/// <reference types="vite/client" />
/**
 * ErrorBoundary - Catches render errors anywhere in the React tree and
 * shows a recoverable fallback instead of a white screen.
 *
 * Usage:
 *   <ErrorBoundary><App /></ErrorBoundary>
 *   <ErrorBoundary fallback={(err, reset) => ...}><Section /></ErrorBoundary>
 */

import * as React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
     
    console.error('[ErrorBoundary] Caught render error:', error, info);
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    const { error } = this.state;
    if (error === null) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    return (
      <div
        role="alert"
        className="min-h-screen flex items-center justify-center bg-[#f7fbf0] p-6"
      >
        <div className="max-w-md w-full bg-white border border-[#bfcaba] rounded-3xl p-8 shadow-sm space-y-4 text-center">
          <div className="text-5xl" aria-hidden="true">
            ⚠️
          </div>
          <h1 className="text-xl font-extrabold text-[#0d631b]">
            Algo salió mal
          </h1>
          <p className="text-sm text-[#40493d] leading-relaxed">
            La app encontró un error inesperado. Tu lista está guardada localmente — al recargar la recuperarás.
          </p>
          {import.meta.env.DEV && (
            <pre className="text-left text-xs bg-[#f1f5eb] border border-[#bfcaba] rounded-xl p-3 overflow-auto max-h-40 font-mono text-[#40493d]">
              {error.message}
              {'\n'}
              {error.stack}
            </pre>
          )}
          <div className="flex gap-2 justify-center pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#0d631b] hover:bg-[#2e7d32] text-white font-bold rounded-xl text-sm transition-all active:scale-95"
            >
              Recargar app
            </button>
            <button
              type="button"
              onClick={this.reset}
              className="px-4 py-2 bg-[#ebefe5] hover:bg-[#e2e8db] text-[#40493d] font-bold rounded-xl text-sm transition-all active:scale-95"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }
}
