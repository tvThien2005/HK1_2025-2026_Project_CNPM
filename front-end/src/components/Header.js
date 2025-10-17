import React, { useState } from 'react';
import Notification from './Notification';
// import '../styles/Components.css';

function Header({ onLogout, notification, onInfo}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    // Chuyển về trang login được xử lý trong App.js
  };

  const handleInfo = () => {
    if (typeof onInfo === 'function') {
      onInfo();
    } else {
      console.warn('onInfo chưa được truyền hoặc không phải hàm');
    }
  };


  return (
    <header className="app-header">
      <div className="header-title">
        <span className="app-icon">🚍</span>
        Smart School Bus Tracking System
      </div>
      <div className="header-actions">
        {/* Nút thông báo */}
        <div 
          className="notification-icon-container"
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        >
            <span className="notification-badge">🔔</span>
                    </div>
        
        {/* Popover thông báo */}
        {isNotificationOpen && (
            <div className="notification-dropdown">
                {notification ? (
                    <Notification notification={notification} isDropdown={true} />
                ) : (
                    <p>Không có thông báo mới.</p>
                )}
            </div>
        )}

        {/* Avatar và nút đăng xuất */}
        <div
          className="avatar-container"
          onClick={() => setIsHovered(!isHovered)}
        >
          <div className="avatar">👤</div>
          {isHovered && (
            <div 
              className="logout-popover"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <button onClick={handleInfo}>Thông tin cá nhân</button>
              <button onClick={handleLogout}>Đăng Xuất</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;