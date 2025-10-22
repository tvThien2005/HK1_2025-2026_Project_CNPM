// import React, { useState } from 'react'
// import {FaEye, FaEyeSlash} from "react-icons/fa";

// export default function AccountInfo() {
//   const [editing, setEditing] = useState(false)
//   const [passwordVisible, setPasswordVisible] = useState(false)
//   const [form, setForm] = useState({
//     fullName: 'Nguyễn Văn A',
//     phone: '0123456789',
//     dob: '01/01/2015',
//     username: 'Hello',
//     password: 'password123', // thực tế lưu mật khẩu ở đây (mock)
//     createdAt: '01/01/2025',
//     status: 'Đang hoạt động'
//   })

//   function onChange(e) {
//     setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
//   }

//   function togglePassword() {
//     setPasswordVisible(v => !v)
//   }

//   return (
//     <div className="card account-card">
//       <div className="card-header">
//         <h2>Thông tin tài khoản</h2>
//         <button className="edit-btn" onClick={() => setEditing(!editing)}>
//           {editing ? 'Hủy' : 'Chỉnh sửa'}
//         </button>
//       </div>

//       <div className="card-body">
//         <Field label="Họ tên:" name="fullName" value={form.fullName} onChange={onChange} editable={editing}/>
//         <Field label="Số điện thoại:" name="phone" value={form.phone} onChange={onChange} editable={editing}/>
//         <Field label="Ngày sinh:" name="dob" value={form.dob} onChange={onChange} editable={editing}/>
//         <hr />
//         <Field label="Tên đăng nhập" name="username" value={form.username} onChange={onChange} editable={false}/>
//         {/* Password field: hiển thị icon mắt để toggle */}
//         <PasswordField
//           label="Mật khẩu"
//           name="password"
//           value={form.password}
//           onChange={onChange}
//           editable={editing}
//           visible={passwordVisible}
//           toggleVisible={togglePassword}
//         />
//         <Field label="Ngày tạo tài khoản:" name="createdAt" value={form.createdAt} onChange={onChange} editable={false}/>
//         <div className="status-row">
//           <label>Trạng thái:</label>
//           <div className="status-pill">{form.status}</div>
//         </div>
//       </div>

//       <div className="card-footer">
//         {editing && (
//           <button className="save-btn" onClick={() => { setEditing(false); alert('Đã lưu thông tin!')}}> 💾 Lưu</button>   
//         )}
//       </div>
//     </div>
//   )
// }

// /* Reusable simple Field */
// function Field({ label, name, value, onChange, editable, type='text' }) {
//   return (
//     <div className="field-row">
//       <label>{label}</label>
//       {editable ? (
//         <input className="field-input" name={name} value={value} onChange={onChange} type={type} />
//       ) : (
//         <div className="field-display">{type === 'password' ? '********' : value}</div>
//       )}
//     </div>
//   )
// }

// function PasswordField({ label, name, value, onChange, editable, visible, toggleVisible }) {
//   return (
//     <div className="field-row">
//       <label>{label}</label>

//       <div className="password-wrapper">
//         {editable ? (
//           <input
//             className="field-input"
//             name={name}
//             value={value}
//             onChange={onChange}
//             type={visible ? "text" : "password"}
//             autoComplete="current-password"
//           />
//         ) : (
//           <div className="field-display">{visible ? value : "********"}</div>
//         )}

//         <button
//           type="button"
//           className="eye-btn"
//           onClick={toggleVisible}
//           title={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
//         >
//           {visible ? <FaEye /> : <FaEyeSlash />}
//         </button>
//       </div>
//     </div>
//   );
// }
// src/components/AccountInfo.jsx
import React from "react";

export default function AccountInfo({ profile }) {
  if (!profile) return null;
  return (
    <div className="account-info">
      <p><strong>{profile.tenNguoiDung || profile.tenDangNhap}</strong></p>
      <p>Vai trò: {profile.capDo}</p>
      <p>Trạng thái: {profile.trangThai}</p>
    </div>
  );
}