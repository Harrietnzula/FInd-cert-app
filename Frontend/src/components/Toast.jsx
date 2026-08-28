import { useEffect } from "react";
import "./Toast.css";

function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 1800);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="toast">
      {message}
    </div>
  );
}

export default Toast;