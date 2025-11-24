// "use client";
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// function ProgressBar({ percent }) {
//   const p = Math.max(0, Math.min(100, percent || 0));
//   return (
//     <div className="progress-bar">
//       <div
//         className="progress-fill"
//         style={{ width: `${p}%` }}
//       ></div>
//     </div>
//   );
// }

// function decideColor(trangThai) {
//   switch (trangThai) {
//     case "InProgress":
//       return { background: "lightgreen" };
//     case "Completed":
//       return { background: "lightgray" };
//     case "Scheduled":
//       return { background: "lightyellow" };
//     default:
//       return { background: "white" };
//   }
// }

// // Hàm chuẩn hóa định dạng ngày
// // Hàm chuẩn hóa định dạng ngày - SỬA LẠI ĐỂ XỬ LÝ MÚI GIỜ
// const normalizeDate = (dateString) => {
//   if (!dateString) {
//     console.log('❌ Date string is null or undefined');
//     return null;
//   }
  
//   try {
//     console.log('📅 Raw date string:', dateString);
    
//     // Nếu là ISO string (có chứa T và Z), xử lý múi giờ
//     if (dateString.includes('T')) {
//       // Tạo Date object từ string
//       const date = new Date(dateString);
      
//       // Điều chỉnh cho múi giờ Việt Nam (UTC+7)
//       const adjustedDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
      
//       // Lấy phần date đã điều chỉnh
//       const year = adjustedDate.getUTCFullYear();
//       const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
//       const day = String(adjustedDate.getUTCDate()).padStart(2, '0');
      
//       const normalizedDate = `${year}-${month}-${day}`;
//       console.log('📅 ISO date parsed (adjusted):', normalizedDate);
//       return normalizedDate;
//     }
    
//     // Nếu đã là định dạng YYYY-MM-DD
//     if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
//       console.log('📅 Already YYYY-MM-DD:', dateString);
//       return dateString;
//     }
    
//     console.log('❌ Unknown date format:', dateString);
//     return null;
//   } catch (error) {
//     console.error('❌ Error parsing date:', error, 'dateString:', dateString);
//     return null;
//   }
// };

// // Hàm lấy ngày hôm nay đúng múi giờ Việt Nam
// const getTodayVietnam = () => {
//   const now = new Date();
//   // Điều chỉnh cho múi giờ Việt Nam (UTC+7)
//   const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  
//   const year = vietnamTime.getUTCFullYear();
//   const month = String(vietnamTime.getUTCMonth() + 1).padStart(2, '0');
//   const day = String(vietnamTime.getUTCDate()).padStart(2, '0');
  
//   return `${year}-${month}-${day}`;
// };

// // Hàm kiểm tra xem chuyến xe có phải hôm nay không - SỬA LẠI
// const isTripToday = (trip) => {
//   const today = getTodayVietnam(); // Sử dụng hàm mới
  
//   // Kiểm tra nếu trip.ngay tồn tại
//   if (!trip.ngay) {
//     console.log('❌ Trip has no ngay property:', trip.maChuyenXe);
//     return false;
//   }
  
//   const tripDate = normalizeDate(trip.ngay);
//   const isToday = tripDate === today;
  
//   console.log(`📅 Trip ${trip.maChuyenXe} date check:`, {
//     tripNgay: trip.ngay,
//     tripDate,
//     today,
//     isToday
//   });
  
//   return isToday;
// };

// // Hàm tìm chuyến xe tương ứng từ mảng trip
// const findMatchingTrips = (studentTrips, allTrips) => {
//   if (!Array.isArray(studentTrips) || !Array.isArray(allTrips)) {
//     console.log('❌ Invalid input data');
//     return [];
//   }

//   console.log('🎯 Finding matching trips...');
//   console.log('Student trips count:', studentTrips.length);
//   console.log('All trips count:', allTrips.length);

//   const matchedTrips = studentTrips.map(studentTrip => {
//     // Tìm chuyến xe tương ứng trong allTrips dựa trên maChuyenXe
//     const matchingTrip = allTrips.find(trip => 
//       trip.maChuyenXe === studentTrip.maChuyenXe
//     );

//     if (matchingTrip) {
//       console.log('✅ Found matching trip:', {
//         maChuyenXe: studentTrip.maChuyenXe,
//         hasNgay: !!matchingTrip.ngay,
//         ngay: matchingTrip.ngay
//       });
      
//       // Kết hợp thông tin từ studentTrip và matchingTrip
//       return {
//         ...studentTrip, // Giữ lại thông tin từ student.trips
//         ...matchingTrip // Bổ sung thông tin từ allTrips (bao gồm ngay)
//       };
//     } else {
//       console.log('❌ No matching trip found for maChuyenXe:', studentTrip.maChuyenXe);
//       return studentTrip; // Trả về studentTrip gốc nếu không tìm thấy
//     }
//   });

//   console.log('📋 Matched trips result:', matchedTrips);
//   return matchedTrips;
// };

// // Hàm kiểm tra xem chuyến xe có phải hôm nay không
// // const isTripToday = (trip) => {
// //   const today = new Date().toISOString().split("T")[0];
  
// //   // Kiểm tra nếu trip.ngay tồn tại
// //   if (!trip.ngay) {
// //     console.log('❌ Trip has no ngay property:', trip.maChuyenXe);
// //     return false;
// //   }
  
