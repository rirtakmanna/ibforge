// src/components/ErrorBoundary.jsx
//
// Catches render errors in the component tree below it and shows a fallback.
// Wraps the entire <Routes> tree in App.jsx so a single component crash
// never produces a blank white screen.
//
// Class component is required: hooks cannot implement getDerivedStateFromError
// or componentDidCatch.

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Phase 1: log to console. Phase 4 may forward to an error reporter.
    console.error('[ErrorBoundary] caught:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback" role="alert">
          <h1>Something broke.</h1>
          <p>The app hit an error and stopped rendering this view.</p>
          {this.state.error && this.state.error.message ? (
            <pre className="error-boundary-message">{this.state.error.message}</pre>
          ) : null}
          <button type="button" onClick={this.handleReload}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;