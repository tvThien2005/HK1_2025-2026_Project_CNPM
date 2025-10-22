// import React from 'react'

// export default function Sidebar({ active, setActive, onBack }) {

//   // const handleBack = () =>{
//   //   onBack();
//   // }

//   return (
//     <aside className="sidebar">
//       <button className="back-btn" title="Back" onClick={onBack}>←</button>

//       <nav className="menu">
//         <button
//           className={`menu-item ${active === 'account' ? 'active' : ''}`}
//           onClick={() => setActive('account')}
//         >
//           Thông tin tài khoản
//         </button>

//         <button
//           className={`menu-item ${active === 'history' ? 'active' : ''}`}
//           onClick={() => setActive('history')}
//         >
//           Lịch sử chuyến đi
//         </button>
//       </nav>
//     </aside>
//   )
// }
// src/components/Sidebar.jsx
import React from "react";
import Link from "next/link";

export default function Sidebar({ user }) {
  const role = user?.capDo || "";

  return (
    <aside className="sidebar">
      <div className="sidebar-user">
        <div className="avatar">👤</div>
        <div>{user?.tenNguoiDung || user?.tenDangNhap}</div>
        <div className="role">{role}</div>
      </div>

      <nav>
        <ul>
          <li><Link href="/">Dashboard</Link></li>
          <li><Link href="/Info">Thông tin</Link></li>
          <li><Link href="/map">Bản đồ</Link></li>
          {role === "Manager" && <li><a>Quản lý</a></li>}
          {role === "Driver" && <li><a>Lộ trình tài xế</a></li>}
          {role === "Parent" && <li><a>Trạng thái con</a></li>}
        </ul>
      </nav>
    </aside>
  );
}