// //   const tripDate = normalizeDate(trip.ngay);
// //   const isToday = tripDate === today;
  
// //   console.log(`📅 Trip ${trip.maChuyenXe} date check:`, {
// //     tripDate,
// //     today,
// //     isToday
// //   });
  
// //   return isToday;
// // };
// export const getStudentWithStopAllocations = async (maHocSinh) => {
//   try {
//     const response = await fetch(`/api/phanbohocsinhtram?maHocSinh=${maHocSinh}`);
//     const allocations = await response.json();
    
//     return allocations.map(allocation => ({
//       maPhanBo: allocation.maPhanBoHocSinhTram,
//       maHocSinh: allocation.maHocSinh,
//       maDiemDung: allocation.maDiemDung,
//       tenDiemDung: allocation.tenDiemDung,
//       loaiPhanBo: allocation.loaiPhanBo, // 'Sang' hoặc 'Chieu'
//       thoiGianBatDau: allocation.thoiGianBatDau,
//       thoiGianKetThuc: allocation.thoiGianKetThuc,
//       viTri: {
//         kinhDo: allocation.kinhDo,
//         viDo: allocation.viDo
//       }
//     }));
//   } catch (error) {
//     console.error('Error fetching student allocations:', error);
//     throw error;
//   }
// };

// // Lấy lịch sử di chuyển của học sinh theo điểm dừng
// export const getStudentTravelHistory = async (maHocSinh) => {
//   try {
//     const response = await fetch(`/api/lichsu-hocsinh/${maHocSinh}`);
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching student travel history:', error);
//     throw error;
//   }
// };
// // Hàm xác định trạng thái chuyến xe dựa trên thời gian hiện tại
// const determineTripStatus = (trip) => {
//   const now = new Date();
//   const currentTime = now.toTimeString().substring(0, 8);
//   const thoiGianDi = trip.thoiGianDi;
//   const thoiGianDen = trip.thoiGianDen;
  
//   console.log('⏰ Determining status for trip:', trip.maChuyenXe, {
//     currentTime,
//     thoiGianDi,
//     thoiGianDen
//   });
  
//   if (!thoiGianDi || !thoiGianDen) {
//     return "Unknown";
//   }
  
//   if (currentTime < thoiGianDi) {
//     return "Scheduled";
//   } else if (currentTime >= thoiGianDi && currentTime <= thoiGianDen) {
//     return "InProgress";
//   } else if (currentTime > thoiGianDen) {
//     return "Completed";
//   }
  
//   return "Unknown";
// };

// // Hàm sắp xếp chuyến xe theo ưu tiên
// const sortTripsByPriority = (trips) => {
//   const today = new Date().toISOString().split("T")[0];
  
//   console.log('🎯 Filtering trips for today:', today);
  
//   // CHỈ LỌC CHUYẾN XE HÔM NAY
//   const todayTrips = trips.filter(trip => {
//     const isToday = isTripToday(trip);
//     console.log(`🔍 Trip ${trip.maChuyenXe} - isToday: ${isToday}`);
//     return isToday;
//   });
  
//   console.log('📋 Today trips found:', todayTrips.length);
  
//   if (todayTrips.length === 0) return [];
  
//   // Xác định trạng thái real-time cho các chuyến hôm nay
//   const processedTrips = todayTrips.map(trip => {
//     const status = determineTripStatus(trip);
//     console.log(`🔄 Trip ${trip.maChuyenXe} status: ${status}`);
//     return { ...trip, trangThai: status };
//   }).filter(trip => trip.trangThai !== "Unknown");
  
//   // Sắp xếp theo ưu tiên: InProgress > Scheduled > Completed
//   const sorted = processedTrips.sort((a, b) => {
//     const priorityOrder = { "InProgress": 1, "Scheduled": 2, "Completed": 3 };
    
//     if (priorityOrder[a.trangThai] === priorityOrder[b.trangThai]) {
//       return b.thoiGianDen.localeCompare(a.thoiGianDen);
//     }
    
//     return priorityOrder[a.trangThai] - priorityOrder[b.trangThai];
//   });
  
//   console.log('🏁 Final sorted trips:', sorted);
//   return sorted;
// };

// // Hàm lấy chuyến xe hoàn thành muộn nhất
// const getLatestCompletedTrip = (trips) => {
//   const completedTrips = trips.filter(trip => trip.trangThai === "Completed");
//   if (completedTrips.length === 0) return null;
  
//   return completedTrips.sort((a, b) => b.thoiGianDen.localeCompare(a.thoiGianDen))[0];
// };

// // Hàm tính phần trăm tiến trình
// const calculateProgress = (trip) => {
//   if (trip.trangThai !== "InProgress") {
//     return trip.trangThai === "Completed" ? 100 : 0;
//   }
  
//   const now = new Date();
//   const currentTime = now.toTimeString().substring(0, 8);
  
//   try {
//     const start = new Date(`1970-01-01T${trip.thoiGianDi}`);
//     const end = new Date(`1970-01-01T${trip.thoiGianDen}`);
//     const current = new Date(`1970-01-01T${currentTime}`);
    
//     const totalDuration = end - start;
//     const elapsedDuration = current - start;
    
