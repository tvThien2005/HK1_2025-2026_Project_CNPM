// "use client";
// import Head from "next/head";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Badge,
//   ListGroup,
// } from "react-bootstrap";
// import { useState, useEffect, useRef, useCallback } from "react";
// import dynamic from "next/dynamic";
// import { Bus, Student, BusRoute } from "../../types/bus";

// const BusMap = dynamic(() => import("../../components/Map"), {
//   ssr: false,
// });

// // Mock data
// const mockBusRoutes: BusRoute[] = [
//   {
//     id: "route-1",
//     name: "Tuyến số 1 - Quận 1",
//     busNumber: "SCH-001",
//     driver: "Nguyễn Văn A",
//     school: {
//       name: "Trường Tiểu học ABC",
//       position: { lat: 10.760170054151976, lng: 106.68232266808415 },
//       startTime: "07:00",
//     },
//     students: [
//       {
//         id: "student-1",
//         name: "Nguyễn Văn B",
//         address: "123 Đường Lê Lợi, Quận 1",
//         position: { lat: 10.782622, lng: 106.640172 },
//         school: "Trường Tiểu học ABC",
//         grade: "Lớp 1A",
//         pickupTime: "06:15",
//       },
//       {
//         id: "student-2",
//         name: "Trần Thị C",
//         address: "456 Đường Nguyễn Huệ, Quận 1",
//         position: { lat: 10.772622, lng: 106.650172 },
//         school: "Trường Tiểu học ABC",
//         grade: "Lớp 2B",
//         pickupTime: "06:25",
//       },
//       {
//         id: "student-3",
//         name: "Lê Văn D",
//         address: "789 Đường Pasteur, Quận 1",
//         position: { lat: 10.762622, lng: 106.660172 },
//         school: "Trường Tiểu học ABC",
//         grade: "Lớp 3C",
//         pickupTime: "06:35",
//       },
//     ],
//     currentStatus: "picking_up",
//     currentStudentIndex: 0,
//   },
// ];

// const initialBuses: Bus[] = [
//   {
//     id: "bus-001",
//     name: "Xe 01",
//     licensePlate: "51B-12345",
//     route: mockBusRoutes[0],
//     position: { lat: 10.792622, lng: 106.630172 },
//     speed: 30,
//     lastUpdate: new Date().toLocaleTimeString(),
//     nextStop: {
//       student: mockBusRoutes[0].students[0],
//       estimatedArrival: "06:15",
//     },
//     pickedUpStudents: [],
//   },
// ];

// const VehiclesPage: React.FC = () => {
//   const [buses, setBuses] = useState<Bus[]>(initialBuses);
//   const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
//   const [isRealTime, setIsRealTime] = useState(false);

//   // Ref để lưu thời gian dừng tại mỗi điểm
//   const stopTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

//   // Sử dụng useCallback để tránh recreation function
//   const handleStudentPickup = useCallback(
//     (studentId: string, busId?: string) => {
//       console.log(
//         `🎒 Marking student ${studentId} as picked up for bus ${
//           busId || selectedBus?.id
//         }`
//       );

//       setBuses((prevBuses) =>
//         prevBuses.map((bus) => {
//           // Nếu có busId, chỉ update bus đó, nếu không thì update selectedBus
//           const shouldUpdate = busId
//             ? bus.id === busId
//             : bus.id === selectedBus?.id;

//           if (shouldUpdate) {
//             // Thêm học sinh vào danh sách đã đón nếu chưa có
//             const updatedPickedUpStudents = bus.pickedUpStudents?.includes(
//               studentId
//             )
//               ? bus.pickedUpStudents
//               : [...(bus.pickedUpStudents || []), studentId];

//             console.log(
//               `✅ Updated picked up students for ${bus.name}:`,
//               updatedPickedUpStudents
//             );

//             return {
//               ...bus,
//               pickedUpStudents: updatedPickedUpStudents,
//             };
//           }
//           return bus;
//         })
//       );
//     },
//     [selectedBus]
//   );

//   // Simulate bus movement - FIXED VERSION
//   useEffect(() => {
//     if (!isRealTime) {
//       Object.values(stopTimersRef.current).forEach((timer) =>
//         clearTimeout(timer)
//       );
//       stopTimersRef.current = {};
//       return;
//     }

//     const interval = setInterval(() => {
//       setBuses((prevBuses) =>
//         prevBuses.map((bus) => {
//           const stopTimerKey = `bus-${bus.id}`;
//           const isCurrentlyStopped = !!stopTimersRef.current[stopTimerKey];

//           if (isCurrentlyStopped) {
//             return {
//               ...bus,
//               speed: 0,
//               lastUpdate: new Date().toLocaleTimeString(),
//             };
//           }

//           const currentRoute = bus.route;
//           const currentStudentIndex = bus.route.currentStudentIndex;
//           const students = currentRoute.students;
//           const school = currentRoute.school;

//           if (currentRoute.currentStatus === "completed") {
//             return {
//               ...bus,
//               speed: 0,
//               lastUpdate: new Date().toLocaleTimeString(),
//             };
//           }

//           let targetPosition: { lat: number; lng: number };
//           let nextStatus = bus.route.currentStatus;
//           let nextStudentIndex = currentStudentIndex;

//           if (currentStudentIndex < students.length) {
//             targetPosition = students[currentStudentIndex].position;
//             nextStatus = "picking_up";
//           } else {
//             targetPosition = school.position;
//             nextStatus = "going_to_school";
//           }

//           const currentLat = bus.position.lat;
//           const currentLng = bus.position.lng;
//           const targetLat = targetPosition.lat;
//           const targetLng = targetPosition.lng;

//           const latDiff = targetLat - currentLat;
//           const lngDiff = targetLng - currentLng;
//           const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

//           const speed = 0.0001;
//           let newLat = currentLat;
//           let newLng = currentLng;
//           let newSpeed = Math.floor(speed * 100000);

//           // Kiểm tra nếu đã đến điểm đón
//           if (
//             distance <= 0.0002 &&
//             currentStudentIndex < students.length &&
//             !isCurrentlyStopped
//           ) {
//             console.log(
//               `🎯 ${bus.name} arrived at student ${currentStudentIndex + 1}`
//             );

//             // Tự động đánh dấu học sinh đã đón khi xe đến - TRỰC TIẾP gọi hàm
//             const currentStudentId = students[currentStudentIndex].id;

//             // Gọi trực tiếp hàm handleStudentPickup với busId cụ thể
//             handleStudentPickup(currentStudentId, bus.id);

