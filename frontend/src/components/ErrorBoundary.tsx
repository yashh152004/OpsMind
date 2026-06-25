import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground p-6">
          <div className="enterprise-card p-8 max-w-2xl w-full text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              The application encountered an unexpected error. This might be due to a script loading failure or a runtime crash.
            </p>
            <div className="bg-muted p-4 rounded-md text-left mb-6 overflow-auto max-h-48">
              <code className="text-xs font-mono">{this.state.error?.toString()}</code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Platform
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
