// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Header from "../components/Header";
// import StudentCard from "../components/StudentCard";

// function HomePage({ onLogout, onInfo }) {
//   const [studentData, setStudentData] = useState(null);
//   const [notification, setNotification] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let mounted = true;

//     const fetchStudentData = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const user = JSON.parse(localStorage.getItem("user"));
//         if (!user) {
//           if (mounted) {
//             setError("Chưa đăng nhập");
//             setLoading(false);
//           }
//           return;
//         }

//         // 1) Lấy toàn bộ học sinh
//         const hsRes = await axios.get("http://localhost:5000/api/hocsinh");
//         const allStudents = Array.isArray(hsRes.data) ? hsRes.data : [];

//         // 2) Nếu user là phụ huynh, tìm học sinh liên kết qua bảng phuHuynh
//         let selectedStudent = null;
//         if (user.capDo === "Parent") {
//           try {
//             const phRes = await axios.get("http://localhost:5000/api/phuhuynh");
//             const phList = Array.isArray(phRes.data) ? phRes.data : [];
//             const myPh = phList.find((p) => p.maTaiKhoan === user.maTaiKhoan);
//             if (myPh) {
//               selectedStudent = allStudents.find((s) => s.maHocSinh === myPh.maHocSinh);
//             }
//           } catch (e) {
//             console.warn("Không thể lấy phuHuynh:", e?.message || e);
//           }
//         }

//         // nếu không phải parent hoặc không tìm được học sinh thì lấy học sinh mặc định (đầu danh sách)
//         if (!selectedStudent) selectedStudent = allStudents[0] || null;

//         if (!selectedStudent) {
//           if (mounted) {
//             setError("Không có dữ liệu học sinh.");
//             setLoading(false);
//           }
//           return;
//         }

//         // 3) Lấy dữ liệu chuyến xe, tuyến, xe buýt, tài xế
//         const [chRes, tuRes, xeRes, txRes] = await Promise.all([
//           axios.get("http://localhost:5000/api/chuyenxe"),
//           axios.get("http://localhost:5000/api/tuyenduong"),
//           axios.get("http://localhost:5000/api/xeBuyt"),
//           axios.get("http://localhost:5000/api/taixe"),
//         ]);

//         const chuyenList = Array.isArray(chRes.data) ? chRes.data : [];
//         const tuyenList = Array.isArray(tuRes.data) ? tuRes.data : [];
//         const xeList = Array.isArray(xeRes.data) ? xeRes.data : [];
//         const taixeList = Array.isArray(txRes.data) ? txRes.data : [];

//         // 4) Tìm phân bổ của học sinh (nếu có) bằng API phanBoHocSinh hoặc bằng cách tìm chuyenXe có maHocSinh.
//         // Nếu backend không có endpoint phanBoHocSinh, ta tìm chuyến có maChuyenXe chứa selectedStudent via backend chuyenxe/phanbo logic.
//         // Ở frontend ta cố gắng tìm chuyenXe có phanBo chứa học sinh: (chuyenList may include phanBo? if not, we fallback)
//         let selectedChuyen = null;
//         // first try: check chuyenList items that may include maChuyenXe and a field indicating assigned students (if backend returned join)
//         for (const cx of chuyenList) {
//           // nếu backend trả về mảng phân bổ như cx.phanBo hoặc cx.maHocSinh thì detect
//           if (Array.isArray(cx.phanBoHocSinh)) {
//             if (cx.phanBoHocSinh.some((pb) => pb.maHocSinh === selectedStudent.maHocSinh)) {
//               selectedChuyen = cx;
//               break;
//             }
//           }
//           // fallback: if chuyenXe has maChuyenXe and we can later query server for phanBo (not available here)
//         }

//         // fallback: take a chuyenXe that matches selectedStudent.maTuyenDuong (if student row had maTuyenDuong)
//         if (!selectedChuyen) {
//           // if selectedStudent.maTuyenDuong exists try to match
//           if (selectedStudent.maTuyenDuong) {
//             selectedChuyen = chuyenList.find((c) => c.maTuyenDuong === selectedStudent.maTuyenDuong);
//           }
//         }