//     if (totalDuration <= 0) return 0;
    
//     const progress = (elapsedDuration / totalDuration) * 100;
//     return Math.min(Math.max(progress, 0), 100);
//   } catch (error) {
//     console.error('Lỗi tính tiến trình:', error);
//     return 0;
//   }
// };

// // Giả sử bạn có mảng allTrips từ nơi khác (có thể import hoặc truyền qua props)
// // const allTrips = [...] // Mảng này chứa tất cả chuyến xe với đầy đủ thông tin bao gồm ngay

// export default function StudentCard({ student = {}, isSummaryDefault = false, allTrips = [] }) {
//   const [isSummary, setIsSummary] = useState(isSummaryDefault);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [matchedTrips, setMatchedTrips] = useState([]);
//   const router = useRouter();

//   const name = student.tenHocSinh || "-";
//   const klass = student.lop || "-";
//   const avatar = student.anhHocSinh ? `http://localhost:5000/${student.anhHocSinh}` : null;
//   console.log(allTrips);

//   // Tìm các chuyến xe tương ứng khi component mount hoặc dữ liệu thay đổi
//   useEffect(() => {
//     if (student.trips && allTrips.length > 0) {
//       const matches = findMatchingTrips(student.trips, allTrips);
//       setMatchedTrips(matches);
//     } else {
//       setMatchedTrips(student.trips || []);
//     }
//   }, [student.trips, allTrips]);

//   // Cập nhật thời gian mỗi giây để tính toán trạng thái real-time
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 60000);
    
//     return () => clearInterval(interval);
//   }, []);

//   // Sắp xếp và lọc chuyến xe - CHỈ LẤY CHUYẾN HÔM NAY
//   const sortedTrips = sortTripsByPriority(matchedTrips);
  
//   const hasTripToday = sortedTrips.length > 0;
  
//   // Xác định chuyến xe hiện tại để hiển thị
//   let current;
//   if (hasTripToday) {
//     // Nếu có chuyến đang diễn ra hoặc sắp diễn ra
//     const activeOrUpcomingTrip = sortedTrips.find(trip => 
//       trip.trangThai === "InProgress" || trip.trangThai === "Scheduled"
//     );
    
//     if (activeOrUpcomingTrip) {
//       current = activeOrUpcomingTrip;
//     } else {
//       // Nếu tất cả đã hoàn thành, lấy chuyến hoàn thành muộn nhất
//       current = getLatestCompletedTrip(sortedTrips);
//     }
//   }

//   // Tính phần trăm tiến trình cho chuyến hiện tại
//   const currentProgress = current ? calculateProgress(current) : 0;

//   const goToMap = () => router.push("/map");

//   console.log('=== STUDENT CARD FINAL RESULT ===');
//   console.log('Student trips count:', student.trips?.length || 0);
//   console.log('All trips count:', allTrips.length);
//   console.log('Matched trips count:', matchedTrips.length);
//   console.log('Today trips count:', sortedTrips.length);
//   console.log('Current trip:', current);
//   console.log('Has trip today:', hasTripToday);

//   return (
//     <div className="student-card">
//       {/* Header */}
//       <div className="student-card-header">
//         <div className="student-info">
//           <div className="student-avatar">
//             {avatar ? (
//               <img src={avatar} alt={name} />
//             ) : (
//               <div className="avatar-placeholder">👤</div>
//             )}
//           </div>
//         </div>
//         <div className="student-name-class">
//           <div className="student-name">
//             <div className="student-name">{name}</div>
//             <div className="student-class">Lớp {klass}</div>
//           </div>
//           <div className="status-box">
//             <div className="status-label">Trạng thái:</div>
//             <div className="status-value">
//               {!hasTripToday ? "Chưa phân bổ" : (current?.trangThai === "Completed" ? "Hoàn tất" : current?.trangThai || "Chưa phân bổ")}
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Body */}
//       <div className="student-body">
//         <div className="student-main">
//           {!hasTripToday ? (
//             <div>Hôm nay không có chuyến đi nào.</div>
//           ) : (
//             <>
//               <div className="trip-status">
//                 {current?.trangThai === "InProgress"
//                   ? "Xe đang trên đường"
//                   : current?.trangThai === "Scheduled"
//                   ? "Chuyến xe sắp diễn ra"
//                   : current?.trangThai === "Completed"
//                   ? "Chuyến xe đã hoàn thành"
//                   : `Trạng thái: ${current?.trangThai || "-"}`}
//               </div>

//               <div className="trip-time">
//                 <div className="trip-estimate">
//                   <div>
//                     Giờ đi: <strong>{current?.thoiGianDi?.substring(0, 5) || "-"}</strong>
//                   </div>
//                   <div>
//                     Giờ đến: <strong>{current?.thoiGianDen?.substring(0, 5) || "-"}</strong>
//                   </div>
//                   <div>
//                     Tuyến số: <strong>{current?.tenTuyenDuong || "-"}</strong>
//                   </div>
//                 </div>
//                 <div className="trip-info-row">
//                   <div>
//                     Biển số xe: <strong>{current?.bienSoXe || "-"}</strong>
//                   </div>
//                   <div>
//                     Tài xế : <strong>{current?.tenTaiXe || "-"}</strong>
//                   </div>
//                 </div>
//                 <ProgressBar percent={currentProgress} />
//                 <div className="map-button-wrap">
//                   <button className="map-button" onClick={goToMap}>
//                     Xem bản đồ
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
        
