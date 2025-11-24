import React, { useState, useEffect } from 'react'

function formatDateFromDB(dateString) {
  if (!dateString) return "";
  
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Tháng trong JS bắt đầu từ 0
  const year = d.getFullYear();

  return `${day}/${month}/${year}`; // Kết quả dd/mm/yyyy
}


export default function HistoryList() {
  const [history, setHistory] = useState([])
  
  // Lấy maTaiKhoan từ localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {}
  const maTaiKhoan = user.maTaiKhoan

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`http://localhost:5000/api/lichsu/${maTaiKhoan}`)
        const data = await res.json()
        // Nếu API trả theo dạng { status, data } thì dùng data.data
        setHistory(data)
        console.log("Lịch sử đã tải:", data)
      } catch (err) {
        console.error("Lỗi khi tải lịch sử:", err)
      }
    }

    if (maTaiKhoan) fetchHistory()
  }, [maTaiKhoan])

  return (
    <div className="card history-card">
      <h2>Lịch sử đi học</h2>
      <p className="muted">Theo dõi tình hình đi học trong tuần qua</p>

      <div className="history-list">
        {history.map((item, i) => (
          <div className="history-item" key={i}>
            <div className="date">
              <div>{formatDateFromDB(item.ngay)}</div>
              <div className='name'>Tên học sinh: {item.tenHocSinh}</div>
            </div>
            <div className="history-content">
              <div><strong>Thời gian đi:</strong> {item.morning}</div>
              <div><strong>Thời gian đến:</strong> {item.afternoon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// src/components/HistoryList.jsx
// import React from "react";

// export default function HistoryList({ items = [] }) {
//   if (!items.length) return <p>Không có lịch sử.</p>;
//   return (
//     <ul className="history-list">
//       {items.map((it, idx) => (
//         <li key={idx}>{it}</li>
//       ))}
//     </ul>
//   );
// }
