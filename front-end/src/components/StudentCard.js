// import React, { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// import { useRouter } from 'next/router';
// // import '../styles/Components.css';

// function StudentCard({ student, isSummaryDefault = false }) {
//   const [isSummary, setIsSummary] = useState(isSummaryDefault);
//   // const navigate = useNavigate();
//   const router = useRouter();

//   const toggleSummary = () => {
//     setIsSummary(!isSummary);
//   };

//   const goToMap = () => {
//     // navigate('/map');
//     router.push('/map');
//   };

//   const { studentName, studentClass, morningTrip, afternoonTrip } = student;
//   const trip = morningTrip; // Dùng thông tin chuyến đi buổi sáng cho cả 2 dạng hiển thị

//   // Chọn trạng thái hiển thị:
//   // Dạng 1: Đầy đủ (trang chính bên trái) - Dùng khi isSummary = false
//   // Dạng 2: Tóm tắt (trang chính bên phải) - Dùng khi isSummary = true

//   return (
//     <div className={`student-card ${isSummary ? 'summary-mode' : 'full-mode'}`}>
//       {/* Phần Header chung */}
//       <div className="student-header">
//         <div className="student-info">
//                     <div>
//             <p className="name">{studentName}</p>
//             <p className="class">{studentClass}</p>
//           </div>
//         </div>
//         <div className={`status-tag status-${trip.status.toLowerCase().replace(/\s/g, '-')}`}>
//           Trạng thái: <strong>{trip.status}</strong>
//         </div>
//       </div>

//       {/* Thông tin chuyến đi & nút */}
//       <div className="trip-info-container">
//         {/* Thông tin chính */}
//         <div className="main-trip-info">
//           {/* Thông tin trạng thái chi tiết */}
//           {!isSummary ? (
//             // Dạng đầy đủ (Full Mode)
//             <div className="full-details">
//               <p className="action-text"> {trip.currentAction}</p>
//               <div className="progress-bar-container">
//                 <div 
//                     className="progress-bar" 
//                     style={{ width: `${trip.progress}%` }}
//                 ></div>
//                 <span>{trip.progress}%</span>
//               </div>
//               <p>Dự kiến đến: <strong>{trip.estimatedArrivalTime}</strong></p>
//             </div>
//           ) : (
//             // Dạng tóm tắt (Summary Mode)
//             <div className="summary-details">
//               <p className="action-text"> {trip.currentAction}</p>
//               <p>Thời gian đến: <strong>{trip.arrivalTime || trip.scheduledTime}</strong></p>
//             </div>
//           )}

//           {/* Nút Xem bản đồ (chung) */}
//           <button className="map-button" onClick={goToMap}>
//              Xem bản đồ
//           </button>
//         </div>
        
//         {/* Thông tin chi tiết chuyến đi (chỉ hiển thị ở Full Mode) */}
//         {!isSummary && (
//           <div className="detailed-trip-info">
//             <p>Chuyến đón:</p>
//             <p>Xe buýt: <strong>{trip.busNumber}</strong></p>
//             <p>Thời gian đón: <strong>{trip.scheduledTime}</strong></p>
//             <p>Tài xế: <strong>{trip.driverName}</strong></p>
//             <p>Điểm đón: <strong>{trip.pickupPoint}</strong></p>

//             <div className="pickup-status">
//                             Trạng thái: <span className={`status-${trip.pickupStatus.toLowerCase().replace(/\s/g, '-')}`}>{trip.pickupStatus}</span>
//             </div>

//             {/* Thông tin chuyến trả (Buổi chiều) */}
//             <div className="afternoon-trip">
//               <p>Chuyến trả:</p>
//               <p>Xe buýt: <strong>{afternoonTrip.busNumber}</strong></p>
//               <p>Thời gian đón: <strong>{afternoonTrip.scheduledTime}</strong></p>
//               <p>Điểm trả: <strong>{afternoonTrip.pickupPoint}</strong></p>
//               <p>Tài xế: <strong>{afternoonTrip.driverName}</strong></p>
              
//               <div className="pickup-status">
//                                 Trạng thái: <span className={`status-${afternoonTrip.status.toLowerCase().replace(/\s/g, '-')}`}>{afternoonTrip.status}</span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Nút Ẩn bớt / Chi tiết */}
//       <button className="toggle-button" onClick={toggleSummary}>
//         {isSummary ? ' Chi tiết' : ' Ẩn bớt'}
//       </button>
//     </div>
//   );
// }

