#!/usr/bin/env python3
"""
csv_to_db.py
------------
GUI application to upload CSV data into PostgreSQL.

Project structure expected:

SIH26/
├── backend/
│   ├── .env
│   └── ...
└── csv_to_db.py

Backend .env should contain:

DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=postgres
DB_PASS=your_password

Requirements:
    pip install pandas psycopg2-binary python-dotenv

Tkinter:
    Usually included with Python on Windows.
    On Ubuntu/Debian:
        sudo apt install python3-tk

Features:
- Automatically loads PostgreSQL credentials from backend/.env
- User does not need to type database credentials
- Select CSV using file picker
- Select target table
- Automatically matches CSV columns with database columns
- Automatically creates PostGIS geography from latitude/longitude
- Ignores id, created_at and updated_at
- Displays upload progress/logs
"""

import os
import sys
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv


# ============================================================
# ENVIRONMENT CONFIGURATION
# ============================================================

# csv_to_db.py location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Backend .env location
BACKEND_ENV = os.path.join(BASE_DIR, "backend", ".env")

# Load backend .env
if not os.path.exists(BACKEND_ENV):
    print(f"WARNING: Backend .env not found at:")
    print(BACKEND_ENV)

load_dotenv(BACKEND_ENV)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "")
DB_USER = os.getenv("DB_USER", "")
DB_PASS = os.getenv("DB_PASS", "")


# ============================================================
# ALLOWED DATABASE TABLES
# ============================================================

TABLES = [
    "model_runs",
    "police_stations",
    "atm_locations",
    "cybercrime_complaints",
    "predicted_hotspots",
]


# Columns that PostgreSQL/database automatically manages
AUTO_SKIP_COLUMNS = {
    "id",
    "created_at",
    "updated_at",
}


# ============================================================
# DATABASE FUNCTIONS
# ============================================================