//             // Dừng lại để đón học sinh
//             stopTimersRef.current[stopTimerKey] = setTimeout(() => {
//               console.log(
//                 `✅ ${bus.name} picked up student, moving to next stop`
//               );

//               const nextIndex = currentStudentIndex + 1;
//               const newStatus =
//                 nextIndex === students.length
//                   ? "going_to_school"
//                   : "picking_up";

//               console.log(
//                 `➡️ ${bus.name} moving to ${
//                   nextIndex < students.length
//                     ? `student ${nextIndex + 1}`
//                     : "school"
//                 }, status: ${newStatus}`
//               );

//               // Cập nhật state
//               setBuses((prev) =>
//                 prev.map((b) => {
//                   if (b.id === bus.id) {
//                     return {
//                       ...b,
//                       route: {
//                         ...b.route,
//                         currentStudentIndex: nextIndex,
//                         currentStatus: newStatus,
//                       },
//                     };
//                   }
//                   return b;
//                 })
//               );

//               delete stopTimersRef.current[stopTimerKey];
//             }, 2000);

//             newLat = targetLat;
//             newLng = targetLng;
//             newSpeed = 0;
//           }
//           // Kiểm tra nếu đã đến trường
//           else if (
//             distance <= 0.0002 &&
//             currentStudentIndex >= students.length &&
//             !isCurrentlyStopped
//           ) {
//             console.log(`🏫 ${bus.name} arrived at school - COMPLETED!`);

//             nextStatus = "completed";
//             newLat = targetLat;
//             newLng = targetLng;
//             newSpeed = 0;

//             setTimeout(() => {
//               setBuses((prev) =>
//                 prev.map((b) => {
//                   if (b.id === bus.id) {
//                     return {
//                       ...b,
//                       route: {
//                         ...b.route,
//                         currentStatus: "completed",
//                       },
//                     };
//                   }
//                   return b;
//                 })
//               );
//             }, 0);
//           } else {
//             const moveDistance = Math.min(distance, speed);
//             newLat = currentLat + (latDiff / distance) * moveDistance;
//             newLng = currentLng + (lngDiff / distance) * moveDistance;
//           }

//           let nextStop = undefined;
//           if (nextStudentIndex < students.length && !isCurrentlyStopped) {
//             const nextStudent = students[nextStudentIndex];
//             const estimatedTime = Math.floor(distance / speed);
//             const estimatedArrival = new Date();
//             estimatedArrival.setSeconds(
//               estimatedArrival.getSeconds() + estimatedTime
//             );

//             nextStop = {
//               student: nextStudent,
//               estimatedArrival: estimatedArrival.toLocaleTimeString("vi-VN", {
//                 hour: "2-digit",
//                 minute: "2-digit",
//                 second: "2-digit",
//               }),
//             };
//           }

//           return {
//             ...bus,
//             position: { lat: newLat, lng: newLng },
//             speed: newSpeed,
//             lastUpdate: new Date().toLocaleTimeString(),
//             nextStop,
//             route: {
//               ...currentRoute,
//               currentStatus: nextStatus,
//               currentStudentIndex: nextStudentIndex,
//             },
//           };
//         })
//       );
//     }, 100);

//     return () => {
//       clearInterval(interval);
//       Object.values(stopTimersRef.current).forEach((timer) =>
//         clearTimeout(timer)
//       );
//       stopTimersRef.current = {};
//     };
//   }, [isRealTime, handleStudentPickup]); // THÊM handleStudentPickup vào dependencies

//   // Sync selectedBus - IMPROVED VERSION
//   useEffect(() => {
//     if (!selectedBus) return;

//     const updatedBus = buses.find((b) => b.id === selectedBus.id);
//     if (
//       updatedBus &&
//       (updatedBus.route.currentStudentIndex !==
//         selectedBus.route.currentStudentIndex ||
//         updatedBus.route.currentStatus !== selectedBus.route.currentStatus ||
//         updatedBus.position.lat !== selectedBus.position.lat ||
//         updatedBus.position.lng !== selectedBus.position.lng ||
//         updatedBus.speed !== selectedBus.speed ||
//         JSON.stringify(updatedBus.pickedUpStudents) !==
//           JSON.stringify(selectedBus.pickedUpStudents))
//     ) {
//       console.log("🔄 Syncing selectedBus with updated bus data");
//       setSelectedBus(updatedBus);
//     }
//   }, [buses, selectedBus]);

//   const toggleRealTime = () => {
//     if (isRealTime) {
//       Object.values(stopTimersRef.current).forEach((timer) =>
//         clearTimeout(timer)
//       );
//       stopTimersRef.current = {};
//     }
//     setIsRealTime(!isRealTime);
//     if (!isRealTime) {
//       setBuses(initialBuses);
//     }
//   };

//   const handleBusSelect = (bus: Bus | null) => {
//     setSelectedBus(bus);
//   };

//   const resetSimulation = () => {
//     Object.values(stopTimersRef.current).forEach((timer) =>
//       clearTimeout(timer)
//     );
//     stopTimersRef.current = {};
//     setBuses(initialBuses);
//     setIsRealTime(false);
//     setSelectedBus(null);
//   };

//   const skipCurrentStop = () => {
//     if (selectedBus) {
//       setBuses((prev) =>
//         prev.map((bus) => {
//           if (bus.id === selectedBus.id) {
//             const nextIndex = bus.route.currentStudentIndex + 1;
//             const newStatus =
//               nextIndex === bus.route.students.length
//                 ? "going_to_school"
//                 : "picking_up";

//             console.log(`⏭️ Skipping to stop ${nextIndex}`);

//             const stopTimerKey = `bus-${bus.id}`;
//             if (stopTimersRef.current[stopTimerKey]) {
//               clearTimeout(stopTimersRef.current[stopTimerKey]);
//               delete stopTimersRef.current[stopTimerKey];
//             }

//             return {
//               ...bus,
//               route: {
//                 ...bus.route,
//                 currentStudentIndex: nextIndex,
//                 currentStatus: newStatus,
//               },
//             };
//           }
//           return bus;
//         })
//       );
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "waiting":
//         return "secondary";
//       case "picking_up":
//         return "warning";
//       case "going_to_school":
//         return "primary";
//       case "completed":
//         return "success";
//       default:
//         return "secondary";
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case "waiting":
//         return "Chờ đón";
//       case "picking_up":
//         return "Đang đón";
//       case "going_to_school":
//         return "Đến trường";
//       case "completed":
//         return "Hoàn thành";
//       default:
//         return status;
//     }
//   };

