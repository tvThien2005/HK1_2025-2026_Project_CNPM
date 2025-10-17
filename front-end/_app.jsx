// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './src/pages/login';
// import HomePage from './src/pages/index';
// import MapPage from './src/pages/map';
// // import '../src/styles/globals.css'; // Dùng chung styles
// import './styles/Components.css';

// function App({ Component, pageProps }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // Kiểm tra trạng thái đăng nhập khi khởi động
//   useEffect(() => {
//     const user = localStorage.getItem('user');
//     if (user) {
//       setIsAuthenticated(true);
//     }
//   }, []);

//   const handleLogin = (user) => {
//     localStorage.setItem('user', JSON.stringify(user));
//     setIsAuthenticated(true);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('user');
//     setIsAuthenticated(false);
//   };

//   return (
//     <Router>
//       <Routes>
//         <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
//         <Route 
//           path="/" 
//           element={
//             isAuthenticated ? (
//               <HomePage onLogout={handleLogout} />
//             ) : (
//               <Navigate to="/login" replace />
//             )
//           } 
//         />
//         <Route 
//           path="/map" 
//           element={
//             isAuthenticated ? (
//               <MapPage onLogout={handleLogout} />
//             ) : (
//               <Navigate to="/login" replace />
//             )
//           } 
//         />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;