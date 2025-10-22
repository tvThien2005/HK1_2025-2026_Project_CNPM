// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Header from '../components/Header';
// import StudentCard from '../components/StudentCard';
// // import '../styles/Components.css';

// function HomePage({ onLogout , onInfo}) {
//   const [studentData, setStudentData] = useState(null);
//   const [notification, setNotification] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/student/data');
//         setStudentData(response.data.student);
//         setNotification(response.data.notification);
//       } catch (err) {
//         setError('Failed to fetch student data.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (!studentData) return <div>No student data available.</div>;

//   return (
//     <div className="app-layout">
//       <Header onLogout={onLogout} notification={notification} onInfo = {onInfo}/>
//       <main className="home-content">
//         <div className="student-card-wrapper">
//           {/* Thẻ đầy đủ (Giống ảnh trái) */}
//           <StudentCard student={studentData} isSummaryDefault={false} />
//           {/* Thẻ tóm tắt (Giống ảnh phải) */}
//           <StudentCard student={studentData} isSummaryDefault={true} />
//         </div>
//       </main>
//     </div>
//   );
// }

// export default HomePage;
// src/pages/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import StudentCard from "../components/StudentCard";

function HomePage({ onLogout, onInfo }) {
  const [studentData, setStudentData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchStudentData = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          if (mounted) {
            setError("Chưa đăng nhập");
            setLoading(false);
          }
          return;
        }

        // 1) Lấy toàn bộ học sinh
        const hsRes = await axios.get("http://localhost:5000/api/hocsinh");
        const allStudents = Array.isArray(hsRes.data) ? hsRes.data : [];

        // 2) Nếu user là phụ huynh, tìm học sinh liên kết qua bảng phuHuynh
        let selectedStudent = null;
        if (user.capDo === "Parent") {
          try {
            const phRes = await axios.get("http://localhost:5000/api/phuhuynh");
            const phList = Array.isArray(phRes.data) ? phRes.data : [];
            const myPh = phList.find((p) => p.maTaiKhoan === user.maTaiKhoan);
            if (myPh) {
              selectedStudent = allStudents.find((s) => s.maHocSinh === myPh.maHocSinh);
            }
          } catch (e) {
            console.warn("Không thể lấy phuHuynh:", e?.message || e);
          }
        }

        // nếu không phải parent hoặc không tìm được học sinh thì lấy học sinh mặc định (đầu danh sách)
        if (!selectedStudent) selectedStudent = allStudents[0] || null;

        if (!selectedStudent) {
          if (mounted) {
            setError("Không có dữ liệu học sinh.");
            setLoading(false);
          }
          return;
        }

        // 3) Lấy dữ liệu chuyến xe, tuyến, xe buýt, tài xế
        const [chRes, tuRes, xeRes, txRes] = await Promise.all([
          axios.get("http://localhost:5000/api/chuyenxe"),
          axios.get("http://localhost:5000/api/tuyenduong"),
          axios.get("http://localhost:5000/api/xeBuyt"),
          axios.get("http://localhost:5000/api/taixe"),
        ]);

        const chuyenList = Array.isArray(chRes.data) ? chRes.data : [];
        const tuyenList = Array.isArray(tuRes.data) ? tuRes.data : [];
        const xeList = Array.isArray(xeRes.data) ? xeRes.data : [];
        const taixeList = Array.isArray(txRes.data) ? txRes.data : [];

        // 4) Tìm phân bổ của học sinh (nếu có) bằng API phanBoHocSinh hoặc bằng cách tìm chuyenXe có maHocSinh.
        // Nếu backend không có endpoint phanBoHocSinh, ta tìm chuyến có maChuyenXe chứa selectedStudent via backend chuyenxe/phanbo logic.
        // Ở frontend ta cố gắng tìm chuyenXe có phanBo chứa học sinh: (chuyenList may include phanBo? if not, we fallback)
        let selectedChuyen = null;
        // first try: check chuyenList items that may include maChuyenXe and a field indicating assigned students (if backend returned join)
        for (const cx of chuyenList) {
          // nếu backend trả về mảng phân bổ như cx.phanBo hoặc cx.maHocSinh thì detect
          if (Array.isArray(cx.phanBoHocSinh)) {
            if (cx.phanBoHocSinh.some((pb) => pb.maHocSinh === selectedStudent.maHocSinh)) {
              selectedChuyen = cx;
              break;
            }
          }
          // fallback: if chuyenXe has maChuyenXe and we can later query server for phanBo (not available here)
        }

        // fallback: take a chuyenXe that matches selectedStudent.maTuyenDuong (if student row had maTuyenDuong)
        if (!selectedChuyen) {
          // if selectedStudent.maTuyenDuong exists try to match
          if (selectedStudent.maTuyenDuong) {
            selectedChuyen = chuyenList.find((c) => c.maTuyenDuong === selectedStudent.maTuyenDuong);
          }
        }

        // last fallback: choose the first InProgress or Scheduled chuyen
        if (!selectedChuyen) {
          selectedChuyen = chuyenList.find((c) => c.trangThai === "InProgress") || chuyenList[0] || null;
        }

        // 5) Build formatted student object used by UI
        const tuyen = selectedChuyen ? tuyenList.find((t) => t.maTuyenDuong === selectedChuyen.maTuyenDuong) : null;
        const xe = selectedChuyen ? xeList.find((x) => x.maXeBuyt === selectedChuyen.maXeBuyt) : null;
        const taixe = xe ? taixeList.find((t) => t.maTaiXe === xe.maTaiXe) : null;

        const formattedStudent = {
          studentName: selectedStudent.tenHocSinh,
          studentClass: selectedStudent.lop,
          morningTrip: {
            busNumber: xe?.bienSoXe || xe?.bienSo || "Chưa có",
            driverName: taixe?.tenTaiXe || "Chưa có",
            scheduledTime: (await resolveScheduledTime(selectedChuyen)) || (tuyen?.gioKhoiHanh || "07:00"),
            pickupPoint: selectedStudent?.diaChiNha || "Không rõ",
            pickupStatus: "Đang đón",
            status: selectedChuyen?.trangThai || "Unknown",
            currentAction: selectedChuyen?.trangThai === "InProgress" ? "Xe đang trên đường" : "Chưa khởi hành",
            progress: estimateProgress(selectedChuyen),
            estimatedArrivalTime: estimateArrival(selectedChuyen, tuyen),
          },
          afternoonTrip: {
            busNumber: xe?.bienSoXe || "Chưa có",
            driverName: taixe?.tenTaiXe || "Chưa có",
            scheduledTime: (tuyen?.thoiGianDen || "16:30"),
            pickupPoint: "Trường học",
            status: "Chưa khởi hành",
          },
        };

        // 6) Lấy 1 thông báo tóm tắt (optional) — gọi API thông báo nếu user có maTaiKhoan
        let notif = null;
        try {
          if (user.maTaiKhoan) {
            const tbRes = await axios.get(`http://localhost:5000/api/thongbao/${user.maTaiKhoan}`);
            const tb = Array.isArray(tbRes.data) ? tbRes.data : [];
            if (tb.length) {
              const latest = tb[0];
              notif = {
                message: latest.noiDung,
                timeAgo: new Date(latest.thoiGianTao).toLocaleString(),
                type: "info",
              };
            }
          }
        } catch (e) {
          console.warn("Không lấy được thông báo:", e?.message || e);
        }

        if (mounted) {
          setStudentData(formattedStudent);
          setNotification(notif);
        }
      } catch (err) {
        console.error("Error fetchStudentData:", err);
        if (mounted) setError("Không thể tải dữ liệu từ server.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // helper small functions ----------------
    // Estimate progress rudimentary (if no detailed GPS info)
    const estimateProgress = (chuyen) => {
      if (!chuyen) return 0;
      if (chuyen.trangThai === "Completed") return 100;
      if (chuyen.trangThai === "InProgress") return 60;
      if (chuyen.trangThai === "Scheduled") return 0;
      return 30;
    };

    // estimate arrival time: uses lichTrinh if join or tuyen info
    const estimateArrival = (chuyen, tuyen) => {
      if (!chuyen) return "—";
      // if chuyen has maLichTrinh and backend returned times, use them
      if (chuyen.thoiGianDen) return chuyen.thoiGianDen;
      if (tuyen && tuyen.thoiGianDen) return tuyen.thoiGianDen;
      return "—";
    };

    // try to resolve scheduled time from chuyen -> lichTrinh (if server returns joined fields)
    const resolveScheduledTime = async (chuyen) => {
      if (!chuyen) return null;
      if (chuyen.thoiGianDi) return chuyen.thoiGianDi;
      // fallback: try to fetch lichTrinh by maLichTrinh if available
      if (chuyen.maLichTrinh) {
        try {
          const resp = await axios.get("http://localhost:5000/api/lichtrinh");
          if (Array.isArray(resp.data)) {
            const lt = resp.data.find((l) => l.maLichTrinh === chuyen.maLichTrinh);
            return lt?.thoiGianDi || null;
          }
        } catch (e) {
          return null;
        }
      }
      return null;
    };

    fetchStudentData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!studentData) return <div>Không có dữ liệu học sinh.</div>;

  return (
    <div className="app-layout">
      <Header onLogout={onLogout} notification={notification} onInfo={onInfo} />
      <main className="home-content">
        <div className="student-card-wrapper">
          <StudentCard student={studentData} isSummaryDefault={false} />
          <StudentCard student={studentData} isSummaryDefault={true} />
        </div>
      </main>
    </div>
  );
}

export default HomePage;