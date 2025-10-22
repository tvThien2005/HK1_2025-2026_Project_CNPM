// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './login';
// import HomePage from './index';
// import MapPage from './map';
// // import '../src/styles/globals.css'; // Dùng chung styles
// import '../styles/Components.css';
// import '../styles/global.css'

// function App({ Component, pageProps }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const router = useRouter();

//   // Kiểm tra trạng thái đăng nhập khi khởi động (chạy trên client)
//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     const user = JSON.parse(localStorage.getItem('user'));

//     if (user && user.token) {
//       // Kiểm tra token hợp lệ (gọi API hoặc decode JWT)
//       setIsAuthenticated(true);
//     } else {
//       setIsAuthenticated(false);
//     }
//   }, []);

//   // Điều hướng dựa trên trạng thái đăng nhập
//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     // Khi chưa đăng nhập, ép về /login (trừ khi đang ở /login)
//     if (!isAuthenticated && router.pathname !== '/login') {
//       router.push('/login');
//     }
//     // Nếu đã đăng nhập mà đang ở /login thì chuyển về /
//     if (isAuthenticated && router.pathname === '/login') {
//       router.push('/');
//     }
//   }, [isAuthenticated, router.pathname]);

//   const handleLogin = (user) => {
//     localStorage.setItem('user', JSON.stringify(user));
//     setIsAuthenticated(true);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('user');
//     setIsAuthenticated(false);
//     // optional: navigate to login after logout
//     if (typeof window !== 'undefined') router.push('/login');
//   };

//   // Hàm điều hướng đến trang Info.jsx
//   const handleInfo = () => {
//     if (typeof window !== 'undefined') router.push('/Info');
//   };

//   const handleBack = () => {
//     if (typeof window !== 'undefined') router.push('/'); // chuyển về trang index
//   };


//   // Truyền các handler vào page component để page có thể gọi
//   return (
//     <Component
//       {...pageProps}
//       onLogin={handleLogin}
//       onLogout={handleLogout}
//       onInfo={handleInfo}
//       onBack={handleBack}
//       isAuthenticated={isAuthenticated}
//     />
//   );
// }

// export default App;
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/Components.css';
import '../styles/global.css';

function App({ Component, pageProps }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const user = JSON.parse(localStorage.getItem('user'));

    // ✅ Chỉ cần kiểm tra có user là được, không cần token
    if (user && user.maTaiKhoan) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Điều hướng tự động
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isAuthenticated && router.pathname !== '/login') {
      router.push('/login');
    } else if (isAuthenticated && router.pathname === '/login') {
      router.push('/');
    }
  }, [isAuthenticated, router.pathname]);

  const handleLogin = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
    router.push('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    router.push('/login');
  };

  const handleInfo = () => router.push('/Info');
  const handleBack = () => router.push('/');

  return (
    <Component
      {...pageProps}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onInfo={handleInfo}
      onBack={handleBack}
      isAuthenticated={isAuthenticated}
    />
  );
}

export default App;