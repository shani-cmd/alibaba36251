import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Debug Error Boundary
class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("React Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, color: "red", background: "#fff", zIndex: 9999, position: "relative" }}>
                    <h2>Something went wrong (React Error)</h2>
                    <pre>{this.state.error?.toString()}</pre>
                    <pre>{this.state.error?.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

// Global window error handler for non-React errors
window.onerror = function (message, source, lineno, colno, error) {
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = "position:fixed;top:0;left:0;width:100%;background:red;color:white;padding:20px;z-index:10000;white-space:pre-wrap;";
    errorDiv.innerHTML = `
    <h2>Global Error Caught</h2>
    <p>Message: ${message}</p>
    <p>Source: ${source}:${lineno}:${colno}</p>
    <pre>${error?.stack || "No stack trace"}</pre>
  `;
    document.body.appendChild(errorDiv);
};


createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);