// ...existing code...
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function StudentCard({ student, isSummaryDefault = false }) {
  const [isSummary, setIsSummary] = useState(isSummaryDefault);
  const [hidden, setHidden] = useState(false);
  const router = useRouter();

  // tạo id chuỗi ổn định cho dedupe
  const rawId = student?.maHocSinh ?? student?.id ?? student?.studentId ?? null;
  const studentId = rawId !== null && rawId !== undefined ? String(rawId) : null;

  useEffect(() => {
    if (typeof window === 'undefined' || !studentId) return;
    // Map để đếm số instance cho mỗi id (an toàn hơn Set với kiểu khác nhau)
    window.__renderedStudentIds = window.__renderedStudentIds || new Map();
    const map = window.__renderedStudentIds;
    const cur = map.get(studentId) || 0;

    if (cur > 0) {
      map.set(studentId, cur + 1);
      setHidden(true); // nếu đã có instance -> ẩn instance tiếp theo
    } else {
      map.set(studentId, 1);
      setHidden(false);
    }

    return () => {
      const now = map.get(studentId) || 0;
      if (now <= 1) map.delete(studentId);
      else map.set(studentId, now - 1);
    };
  }, [studentId]);

  if (hidden) return null;

  // dữ liệu an toàn
  const name = student?.tenHocSinh ?? student?.studentName ?? '-';
  const klass = student?.lop ?? student?.class ?? '-';
  const avatar = student?.anhHocSinh ?? null;
  // lọc bỏ trips rỗng/không có thông tin để tránh trường hợp hiển thị rỗng
  const tripsRaw = Array.isArray(student?.trips) ? student.trips : [];
  const trips = tripsRaw.filter(t =>
    t && (t.maChuyenXe || t.bienSoXe || t.thoiGianDi || t.thoiGianDen || t.tenTaiXe)
  );
  const trip = trips[0] ?? null;

  const show = v => (v === undefined || v === null || v === '' ? '-' : v);

  const toggleSummary = () => setIsSummary(v => !v);
  const goToMap = () => router.push('/map');

  // Nếu không có chuyến: render card ngắn gọn, tránh các dòng trống
  if (!trip) {
    return (
      <div className={`student-card ${isSummary ? 'summary-mode' : 'full-mode'}`}>
        <div className="student-header">
          <div className="student-info">
            {avatar ? (
              <img className="student-avatar" src={avatar} alt={name} />
            ) : (
              <div className="student-avatar placeholder">👦</div>
            )}
            <div>
              <p className="name">{name}</p>
              <p className="class">{klass}</p>
            </div>
          </div>
          <div className="status-tag">Trạng thái: <strong>-</strong></div>
        </div>

        <div className="no-trip" style={{ padding: 12, color: '#666' }}>
          <p style={{ margin: 0 }}>Không có chuyến được phân bổ.</p>
          <button className="map-button" onClick={goToMap} style={{ marginTop: 8 }}>
            Xem bản đồ
          </button>
        </div>

        <button className="toggle-button" onClick={toggleSummary}>
          {isSummary ? ' Chi tiết' : ' Ẩn bớt'}
        </button>
      </div>
    );
  }

  // Có trip -> render đầy đủ
  return (
    <div className={`student-card ${isSummary ? 'summary-mode' : 'full-mode'}`}>
      <div className="student-header">
        <div className="student-info">
          {avatar ? (
            <img className="student-avatar" src={avatar} alt={name} />
          ) : (
            <div className="student-avatar placeholder">👦</div>
          )}
          <div>
            <p className="name">{name}</p>
            <p className="class">{klass}</p>
          </div>
        </div>

        <div className="status-tag">
          Trạng thái: <strong>{show(trip.status)}</strong>
        </div>
      </div>

      <div className="trip-info-container">
        <div className="main-trip-info">
          {!isSummary ? (
            <div className="full-details">
              <p className="action-text">{show(trip.currentAction)}</p>

              <div className="progress-bar-container" style={{ marginTop: 8 }}>
                <div
                  className="progress-bar"
                  style={{ width: `${typeof trip.progress === 'number' ? trip.progress : 0}%` }}
                />
                <span style={{ marginLeft: 8 }}>{typeof trip.progress === 'number' ? `${trip.progress}%` : '-'}</span>
              </div>

              <p style={{ marginTop: 8 }}>Dự kiến đến: <strong>{show(trip.thoiGianDen)}</strong></p>
            </div>
          ) : (
            <div className="summary-details">
              <p className="action-text">{show(trip.currentAction)}</p>
              <p>Thời gian đi: <strong>{show(trip.thoiGianDi ?? trip.thoiGianDen)}</strong></p>
            </div>
          )}

          <button className="map-button" onClick={goToMap}>Xem bản đồ</button>
        </div>

        {!isSummary && (
          <div className="detailed-trip-info">
            <p>Chuyến đón:</p>
            <p>Xe buýt: <strong>{show(trip.bienSoXe)}</strong></p>
            <p>Thời gian đón: <strong>{show(trip.thoiGianDi)}</strong></p>
            <p>Điểm đón: <strong>{show(trip.pickupPoint)}</strong></p>
            <p>Tài xế: <strong>{show(trip.tenTaiXe)}</strong></p>
            {trip.anhTaiXe ? (
              <img className="driver-avatar" src={trip.anhTaiXe} alt={trip.tenTaiXe ?? 'Tài xế'} style={{ marginTop: 8, maxWidth: 80 }} />
            ) : null}

            <div className="pickup-status" style={{ marginTop: 8 }}>
              Trạng thái: <span>{show(trip.pickupStatus)}</span>
            </div>

            <div className="afternoon-trip" style={{ marginTop: 12 }}>
              <p>Chuyến trả:</p>
              <p>Xe buýt: <strong>{show(trip.bienSoXe)}</strong></p>
              <p>Thời gian trả: <strong>{show(trip.thoiGianDen)}</strong></p>
              <p>Điểm trả: <strong>{show(trip.dropoffPoint)}</strong></p>
              <p>Tài xế: <strong>{show(trip.tenTaiXe)}</strong></p>
            </div>
          </div>
        )}
      </div>

      <button className="toggle-button" onClick={toggleSummary}>
        {isSummary ? ' Chi tiết' : ' Ẩn bớt'}
      </button>
    </div>
  );
}

export default StudentCard;