//   // Hàm để xem chi tiết tiến trình - FIXED
//   const getProgressPercentage = (bus: Bus) => {
//     const totalStops = bus.route.students.length + 1;
//     let completedStops = bus.pickedUpStudents?.length || 0;

//     // Nếu đã đến trường, tính là hoàn thành tất cả
//     if (bus.route.currentStatus === "completed") {
//       completedStops = totalStops;
//     }
//     // Nếu đang trên đường đến trường và đã đón hết học sinh
//     else if (
//       bus.route.currentStatus === "going_to_school" &&
//       completedStops === bus.route.students.length
//     ) {
//       completedStops = totalStops - 1; // Chưa đến trường nhưng đã đón hết học sinh
//     }

//     const percentage = (completedStops / totalStops) * 100;
//     console.log(
//       `📊 ${bus.name} progress: ${completedStops}/${totalStops} = ${percentage}%`,
//       {
//         pickedUp: bus.pickedUpStudents,
//         status: bus.route.currentStatus,
//       }
//     );

//     return Math.min(percentage, 100); // Đảm bảo không vượt quá 100%
//   };

//   const isBusStopped = (bus: Bus) => {
//     return !!stopTimersRef.current[`bus-${bus.id}`];
//   };

//   const getCurrentStopInfo = (bus: Bus) => {
//     if (bus.route.currentStudentIndex < bus.route.students.length) {
//       return bus.route.students[bus.route.currentStudentIndex];
//     } else if (bus.route.currentStatus === "going_to_school") {
//       return { name: bus.route.school.name, type: "school" };
//     }
//     return null;
//   };

//   const isStudentPickedUp = (bus: Bus, studentId: string): boolean => {
//     return bus.pickedUpStudents?.includes(studentId) || false;
//   };

//   return (
//     <>
//       <Head>
//         <title>Vị trí xe bus học sinh | Admin Bus Tracking</title>
//       </Head>
//       <Container fluid>
//         <Row className="my-4">
//           <Col>
//             <h1>Theo dõi xe bus học sinh</h1>
//             <div className="d-flex align-items-center gap-3 mb-3">
//               <Badge bg={isRealTime ? "success" : "secondary"}>
//                 {isRealTime
//                   ? "Đang cập nhật thời gian thực"
//                   : "Chế độ xem tĩnh"}
//               </Badge>
//               <Button
//                 variant={isRealTime ? "outline-danger" : "outline-success"}
//                 size="sm"
//                 onClick={toggleRealTime}
//               >
//                 {isRealTime ? "Dừng real-time" : "Bật real-time"}
//               </Button>
//               <Button
//                 variant="outline-secondary"
//                 size="sm"
//                 onClick={resetSimulation}
//               >
//                 Reset
//               </Button>
//               {selectedBus && isBusStopped(selectedBus) && (
//                 <Button
//                   variant="outline-warning"
//                   size="sm"
//                   onClick={skipCurrentStop}
//                 >
//                   ⏭️ Bỏ qua điểm dừng
//                 </Button>
//               )}
//               {isRealTime && (
//                 <Badge bg="info" className="p-2">
//                   🚌 Đang mô phỏng di chuyển...
//                 </Badge>
//               )}
//             </div>

//             {selectedBus && isRealTime && (
//               <Card className="mb-3 bg-light">
//                 <Card.Body className="py-2">
//                   <div className="d-flex justify-content-between align-items-center">
//                     <div>
//                       <strong>{selectedBus.name}</strong> -
//                       {isBusStopped(selectedBus) ? (
//                         <span className="text-warning">
//                           🛑 Đang dừng đón học sinh:{" "}
//                           <strong>
//                             {getCurrentStopInfo(selectedBus)?.name}
//                           </strong>
//                         </span>
//                       ) : (
//                         <span className="text-primary">
//                           {selectedBus.route.currentStatus === "picking_up" &&
//                             "🚌 Đang di chuyển đến điểm đón"}
//                           {selectedBus.route.currentStatus ===
//                             "going_to_school" && "🏫 Đang đến trường"}
//                           {selectedBus.route.currentStatus === "completed" &&
//                             "✅ Đã hoàn thành lộ trình"}
//                         </span>
//                       )}
//                     </div>
//                     <Badge bg={getStatusColor(selectedBus.route.currentStatus)}>
//                       {getStatusText(selectedBus.route.currentStatus)}
//                     </Badge>
//                   </div>
//                   <div className="progress mt-2" style={{ height: "10px" }}>
//                     <div
//                       className="progress-bar"
//                       style={{
//                         width: `${getProgressPercentage(selectedBus)}%`,
//                         backgroundColor:
//                           getStatusColor(selectedBus.route.currentStatus) ===
//                           "success"
//                             ? "#198754"
//                             : getStatusColor(
//                                 selectedBus.route.currentStatus
//                               ) === "primary"
//                             ? "#0d6efd"
//                             : getStatusColor(
//                                 selectedBus.route.currentStatus
//                               ) === "warning"
//                             ? "#ffc107"
//                             : "#6c757d",
//                       }}
//                     ></div>
//                   </div>
//                   <small className="text-muted mt-1 d-block">
//                     Tiến trình: {Math.round(getProgressPercentage(selectedBus))}
//                     % (Đã đón: {selectedBus.pickedUpStudents?.length || 0}/
//                     {selectedBus.route.students.length})
//                   </small>
//                 </Card.Body>
//               </Card>
//             )}
//           </Col>
//         </Row>

//         <Row>
//           <Col lg={8}>
//             <Card className="shadow-sm">
//               <Card.Body>
//                 <Card.Title>
//                   Bản đồ theo dõi lộ trình
//                   {selectedBus && (
//                     <Badge
//                       bg={getStatusColor(selectedBus.route.currentStatus)}
//                       className="ms-2"
//                     >
//                       {getStatusText(selectedBus.route.currentStatus)}
//                       {isBusStopped(selectedBus) && " ⏸️"}
//                     </Badge>
//                   )}
//                 </Card.Title>
//                 <Card.Text>
//                   {isRealTime ? (
//                     <span className="text-success">
//                       ✅ Đang cập nhật vị trí thời gian thực
//                       {selectedBus && isBusStopped(selectedBus) && (
//                         <span className="text-warning">
//                           {" "}
//                           - Xe đang dừng đón học sinh (2s)
//                         </span>
//                       )}
//                     </span>
//                   ) : (
//                     <span className="text-muted">
//                       ⏸️ Chế độ xem tĩnh - Nhấn "Bật real-time" để xem di chuyển
//                     </span>
//                   )}
//                 </Card.Text>
//                 <BusMap
//                   buses={buses}
//                   selectedBus={selectedBus}
//                   onBusSelect={handleBusSelect}
//                   onStudentPickup={handleStudentPickup}
//                 />
//               </Card.Body>
//             </Card>
//           </Col>

