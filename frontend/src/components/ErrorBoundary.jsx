import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Trinetra UI caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '560px',
            padding: '28px',
            borderLeft: '4px solid #ff4757',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'rgba(255, 71, 87, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(255, 71, 87, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff4757'
              }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  Intelligence Module Temporarily Recovering
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  A minor UI rendering glitch was safely captured by Trinetra Fault-Tolerance.
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: '#ff6b81',
              fontFamily: 'var(--font-mono)'
            }}>
              {this.state.error ? this.state.error.toString() : 'Unknown Component Error'}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="cyber-btn"
                style={{ fontSize: '0.8rem' }}
              >
                <RefreshCw size={14} /> Retry View
              </button>
              <button
                onClick={this.handleReload}
                className="cyber-btn cyber-btn-secondary"
                style={{ fontSize: '0.8rem' }}
              >
                Reload Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