//         // last fallback: choose the first InProgress or Scheduled chuyen
//         if (!selectedChuyen) {
//           selectedChuyen = chuyenList.find((c) => c.trangThai === "InProgress") || chuyenList[0] || null;
//         }

//         // 5) Build formatted student object used by UI
//         const tuyen = selectedChuyen ? tuyenList.find((t) => t.maTuyenDuong === selectedChuyen.maTuyenDuong) : null;
//         const xe = selectedChuyen ? xeList.find((x) => x.maXeBuyt === selectedChuyen.maXeBuyt) : null;
//         const taixe = xe ? taixeList.find((t) => t.maTaiXe === xe.maTaiXe) : null;

//         const formattedStudent = {
//           studentName: selectedStudent.tenHocSinh,
//           studentClass: selectedStudent.lop,
//           morningTrip: {
//             busNumber: xe?.bienSoXe || xe?.bienSo || "Chưa có",
//             driverName: taixe?.tenTaiXe || "Chưa có",
//             scheduledTime: (await resolveScheduledTime(selectedChuyen)) || (tuyen?.gioKhoiHanh || "07:00"),
//             pickupPoint: selectedStudent?.diaChiNha || "Không rõ",
//             pickupStatus: "Đang đón",
//             status: selectedChuyen?.trangThai || "Unknown",
//             currentAction: selectedChuyen?.trangThai === "InProgress" ? "Xe đang trên đường" : "Chưa khởi hành",
//             progress: estimateProgress(selectedChuyen),
//             estimatedArrivalTime: estimateArrival(selectedChuyen, tuyen),
//           },
//           afternoonTrip: {
//             busNumber: xe?.bienSoXe || "Chưa có",
//             driverName: taixe?.tenTaiXe || "Chưa có",
//             scheduledTime: (tuyen?.thoiGianDen || "16:30"),
//             pickupPoint: "Trường học",
//             status: "Chưa khởi hành",
//           },
//         };

//         // 6) Lấy 1 thông báo tóm tắt (optional) — gọi API thông báo nếu user có maTaiKhoan
//         let notif = null;
//         try {
//           if (user.maTaiKhoan) {
//             const tbRes = await axios.get(`http://localhost:5000/api/thongbao/${user.maTaiKhoan}`);
//             const tb = Array.isArray(tbRes.data) ? tbRes.data : [];
//             if (tb.length) {
//               const latest = tb[0];
//               notif = {
//                 message: latest.noiDung,
//                 timeAgo: new Date(latest.thoiGianTao).toLocaleString(),
//                 type: "info",
//               };
//             }
//           }
//         } catch (e) {
//           console.warn("Không lấy được thông báo:", e?.message || e);
//         }

//         if (mounted) {
//           setStudentData(formattedStudent);
//           setNotification(notif);
//         }
//       } catch (err) {
//         console.error("Error fetchStudentData:", err);
//         if (mounted) setError("Không thể tải dữ liệu từ server.");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };

//     // helper small functions ----------------
//     // Estimate progress rudimentary (if no detailed GPS info)
//     const estimateProgress = (chuyen) => {
//       if (!chuyen) return 0;
//       if (chuyen.trangThai === "Completed") return 100;
//       if (chuyen.trangThai === "InProgress") return 60;
//       if (chuyen.trangThai === "Scheduled") return 0;
//       return 30;
//     };

//     // estimate arrival time: uses lichTrinh if join or tuyen info
//     const estimateArrival = (chuyen, tuyen) => {
//       if (!chuyen) return "—";
//       // if chuyen has maLichTrinh and backend returned times, use them
//       if (chuyen.thoiGianDen) return chuyen.thoiGianDen;
//       if (tuyen && tuyen.thoiGianDen) return tuyen.thoiGianDen;
//       return "—";
//     };