//         {!isSummary && hasTripToday && (
//           <div className="trip-details">
//             {sortedTrips.map((t, idx) => {
//               const isCurrentTrip = t.maChuyenXe === current?.maChuyenXe;
//               const tripProgress = calculateProgress(t);
              
//               return (
//                 <div
//                   key={t.maChuyenXe || idx}
//                   className="trip-item"
//                   style={decideColor(t.trangThai)}
//                 >
//                   <div className="trip-title">
//                     {t.tenTuyenDuong || `Chuyến ${idx + 1}`}
//                     {isCurrentTrip && <span style={{marginLeft: '10px', color: 'red'}}>(Đang hiển thị)</span>}
//                   </div>
//                   <div className="trip-info">
//                     Xe: <strong>{t.bienSoXe || "-"}</strong>
//                   </div>
//                   <div className="trip-info">
//                     Thời gian:{" "}
//                     <strong>
//                       {t.thoiGianDi?.substring(0, 5) || "-"} → {t.thoiGianDen?.substring(0, 5) || "-"}
//                     </strong>
//                   </div>
//                   <div className="trip-info">
//                     Tài xế: <strong>{t.tenTaiXe || "-"}</strong>
//                   </div>
//                   <div>
//                     Trạng thái: <strong>
//                       {t.trangThai === "Scheduled" ? "Sắp diễn ra" : 
//                        t.trangThai === "InProgress" ? "Đang diễn ra" : 
//                        t.trangThai === "Completed" ? "Đã hoàn thành" : 
//                        t.trangThai}
//                     </strong>
//                   </div>
//                   <div>
//                     Tiến trình: <strong>{Math.round(tripProgress)}%</strong>
//                   </div>
//                   {t.anhTaiXe && (
//                     <img
//                       src={`http://localhost:5000/uploads/${t.anhTaiXe}`}
//                       alt={t.tenTaiXe}
//                       className="driver-avatar"
//                     />
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <div className="student-footer">
//         {hasTripToday && (
//           <button
//             onClick={() => setIsSummary((v) => !v)}
//             className="toggle-button"
//           >
//             {isSummary ? "Chi tiết" : "Ẩn bớt"}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function ProgressBar({ percent }) {
  const p = Math.max(0, Math.min(100, percent || 0));
  return (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${p}%` }}
      ></div>
    </div>
  );
}

function decideColor(trangThai) {
  switch (trangThai) {
    case "InProgress":
      return { background: "lightgreen" };
    case "Completed":
      return { background: "lightgray" };
    case "Scheduled":
      return { background: "lightyellow" };
    default:
      return { background: "white" };
  }
}

// Hàm chuẩn hóa định dạng ngày
const normalizeDate = (dateString) => {
  if (!dateString) {
    console.log('❌ Date string is null or undefined');
    return null;
  }
  
  try {
    console.log('📅 Raw date string:', dateString);
    
    // Nếu là ISO string (có chứa T và Z), xử lý múi giờ
    if (dateString.includes('T')) {
      const date = new Date(dateString);
      const adjustedDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
      
      const year = adjustedDate.getUTCFullYear();
      const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(adjustedDate.getUTCDate()).padStart(2, '0');
      
      const normalizedDate = `${year}-${month}-${day}`;
      console.log('📅 ISO date parsed (adjusted):', normalizedDate);
      return normalizedDate;
    }
    
    // Nếu đã là định dạng YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      console.log('📅 Already YYYY-MM-DD:', dateString);
      return dateString;
    }
    
    console.log('❌ Unknown date format:', dateString);
    return null;
  } catch (error) {
    console.error('❌ Error parsing date:', error, 'dateString:', dateString);
    return null;
  }
};

// Hàm lấy ngày hôm nay đúng múi giờ Việt Nam
const getTodayVietnam = () => {
  const now = new Date();
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  
  const year = vietnamTime.getUTCFullYear();
  const month = String(vietnamTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(vietnamTime.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Hàm kiểm tra xem chuyến xe có phải hôm nay không
const isTripToday = (trip) => {
  const today = getTodayVietnam();
  
  if (!trip.ngay) {
    console.log('❌ Trip has no ngay property:', trip.maChuyenXe);
    return false;
  }
  
  const tripDate = normalizeDate(trip.ngay);
  const isToday = tripDate === today;
  
  console.log(`📅 Trip ${trip.maChuyenXe} date check:`, {
    tripNgay: trip.ngay,
    tripDate,
    today,
    isToday
  });
  
  return isToday;
};

// Hàm tìm chuyến xe tương ứng từ mảng trip
const findMatchingTrips = (studentTrips, allTrips) => {
  if (!Array.isArray(studentTrips) || !Array.isArray(allTrips)) {
    console.log('❌ Invalid input data');
    return [];
  }

  console.log('🎯 Finding matching trips...');
  console.log('Student trips count:', studentTrips.length);
  console.log('All trips count:', allTrips.length);

  const matchedTrips = studentTrips.map(studentTrip => {
    const matchingTrip = allTrips.find(trip => 
      trip.maChuyenXe === studentTrip.maChuyenXe
    );

    if (matchingTrip) {
      console.log('✅ Found matching trip:', {
        maChuyenXe: studentTrip.maChuyenXe,
        hasNgay: !!matchingTrip.ngay,
        ngay: matchingTrip.ngay
      });
      
      return {
        ...studentTrip,
        ...matchingTrip
      };
    } else {
      console.log('❌ No matching trip found for maChuyenXe:', studentTrip.maChuyenXe);
      return studentTrip;
    }
  });

  console.log('📋 Matched trips result:', matchedTrips);
  return matchedTrips;
};

// Hàm xác định trạng thái chuyến xe dựa trên thời gian hiện tại
const determineTripStatus = (trip) => {
  const now = new Date();
  const currentTime = now.toTimeString().substring(0, 8);
  const thoiGianDi = trip.thoiGianDi;
  const thoiGianDen = trip.thoiGianDen;
  
  console.log('⏰ Determining status for trip:', trip.maChuyenXe, {
    currentTime,
    thoiGianDi,
    thoiGianDen
  });
  
  if (!thoiGianDi || !thoiGianDen) {
    return "Unknown";
  }
  
  if (currentTime < thoiGianDi) {
    return "Scheduled";
  } else if (currentTime >= thoiGianDi && currentTime <= thoiGianDen) {
    return "InProgress";
  } else if (currentTime > thoiGianDen) {
    return "Completed";
  }
  
  return "Unknown";
};

// Hàm sắp xếp chuyến xe theo ưu tiên
const sortTripsByPriority = (trips) => {
  const today = getTodayVietnam();
  
  console.log('🎯 Filtering trips for today:', today);
  
  // CHỈ LỌC CHUYẾN XE HÔM NAY
  const todayTrips = trips.filter(trip => {
    const isToday = isTripToday(trip);
    console.log(`🔍 Trip ${trip.maChuyenXe} - isToday: ${isToday}`);
    return isToday;
  });
  
  console.log('📋 Today trips found:', todayTrips.length);
  
  if (todayTrips.length === 0) return [];
  
  // Xác định trạng thái real-time cho các chuyến hôm nay
  const processedTrips = todayTrips.map(trip => {
    const status = determineTripStatus(trip);
    console.log(`🔄 Trip ${trip.maChuyenXe} status: ${status}`);
    return { ...trip, trangThai: status };
  }).filter(trip => trip.trangThai !== "Unknown");
  
  // Sắp xếp theo ưu tiên: InProgress > Scheduled > Completed
  const sorted = processedTrips.sort((a, b) => {
    const priorityOrder = { "InProgress": 1, "Scheduled": 2, "Completed": 3 };
    
    if (priorityOrder[a.trangThai] === priorityOrder[b.trangThai]) {
      return a.thoiGianDi.localeCompare(b.thoiGianDi); // Sắp xếp theo giờ đi
    }
    
    return priorityOrder[a.trangThai] - priorityOrder[b.trangThai];
  });
  
  console.log('🏁 Final sorted trips:', sorted);
  return sorted;
};

// Hàm lấy chuyến xe hoàn thành muộn nhất
const getLatestCompletedTrip = (trips) => {
  const completedTrips = trips.filter(trip => trip.trangThai === "Completed");
  if (completedTrips.length === 0) return null;
  
  return completedTrips.sort((a, b) => b.thoiGianDen.localeCompare(a.thoiGianDen))[0];
};

// Hàm tính phần trăm tiến trình
const calculateProgress = (trip) => {
  if (trip.trangThai !== "InProgress") {
    return trip.trangThai === "Completed" ? 100 : 0;
  }
  
  const now = new Date();
  const currentTime = now.toTimeString().substring(0, 8);
  
  try {
    const start = new Date(`1970-01-01T${trip.thoiGianDi}`);
    const end = new Date(`1970-01-01T${trip.thoiGianDen}`);
    const current = new Date(`1970-01-01T${currentTime}`);
    
    const totalDuration = end - start;
    const elapsedDuration = current - start;
    
    if (totalDuration <= 0) return 0;
    
    const progress = (elapsedDuration / totalDuration) * 100;
    return Math.min(Math.max(progress, 0), 100);
  } catch (error) {
    console.error('Lỗi tính tiến trình:', error);
    return 0;
  }
};

// Hàm lấy loại chuyến xe (Đón/Trả)
const getTripType = (trip) => {
  // Dựa vào thời gian để xác định sáng/chiều
  if (trip.thoiGianDi && trip.thoiGianDi < '12:00:00') {
    return 'ĐÓN';
  } else {
    return 'TRẢ';
  }
};

// Hàm lấy icon cho loại chuyến
const getTripIcon = (trip) => {
  return getTripType(trip) === 'ĐÓN' ? '🚌' : '🏠';
};

// Hàm lấy màu cho loại chuyến
const getTripColor = (trip) => {
  return getTripType(trip) === 'ĐÓN' ? '#FF9800' : '#9C27B0';
};

export default function StudentCard({ student = {}, isSummaryDefault = false }) {
  const [isSummary, setIsSummary] = useState(isSummaryDefault);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [matchedTrips, setMatchedTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Lấy dữ liệu từ student object mới
  const name = student.studentName || "-";
  const klass = student.studentClass || "-";
  const avatar = student.studentImage ? `http://localhost:5000/${student.studentImage}` : null;
  const allTrips = student.allTrips || [];
  const morningTrip = student.morningTrip || {};
  const afternoonTrip = student.afternoonTrip || {};

  // Tạo trips từ dữ liệu morningTrip và afternoonTrip
  useEffect(() => {
    const processTrips = () => {
      console.log('🔄 Processing trips from student data...');
      
      const trips = [];
      
      // Thêm chuyến sáng nếu có thông tin
      if (morningTrip.tripId) {
        trips.push({
          maChuyenXe: morningTrip.tripId,
          bienSoXe: morningTrip.busNumber,
          tenTaiXe: morningTrip.driverName,
          anhTaiXe: morningTrip.driverImage,
          tenTuyenDuong: morningTrip.routeName,
          thoiGianDi: morningTrip.scheduledTime,
          thoiGianDen: morningTrip.estimatedArrivalTime,
          trangThai: morningTrip.status,
          loaiPhanBo: 'Sang',
          ngay: new Date().toISOString().split('T')[0] // Hôm nay
        });
      }
      
      // Thêm chuyến chiều nếu có thông tin
      if (afternoonTrip.tripId) {
        trips.push({
          maChuyenXe: afternoonTrip.tripId,
          bienSoXe: afternoonTrip.busNumber,
          tenTaiXe: afternoonTrip.driverName,
          anhTaiXe: afternoonTrip.driverImage,
          tenTuyenDuong: afternoonTrip.routeName,
          thoiGianDi: afternoonTrip.scheduledTime,
          thoiGianDen: afternoonTrip.estimatedArrivalTime,
          trangThai: afternoonTrip.status,
          loaiPhanBo: 'Chieu',
          ngay: new Date().toISOString().split('T')[0] // Hôm nay
        });
      }
      
      console.log('✅ Processed trips:', trips);
      
      // Nếu có allTrips từ props, thực hiện matching
      if (allTrips.length > 0) {
        const matches = findMatchingTrips(trips, allTrips);
        setMatchedTrips(matches);
      } else {
        setMatchedTrips(trips);
      }
    };
    
    processTrips();
  }, [student, allTrips, morningTrip, afternoonTrip]);

  // Cập nhật thời gian mỗi phút để tính toán trạng thái real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Sắp xếp và lọc chuyến xe - CHỈ LẤY CHUYẾN HÔM NAY
  const sortedTrips = sortTripsByPriority(matchedTrips);
  
  const hasTripToday = sortedTrips.length > 0;
  
  // Xác định chuyến xe hiện tại để hiển thị
  let current;
  if (hasTripToday) {
    // Nếu có chuyến đang diễn ra hoặc sắp diễn ra
    const activeOrUpcomingTrip = sortedTrips.find(trip => 
      trip.trangThai === "InProgress" || trip.trangThai === "Scheduled"
    );
    
    if (activeOrUpcomingTrip) {
      current = activeOrUpcomingTrip;
    } else {
      // Nếu tất cả đã hoàn thành, lấy chuyến hoàn thành muộn nhất
      current = getLatestCompletedTrip(sortedTrips);
    }
  }

  // Tính phần trăm tiến trình cho chuyến hiện tại
  const currentProgress = current ? calculateProgress(current) : 0;

  const goToMap = () => router.push("/map");

  console.log('=== STUDENT CARD FINAL RESULT ===');
  console.log('Student:', name);
  console.log('Morning trip:', morningTrip);
  console.log('Afternoon trip:', afternoonTrip);
  console.log('All trips count:', allTrips.length);
  console.log('Matched trips count:', matchedTrips.length);
  console.log('Today trips count:', sortedTrips.length);
  console.log('Current trip:', current);
  console.log('Has trip today:', hasTripToday);

  // Nếu không có trip data, hiển thị thông tin đơn giản từ morningTrip
  if (!hasTripToday && morningTrip.busNumber) {
    return (
      <div className="student-card">
        {/* Header */}
        <div className="student-card-header">
          <div className="student-info">
            <div className="student-avatar">
              {avatar ? (
                <img src={avatar} alt={name} />
              ) : (
                <div className="avatar-placeholder">👤</div>
              )}
            </div>
          </div>
          <div className="student-name-class">
            <div className="student-name">
              <div className="student-name">{name}</div>
              <div className="student-class">Lớp {klass}</div>
            </div>
            <div className="status-box">
              <div className="status-label">Trạng thái:</div>
              <div className="status-value">
                {morningTrip.status === "Completed" ? "Hoàn tất" : 
                 morningTrip.status === "InProgress" ? "Đang diễn ra" : 
                 morningTrip.status === "Scheduled" ? "Sắp diễn ra" : 
                 "Chưa phân bổ"}
              </div>
            </div>
          </div>
        </div>
        
        {/* Body - Hiển thị thông tin đơn giản */}
        <div className="student-body">
          <div className="student-main">
            <div className="trip-status">
              {morningTrip.currentAction || "Chưa khởi hành"}
            </div>

            <div className="trip-time">
              <div className="trip-estimate">
                <div>
                  Giờ đi: <strong>{morningTrip.scheduledTime?.substring(0, 5) || "-"}</strong>
                </div>
                <div>
                  Giờ đến: <strong>{morningTrip.estimatedArrivalTime?.substring(0, 5) || "-"}</strong>
                </div>
                <div>
                  Tuyến: <strong>{morningTrip.routeName || "-"}</strong>
                </div>
              </div>
              <div className="trip-info-row">
                <div>
                  Biển số xe: <strong>{morningTrip.busNumber || "-"}</strong>
                </div>
                <div>
                  Tài xế: <strong>{morningTrip.driverName || "-"}</strong>
                </div>
              </div>
              <ProgressBar percent={morningTrip.progress || 0} />
              <div className="map-button-wrap">
                <button className="map-button" onClick={goToMap}>
                  Xem bản đồ
                </button>
              </div>
            </div>
          </div>
          
          {/* Chi tiết chuyến đi */}
          {!isSummary && (
            <div className="trip-details">
              {/* Chuyến sáng */}
              <div className="trip-item" style={decideColor(morningTrip.status)}>
                <div className="trip-title">
                  <span style={{ color: '#FF9800', marginRight: '8px' }}>🚌</span>
                  Chuyến sáng
                </div>
                <div className="trip-info">
                  Xe: <strong>{morningTrip.busNumber || "-"}</strong>
                </div>
                <div className="trip-info">
                  Thời gian: <strong>{morningTrip.scheduledTime || "-"}</strong>
                </div>
                <div className="trip-info">
                  Tài xế: <strong>{morningTrip.driverName || "-"}</strong>
                </div>
                <div>
                  Trạng thái: <strong>
                    {morningTrip.status === "Scheduled" ? "Sắp diễn ra" : 
                     morningTrip.status === "InProgress" ? "Đang diễn ra" : 
                     morningTrip.status === "Completed" ? "Đã hoàn thành" : 
                     morningTrip.status}
                  </strong>
                </div>
                <div>
                  Tiến trình: <strong>{morningTrip.progress || 0}%</strong>
                </div>
                {morningTrip.driverImage && (
                  <img
                    src={`http://localhost:5000/uploads/${morningTrip.driverImage}`}
                    alt={morningTrip.driverName}
                    className="driver-avatar"
                  />
                )}
              </div>

              {/* Chuyến chiều */}
              <div className="trip-item" style={decideColor(afternoonTrip.status)}>
                <div className="trip-title">
                  <span style={{ color: '#9C27B0', marginRight: '8px' }}>🏠</span>
                  Chuyến chiều
                </div>
                <div className="trip-info">
                  Xe: <strong>{afternoonTrip.busNumber || "-"}</strong>
                </div>
                <div className="trip-info">
                  Thời gian: <strong>{afternoonTrip.scheduledTime || "-"}</strong>
                </div>
                <div className="trip-info">
                  Tài xế: <strong>{afternoonTrip.driverName || "-"}</strong>
                </div>
                <div>
                  Trạng thái: <strong>
                    {afternoonTrip.status === "Scheduled" ? "Sắp diễn ra" : 
                     afternoonTrip.status === "InProgress" ? "Đang diễn ra" : 
                     afternoonTrip.status === "Completed" ? "Đã hoàn thành" : 
                     afternoonTrip.status}
                  </strong>
                </div>
                {afternoonTrip.driverImage && (
                  <img
                    src={`http://localhost:5000/uploads/${afternoonTrip.driverImage}`}
                    alt={afternoonTrip.driverName}
                    className="driver-avatar"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="student-footer">
          <button
            onClick={() => setIsSummary((v) => !v)}
            className="toggle-button"
          >
            {isSummary ? "Chi tiết" : "Ẩn bớt"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-card">
      {/* Header */}
      <div className="student-card-header">
        <div className="student-info">
          <div className="student-avatar">
            {avatar ? (
              <img src={avatar} alt={name} />
            ) : (
              <div className="avatar-placeholder">👤</div>
            )}
          </div>
        </div>
        <div className="student-name-class">
          <div className="student-name">
            <div className="student-name">{name}</div>
            <div className="student-class">Lớp {klass}</div>
          </div>
          <div className="status-box">
            <div className="status-label">Trạng thái:</div>
            <div className="status-value">
              {!hasTripToday ? "Chưa phân bổ" : (current?.trangThai === "Completed" ? "Hoàn tất" : current?.trangThai || "Chưa phân bổ")}
            </div>
          </div>
        </div>
      </div>
      
      {/* Body */}
      <div className="student-body">
        <div className="student-main">
          {!hasTripToday ? (
            <div>Hôm nay không có chuyến đi nào.</div>
          ) : (
            <>
              <div className="trip-status">
                <span style={{ 
                  color: current ? getTripColor(current) : '#666',
                  fontWeight: 'bold',
                  marginRight: '8px'
                }}>
                  {current ? getTripIcon(current) : ''} {current ? getTripType(current) : ''}
                </span>
                {current?.trangThai === "InProgress"
                  ? current?.loaiPhanBo === 'Sang' ? "Xe đang đón học sinh" : "Xe đang trả học sinh"
                  : current?.trangThai === "Scheduled"
                  ? "Chuyến xe sắp diễn ra"
                  : current?.trangThai === "Completed"
                  ? "Chuyến xe đã hoàn thành"
                  : `Trạng thái: ${current?.trangThai || "-"}`}
              </div>

              <div className="trip-time">
                <div className="trip-estimate">
                  <div>
                    Giờ {current?.loaiPhanBo === 'Sang' ? 'đón' : 'trả'}: <strong>{current?.thoiGianDi?.substring(0, 5) || "-"}</strong>
                  </div>
                  <div>
                    Giờ {current?.loaiPhanBo === 'Sang' ? 'đến trường' : 'kết thúc'}: <strong>{current?.thoiGianDen?.substring(0, 5) || "-"}</strong>
                  </div>
                  <div>
                    Tuyến số: <strong>{current?.tenTuyenDuong || "-"}</strong>
                  </div>
                </div>
                <div className="trip-info-row">
                  <div>
                    Biển số xe: <strong>{current?.bienSoXe || "-"}</strong>
                  </div>
                  <div>
                    Tài xế: <strong>{current?.tenTaiXe || "-"}</strong>
                  </div>
                </div>
                <ProgressBar percent={currentProgress} />
                <div className="map-button-wrap">
                  <button className="map-button" onClick={goToMap}>
                    Xem bản đồ
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        {!isSummary && hasTripToday && (
          <div className="trip-details">
            {sortedTrips.map((t, idx) => {
              const isCurrentTrip = t.maChuyenXe === current?.maChuyenXe;
              const tripProgress = calculateProgress(t);
              const tripType = getTripType(t);
              const tripIcon = getTripIcon(t);
              const tripColor = getTripColor(t);
              
              return (
                <div
                  key={t.maChuyenXe || idx}
                  className="trip-item"
                  style={decideColor(t.trangThai)}
                >
                  <div className="trip-title">
                    <span style={{ color: tripColor, marginRight: '8px' }}>
                      {tripIcon}
                    </span>
                    {t.tenTuyenDuong || `Chuyến ${idx + 1}`}
                    <span style={{ 
                      color: tripColor, 
                      fontWeight: 'bold',
                      marginLeft: '8px',
                      fontSize: '0.9em'
                    }}>
                      ({tripType})
                    </span>
                    {isCurrentTrip && <span style={{marginLeft: '10px', color: 'red'}}>(Đang hiển thị)</span>}
                  </div>
                  <div className="trip-info">
                    Xe: <strong>{t.bienSoXe || "-"}</strong>
                  </div>
                  <div className="trip-info">
                    Thời gian:{" "}
                    <strong>
                      {t.thoiGianDi?.substring(0, 5) || "-"} → {t.thoiGianDen?.substring(0, 5) || "-"}
                    </strong>
                  </div>
                  <div className="trip-info">
                    Tài xế: <strong>{t.tenTaiXe || "-"}</strong>
                  </div>
                  <div>
                    Trạng thái: <strong>
                      {t.trangThai === "Scheduled" ? "Sắp diễn ra" : 
                       t.trangThai === "InProgress" ? (t.loaiPhanBo === 'Sang' ? "Đang đón" : "Đang trả") : 
                       t.trangThai === "Completed" ? "Đã hoàn thành" : 
                       t.trangThai}
                    </strong>
                  </div>
                  <div>
                    Tiến trình: <strong>{Math.round(tripProgress)}%</strong>
                  </div>
                  {t.anhTaiXe && (
                    <img
                      src={`http://localhost:5000/${t.anhTaiXe}`}
                      alt={t.tenTaiXe}
                      className="driver-avatar"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="student-footer">
        {hasTripToday && (
          <button
            onClick={() => setIsSummary((v) => !v)}
            className="toggle-button"
          >
            {isSummary ? "Chi tiết" : "Ẩn bớt"}
          </button>
        )}
      </div>
      <style jsx>{`
        .student-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .student-card-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .student-info {
          display: flex;
          align-items: center;
        }
        .student-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 16px;
        }
        .student-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .student-name-class {
          flex: 1;
        }
        .student-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .student-class {
          color: #666;
          margin-bottom: 8px;
        }
        .status-box {
          display: flex;
          align-items: center;
        }
        .status-label {
          color: #666;
          margin-right: 8px;
        }
        .status-value {
          font-weight: bold;
          color: #4CAF50;
        }
        .student-body {
          margin-bottom: 16px;
        }
        .trip-status {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 12px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 4px;
        }
        .trip-estimate {
          margin-bottom: 12px;
        }
        .trip-estimate div {
          margin-bottom: 4px;
        }
        .trip-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
          margin: 12px 0;
        }
        .progress-fill {
          height: 100%;
          background: #4CAF50;
          transition: width 0.3s ease;
        }
        .map-button-wrap {
          text-align: center;
          margin-top: 16px;
        }
        .map-button {
          background: #2196F3;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .map-button:hover {
          background: #1976D2;
        }
        .trip-details {
          margin-top: 16px;
          border-top: 1px solid #eee;
          padding-top: 16px;
        }
        .trip-item {
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        .trip-title {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .trip-info {
          margin-bottom: 4px;
        }
        .driver-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-top: 8px;
        }
        .student-footer {
          text-align: center;
          border-top: 1px solid #eee;
          padding-top: 12px;
        }
        .toggle-button {
          background: none;
          border: 1px solid #ddd;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          color: #666;
        }
        .toggle-button:hover {
          background: #f5f5f5;
        }
      `}</style>
    </div>
  );
}