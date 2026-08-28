import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          background: "#1a0000",
          color: "#ff8888",
          padding: "40px",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          minHeight: "100vh",
        }}>
          <h1 style={{ color: "#ff4444" }}>App crashed</h1>
          <p><strong>{this.state.error.message}</strong></p>
          <pre>{this.state.error.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;