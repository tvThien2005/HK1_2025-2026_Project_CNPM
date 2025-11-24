import React from "react";

function Notification({ notification }) {
  if (!notification) return null;

  const { message, timeAgo, type } = notification;

  let icon = "🔔";
  let colorClass = "notification-info";
  if (type === "success") {
    icon = "✅";
    colorClass = "notification-success";
  } else if (type === "warning") {
    icon = "⚠️";
    colorClass = "notification-warning";
  }

  return (
    <div className={`notification-card ${colorClass}`}>
      <div className="notification-icon">{icon}</div>
      <div className="notification-content">
        <p className="notification-message">{message}</p>
        <span className="notification-time">{timeAgo}</span>
      </div>
    </div>
  );
}

export default Notification;