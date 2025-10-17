import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useRouter } from 'next/router';
// import '../styles/Components.css';

function StudentCard({ student, isSummaryDefault = false }) {
  const [isSummary, setIsSummary] = useState(isSummaryDefault);
  // const navigate = useNavigate();
  const router = useRouter();

  const toggleSummary = () => {
    setIsSummary(!isSummary);
  };

  const goToMap = () => {
    // navigate('/map');
    router.push('/map');
  };

  const { studentName, studentClass, morningTrip, afternoonTrip } = student;
  const trip = morningTrip; // Dùng thông tin chuyến đi buổi sáng cho cả 2 dạng hiển thị

  // Chọn trạng thái hiển thị:
  // Dạng 1: Đầy đủ (trang chính bên trái) - Dùng khi isSummary = false
  // Dạng 2: Tóm tắt (trang chính bên phải) - Dùng khi isSummary = true

  return (
    <div className={`student-card ${isSummary ? 'summary-mode' : 'full-mode'}`}>
      {/* Phần Header chung */}
      <div className="student-header">
        <div className="student-info">
                    <div>
            <p className="name">{studentName}</p>
            <p className="class">{studentClass}</p>
          </div>
        </div>
        <div className={`status-tag status-${trip.status.toLowerCase().replace(/\s/g, '-')}`}>
          Trạng thái: <strong>{trip.status}</strong>
        </div>
      </div>

      {/* Thông tin chuyến đi & nút */}
      <div className="trip-info-container">
        {/* Thông tin chính */}
        <div className="main-trip-info">
          {/* Thông tin trạng thái chi tiết */}
          {!isSummary ? (
            // Dạng đầy đủ (Full Mode)
            <div className="full-details">
              <p className="action-text"> {trip.currentAction}</p>
              <div className="progress-bar-container">
                <div 
                    className="progress-bar" 
                    style={{ width: `${trip.progress}%` }}
                ></div>
                <span>{trip.progress}%</span>
              </div>
              <p>Dự kiến đến: <strong>{trip.estimatedArrivalTime}</strong></p>
            </div>
          ) : (
            // Dạng tóm tắt (Summary Mode)
            <div className="summary-details">
              <p className="action-text"> {trip.currentAction}</p>
              <p>Thời gian đến: <strong>{trip.arrivalTime || trip.scheduledTime}</strong></p>
            </div>
          )}

          {/* Nút Xem bản đồ (chung) */}
          <button className="map-button" onClick={goToMap}>
             Xem bản đồ
          </button>
        </div>
        
        {/* Thông tin chi tiết chuyến đi (chỉ hiển thị ở Full Mode) */}
        {!isSummary && (
          <div className="detailed-trip-info">
            <p>Chuyến đón:</p>
            <p>Xe buýt: <strong>{trip.busNumber}</strong></p>
            <p>Thời gian đón: <strong>{trip.scheduledTime}</strong></p>
            <p>Tài xế: <strong>{trip.driverName}</strong></p>
            <p>Điểm đón: <strong>{trip.pickupPoint}</strong></p>

            <div className="pickup-status">
                            Trạng thái: <span className={`status-${trip.pickupStatus.toLowerCase().replace(/\s/g, '-')}`}>{trip.pickupStatus}</span>
            </div>

            {/* Thông tin chuyến trả (Buổi chiều) */}
            <div className="afternoon-trip">
              <p>Chuyến trả:</p>
              <p>Xe buýt: <strong>{afternoonTrip.busNumber}</strong></p>
              <p>Thời gian đón: <strong>{afternoonTrip.scheduledTime}</strong></p>
              <p>Điểm trả: <strong>{afternoonTrip.pickupPoint}</strong></p>
              <p>Tài xế: <strong>{afternoonTrip.driverName}</strong></p>
              
              <div className="pickup-status">
                                Trạng thái: <span className={`status-${afternoonTrip.status.toLowerCase().replace(/\s/g, '-')}`}>{afternoonTrip.status}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nút Ẩn bớt / Chi tiết */}
      <button className="toggle-button" onClick={toggleSummary}>
        {isSummary ? ' Chi tiết' : ' Ẩn bớt'}
      </button>
    </div>
  );
}

export default StudentCard;