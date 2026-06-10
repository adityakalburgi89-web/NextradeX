import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught error:", error, info);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="bg-surface border border-white/[0.08] rounded-2xl p-8 max-w-md w-full text-center shadow-elevation-lg">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-trading-down/10 p-4 text-trading-down">
                <AlertTriangle size={32} />
              </div>
            </div>
            <h1 className="font-heading text-xl font-bold text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-muted text-sm mb-6 font-body">
              {this.state.error?.message || "An unexpected error occurred. Please reload the app."}
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-active text-ink font-bold rounded-xl text-sm transition-all focus-ring"
            >
              <RefreshCw size={16} />
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;