// import React from 'react';
// // import { useNavigate } from 'react-router-dom';
// import { useRouter } from 'next/router';
// // import '../styles/Components.css';

// function MapPage() {
//     // const navigate = useNavigate();
//     const router = useRouter();

//     const handleGoBack = () => {
//         // navigate('/');
//         router.push('/');
//     };

//     return (
//         <div className="map-page-layout">
//             <header className="map-header">
//                 <button className="back-button" onClick={handleGoBack}>
//                      Trở lại
//                 </button>
//                 <div className="header-title">Smart School Bus Tracking System</div>
//                 <div className="avatar-placeholder"></div>
//             </header>

//             <div className="map-container-wrapper">
//                 <div className="map-box">
//                     <div className="map-title">
//                          Bản đồ
//                         <span className="follow-name">Theo dõi Nguyễn Văn A</span>
//                     </div>

//                     {/* Phần bản đồ giả lập */}
//                     <div className="mock-map-area">
//                         {/* Các icon zoom/phóng */}
//                         <div className="map-controls">
//                                                                                                             </div>
                        
//                         {/* Giả lập các điểm trên bản đồ */}
//                         <div className="map-legend">
//                             <p><span className="dot moving-dot"></span> Đang di chuyển</p>
//                             <p><span className="dot stop-dot"></span> Đang dừng</p>
//                             <p><span className="dot maintenance-dot"></span> Bảo trì</p>
//                             <p><span className="dot pickup-dot"></span> Điểm dừng</p>
//                             <p><span className="dot school-dot"></span> Trường học</p>
//                             <p>...</p> 
//                         </div>

//                         {/* Các chú thích địa điểm giả lập trên bản đồ */}
//                         <span className="map-label school-label">Trường THCS ABC</span>
//                         <span className="map-label bus-label">Xe buýt B</span>
//                         <span className="map-label pickup-label">Ngã Tư Nguyễn Huệ</span>

//                         {/* Chú thích hướng dẫn sử dụng */}
//                         <div className="map-instructions">
//                             <h3>Hướng dẫn sử dụng:</h3>
//                             <ul>
//                                 <li> Nhấp vào xe buýt để xem thông tin chi tiết</li>
//                                 <li> Nhấp vào điểm dừng để xem danh sách học sinh</li>
//                                 <li> Sử dụng các nút điều khiển để phóng to/thu nhỏ</li>
//                                 <li> Nhấp vào nút mở rộng để xem toàn màn hình</li>
//                             </ul>
//                         </div>

//                         {/* Thẻ thông tin dưới bản đồ */}
//                         <div className="map-info-cards">
//                             <div className="info-card clock">
//                                                                 <span>7:30AM</span>
//                                 <small>Thời gian tới dự kiến</small>
//                             </div>
//                             <div className="info-card location">
//                                                                 <span>4</span>
//                                 <small>Điểm dừng</small>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default MapPage;
// src/pages/map.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useRouter } from "next/router";

export default function MapPage() {
  const router = useRouter();
  const [points, setPoints] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u) return router.push("/login");
    setUser(u);

    fetch("http://localhost:5000/api/vitrichuyenxe")
      .then((r) => r.json())
      .then(setPoints)
      .catch((e) => console.error(e));
  }, [router]);

  return (
    <div>
      <Header onLogout={() => { localStorage.removeItem("user"); router.push("/login"); }} />
      <div className="page-content">
        <h2>Bản đồ vị trí chuyến xe</h2>
        <p>Danh sách toạ độ (mới nhất trước):</p>
        <ul>
          {points.map((p) => (
            <li key={p.maViTriChuyenXe}>
              Chuyến xe #{p.maChuyenXe} — ({p.kinhDo}, {p.viDo}) — {new Date(p.thoiGianGhiNhan).toLocaleString()}
            </li>
          ))}
        </ul>
        <p>
          (Nếu muốn hiển thị bản đồ, cài package <code>leaflet</code> và <code>react-leaflet</code> và mình sẽ cập nhật code.)
        </p>
      </div>
    </div>
  );
}