//     // try to resolve scheduled time from chuyen -> lichTrinh (if server returns joined fields)
//     const resolveScheduledTime = async (chuyen) => {
//       if (!chuyen) return null;
//       if (chuyen.thoiGianDi) return chuyen.thoiGianDi;
//       // fallback: try to fetch lichTrinh by maLichTrinh if available
//       if (chuyen.maLichTrinh) {
//         try {
//           const resp = await axios.get("http://localhost:5000/api/lichtrinh");
//           if (Array.isArray(resp.data)) {
//             const lt = resp.data.find((l) => l.maLichTrinh === chuyen.maLichTrinh);
//             return lt?.thoiGianDi || null;
//           }
//         } catch (e) {
//           return null;
//         }
//       }
//       return null;
//     };

//     fetchStudentData();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   if (loading) return <div>Đang tải dữ liệu...</div>;
//   if (error) return <div>Lỗi: {error}</div>;
//   if (!studentData) return <div>Không có dữ liệu học sinh.</div>;

//   return (
//     <div className="app-layout">
//       <Header onLogout={onLogout} notification={notification} onInfo={onInfo} />
//       <main className="home-content">
//         <div className="student-card-wrapper">
//           <StudentCard student={studentData} isSummaryDefault={false} />
//           <StudentCard student={studentData} isSummaryDefault={true} />
//         </div>
//       </main>
//     </div>
//   );
// }

