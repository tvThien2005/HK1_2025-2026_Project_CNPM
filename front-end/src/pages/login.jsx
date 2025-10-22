// import React, { useState } from 'react';
// import axios from 'axios';
// // import '../styles/Components.css'; // Dùng chung styles

// function LoginPage({ onLogin }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       // Gọi API đăng nhập
//       const response = await axios.post('http://localhost:5000/api/auth/login', {
//         username,
//         password,
//       });

//       if (response.data.success) {
//         onLogin(response.data.user); // Lưu thông tin user và chuyển trang
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed. Server error.');
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         <div className="bus-icon-circle">🚍</div>
//         <h1>HỆ THỐNG THEO DÕI XE BUÝT</h1>
//         <p>Dành cho phụ huynh</p>
//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             placeholder="Tên đăng nhập hoặc số điện thoại"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           />
//           <input
//             type="password"
//             placeholder="Mật khẩu"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           {error && <p className="error-message">{error}</p>}
//           <button type="submit">Đăng Nhập</button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default LoginPage;
// src/pages/login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
// import '../styles/Components.css'; // Giữ nguyên nếu bạn dùng CSS chung

function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Gọi API đăng nhập thật (server.js)
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });

      const data = response.data;

      if (data.maTaiKhoan) {
        // ✅ Lưu user vào localStorage để các trang khác sử dụng
        localStorage.setItem("user", JSON.stringify(data));
        router.push("/"); // Chuyển về trang chính
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không hợp lệ");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError(
        err.response?.data?.error ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản."
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="bus-icon-circle">🚍</div>
        <h1>HỆ THỐNG THEO DÕI XE BUÝT</h1>
        <p>Dành cho phụ huynh</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Tên đăng nhập hoặc số điện thoại"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Đăng Nhập</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;