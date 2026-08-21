import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

/**
 * Catches render-time errors in its subtree so a bug in one part of the
 * page (e.g. a malformed product card) doesn't blank the entire app.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In a real app this would report to an error-tracking service.
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 text-center py-16 px-4 border border-[--color-line] rounded-lg"
          >
            <AlertTriangle className="w-8 h-8 text-[--color-accent]" aria-hidden="true" />
            <div>
              <p className="font-medium text-[--color-ink]">Something went wrong</p>
              <p className="text-sm text-[--color-ink-muted] mt-1">
                This section couldn't be displayed. You can try again below.
              </p>
            </div>
            <Button size="sm" onClick={this.handleReset}>
              Try again
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
