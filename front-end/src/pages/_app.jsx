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