//           <Col lg={4}>
//             {/* Các component khác giữ nguyên */}
//             <Card className="shadow-sm mb-3">
//               <Card.Body>
//                 <Card.Title>Trạng thái hệ thống</Card.Title>
//                 <ListGroup variant="flush">
//                   <ListGroup.Item className="d-flex justify-content-between">
//                     <span>Chế độ:</span>
//                     <Badge bg={isRealTime ? "success" : "secondary"}>
//                       {isRealTime ? "Real-time" : "Tĩnh"}
//                     </Badge>
//                   </ListGroup.Item>
//                   <ListGroup.Item className="d-flex justify-content-between">
//                     <span>Số xe đang hoạt động:</span>
//                     <Badge bg="primary">{buses.length}</Badge>
//                   </ListGroup.Item>
//                   <ListGroup.Item className="d-flex justify-content-between">
//                     <span>Cập nhật cuối:</span>
//                     <span className="text-muted small">
//                       {buses[0]?.lastUpdate || "--:--:--"}
//                     </span>
//                   </ListGroup.Item>
//                 </ListGroup>
//               </Card.Body>
//             </Card>

//             {/* Danh sách xe bus */}
//             <Card className="shadow-sm mb-3">
//               <Card.Body>
//                 <Card.Title>Danh sách xe bus</Card.Title>
//                 <ListGroup variant="flush">
//                   {buses.map((bus) => (
//                     <ListGroup.Item
//                       key={bus.id}
//                       action
//                       active={selectedBus?.id === bus.id}
//                       onClick={() => setSelectedBus(bus)}
//                       className="d-flex justify-content-between align-items-start"
//                     >
//                       <div>
//                         <h6 className="mb-1">
//                           {bus.name}
//                           {isBusStopped(bus) && " 🛑"}
//                         </h6>
//                         <small>{bus.licensePlate}</small>
//                         <br />
//                         <small>Tài xế: {bus.route.driver}</small>
//                         <br />
//                         <small className="text-muted">
//                           Tốc độ: {bus.speed || 0} km/h
//                         </small>
//                         <br />
//                         <small className="text-muted">
//                           Tiến trình: {Math.round(getProgressPercentage(bus))}%
//                         </small>
//                         <br />
//                         <small className="text-success">
//                           ✅ Đã đón: {bus.pickedUpStudents?.length || 0}/
//                           {bus.route.students.length}
//                         </small>
//                         {isBusStopped(bus) && getCurrentStopInfo(bus) && (
//                           <>
//                             <br />
//                             <small className="text-warning">
//                               🎒 Đang đón: {getCurrentStopInfo(bus)?.name}
//                             </small>
//                           </>
//                         )}
//                       </div>
//                       <div className="text-end">
//                         <Badge bg={getStatusColor(bus.route.currentStatus)}>
//                           {getStatusText(bus.route.currentStatus)}
//                           {isBusStopped(bus) && " 🛑"}
//                         </Badge>
//                         <br />
//                         <small className="text-muted">{bus.lastUpdate}</small>
//                       </div>
//                     </ListGroup.Item>
//                   ))}
//                 </ListGroup>
//               </Card.Body>
//             </Card>

//             {selectedBus && (
//               <Card className="shadow-sm">
//                 <Card.Body>
//                   <Card.Title>Thông tin chi tiết</Card.Title>
//                   <h6>Lộ trình: {selectedBus.route.name}</h6>
//                   <p>
//                     <strong>Trường:</strong> {selectedBus.route.school.name}
//                   </p>
//                   <p>
//                     <strong>Giờ vào lớp:</strong>{" "}
//                     {selectedBus.route.school.startTime}
//                   </p>

//                   <h6 className="mt-3">Tiến trình:</h6>
//                   <div className="progress mb-3" style={{ height: "20px" }}>
//                     <div
//                       className="progress-bar"
//                       style={{
//                         width: `${getProgressPercentage(selectedBus)}%`,
//                       }}
//                     >
//                       {Math.round(getProgressPercentage(selectedBus))}%
//                     </div>
//                   </div>

//                   <h6 className="mt-3">Danh sách điểm đón:</h6>
//                   <div style={{ maxHeight: "300px", overflowY: "auto" }}>
//                     {selectedBus.route.students.map((student, index) => {
//                       const isPickedUp = isStudentPickedUp(
//                         selectedBus,
//                         student.id
//                       );
//                       const isCurrent =
//                         index === selectedBus.route.currentStudentIndex;

//                       return (
//                         <Card
//                           key={student.id}
//                           className="mb-2"
//                           style={{
//                             opacity: isPickedUp ? 0.6 : 1,
//                             borderLeft: isCurrent
//                               ? "4px solid #ffc107"
//                               : "4px solid transparent",
//                           }}
//                         >
//                           <Card.Body className="py-2">
//                             <div className="d-flex justify-content-between align-items-start">
//                               <div>
//                                 <h6 className="mb-1">
//                                   {index + 1}. {student.name}
//                                   {isCurrent &&
//                                     selectedBus.route.currentStatus ===
//                                       "picking_up" && (
//                                       <Badge bg="warning" className="ms-1">
//                                         {isBusStopped(selectedBus)
//                                           ? "🛑 Đang dừng đón"
//                                           : "🚌 Đang đến"}
//                                       </Badge>
//                                     )}
//                                   {isPickedUp && (
//                                     <Badge bg="success" className="ms-1">
//                                       ✅ Đã đón
//                                     </Badge>
//                                   )}
//                                   {!isPickedUp &&
//                                     index >
//                                       selectedBus.route.currentStudentIndex && (
//                                       <Badge bg="secondary" className="ms-1">
//                                         ⏳ Chờ đón
//                                       </Badge>
//                                     )}
//                                 </h6>
//                                 <small className="text-muted">
//                                   {student.grade} - {student.address}
//                                 </small>
//                                 <br />
//                                 <small>Giờ đón: {student.pickupTime}</small>
//                               </div>
//                             </div>
//                           </Card.Body>
//                         </Card>
//                       );
//                     })}