def get_table_columns(conn, table):
    """
    Get all column names from the selected PostgreSQL table.
    """

    with conn.cursor() as cur:

        cur.execute(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = %s
            AND table_schema = 'public'
            ORDER BY ordinal_position
            """,
            (table,),
        )

        return {row[0].lower() for row in cur.fetchall()}


def insert_csv(conn, csv_path, table, log):
    """
    Read CSV and insert matching columns into PostgreSQL.
    """

    # --------------------------------------------------------
    # Read CSV
    # --------------------------------------------------------

    log("Reading CSV file...")

    df = pd.read_csv(csv_path)

    if df.empty:
        raise ValueError("The selected CSV file is empty.")

    # Normalize column names
    df.columns = [
        str(column).strip().lower()
        for column in df.columns
    ]

    log(f"CSV contains {len(df)} rows.")
    log(f"CSV columns: {list(df.columns)}")


    # --------------------------------------------------------
    # Get database columns
    # --------------------------------------------------------

    table_columns = get_table_columns(conn, table)

    if not table_columns:
        raise ValueError(
            f"Table '{table}' was not found in the public schema."
        )

    log(f"Database columns: {sorted(table_columns)}")


    # --------------------------------------------------------
    # Geography handling
    # --------------------------------------------------------

    has_latlon = (
        "latitude" in df.columns
        and "longitude" in df.columns
    )

    build_geom_from_latlon = (
        has_latlon
        and "geom" in table_columns
    )


    # --------------------------------------------------------
    # Find matching columns
    # --------------------------------------------------------

    usable_cols = []

    for column in df.columns:

        # Ignore latitude/longitude when geom is generated
        if column in ("latitude", "longitude"):
            continue

        # Ignore automatically generated database columns
        if column in AUTO_SKIP_COLUMNS:
            continue

        # Only insert columns that exist in database
        if column in table_columns:
            usable_cols.append(column)


    # Add geom if it needs to be generated
    if build_geom_from_latlon and "geom" not in usable_cols:
        usable_cols.append("geom")


    if not usable_cols:
        raise ValueError(
            "No matching CSV columns were found in the target database table."
        )


    log(f"Columns that will be inserted: {usable_cols}")


    # --------------------------------------------------------
    # Build SQL value expressions
    # --------------------------------------------------------

    value_exprs = []

    for column in usable_cols:

        if column == "geom" and build_geom_from_latlon:

            value_exprs.append(
                "ST_SetSRID("
                "ST_MakePoint(%s, %s), "
                "4326"
                ")::geography"
            )

        elif column == "geom":

            value_exprs.append(
                "ST_GeogFromText(%s)"
            )

        else:

            value_exprs.append("%s")


    template = "(" + ", ".join(value_exprs) + ")"


    # --------------------------------------------------------
    # Prepare rows
    # --------------------------------------------------------

    rows = []

    for index, row in df.iterrows():

        row_values = []

        for column in usable_cols:

            # ----------------------------------------------
            # Create geography from latitude/longitude
            # ----------------------------------------------

            if (
                column == "geom"
                and build_geom_from_latlon
            ):

                longitude = row["longitude"]
                latitude = row["latitude"]

                if pd.isna(longitude) or pd.isna(latitude):

                    row_values.extend([None, None])

                else:

                    try:

                        longitude = float(longitude)
                        latitude = float(latitude)

                    except (ValueError, TypeError):

                        raise ValueError(
                            f"Invalid latitude/longitude "
                            f"at CSV row {index + 2}."
                        )

                    row_values.extend(
                        [longitude, latitude]
                    )


            # ----------------------------------------------
            # Raw WKT geometry
            # ----------------------------------------------

            elif column == "geom":

                value = row.get("geom")

                if pd.isna(value):
                    value = None

                row_values.append(value)


            # ----------------------------------------------
            # Normal column
            # ----------------------------------------------

            else:

                value = row.get(column)

                if pd.isna(value):
                    value = None

                row_values.append(value)


        rows.append(tuple(row_values))


    # --------------------------------------------------------
    # Build INSERT query
    # --------------------------------------------------------

    # Table names and column names come from our predefined
    # table list / database metadata, not user-entered SQL.

    column_list_sql = ", ".join(
        f'"{column}"'
        for column in usable_cols
    )

    query = (
        f'INSERT INTO "{table}" '
        f'({column_list_sql}) '
        f'VALUES %s'
    )


    # --------------------------------------------------------
    # Insert data
    # --------------------------------------------------------

    log(f"Inserting {len(rows)} rows...")

    try:

        with conn.cursor() as cur:

            execute_values(
                cur,
                query,
                rows,
                template=template,
                page_size=1000,
            )

        conn.commit()

    except Exception:

        conn.rollback()
        raise


    # --------------------------------------------------------
    # Success
    # --------------------------------------------------------

    log(
        f"Successfully inserted "
        f"{len(rows)} rows into '{table}'."
    )

    log(
        f"Columns used: {usable_cols}"
    )


# ============================================================
# GUI APPLICATION
# ============================================================

class App(tk.Tk):

    def __init__(self):

        super().__init__()

        self.title("CSV → Database Uploader")

        self.geometry("600x520")

        self.resizable(False, False)

        self.csv_path = tk.StringVar()


        # ====================================================
        # DATABASE CONNECTION FRAME
        # ====================================================

        conn_frame = ttk.LabelFrame(
            self,
            text="Database Connection"
        )

        conn_frame.pack(
            fill="x",
            padx=10,
            pady=8
        )


        # Host
        self.host = self._add_field(
            conn_frame,
            "Host",
            DB_HOST,
            0
        )


        # Port
        self.port = self._add_field(
            conn_frame,
            "Port",
            DB_PORT,
            1
        )


        # Database
        self.dbname = self._add_field(
            conn_frame,
            "Database",
            DB_NAME,
            2
        )


        # User
        self.user = self._add_field(
            conn_frame,
            "User",
            DB_USER,
            3
        )


        # Password
        self.password = self._add_field(
            conn_frame,
            "Password",
            DB_PASS,
            4,
            show="*"
        )


        # ====================================================
        # TARGET TABLE
        # ====================================================

        table_frame = ttk.LabelFrame(
            self,
            text="Target Table"
        )

        table_frame.pack(
            fill="x",
            padx=10,
            pady=8
        )


        self.table_choice = ttk.Combobox(
            table_frame,
            values=TABLES,
            state="readonly"
        )

        self.table_choice.current(0)

        self.table_choice.pack(
            fill="x",
            padx=10,
            pady=8
        )


        # ====================================================
        # CSV FILE
        # ====================================================

        file_frame = ttk.LabelFrame(
            self,
            text="CSV File"
        )

        file_frame.pack(
            fill="x",
            padx=10,
            pady=8
        )


        file_row = ttk.Frame(file_frame)

        file_row.pack(
            fill="x",
            padx=10,
            pady=8
        )


        ttk.Entry(
            file_row,
            textvariable=self.csv_path,
            state="readonly"
        ).pack(
            side="left",
            fill="x",
            expand=True
        )


        ttk.Button(
            file_row,
            text="Browse...",
            command=self.browse_file
        ).pack(
            side="left",
            padx=(8, 0)
        )


        # ====================================================
        # UPLOAD BUTTON
        # ====================================================

        self.upload_btn = ttk.Button(
            self,
            text="Upload to Database",
            command=self.start_upload
        )

        self.upload_btn.pack(
            pady=10
        )


        # ====================================================
        # LOG
        # ====================================================

        log_frame = ttk.LabelFrame(
            self,
            text="Log"
        )

        log_frame.pack(
            fill="both",
            expand=True,
            padx=10,
            pady=8
        )


        self.log_box = tk.Text(
            log_frame,
            height=10,
            state="disabled",
            wrap="word"
        )

        self.log_box.pack(
            fill="both",
            expand=True,
            padx=6,
            pady=6
        )


    # ========================================================
    # ADD GUI FIELD
    # ========================================================

    def _add_field(
        self,
        parent,
        label,
        default,
        row,
        show=None
    ):

        ttk.Label(
            parent,
            text=label,
            width=10
        ).grid(
            row=row,
            column=0,
            padx=10,
            pady=4,
            sticky="w"
        )


        var = tk.StringVar(
            value=default
        )


        entry = ttk.Entry(
            parent,
            textvariable=var,
            show=show,
            state="readonly"
        )


        entry.grid(
            row=row,
            column=1,
            padx=10,
            pady=4,
            sticky="ew"
        )


        parent.columnconfigure(
            1,
            weight=1
        )


        return var


    # ========================================================
    # FILE BROWSER
    # ========================================================

    def browse_file(self):

        path = filedialog.askopenfilename(
            title="Select a CSV file",
            filetypes=[
                ("CSV files", "*.csv"),
                ("All files", "*.*"),
            ],
        )


        if path:

            self.csv_path.set(path)

            self.log(
                f"Selected CSV: {path}"
            )


    # ========================================================
    # LOG FUNCTION
    # ========================================================

    def log(self, message):

        # Tkinter widgets should normally be updated from
        # the main GUI thread.

        self.after(
            0,
            self._write_log,
            message
        )


    def _write_log(self, message):

        self.log_box.configure(
            state="normal"
        )

        self.log_box.insert(
            "end",
            message + "\n"
        )

        self.log_box.see("end")

        self.log_box.configure(
            state="disabled"
        )


    # ========================================================
    # START UPLOAD
    # ========================================================

    def start_upload(self):

        # Check CSV
        if not self.csv_path.get():

            messagebox.showwarning(
                "No file selected",
                "Please choose a CSV file first."
            )

            return


        # Check database configuration
        if not all(
            [
                self.dbname.get(),
                self.user.get(),
                self.password.get(),
            ]
        ):

            messagebox.showerror(
                "Database Configuration Error",
                "Database credentials could not be loaded from backend/.env."
            )

            return


        # Disable button
        self.upload_btn.configure(
            state="disabled",
            text="Uploading..."
        )


        # Run database operation in background
        threading.Thread(
            target=self._run_upload,
            daemon=True
        ).start()


    # ========================================================
    # DATABASE UPLOAD THREAD
    # ========================================================

    def _run_upload(self):

        table = self.table_choice.get()

        csv_path = self.csv_path.get()

        conn = None


        try:

            self.log(
                f"Connecting to database "
                f"'{self.dbname.get()}' "
                f"at "
                f"{self.host.get()}:{self.port.get()}..."
            )


            # ------------------------------------------------
            # Connect PostgreSQL
            # ------------------------------------------------

            conn = psycopg2.connect(
                host=self.host.get(),
                port=self.port.get(),
                dbname=self.dbname.get(),
                user=self.user.get(),
                password=self.password.get(),
            )


            self.log(
                "Database connection successful."
            )


            self.log(
                f"Reading '{os.path.basename(csv_path)}' "
                f"and inserting into '{table}'..."
            )


            # ------------------------------------------------
            # Insert CSV
            # ------------------------------------------------

            insert_csv(
                conn,
                csv_path,
                table,
                self.log
            )


            self.log(
                "Upload completed successfully."
            )


            # ------------------------------------------------
            # Success popup
            # ------------------------------------------------

            self.after(
                0,
                lambda: messagebox.showinfo(
                    "Success",
                    f"Data inserted into '{table}' successfully."
                )
            )


        except Exception as e:

            self.log(
                f"ERROR: {e}"
            )


            self.after(
                0,
                lambda error=str(e): messagebox.showerror(
                    "Upload Failed",
                    error
                )
            )


        finally:

            if conn:

                try:
                    conn.close()

                except Exception:
                    pass


            # Re-enable upload button
            self.after(
                0,
                lambda: self.upload_btn.configure(
                    state="normal",
                    text="Upload to Database"
                )
            )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    try:

        app = App()

        app.mainloop()

    except tk.TclError as e:

        sys.exit(
            "Could not start the GUI "
            "(no display available / tkinter missing).\n"
            f"Details: {e}\n\n"
            "On Linux, install tkinter with:\n"
            "sudo apt install python3-tk"
        )
