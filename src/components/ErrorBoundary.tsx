import { Callout } from "@blueprintjs/core";
import * as React from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error(error, info);
  }

  render() {
    if (this.state.error) {
      // You can render any custom fallback UI
      return <Callout intent="danger">{String(this.state.error)}</Callout>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;