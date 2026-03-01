import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>משהו השתבש</h1>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>אירעה שגיאה בלתי צפויה. אנא נסה לרענן את הדף.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '0.75rem 2rem', fontSize: '1rem', borderRadius: '8px', border: 'none', background: '#1976d2', color: '#fff', cursor: 'pointer' }}
          >
            רענן את הדף
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