// export default HomePage;
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

        console.log("👤 User info:", user);

        // 1) LẤY DỮ LIỆU HỌC SINH - Xử lý response structure mới
        let allStudents = [];
        try {
          const hsRes = await axios.get("http://localhost:5000/api/hocsinh");
          console.log("🎓 HocSinh response:", hsRes.data);
          
          // Xử lý cả 2 structure: {success, data} và array trực tiếp
          if (hsRes.data.success && hsRes.data.data) {
            allStudents = Array.isArray(hsRes.data.data) ? hsRes.data.data : [];
          } else if (Array.isArray(hsRes.data)) {
            allStudents = hsRes.data;
          }
          console.log("🎓 All students:", allStudents);
        } catch (e) {
          console.error("❌ Không thể lấy danh sách học sinh:", e?.message || e);
          allStudents = [];
        }

        // 2) TÌM HỌC SINH PHÙ HỢP VỚI USER
        let selectedStudent = null;

        if (user.capDo === "Parent") {
          // Nếu là phụ huynh, lấy học sinh của phụ huynh đó
          try {
            console.log("👨‍👩‍👧‍👦 Fetching parent students for:", user.maTaiKhoan);
            const parentStudentsRes = await axios.get(`http://localhost:5000/api/phuhuynh/${user.maTaiKhoan}/hocsinh`);
            console.log("👨‍👩‍👧‍👦 Parent students response:", parentStudentsRes.data);
            
            let parentStudents = [];
            if (parentStudentsRes.data.success && parentStudentsRes.data.data) {
              parentStudents = Array.isArray(parentStudentsRes.data.data) ? parentStudentsRes.data.data : [];
            } else if (Array.isArray(parentStudentsRes.data)) {
              parentStudents = parentStudentsRes.data;
            }

            console.log("👨‍👩‍👧‍👦 Parent's students:", parentStudents);

            if (parentStudents.length > 0) {
              // Tìm học sinh trong danh sách allStudents dựa trên parentStudents
              selectedStudent = allStudents.find(s => 
                parentStudents.some(ps => ps.maHocSinh === s.maHocSinh)
              );
              console.log("🎯 Selected student from parent:", selectedStudent);
            }
          } catch (e) {
            console.error("❌ Không thể lấy học sinh của phụ huynh:", e?.message || e);
          }
        } else if (user.capDo === "Driver") {
          // Nếu là tài xế, lấy học sinh từ các chuyến xe của tài xế
          try {
            const txRes = await axios.get("http://localhost:5000/api/taixe");
            let drivers = [];
            if (txRes.data.success && txRes.data.data) {
              drivers = Array.isArray(txRes.data.data) ? txRes.data.data : [];
            } else if (Array.isArray(txRes.data)) {
              drivers = txRes.data;
            }
            
            const currentDriver = drivers.find(d => d.maTaiKhoan === user.maTaiKhoan);
            console.log("👨‍✈️ Current driver:", currentDriver);
            
            if (currentDriver) {
              // Lấy chuyến xe của tài xế
              const tripsRes = await axios.get("http://localhost:5000/api/chuyenxe");
              let trips = [];
              if (tripsRes.data.success && tripsRes.data.data) {
                trips = Array.isArray(tripsRes.data.data) ? tripsRes.data.data : [];
              } else if (Array.isArray(tripsRes.data)) {
                trips = tripsRes.data;
              }
              
              const driverTrips = trips.filter(t => t.maTaiXe === currentDriver.maTaiXe);
              console.log("🚗 Driver trips:", driverTrips);
              
              if (driverTrips.length > 0) {
                // Lấy học sinh từ các chuyến xe này
                const tripStudents = [];
                for (const trip of driverTrips) {
                  try {
                    const allocationRes = await axios.get(`http://localhost:5000/api/phanbohocsinhtram?maChuyenXe=${trip.maChuyenXe}`);
                    let allocations = [];
                    if (allocationRes.data.success && allocationRes.data.data) {
                      allocations = Array.isArray(allocationRes.data.data) ? allocationRes.data.data : [];
                    } else if (Array.isArray(allocationRes.data)) {
                      allocations = allocationRes.data;
                    }
                    
                    allocations.forEach(alloc => {
                      const student = allStudents.find(s => s.maHocSinh === alloc.maHocSinh);
                      if (student && !tripStudents.find(ts => ts.maHocSinh === student.maHocSinh)) {
                        tripStudents.push(student);
                      }
                    });
                  } catch (allocError) {
                    console.warn("Không thể lấy phân bổ cho chuyến:", trip.maChuyenXe, allocError);
                  }
                }
                
                if (tripStudents.length > 0) {
                  selectedStudent = tripStudents[0];
                  console.log("🎯 Selected student from driver trips:", selectedStudent);
                }
              }
            }
          } catch (e) {
            console.error("❌ Không thể lấy học sinh của tài xế:", e?.message || e);
          }
        }

        // Fallback: lấy học sinh đầu tiên nếu không tìm được
        if (!selectedStudent && allStudents.length > 0) {
          selectedStudent = allStudents[0];
          console.log("🔄 Fallback to first student:", selectedStudent);
        }

        if (!selectedStudent) {
          if (mounted) {
            setError("Không có dữ liệu học sinh.");
            setLoading(false);
          }
          return;
        }

        console.log("🎯 Final selected student:", selectedStudent);

        // 3) LẤY THÔNG TIN CHUYẾN XE VÀ LIÊN QUAN
        let selectedTrip = null;
        let busInfo = null;
        let driverInfo = null;
        let routeInfo = null;

        // Lấy chuyến xe từ phân bổ của học sinh
        try {
          const studentTripsRes = await axios.get(`http://localhost:5000/api/phanbohocsinhtram?maHocSinh=${selectedStudent.maHocSinh}`);
          let studentTrips = [];
          if (studentTripsRes.data.success && studentTripsRes.data.data) {
            studentTrips = Array.isArray(studentTripsRes.data.data) ? studentTripsRes.data.data : [];
          } else if (Array.isArray(studentTripsRes.data)) {
            studentTrips = studentTripsRes.data;
          }

          if (studentTrips.length > 0) {
            // Lấy chuyến xe đầu tiên
            const firstTripAllocation = studentTrips[0];
            if (firstTripAllocation.maChuyenXe) {
              try {
                const tripDetailRes = await axios.get(`http://localhost:5000/api/chuyenxe/${firstTripAllocation.maChuyenXe}`);
                if (tripDetailRes.data.success && tripDetailRes.data.data) {
                  selectedTrip = tripDetailRes.data.data;
                } else {
                  selectedTrip = tripDetailRes.data;
                }
                console.log("🚌 Selected trip details:", selectedTrip);
              } catch (e) {
                console.warn("Không thể lấy chi tiết chuyến xe:", e?.message || e);
              }
            }
          }
        } catch (e) {
          console.warn("Không thể lấy chuyến xe của học sinh:", e?.message || e);
        }

        // Lấy thông tin xe buýt
        if (selectedTrip?.maXeBuyt) {
          try {
            const busesRes = await axios.get("http://localhost:5000/api/xebuyt");
            let buses = [];
            if (busesRes.data.success && busesRes.data.data) {
              buses = Array.isArray(busesRes.data.data) ? busesRes.data.data : [];
            } else if (Array.isArray(busesRes.data)) {
              buses = busesRes.data;
            }
            busInfo = buses.find(b => b.maXeBuyt === selectedTrip.maXeBuyt);
            console.log("🚗 Bus info:", busInfo);
          } catch (e) {
            console.warn("Không thể lấy thông tin xe buýt:", e?.message || e);
          }
        }

        // Lấy thông tin tài xế
        if (selectedTrip?.maTaiXe) {
          try {
            const driversRes = await axios.get("http://localhost:5000/api/taixe");
            let drivers = [];
            if (driversRes.data.success && driversRes.data.data) {
              drivers = Array.isArray(driversRes.data.data) ? driversRes.data.data : [];
            } else if (Array.isArray(driversRes.data)) {
              drivers = driversRes.data;
            }
            driverInfo = drivers.find(d => d.maTaiXe === selectedTrip.maTaiXe);
            console.log("👨‍✈️ Driver info:", driverInfo);
          } catch (e) {
            console.warn("Không thể lấy thông tin tài xế:", e?.message || e);
          }
        }

        // Lấy thông tin tuyến đường
        if (selectedTrip?.maTuyenDuong) {
          try {
            const routesRes = await axios.get("http://localhost:5000/api/tuyenduong");
            let routes = [];
            if (routesRes.data.success && routesRes.data.data) {
              routes = Array.isArray(routesRes.data.data) ? routesRes.data.data : [];
            } else if (Array.isArray(routesRes.data)) {
              routes = routesRes.data;
            }
            routeInfo = routes.find(r => r.maTuyenDuong === selectedTrip.maTuyenDuong);
            console.log("🛣️ Route info:", routeInfo);
          } catch (e) {
            console.warn("Không thể lấy thông tin tuyến đường:", e?.message || e);
          }
        }

        // 4) XÂY DỰNG DỮ LIỆU ĐỊNH DẠNG CHO UI
        const formattedStudent = {
          studentName: selectedStudent.tenHocSinh,
          studentClass: selectedStudent.lop,
          studentImage: selectedStudent.anhHocSinh,
          address: selectedStudent.diaChi || "Không có địa chỉ",
          morningTrip: {
            busNumber: busInfo?.bienSoXe || selectedTrip?.bienSoXe || "Chưa có",
            driverName: driverInfo?.tenTaiXe || selectedTrip?.tenTaiXe || "Chưa có",
            driverImage: driverInfo?.anhTaiXe,
            scheduledTime: selectedTrip?.thoiGianDi || routeInfo?.thoiGianDi || "07:00",
            pickupPoint: getPickupPoint(selectedStudent, selectedTrip, "Sang"),
            pickupStatus: getPickupStatus(selectedTrip),
            status: selectedTrip?.trangThai || "Scheduled",
            currentAction: getCurrentAction(selectedTrip),
            progress: estimateProgress(selectedTrip),
            estimatedArrivalTime: estimateArrival(selectedTrip, routeInfo),
            routeName: routeInfo?.tenTuyenDuong || selectedTrip?.tenTuyenDuong || "Không rõ",
            tripId: selectedTrip?.maChuyenXe
          },
          afternoonTrip: {
            busNumber: busInfo?.bienSoXe || selectedTrip?.bienSoXe || "Chưa có",
            driverName: driverInfo?.tenTaiXe || selectedTrip?.tenTaiXe || "Chưa có",
            driverImage: driverInfo?.anhTaiXe,
            scheduledTime: selectedTrip?.thoiGianDen || routeInfo?.thoiGianDen || "16:30",
            pickupPoint: getPickupPoint(selectedStudent, selectedTrip, "Chieu"),
            status: "Scheduled",
            routeName: routeInfo?.tenTuyenDuong || selectedTrip?.tenTuyenDuong || "Không rõ",
            tripId: selectedTrip?.maChuyenXe
          },
        };

        // 5) LẤY TẤT CẢ CHUYẾN XE CHO STUDENTCARD
        try {
          const allTripsRes = await axios.get("http://localhost:5000/api/chuyenxe-all");
          let allTrips = [];
          if (allTripsRes.data.success && allTripsRes.data.data) {
            allTrips = Array.isArray(allTripsRes.data.data) ? allTripsRes.data.data : [];
          } else if (Array.isArray(allTripsRes.data)) {
            allTrips = allTripsRes.data;
          }
          formattedStudent.allTrips = allTrips;
          console.log("📋 All trips for StudentCard:", allTrips.length);
        } catch (e) {
          console.warn("Không thể lấy danh sách chuyến xe:", e?.message || e);
          formattedStudent.allTrips = [];
        }

        // 6) LẤY THÔNG BÁO
        let notif = null;
        try {
          if (user.maTaiKhoan) {
            const tbRes = await axios.get(`http://localhost:5000/api/thongbao/${user.maTaiKhoan}`);
            let tb = [];
            if (tbRes.data.success && tbRes.data.data) {
              tb = Array.isArray(tbRes.data.data) ? tbRes.data.data : [];
            } else if (Array.isArray(tbRes.data)) {
              tb = tbRes.data;
            }
            
            if (tb.length) {
              const latest = tb[0];
              notif = {
                message: latest.noiDung,
                timeAgo: formatTimeAgo(new Date(latest.thoiGianTao)),
                timestamp: new Date(latest.thoiGianTao),
                type: "info",
              };
              console.log("📢 Notification:", notif);
            }
          }
        } catch (e) {
          console.warn("Không lấy được thông báo:", e?.message || e);
        }

        if (mounted) {
          setStudentData(formattedStudent);
          setNotification(notif);
          console.log("✅ Final student data:", formattedStudent);
        }
      } catch (err) {
        console.error("❌ Lỗi fetchStudentData:", err);
        if (mounted) setError("Không thể tải dữ liệu từ server.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // HELPER FUNCTIONS ------------------------

    // Ước tính tiến trình
    const estimateProgress = (trip) => {
      if (!trip) return 0;
      if (trip.trangThai === "Completed") return 100;
      if (trip.trangThai === "InProgress") return 60;
      if (trip.trangThai === "Scheduled") return 0;
      return 30;
    };

    // Ước tính thời gian đến
    const estimateArrival = (trip, route) => {
      if (!trip) return "—";
      if (trip.thoiGianDen) return trip.thoiGianDen;
      if (route && route.thoiGianDen) return route.thoiGianDen;
      return "—";
    };

    // Lấy điểm đón
    const getPickupPoint = (student, trip, loaiPhanBo) => {
      if (!trip) return student.address || "Không rõ";
      
      // Trong phiên bản đơn giản, trả về địa chỉ học sinh
      return student.address || "Không rõ";
    };

    // Lấy trạng thái đón
    const getPickupStatus = (trip) => {
      if (!trip) return "Chưa đón";
      if (trip.trangThai === "Completed") return "Đã đón";
      if (trip.trangThai === "InProgress") return "Đang đón";
      return "Chưa đón";
    };

    // Lấy hành động hiện tại
    const getCurrentAction = (trip) => {
      if (!trip) return "Chưa khởi hành";
      if (trip.trangThai === "Completed") return "Đã hoàn thành";
      if (trip.trangThai === "InProgress") return "Xe đang trên đường";
      return "Chưa khởi hành";
    };

    // Định dạng thời gian
    const formatTimeAgo = (date) => {
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return `${diffDays} ngày trước`;
    };

    fetchStudentData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">Lỗi: {error}</div>;
  if (!studentData) return <div className="no-data">Không có dữ liệu học sinh.</div>;

  return (
    <div className="app-layout">
      <Header onLogout={onLogout} notification={notification} onInfo={onInfo} />
      <main className="home-content">
        <div className="student-card-wrapper">
          <StudentCard student={studentData} isSummaryDefault={false} />
        </div>
      </main>
    </div>
  );
}

export default HomePage;