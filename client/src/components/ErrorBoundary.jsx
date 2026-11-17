import { Component } from 'react';
import Button from './Button.jsx';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('Unexpected error:', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }

    return (
      <div className="error-boundary">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="error-boundary__title">The page hit an unexpected error</h1>
        <p className="error-boundary__text">
          Reloading usually fixes it. If it keeps happening, come back a bit later.
        </p>
        <Button onClick={() => window.location.reload()}>Reload the page</Button>
      </div>
    );
  }
}

export default ErrorBoundary;