//                     <Card className="mb-2">
//                       <Card.Body className="py-2">
//                         <div className="d-flex justify-content-between align-items-start">
//                           <div>
//                             <h6 className="mb-1">
//                               🏫 {selectedBus.route.school.name}
//                               {selectedBus.route.currentStatus ===
//                                 "going_to_school" && (
//                                 <Badge bg="primary" className="ms-1">
//                                   Đang đến
//                                 </Badge>
//                               )}
//                               {selectedBus.route.currentStatus ===
//                                 "completed" && (
//                                 <Badge bg="success" className="ms-1">
//                                   ✅ Đã đến
//                                 </Badge>
//                               )}
//                             </h6>
//                             <small className="text-muted">
//                               Giờ vào lớp: {selectedBus.route.school.startTime}
//                             </small>
//                           </div>
//                         </div>
//                       </Card.Body>
//                     </Card>
//                   </div>
//                 </Card.Body>
//               </Card>
//             )}
//           </Col>
//         </Row>
//       </Container>
//     </>
//   );
// };

// export default VehiclesPage;

"use client";
import Head from "next/head";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Bus, Student, BusRoute } from "../../types/bus";

const BusMap = dynamic(() => import("../../components/Map"), {
  ssr: false,
});

// Service functions để fetch data từ database
const fetchDataFromDB = async () => {
  try {
    // Sử dụng URL đầy đủ với localhost:5000
    const response = await fetch("http://localhost:5000/api/tracking/bus-data");
    if (!response.ok) {
      throw new Error(
        `Failed to fetch bus data: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error || "Lỗi không xác định từ server");
    }
  } catch (error) {
    console.error("Error fetching data from database:", error);

    // Fallback: test kết nối cơ bản
    try {
      const testResponse = await fetch("http://localhost:5000/api/tracking");
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log("✅ Tracking API is working:", testData);
      }
    } catch (testError) {
      console.error("❌ Cannot connect to tracking API:", testError);
    }

    return null;
  }
};

// Hàm chuyển đổi dữ liệu từ DB sang định dạng Bus
const convertDBDataToBus = (dbData: any): Bus[] => {
  if (!dbData) return [];

  const {
    hocsinh,
    diachi,
    vitrithuc,
    taixe,
    xebuyt,
    chuyenxe,
    lichtrinh,
    tuyenduong,
    phanbohocsinh,
  } = dbData;

  return chuyenxe.map((chuyen: any) => {
    // Tìm thông tin liên quan
    const xe = xebuyt.find((x: any) => x.maXeBuyt === chuyen.maXeBuyt);
    const taiXe = taixe.find((t: any) => t.maTaiXe === chuyen.maTaiXe);
    const lich = lichtrinh.find(
      (l: any) => l.maLichTrinh === chuyen.maLichTrinh
    );
    const tuyen = tuyenduong.find(
      (t: any) => t.maTuyenDuong === chuyen.maTuyenDuong
    );

    // Lấy danh sách học sinh cho chuyến xe này
    const phanBoHocSinh = phanbohocsinh.filter(
      (pb: any) => pb.maChuyenXe === chuyen.maChuyenXe
    );

    const busStudents: Student[] = phanBoHocSinh
      .map((pb: any) => {
        const student = hocsinh.find(
          (hs: any) => hs.maHocSinh === pb.maHocSinh
        );
        if (!student) return null;

        const address = diachi.find(
          (dc: any) => dc.maDiaChi === student.maDiaChi
        );
        const location = vitrithuc.find(
          (vt: any) => vt.maViTriThuc === address?.maViTriThuc
        );

        return {
          id: student.maHocSinh.toString(),
          name: student.tenHocSinh,
          address: `${address?.soNha || ""} ${address?.duong || ""}, ${
            address?.phuongXa || ""
          }, ${address?.quanHuyen || ""}, ${address?.thanhPho || ""}`,
          position: {
            lat: location?.viDo || 10.762622,
            lng: location?.kinhDo || 106.660172,
          },
          school: "Trường Đại học Sài Gòn",
          grade: student.lop,
          pickupTime: lich?.thoiGianDi
            ? lich.thoiGianDi.substring(0, 5)
            : "06:30",
        };
      })
      .filter(Boolean) as Student[];

    // Tạo route từ dữ liệu database
    const busRoute: BusRoute = {
      id: chuyen.maChuyenXe.toString(),
      name: tuyen?.tenTuyenDuong || `Tuyến ${chuyen.maTuyenDuong}`,
      busNumber: xe?.bienSoXe || "Unknown",
      driver: taiXe?.tenTaiXe || "Chưa xác định",
      school: {
        name: "Trường Đại học Sài Gòn",
        position: {
          lat: 10.762622,
          lng: 106.682243,
        },
        startTime: "07:30",
      },
      students: busStudents,
      currentStatus: "waiting",
      currentStudentIndex: 0,
    };

    return {
      id: chuyen.maChuyenXe.toString(),
      name: `Xe ${xe?.bienSoXe || chuyen.maChuyenXe}`,
      licensePlate: xe?.bienSoXe || "Unknown",
      route: busRoute,
      position: {
        lat: 10.782622,
        lng: 106.640172,
      },
      speed: 0,
      lastUpdate: new Date().toLocaleTimeString(),
      nextStop:
        busStudents.length > 0
          ? {
              student: busStudents[0],
              estimatedArrival: lich?.thoiGianDi
                ? lich.thoiGianDi.substring(0, 5)
                : "06:30",
            }
          : undefined,
      pickedUpStudents: [],
    };
  });
};

const VehiclesPage: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Ref để lưu thời gian dừng tại mỗi điểm
  const stopTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Fetch data từ database khi component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const dbData = await fetchDataFromDB();
        if (dbData) {
          const busData = convertDBDataToBus(dbData);
          setBuses(busData);
          if (busData.length > 0) {
            setSelectedBus(busData[0]);
          }
        }
      } catch (error) {
        console.error("Error loading bus data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Sử dụng useCallback để tránh recreation function
  const handleStudentPickup = useCallback(
    (studentId: string, busId?: string) => {
      console.log(
        `🎒 Marking student ${studentId} as picked up for bus ${
          busId || selectedBus?.id
        }`
      );

      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          // Nếu có busId, chỉ update bus đó, nếu không thì update selectedBus
          const shouldUpdate = busId
            ? bus.id === busId
            : bus.id === selectedBus?.id;

          if (shouldUpdate) {
            // Thêm học sinh vào danh sách đã đón nếu chưa có
            const updatedPickedUpStudents = bus.pickedUpStudents?.includes(
              studentId
            )
              ? bus.pickedUpStudents
              : [...(bus.pickedUpStudents || []), studentId];

            console.log(
              `✅ Updated picked up students for ${bus.name}:`,
              updatedPickedUpStudents
            );

            return {
              ...bus,
              pickedUpStudents: updatedPickedUpStudents,
            };
          }
          return bus;
        })
      );
    },
    [selectedBus]
  );

  // Simulate bus movement - FIXED VERSION
  useEffect(() => {
    if (!isRealTime || buses.length === 0) {
      Object.values(stopTimersRef.current).forEach((timer) =>
        clearTimeout(timer)
      );
      stopTimersRef.current = {};
      return;
    }

    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          const stopTimerKey = `bus-${bus.id}`;
          const isCurrentlyStopped = !!stopTimersRef.current[stopTimerKey];

          if (isCurrentlyStopped) {
            return {
              ...bus,
              speed: 0,
              lastUpdate: new Date().toLocaleTimeString(),
            };
          }

          const currentRoute = bus.route;
          const currentStudentIndex = bus.route.currentStudentIndex;
          const students = currentRoute.students;
          const school = currentRoute.school;

          if (currentRoute.currentStatus === "completed") {
            return {
              ...bus,
              speed: 0,
              lastUpdate: new Date().toLocaleTimeString(),
            };
          }

          let targetPosition: { lat: number; lng: number };
          let nextStatus = bus.route.currentStatus;
          let nextStudentIndex = currentStudentIndex;

          if (currentStudentIndex < students.length) {
            targetPosition = students[currentStudentIndex].position;
            nextStatus = "picking_up";
          } else {
            targetPosition = school.position;
            nextStatus = "going_to_school";
          }

          const currentLat = bus.position.lat;
          const currentLng = bus.position.lng;
          const targetLat = targetPosition.lat;
          const targetLng = targetPosition.lng;

          const latDiff = targetLat - currentLat;
          const lngDiff = targetLng - currentLng;
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

          const speed = 0.0001;
          let newLat = currentLat;
          let newLng = currentLng;
          let newSpeed = Math.floor(speed * 100000);

          // Kiểm tra nếu đã đến điểm đón
          if (
            distance <= 0.0002 &&
            currentStudentIndex < students.length &&
            !isCurrentlyStopped
          ) {
            console.log(
              `🎯 ${bus.name} arrived at student ${currentStudentIndex + 1}`
            );

            // Tự động đánh dấu học sinh đã đón khi xe đến - TRỰC TIẾP gọi hàm
            const currentStudentId = students[currentStudentIndex].id;

            // Gọi trực tiếp hàm handleStudentPickup với busId cụ thể
            handleStudentPickup(currentStudentId, bus.id);

            // Dừng lại để đón học sinh
            stopTimersRef.current[stopTimerKey] = setTimeout(() => {
              console.log(
                `✅ ${bus.name} picked up student, moving to next stop`
              );

              const nextIndex = currentStudentIndex + 1;
              const newStatus =
                nextIndex === students.length
                  ? "going_to_school"
                  : "picking_up";

              console.log(
                `➡️ ${bus.name} moving to ${
                  nextIndex < students.length
                    ? `student ${nextIndex + 1}`
                    : "school"
                }, status: ${newStatus}`
              );

              // Cập nhật state
              setBuses((prev) =>
                prev.map((b) => {
                  if (b.id === bus.id) {
                    return {
                      ...b,
                      route: {
                        ...b.route,
                        currentStudentIndex: nextIndex,
                        currentStatus: newStatus,
                      },
                    };
                  }
                  return b;
                })
              );

              delete stopTimersRef.current[stopTimerKey];
            }, 2000);

            newLat = targetLat;
            newLng = targetLng;
            newSpeed = 0;
          }
          // Kiểm tra nếu đã đến trường
          else if (
            distance <= 0.0002 &&
            currentStudentIndex >= students.length &&
            !isCurrentlyStopped
          ) {
            console.log(`🏫 ${bus.name} arrived at school - COMPLETED!`);

            nextStatus = "completed";
            newLat = targetLat;
            newLng = targetLng;
            newSpeed = 0;

            setTimeout(() => {
              setBuses((prev) =>
                prev.map((b) => {
                  if (b.id === bus.id) {
                    return {
                      ...b,
                      route: {
                        ...b.route,
                        currentStatus: "completed",
                      },
                    };
                  }
                  return b;
                })
              );
            }, 0);
          } else {
            const moveDistance = Math.min(distance, speed);
            newLat = currentLat + (latDiff / distance) * moveDistance;
            newLng = currentLng + (lngDiff / distance) * moveDistance;
          }

          let nextStop = undefined;
          if (nextStudentIndex < students.length && !isCurrentlyStopped) {
            const nextStudent = students[nextStudentIndex];
            const estimatedTime = Math.floor(distance / speed);
            const estimatedArrival = new Date();
            estimatedArrival.setSeconds(
              estimatedArrival.getSeconds() + estimatedTime
            );

            nextStop = {
              student: nextStudent,
              estimatedArrival: estimatedArrival.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
            };
          }

          return {
            ...bus,
            position: { lat: newLat, lng: newLng },
            speed: newSpeed,
            lastUpdate: new Date().toLocaleTimeString(),
            nextStop,
            route: {
              ...currentRoute,
              currentStatus: nextStatus,
              currentStudentIndex: nextStudentIndex,
            },
          };
        })
      );
    }, 100);

    return () => {
      clearInterval(interval);
      Object.values(stopTimersRef.current).forEach((timer) =>
        clearTimeout(timer)
      );
      stopTimersRef.current = {};
    };
  }, [isRealTime, handleStudentPickup, buses.length]);

  // Sync selectedBus - IMPROVED VERSION
  useEffect(() => {
    if (!selectedBus) return;

    const updatedBus = buses.find((b) => b.id === selectedBus.id);
    if (
      updatedBus &&
      (updatedBus.route.currentStudentIndex !==
        selectedBus.route.currentStudentIndex ||
        updatedBus.route.currentStatus !== selectedBus.route.currentStatus ||
        updatedBus.position.lat !== selectedBus.position.lat ||
        updatedBus.position.lng !== selectedBus.position.lng ||
        updatedBus.speed !== selectedBus.speed ||
        JSON.stringify(updatedBus.pickedUpStudents) !==
          JSON.stringify(selectedBus.pickedUpStudents))
    ) {
      console.log("🔄 Syncing selectedBus with updated bus data");
      setSelectedBus(updatedBus);
    }
  }, [buses, selectedBus]);

  const toggleRealTime = () => {
    if (isRealTime) {
      Object.values(stopTimersRef.current).forEach((timer) =>
        clearTimeout(timer)
      );
      stopTimersRef.current = {};
    }
    setIsRealTime(!isRealTime);
  };

  const handleBusSelect = (bus: Bus | null) => {
    setSelectedBus(bus);
  };

  const resetSimulation = () => {
    Object.values(stopTimersRef.current).forEach((timer) =>
      clearTimeout(timer)
    );
    stopTimersRef.current = {};

    // Reset buses về trạng thái ban đầu từ database
    const loadInitialData = async () => {
      const dbData = await fetchDataFromDB();
      if (dbData) {
        const busData = convertDBDataToBus(dbData);
        setBuses(busData);
        if (busData.length > 0) {
          setSelectedBus(busData[0]);
        }
      }
    };

    loadInitialData();
    setIsRealTime(false);
  };

  const skipCurrentStop = () => {
    if (selectedBus) {
      setBuses((prev) =>
        prev.map((bus) => {
          if (bus.id === selectedBus.id) {
            const nextIndex = bus.route.currentStudentIndex + 1;
            const newStatus =
              nextIndex === bus.route.students.length
                ? "going_to_school"
                : "picking_up";

            console.log(`⏭️ Skipping to stop ${nextIndex}`);

            const stopTimerKey = `bus-${bus.id}`;
            if (stopTimersRef.current[stopTimerKey]) {
              clearTimeout(stopTimersRef.current[stopTimerKey]);
              delete stopTimersRef.current[stopTimerKey];
            }

            return {
              ...bus,
              route: {
                ...bus.route,
                currentStudentIndex: nextIndex,
                currentStatus: newStatus,
              },
            };
          }
          return bus;
        })
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "secondary";
      case "picking_up":
        return "warning";
      case "going_to_school":
        return "primary";
      case "completed":
        return "success";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "Chờ đón";
      case "picking_up":
        return "Đang đón";
      case "going_to_school":
        return "Đến trường";
      case "completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  // Hàm để xem chi tiết tiến trình - FIXED
  const getProgressPercentage = (bus: Bus) => {
    const totalStops = bus.route.students.length + 1;
    let completedStops = bus.pickedUpStudents?.length || 0;

    // Nếu đã đến trường, tính là hoàn thành tất cả
    if (bus.route.currentStatus === "completed") {
      completedStops = totalStops;
    }
    // Nếu đang trên đường đến trường và đã đón hết học sinh
    else if (
      bus.route.currentStatus === "going_to_school" &&
      completedStops === bus.route.students.length
    ) {
      completedStops = totalStops - 1; // Chưa đến trường nhưng đã đón hết học sinh
    }

    const percentage = (completedStops / totalStops) * 100;
    return Math.min(percentage, 100); // Đảm bảo không vượt quá 100%
  };

  const isBusStopped = (bus: Bus) => {
    return !!stopTimersRef.current[`bus-${bus.id}`];
  };

  const getCurrentStopInfo = (bus: Bus) => {
    if (bus.route.currentStudentIndex < bus.route.students.length) {
      return bus.route.students[bus.route.currentStudentIndex];
    } else if (bus.route.currentStatus === "going_to_school") {
      return { name: bus.route.school.name, type: "school" };
    }
    return null;
  };

  const isStudentPickedUp = (bus: Bus, studentId: string): boolean => {
    return bus.pickedUpStudents?.includes(studentId) || false;
  };

  if (isLoading) {
    return (
      <Container fluid>
        <Row className="my-4">
          <Col>
            <div className="text-center">
              <h2>Đang tải dữ liệu...</h2>
              <p>Vui lòng chờ trong giây lát</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Vị trí xe bus học sinh | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <Row className="my-4">
          <Col>
            <h1>Theo dõi xe bus học sinh</h1>
            <div className="d-flex align-items-center gap-3 mb-3">
              <Badge bg={isRealTime ? "success" : "secondary"}>
                {isRealTime
                  ? "Đang cập nhật thời gian thực"
                  : "Chế độ xem tĩnh"}
              </Badge>
              <Button
                variant={isRealTime ? "outline-danger" : "outline-success"}
                size="sm"
                onClick={toggleRealTime}
                disabled={buses.length === 0}
              >
                {isRealTime ? "Dừng real-time" : "Bật real-time"}
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={resetSimulation}
                disabled={buses.length === 0}
              >
                Reset
              </Button>
              {selectedBus && isBusStopped(selectedBus) && (
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={skipCurrentStop}
                >
                  ⏭️ Bỏ qua điểm dừng
                </Button>
              )}
              {isRealTime && (
                <Badge bg="info" className="p-2">
                  🚌 Đang mô phỏng di chuyển...
                </Badge>
              )}
            </div>

            {selectedBus && isRealTime && (
              <Card className="mb-3 bg-light">
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{selectedBus.name}</strong> -
                      {isBusStopped(selectedBus) ? (
                        <span className="text-warning">
                          🛑 Đang dừng đón học sinh:{" "}
                          <strong>
                            {getCurrentStopInfo(selectedBus)?.name}
                          </strong>
                        </span>
                      ) : (
                        <span className="text-primary">
                          {selectedBus.route.currentStatus === "picking_up" &&
                            "🚌 Đang di chuyển đến điểm đón"}
                          {selectedBus.route.currentStatus ===
                            "going_to_school" && "🏫 Đang đến trường"}
                          {selectedBus.route.currentStatus === "completed" &&
                            "✅ Đã hoàn thành lộ trình"}
                        </span>
                      )}
                    </div>
                    <Badge bg={getStatusColor(selectedBus.route.currentStatus)}>
                      {getStatusText(selectedBus.route.currentStatus)}
                    </Badge>
                  </div>
                  <div className="progress mt-2" style={{ height: "10px" }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${getProgressPercentage(selectedBus)}%`,
                        backgroundColor:
                          getStatusColor(selectedBus.route.currentStatus) ===
                          "success"
                            ? "#198754"
                            : getStatusColor(
                                selectedBus.route.currentStatus
                              ) === "primary"
                            ? "#0d6efd"
                            : getStatusColor(
                                selectedBus.route.currentStatus
                              ) === "warning"
                            ? "#ffc107"
                            : "#6c757d",
                      }}
                    ></div>
                  </div>
                  <small className="text-muted mt-1 d-block">
                    Tiến trình: {Math.round(getProgressPercentage(selectedBus))}
                    % (Đã đón: {selectedBus.pickedUpStudents?.length || 0}/
                    {selectedBus.route.students.length})
                  </small>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>
                  Bản đồ theo dõi lộ trình
                  {selectedBus && (
                    <Badge
                      bg={getStatusColor(selectedBus.route.currentStatus)}
                      className="ms-2"
                    >
                      {getStatusText(selectedBus.route.currentStatus)}
                      {isBusStopped(selectedBus) && " ⏸️"}
                    </Badge>
                  )}
                </Card.Title>
                <Card.Text>
                  {buses.length === 0 ? (
                    <span className="text-danger">
                      ⚠️ Không có dữ liệu xe bus
                    </span>
                  ) : isRealTime ? (
                    <span className="text-success">
                      ✅ Đang cập nhật vị trí thời gian thực
                      {selectedBus && isBusStopped(selectedBus) && (
                        <span className="text-warning">
                          {" "}
                          - Xe đang dừng đón học sinh (2s)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted">
                      ⏸️ Chế độ xem tĩnh - Nhấn "Bật real-time" để xem di chuyển
                    </span>
                  )}
                </Card.Text>
                {buses.length > 0 ? (
                  <BusMap
                    buses={buses}
                    selectedBus={selectedBus}
                    onBusSelect={handleBusSelect}
                    onStudentPickup={handleStudentPickup}
                  />
                ) : (
                  <div className="text-center py-5">
                    <h5>Không có dữ liệu xe bus</h5>
                    <p>Vui lòng kiểm tra kết nối database</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Các component khác giữ nguyên */}
            <Card className="shadow-sm mb-3">
              <Card.Body>
                <Card.Title>Trạng thái hệ thống</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Chế độ:</span>
                    <Badge bg={isRealTime ? "success" : "secondary"}>
                      {isRealTime ? "Real-time" : "Tĩnh"}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Số xe đang hoạt động:</span>
                    <Badge bg="primary">{buses.length}</Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Cập nhật cuối:</span>
                    <span className="text-muted small">
                      {buses[0]?.lastUpdate || "--:--:--"}
                    </span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

            {/* Danh sách xe bus */}
            {buses.length > 0 && (
              <Card className="shadow-sm mb-3">
                <Card.Body>
                  <Card.Title>Danh sách xe bus</Card.Title>
                  <ListGroup variant="flush">
                    {buses.map((bus) => (
                      <ListGroup.Item
                        key={bus.id}
                        action
                        active={selectedBus?.id === bus.id}
                        onClick={() => setSelectedBus(bus)}
                        className="d-flex justify-content-between align-items-start"
                      >
                        <div>
                          <h6 className="mb-1">
                            {bus.name}
                            {isBusStopped(bus) && " 🛑"}
                          </h6>
                          <small>{bus.licensePlate}</small>
                          <br />
                          <small>Tài xế: {bus.route.driver}</small>
                          <br />
                          <small className="text-muted">
                            Tốc độ: {bus.speed || 0} km/h
                          </small>
                          <br />
                          <small className="text-muted">
                            Tiến trình: {Math.round(getProgressPercentage(bus))}
                            %
                          </small>
                          <br />
                          <small className="text-success">
                            ✅ Đã đón: {bus.pickedUpStudents?.length || 0}/
                            {bus.route.students.length}
                          </small>
                          {isBusStopped(bus) && getCurrentStopInfo(bus) && (
                            <>
                              <br />
                              <small className="text-warning">
                                🎒 Đang đón: {getCurrentStopInfo(bus)?.name}
                              </small>
                            </>
                          )}
                        </div>
                        <div className="text-end">
                          <Badge bg={getStatusColor(bus.route.currentStatus)}>
                            {getStatusText(bus.route.currentStatus)}
                            {isBusStopped(bus) && " 🛑"}
                          </Badge>
                          <br />
                          <small className="text-muted">{bus.lastUpdate}</small>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            )}

            {selectedBus && (
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Thông tin chi tiết</Card.Title>
                  <h6>Lộ trình: {selectedBus.route.name}</h6>
                  <p>
                    <strong>Trường:</strong> {selectedBus.route.school.name}
                  </p>
                  <p>
                    <strong>Giờ vào lớp:</strong>{" "}
                    {selectedBus.route.school.startTime}
                  </p>

                  <h6 className="mt-3">Tiến trình:</h6>
                  <div className="progress mb-3" style={{ height: "20px" }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${getProgressPercentage(selectedBus)}%`,
                      }}
                    >
                      {Math.round(getProgressPercentage(selectedBus))}%
                    </div>
                  </div>

                  <h6 className="mt-3">Danh sách điểm đón:</h6>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {selectedBus.route.students.map((student, index) => {
                      const isPickedUp = isStudentPickedUp(
                        selectedBus,
                        student.id
                      );
                      const isCurrent =
                        index === selectedBus.route.currentStudentIndex;

                      return (
                        <Card
                          key={student.id}
                          className="mb-2"
                          style={{
                            opacity: isPickedUp ? 0.6 : 1,
                            borderLeft: isCurrent
                              ? "4px solid #ffc107"
                              : "4px solid transparent",
                          }}
                        >
                          <Card.Body className="py-2">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">
                                  {index + 1}. {student.name}
                                  {isCurrent &&
                                    selectedBus.route.currentStatus ===
                                      "picking_up" && (
                                      <Badge bg="warning" className="ms-1">
                                        {isBusStopped(selectedBus)
                                          ? "🛑 Đang dừng đón"
                                          : "🚌 Đang đến"}
                                      </Badge>
                                    )}
                                  {isPickedUp && (
                                    <Badge bg="success" className="ms-1">
                                      ✅ Đã đón
                                    </Badge>
                                  )}
                                  {!isPickedUp &&
                                    index >
                                      selectedBus.route.currentStudentIndex && (
                                      <Badge bg="secondary" className="ms-1">
                                        ⏳ Chờ đón
                                      </Badge>
                                    )}
                                </h6>
                                <small className="text-muted">
                                  {student.grade} - {student.address}
                                </small>
                                <br />
                                <small>Giờ đón: {student.pickupTime}</small>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      );
                    })}

                    <Card className="mb-2">
                      <Card.Body className="py-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">
                              🏫 {selectedBus.route.school.name}
                              {selectedBus.route.currentStatus ===
                                "going_to_school" && (
                                <Badge bg="primary" className="ms-1">
                                  Đang đến
                                </Badge>
                              )}
                              {selectedBus.route.currentStatus ===
                                "completed" && (
                                <Badge bg="success" className="ms-1">
                                  ✅ Đã đến
                                </Badge>
                              )}
                            </h6>
                            <small className="text-muted">
                              Giờ vào lớp: {selectedBus.route.school.startTime}
                            </small>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default VehiclesPage;
