// import React, { useState } from 'react';
// import Notification from './Notification';
// // import '../styles/Components.css';

// function Header({ onLogout, notification, onInfo}) {
//   const [isHovered, setIsHovered] = useState(false);
//   const [isNotificationOpen, setIsNotificationOpen] = useState(false);

//   const handleLogout = () => {
//     onLogout();
//     // Chuyển về trang login được xử lý trong App.js
//   };

//   const handleInfo = () => {
//     if (typeof onInfo === 'function') {
//       onInfo();
//     } else {
//       console.warn('onInfo chưa được truyền hoặc không phải hàm');
//     }
//   };


//   return (
//     <header className="app-header">
//       <div className="header-title">
//         <span className="app-icon">🚍</span>
//         Smart School Bus Tracking System
//       </div>
//       <div className="header-actions">
//         {/* Nút thông báo */}
//         <div 
//           className="notification-icon-container"
//           onClick={() => setIsNotificationOpen(!isNotificationOpen)}
//         >
//             <span className="notification-badge">🔔</span>
//                     </div>
        
//         {/* Popover thông báo */}
//         {isNotificationOpen && (
//             <div className="notification-dropdown">
//                 {notification ? (
//                     <Notification notification={notification} isDropdown={true} />
//                 ) : (
//                     <p>Không có thông báo mới.</p>
//                 )}
//             </div>
//         )}

//         {/* Avatar và nút đăng xuất */}
//         <div
//           className="avatar-container"
//           onClick={() => setIsHovered(!isHovered)}
//         >
//           <div className="avatar">👤</div>
//           {isHovered && (
//             <div 
//               className="logout-popover"
//               onMouseEnter={() => setIsHovered(true)}
//               onMouseLeave={() => setIsHovered(false)}
//             >
//               <button onClick={handleInfo}>Thông tin cá nhân</button>
//               <button onClick={handleLogout}>Đăng Xuất</button>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }

// src/components/Header.js
import React, { useState, useEffect } from "react";
import Notification from "./Notification";

export default function Header({ onLogout, onInfo }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    setUser(u);

    const loadNotifications = async () => {
      if (!u?.maTaiKhoan) return setNotifications([]);
      try {
        const res = await fetch(`http://localhost:5000/api/thongbao/${u.maTaiKhoan}`);
        const data = await res.json();
        // normalize to { message, timeAgo, type }
        const norm = Array.isArray(data)
          ? data.map((tb) => ({
              message: tb.noiDung,
              timeAgo: tb.thoiGianTao ? new Date(tb.thoiGianTao).toLocaleString() : "",
              type: "info",
              raw: tb,
            }))
          : [];
        setNotifications(norm);
      } catch (e) {
        console.error("Không thể tải thông báo:", e);
        setNotifications([]);
      }
    };

    loadNotifications();
  }, []);

  return (
    <header className="app-header">
      <div className="header-title">
        <span className="app-icon">🚍</span> Smart School Bus Tracking System
      </div>

      <div className="header-actions">
        <div
          className="notification-icon-container"
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        >
          <span className="notification-badge">🔔</span>
          {notifications.length > 0 && (
            <span className="notification-count">{notifications.length}</span>
          )}
        </div>

        {isNotificationOpen && (
          <div className="notification-dropdown">
            {notifications.length ? (
              notifications.map((n, idx) => (
                <Notification key={idx} notification={n} />
              ))
            ) : (
              <p>Không có thông báo mới.</p>
            )}
          </div>
        )}

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
              <div className="user-info">
                <strong>{user?.tenNguoiDung || user?.tenDangNhap}</strong>
                <div>{user?.capDo}</div>
              </div>
              <button onClick={onInfo}>Thông tin cá nhân</button>
              <button onClick={onLogout}>Đăng Xuất</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}