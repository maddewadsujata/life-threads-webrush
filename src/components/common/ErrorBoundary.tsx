import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { storage } from '../../utils/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by LifeThreads ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    storage.clearImportedReceipts();
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen flex items-center justify-center bg-[#090b10] text-zinc-100 p-6"
        >
          <div className="max-w-md w-full rounded-2xl border border-rose-500/30 bg-zinc-950/90 p-6 sm:p-8 text-center space-y-4 shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h1 className="text-xl font-bold font-display text-white">Something went wrong</h1>

            <p className="text-xs text-zinc-400 leading-relaxed">
              An unexpected render issue occurred while processing dataset receipts. You can recover
              by resetting to the verified demo dataset.
            </p>

            {this.state.error && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-left">
                <p className="font-mono text-[11px] text-rose-300 break-words">
                  {this.state.error.message || 'Unknown runtime error'}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 text-xs font-bold text-zinc-950 transition-all shadow-lg shadow-cyan-500/20"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset & Reload App</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
