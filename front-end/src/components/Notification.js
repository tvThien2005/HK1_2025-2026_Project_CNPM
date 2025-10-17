import React from 'react';
// import '../styles/Components.css'; // Dùng chung styles

function Notification({ notification }) {
    if (!notification) return null;

    let icon, colorClass;

    switch (notification.type) {
        case 'success':
            icon = '✅';
            colorClass = 'notification-success';
            break;
        case 'warning':
            icon = '⚠️';
            colorClass = 'notification-warning';
            break;
        default:
            icon = '🔔';
            colorClass = 'notification-info';
    }

    return (
        <div className={`notification-card ${colorClass}`}>
            <div className="notification-icon">{icon}</div>
            <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">{notification.timeAgo}</span>
            </div>
        </div>
    );
}

export default Notification;