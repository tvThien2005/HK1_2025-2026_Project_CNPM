import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useRouter } from "next/router";

export default function InfoPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u) return router.push("/login");
    setUser(u);

    fetch(`http://localhost:5000/api/taikhoan/${u.maTaiKhoan}`)
      .then((r) => r.json())
      .then(setProfile)
      .catch((e) => console.error(e));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleInfo = () => {
    // no-op or show modal
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <Header onLogout={handleLogout} onInfo={handleInfo} />
      <div className="page-content">
        <h2>Thông tin cá nhân</h2>
        <p><strong>Tên đăng nhập:</strong> {profile.tenDangNhap}</p>
        <p><strong>Tên hiển thị:</strong> {profile.tenNguoiDung || "-"}</p>
        <p><strong>Vai trò:</strong> {profile.capDo}</p>
        <p><strong>Trạng thái:</strong> {profile.trangThai}</p>
        {/* Nếu muốn hiển thị thêm các thông tin liên quan */}
      </div>
    </div>
  );
}