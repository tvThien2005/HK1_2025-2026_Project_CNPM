// "use client";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   Polyline,
// } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// // Fix marker icons trong React
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//   iconUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
// });

// // ĐỊNH NGHĨA INTERFACE ĐẦY ĐỦ
// interface Student {
//   id: string;
//   name: string;
//   address: string;
//   position: {
//     lat: number;
//     lng: number;
//   };
//   school: string;
//   grade: string;
//   pickupTime: string;
//   loaiPhanBo?: 'Sang' | 'Chieu';
// }

// interface BusRoute {
//   id: string;
//   name: string;
//   busNumber: string;
//   driver: string;
//   school: {
//     name: string;
//     position: {
//       lat: number;
//       lng: number;
//     };
//     startTime: string;
//   };
//   students: Student[];
//   currentStatus: "waiting" | "picking_up" | "going_to_school" | "completed";
//   currentStudentIndex: number;
//   schedule?: {
//     startTime: string;
//     endTime: string;
//   };
//   isDonXe?: boolean;
//   loaiPhanBo?: 'Sang' | 'Chieu';
// }

// interface Bus {
//   id: string;
//   name: string;
//   licensePlate: string;
//   route: BusRoute;
//   position: {
//     lat: number;
//     lng: number;
//   };
//   speed: number;
//   lastUpdate: string;
//   nextStop?: {
//     student: Student;
//     estimatedArrival: string;
//   };
//   pickedUpStudents?: string[];
//   shouldStartRealtime?: boolean;
//   isHidden?: boolean;
//   actualStartTime?: string;
//   totalDistance?: number;
//   currentSegmentProgress?: number;
//   isDonXe?: boolean;
// }

// interface ExtendedBus extends Bus {
//   route: BusRoute;
//   shouldStartRealtime?: boolean;
//   isHidden?: boolean;
//   actualStartTime?: string;
//   totalDistance?: number;
//   currentSegmentProgress?: number;
//   isDonXe?: boolean;
// }

// interface MapProps {
//   buses?: ExtendedBus[];
//   selectedBus?: ExtendedBus | null;
//   onBusSelect?: (bus: ExtendedBus | null) => void;
//   onStudentPickup?: (studentId: string, busId?: string) => void;
//   isRealTime?: boolean;
// }

// // Các hàm utility
// const svgToDataUrl = (svg: string) => {
//   return `data:image/svg+xml;base64,${btoa(svg)}`;
// };

// // Các hàm API (giữ nguyên từ code của bạn)
// export const getTripDetails = async (maChuyenXe: string) => {
//   try {
//     const [trip, assignedStops, studentAllocations] = await Promise.all([
//       fetch(`http://localhost:5000/api/chuyenxe/${maChuyenXe}`).then(res => res.json()),
//       fetch(`http://localhost:5000/api/phanbotramxe?maChuyenXe=${maChuyenXe}`).then(res => res.json()),
//       fetch(`http://localhost:5000/api/phanbohocsinhtram?maChuyenXe=${maChuyenXe}`).then(res => res.json())
//     ]);

//     return {
//       trip: trip[0],
//       assignedStops,
//       studentAllocations
//     };
//   } catch (error) {
//     console.error('Error fetching trip details:', error);
//     throw error;
//   }
// };

// export const getMapData = async () => {
//   try {
//     const [busStops, busRoutes, activeTrips, busLocations, studentAllocations] = await Promise.all([
//       fetch('http://localhost:5000/api/diemdung').then(res => res.json()),
//       fetch('http://localhost:5000/api/chitiettuyenduong').then(res => res.json()),
//       fetch('http://localhost:5000/api/chuyenxe?status=InProgress').then(res => res.json()),
//       fetch('http://localhost:5000/api/vitrichuyenxe').then(res => res.json()),
//       fetch('http://localhost:5000/api/phanbohocsinhtram').then(res => res.json())
//     ]);

//     return {
//       busStops,
//       busRoutes,
//       activeTrips,
//       busLocations,
//       studentAllocations
//     };
//   } catch (error) {
//     console.error('Error fetching map data:', error);
//     throw error;
//   }
// };

// export const getStudentAllocations = async (maHocSinh: string) => {
//   try {
//     const response = await fetch(`http://localhost:5000/api/phanbohocsinhtram?maHocSinh=${maHocSinh}`);
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching student allocations:', error);
//     throw error;
//   }
// };

// // Component BusMap chính
// const BusMap: React.FC<MapProps> = ({
//   buses = [],
//   selectedBus = null,
//   onBusSelect,
//   onStudentPickup,
//   isRealTime = false,
// }) => {
//   const center: [number, number] = [10.762622, 106.660172];

//   // Hàm kiểm tra xem học sinh đã được đón/trả chưa
//   const isStudentPickedUp = (bus: ExtendedBus | null, studentId: string): boolean => {
//     if (!bus) return false;
//     return bus.pickedUpStudents?.includes(studentId) || false;
//   };

//   // Hàm lấy màu sắc cho bus dựa trên trạng thái và chiều
//   const getBusIconColor = (bus: ExtendedBus) => {
//     if (bus.route.currentStatus === "completed") return "#4CAF50"; // Xanh - hoàn thành
    
//     if (bus.isDonXe) {
//       // CHIỀU ĐÓN
//       if (bus.route.currentStatus === "going_to_school") return "#2196F3"; // Xanh dương - đang đến trường
//       if (bus.route.currentStatus === "picking_up") return "#FF9800"; // Cam - đang đón học sinh
//     } else {
//       // CHIỀU TRẢ
//       if (bus.route.currentStatus === "going_to_school") return "#9C27B0"; // Tím - đang rời trường
//       if (bus.route.currentStatus === "picking_up") return "#FF5722"; // Đỏ cam - đang trả học sinh
//     }
    
//     return "#DC2626"; // Đỏ - mặc định
//   };

//   // Tạo icon bus động với màu sắc theo trạng thái và chiều
//   const createBusIcon = (bus: ExtendedBus) => {
//     const color = getBusIconColor(bus);
//     const directionIcon = bus.isDonXe ? "🏫" : "🏠"; // Đến trường hoặc về nhà
    
//     return L.divIcon({
//       html: `
//       <div style="
//         background-color: ${color};
//         width: 35px;
//         height: 35px;
//         border-radius: 50%;
//         border: 3px solid white;
//         box-shadow: 0 2px 4px rgba(0,0,0,0.3);
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         color: white;
//         font-weight: bold;
//         font-size: 14px;
//         position: relative;
//       ">
//         ${directionIcon}
//         <div style="
//           position: absolute;
//           bottom: -5px;
//           right: -5px;
//           background: white;
//           border-radius: 50%;
//           width: 15px;
//           height: 15px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 10px;
//           color: ${color};
//           border: 1px solid ${color};
//         ">
//           ${bus.isDonXe ? 'Đ' : 'T'}
//         </div>
//       </div>
//     `,
//       iconSize: [35, 35],
//       iconAnchor: [17, 17],
//       className: "custom-bus-icon",
//     });
//   };

//   // Hàm lấy vị trí cho polyline theo chiều
//   const getRoutePositions = (bus: ExtendedBus | null): L.LatLngExpression[] => {
//     if (!bus) return [];
    
//     const students = bus.route.students;
//     const school = bus.route.school;

//     if (bus.isDonXe) {
//       // CHIỀU ĐÓN: Điểm xuất phát → Các điểm đón → Trường
//       return [
//         [10.782622, 106.640172] as L.LatLngExpression, // Điểm xuất phát
//         ...students
//           .filter((student) => !isStudentPickedUp(bus, student.id))
//           .map((s) => [s.position.lat, s.position.lng] as L.LatLngExpression),
//         [school.position.lat, school.position.lng] as L.LatLngExpression, // Trường
//       ];
//     } else {
//       // CHIỀU TRẢ: Trường → Các điểm trả → Điểm kết thúc
//       return [
//         [school.position.lat, school.position.lng] as L.LatLngExpression, // Trường
//         ...students
//           .filter((student) => !isStudentPickedUp(bus, student.id))
//           .map((s) => [s.position.lat, s.position.lng] as L.LatLngExpression),
//         [10.782622, 106.640172] as L.LatLngExpression, // Điểm kết thúc
//       ];
//     }
//   };

//   // Hàm lấy vị trí đường đến điểm tiếp theo
//   const getNextStopLinePositions = (bus: ExtendedBus | null): L.LatLngExpression[] => {
//     if (!bus || bus.route.currentStudentIndex >= bus.route.students.length) {
//       return [];
//     }

//     const currentStudent = bus.route.students[bus.route.currentStudentIndex];
    
//     return [
//       [bus.position.lat, bus.position.lng] as L.LatLngExpression,
//       [currentStudent.position.lat, currentStudent.position.lng] as L.LatLngExpression,
//     ];
//   };

//   // Icon cho trường học (giữ nguyên từ code của bạn)
//   const schoolIconSvg = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
//    viewBox="0 0 508 508" xml:space="preserve">
// <circle style="fill:#90DFAA;" cx="254" cy="254" r="254"/>
// <polygon style="fill:#F1543F;" points="445.6,221.6 62.4,221.6 81.2,150.4 426.8,150.4 "/>
// <path style="fill:#2C9984;" d="M53.2,409.2C99.6,469.2,172.4,508,254,508s154.4-38.8,200.8-98.8H53.2z"/>
// <rect x="81.2" y="221.6" style="fill:#E6E9EE;" width="345.6" height="187.6"/>
// <path style="fill:#FFFFFF;" d="M330,180.8c-20.8-20.8-43.6-40-65.6-59.6c-1.6-1.2-2.4-2.8-3.2-4h-18.4c-1.2,3.2-3.2,5.6-6.8,7.2
//   c-6.8,2.8-9.6,10.8-12.8,16.4c-3.6,6.4-8,12.4-13.6,17.2c-9.6,9.2-21.6,15.2-32,23.2v228h153.2v-228
//   C330.8,181.2,330.4,180.8,330,180.8z"/>
// <rect x="81.2" y="390.8" style="fill:#2B3B4E;" width="345.6" height="18.4"/>
// <rect x="177.6" y="390.8" style="fill:#324A5E;" width="153.2" height="18.4"/>
// <polygon style="fill:#FF7058;" points="177.6,200.8 254,124.4 330.4,200.8 355.2,200.8 254,99.6 152.8,200.8 "/>
// <g>
//   <rect x="195.2" y="216.8" style="fill:#84DBFF;" width="33.2" height="33.2"/>
//   <rect x="237.6" y="216.8" style="fill:#84DBFF;" width="33.2" height="33.2"/>
//   <rect x="279.6" y="216.8" style="fill:#84DBFF;" width="33.2" height="33.2"/>
// </g>
// <rect x="222.8" y="318" style="fill:#FFD05B;" width="55.6" height="72.8"/>
// <g>
//   <rect x="341.2" y="249.2" style="fill:#84DBFF;" width="30.4" height="30.4"/>
//   <rect x="380" y="249.2" style="fill:#84DBFF;" width="30.4" height="30.4"/>
//   <rect x="341.2" y="287.6" style="fill:#84DBFF;" width="30.4" height="30.4"/>
//   <rect x="380" y="287.6" style="fill:#84DBFF;" width="30.4" height="30.4"/>
//   <rect x="97.6" y="249.2" style="fill:#84DBFF;" width="30.4" height="30.4"/>
//   <rect x="136.4" y="249.2" style="fill:#84DBFF;" width="30.4" height="30.4"/>
//   <rect x="97.6" y="287.6" style="fill:#84DBFF;" width="30.4" height="30.4"/>
//   <rect x="136.4" y="287.6" style="fill:#84DBFF;" width="30.4" height="30.4"/>
// </g>
// <circle style="fill:#324A5E;" cx="254" cy="178.4" r="22.8"/>
// <circle style="fill:#E6E9EE;" cx="254" cy="178.4" r="17.6"/>
// <g>
//   <rect x="253.6" y="162.8" style="fill:#ACB3BA;" width="1.2" height="2"/>
//   <rect x="253.6" y="192.4" style="fill:#ACB3BA;" width="1.2" height="2"/>
//   <rect x="267.6" y="178" style="fill:#ACB3BA;" width="2" height="1.2"/>
//   <rect x="238.4" y="178" style="fill:#ACB3BA;" width="2" height="1.2"/>

//     <rect x="263.904" y="167.301" transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 332.5304 474.3411)" style="fill:#ACB3BA;" width="1.2" height="2"/>

//     <rect x="243.124" y="188.134" transform="matrix(-0.7073 -0.7069 0.7069 -0.7073 282.412 495.2007)" style="fill:#ACB3BA;" width="1.2" height="2"/>

//     <rect x="263.696" y="188.069" transform="matrix(0.7073 -0.7069 0.7069 0.7073 -56.2967 242.1719)" style="fill:#ACB3BA;" width="1.2" height="2"/>

//     <rect x="242.791" y="167.254" transform="matrix(0.7073 -0.7069 0.7069 0.7073 -47.7006 221.3016)" style="fill:#ACB3BA;" width="1.2" height="2"/>
// </g>
// </svg>`;

//   return (
//     <MapContainer
//       center={center}
//       zoom={13}
//       style={{ height: "500px", width: "100%" }}
//       scrollWheelZoom={true}
//       doubleClickZoom={true}
//       dragging={true}
//       zoomControl={true}
//       touchZoom={true}
//     >
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//       />

//       {/* Hiển thị các điểm đón/trả học sinh CHƯA hoàn thành */}
//       {selectedBus && selectedBus.route.students
//         .filter((student) => !isStudentPickedUp(selectedBus, student.id))
//         .map((student, index) => (
//           <Marker
//             key={`student-${student.id}`}
//             position={[student.position.lat, student.position.lng]}
//             eventHandlers={{
//               click: () => onStudentPickup?.(student.id, selectedBus.id),
//             }}
//             icon={L.icon({
//               iconUrl:
//                 "data:image/svg+xml;base64," +
//                 btoa(`
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <circle cx="12" cy="12" r="10" fill="${selectedBus.isDonXe ? '#4CAF50' : '#2196F3'}" stroke="white" stroke-width="2"/>
//                   <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${
//                     index + 1
//                   }</text>
//                 </svg>
//               `),
//               iconSize: [24, 24],
//               iconAnchor: [12, 12],
//             })}
//           >
//             <Popup>
//               <div style={{ minWidth: "200px" }}>
//                 <h6 style={{ margin: "0 0 8px 0", color: selectedBus.isDonXe ? "#4CAF50" : "#2196F3" }}>
//                   {selectedBus.isDonXe ? "🎒 Điểm đón: " : "🏠 Điểm trả: "}{student.name}
//                 </h6>
//                 <p style={{ margin: "4px 0", fontSize: "14px" }}>
//                   <strong>Lớp:</strong> {student.grade}
//                 </p>
//                 <p style={{ margin: "4px 0", fontSize: "14px" }}>
//                   <strong>Địa chỉ:</strong> {student.address}
//                 </p>
//                 <p style={{ margin: "4px 0", fontSize: "14px" }}>
//                   <strong>Giờ {selectedBus.isDonXe ? 'đón' : 'trả'}:</strong> {student.pickupTime}
//                 </p>
//                 <p style={{ margin: "4px 0", fontSize: "12px", color: "#666" }}>
//                   <strong>Chiều:</strong> {selectedBus.isDonXe ? 'ĐÓN đi học' : 'TRẢ về nhà'}
//                 </p>
//               </div>
//             </Popup>
//           </Marker>
//         ))}

//       {/* Hiển thị các điểm đón/trả ĐÃ hoàn thành */}
//       {selectedBus && selectedBus.route.students
//         .filter((student) => isStudentPickedUp(selectedBus, student.id))
//         .map((student, index) => (
//           <Marker
//             key={`student-pickedup-${student.id}`}
//             position={[student.position.lat, student.position.lng]}
//             icon={L.icon({
//               iconUrl:
//                 "data:image/svg+xml;base64," +
//                 btoa(`
//                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <circle cx="10" cy="10" r="8" fill="#9E9E9E" stroke="white" stroke-width="1"/>
//                   <path d="M6 10L9 13L14 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
//                 </svg>
//               `),
//               iconSize: [20, 20],
//               iconAnchor: [10, 10],
//             })}
//           >
//             <Popup>
//               <div style={{ minWidth: "180px" }}>
//                 <h6 style={{ margin: "0 0 8px 0", color: "#666" }}>
//                   ✅ Đã {selectedBus.isDonXe ? 'đón' : 'trả'}: {student.name}
//                 </h6>
//                 <p style={{ margin: "4px 0", fontSize: "14px" }}>
//                   <strong>Lớp:</strong> {student.grade}
//                 </p>
//               </div>
//             </Popup>
//           </Marker>
//         ))}

//       {/* Hiển thị trường học */}
//       {selectedBus && (
//         <Marker
//           position={[
//             selectedBus.route.school.position.lat,
//             selectedBus.route.school.position.lng,
//           ]}
//           icon={L.icon({
//             iconUrl: svgToDataUrl(schoolIconSvg),
//             iconSize: [30, 30],
//             iconAnchor: [15, 15],
//           })}
//         >
//           <Popup>
//             <div style={{ minWidth: "200px" }}>
//               <h6 style={{ margin: "0 0 8px 0", color: "#2196F3" }}>
//                 🏫 {selectedBus.route.school.name}
//                 <br />
//                 <small style={{ color: "#666" }}>
//                   ({selectedBus.isDonXe ? 'Điểm đến' : 'Điểm xuất phát'})
//                 </small>
//               </h6>
//               <p style={{ margin: "4px 0", fontSize: "14px" }}>
//                 <strong>Giờ vào lớp:</strong> {selectedBus.route.school.startTime}
//               </p>
//             </div>
//           </Popup>
//         </Marker>
//       )}

//       {/* Hiển thị các xe bus với icon động */}
//       {buses.map((bus) => (
//         <Marker
//           key={bus.id}
//           position={[bus.position.lat, bus.position.lng]}
//           eventHandlers={{
//             click: () => onBusSelect?.(bus),
//           }}
//           icon={createBusIcon(bus)}
//         >
//           <Popup>
//             <div style={{ minWidth: "250px" }}>
//               <h6 style={{ margin: "0 0 8px 0", color: getBusIconColor(bus) }}>
//                 {bus.name}
//               </h6>
//               <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
//                 <p style={{ margin: "4px 0" }}>
//                   <strong>Biển số:</strong> {bus.licensePlate}
//                 </p>
//                 <p style={{ margin: "4px 0" }}>
//                   <strong>Tài xế:</strong> {bus.route.driver}
//                 </p>
//                 <p style={{ margin: "4px 0" }}>
//                   <strong>Chiều:</strong> 
//                   <span style={{ 
//                     color: bus.isDonXe ? '#FF9800' : '#9C27B0',
//                     fontWeight: "bold",
//                     marginLeft: "4px",
//                   }}>
//                     {bus.isDonXe ? '🚌 ĐÓN đi học' : '🏠 TRẢ về nhà'}
//                   </span>
//                 </p>
//                 <p style={{ margin: "4px 0" }}>
//                   <strong>Tốc độ:</strong> {bus.speed || 0} km/h
//                 </p>
//                 <p style={{ margin: "4px 0" }}>
//                   <strong>Trạng thái:</strong>
//                   <span
//                     style={{
//                       color: getBusIconColor(bus),
//                       fontWeight: "bold",
//                       marginLeft: "4px",
//                     }}
//                   >
//                     {bus.route.currentStatus === "completed" && "✅ Hoàn thành"}
//                     {bus.route.currentStatus === "going_to_school" && bus.isDonXe && "🏫 Đang đến trường"}
//                     {bus.route.currentStatus === "going_to_school" && !bus.isDonXe && "🚌 Đang rời trường"}
//                     {bus.route.currentStatus === "picking_up" && bus.isDonXe && "🎒 Đang đón học sinh"}
//                     {bus.route.currentStatus === "picking_up" && !bus.isDonXe && "🏠 Đang trả học sinh"}
//                     {bus.route.currentStatus === "waiting" && "⏳ Chờ bắt đầu"}
//                   </span>
//                 </p>
//                 <p style={{ margin: "4px 0" }}>
//                   <strong>Đã {bus.isDonXe ? 'đón' : 'trả'}:</strong> {bus.pickedUpStudents?.length || 0}/
//                   {bus.route.students.length} học sinh
//                 </p>
//                 {bus.nextStop && (
//                   <div
//                     style={{
//                       marginTop: "8px",
//                       padding: "8px",
//                       backgroundColor: "#FFF3CD",
//                       borderRadius: "4px",
//                       border: "1px solid #FFEaa7",
//                     }}
//                   >
//                     <strong style={{ color: "#856404", fontSize: "12px" }}>
//                       🎯 Điểm tiếp theo: {bus.nextStop.student.name}
//                     </strong>
//                     <br />
//                     <span style={{ color: "#856404", fontSize: "11px" }}>
//                       Dự kiến: {bus.nextStop.estimatedArrival}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </Popup>
//         </Marker>
//       ))}

//       {/* Vẽ lộ trình chính */}
//       {selectedBus && (
//         <Polyline
//           positions={getRoutePositions(selectedBus)}
//           color={selectedBus.isDonXe ? "blue" : "purple"}
//           weight={4}
//           opacity={0.7}
//         />
//       )}

//       {/* Vẽ đường từ xe đến điểm tiếp theo */}
//       {selectedBus && selectedBus.route.currentStudentIndex < selectedBus.route.students.length && (
//         <Polyline
//           positions={getNextStopLinePositions(selectedBus)}
//           color="red"
//           weight={3}
//           opacity={0.9}
//           dashArray="5, 10"
//         />
//       )}
//     </MapContainer>
//   );
// };

// export default BusMap;
"use client";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { 
  ExtendedBus, 
  ExtendedBusRoute, 
  ExtendedStation, 
  StudentData, 
  StudentAllocation,
  School 
} from "../../types/bus";
import "leaflet/dist/leaflet.css";

// Fix cho marker icons trong Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface BusMapProps {
  buses: ExtendedBus[];
  selectedBus: ExtendedBus | null;
  onBusSelect: (bus: ExtendedBus | null) => void;
  onStationPickup: (stationId: string, busId?: string) => void;
  isRealTime: boolean;
  additionalData?: {
    currentPositions?: any[];
    trackingData?: any;
    mapData?: any;
  };
}

// Custom icons
const createBusIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'bus-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const createStationIcon = (color: string, isCurrent: boolean = false) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        position: relative;
      ">
        ${isCurrent ? `<div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 6px;
          height: 6px;
          background-color: white;
          border-radius: 50%;
        "></div>` : ''}
      </div>
    `,
    className: 'station-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const createSchoolIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #9C27B0;
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">T</div>
    `,
    className: 'school-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Component để điều khiển map view
const MapController: React.FC<{ selectedBus: ExtendedBus | null; buses: ExtendedBus[] }> = ({ 
  selectedBus, 
  buses 
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedBus) {
      map.setView([selectedBus.position.lat, selectedBus.position.lng], 15);
    } else if (buses.length > 0) {
      const group = new L.FeatureGroup();
      buses.forEach(bus => {
        group.addLayer(L.marker([bus.position.lat, bus.position.lng]));
        bus.route.stations.forEach(station => {
          group.addLayer(L.marker([station.position.lat, station.position.lng]));
        });
        group.addLayer(L.marker([bus.route.school.position.lat, bus.route.school.position.lng]));
      });
      
      if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }
  }, [selectedBus, buses, map]);

  return null;
};

const BusMap: React.FC<BusMapProps> = ({ 
  buses, 
  selectedBus, 
  onBusSelect, 
  onStationPickup, 
  isRealTime,
  additionalData 
}) => {
  const [selectedStation, setSelectedStation] = useState<ExtendedStation | null>(null);
  const [currentPositions, setCurrentPositions] = useState<any[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  // Sử dụng additionalData để bổ sung thông tin
  useEffect(() => {
    if (additionalData?.currentPositions) {
      console.log('📍 Current positions from tracking:', additionalData.currentPositions);
      setCurrentPositions(additionalData.currentPositions);
    }
  }, [additionalData]);

  const getBusColor = (bus: ExtendedBus) => {
    if (selectedBus?.id === bus.id) return "#FF0000";
    
    switch (bus.route.currentStatus) {
      case "waiting": return "#9E9E9E";
      case "picking_up": return "#FF9800";
      case "going_to_school": return "#2196F3";
      case "completed": return "#4CAF50";
      default: return "#9E9E9E";
    }
  };

  const getStationColor = (station: ExtendedStation, bus: ExtendedBus) => {
    const isPickedUp = bus.pickedUpStations?.includes(station.id) || false;
    const isCurrent = bus.currentStationIndex === bus.route.stations.findIndex(s => s.id === station.id);
    
    if (isPickedUp) {
      return "#EA4335"; // Màu đỏ - đã đón
    } else if (isCurrent && bus.route.currentStatus === "picking_up") {
      return "#FBBC05"; // Màu vàng - đang đến
    }
    
    return "#34A853"; // Màu xanh - station bình thường
  };

  const getRoutePath = (bus: ExtendedBus): [number, number][] => {
    if (!bus.route.stations.length) return [];

    const points: [number, number][] = [];
    
    if (bus.isDonXe) {
      // CHIỀU ĐÓN: Điểm xuất phát → Các điểm đón → Trường
      points.push([10.782622, 106.640172]); // Điểm xuất phát
      bus.route.stations.forEach(station => {
        points.push([station.position.lat, station.position.lng]);
      });
      points.push([bus.route.school.position.lat, bus.route.school.position.lng]);
    } else {
      // CHIỀU TRẢ: Trường → Các điểm trả → Điểm kết thúc
      points.push([bus.route.school.position.lat, bus.route.school.position.lng]);
      bus.route.stations.forEach(station => {
        points.push([station.position.lat, station.position.lng]);
      });
      points.push([10.782622, 106.640172]); // Điểm kết thúc
    }

    return points;
  };

  const getRouteColor = (bus: ExtendedBus) => {
    return getBusColor(bus);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting": return "Chờ đón";
      case "picking_up": return "Đang đón";
      case "going_to_school": return "Đến trường";
      case "completed": return "Hoàn thành";
      default: return status;
    }
  };

  const handleStationPickupClick = (stationId: string, busId: string) => {
    onStationPickup(stationId, busId);
    setSelectedStation(null);
  };

  return (
    <MapContainer
      center={[10.762622, 106.682243]}
      zoom={12}
      style={{ height: "600px", width: "100%" }}
      ref={mapRef}
      // FIX: Thêm các options để enable di chuyển và thu phóng
      scrollWheelZoom={true}
      dragging={true}
      doubleClickZoom={true}
      zoomControl={true}
      touchZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController selectedBus={selectedBus} buses={buses} />

      {/* Vẽ lộ trình và markers */}
      {buses.map((bus) => (
        <React.Fragment key={`bus-${bus.id}`}>
          {/* Đường đi của xe */}
          <Polyline
            positions={getRoutePath(bus)}
            pathOptions={{
              color: getRouteColor(bus),
              weight: selectedBus?.id === bus.id ? 4 : 2,
              opacity: selectedBus?.id === bus.id ? 0.8 : 0.4,
            }}
          />

          {/* Các điểm dừng */}
          {bus.route.stations.map((station) => {
            const isCurrent = bus.currentStationIndex === bus.route.stations.findIndex(s => s.id === station.id);
            return (
              <Marker
                key={`${bus.id}-station-${station.id}`}
                position={[station.position.lat, station.position.lng]}
                icon={createStationIcon(getStationColor(station, bus), isCurrent)}
                eventHandlers={{
                  click: () => setSelectedStation(station),
                }}
              >
                <Popup>
                  <div style={{ minWidth: "200px" }}>
                    <h4 style={{ margin: "0 0 8px 0" }}>{station.name}</h4>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Loại:</strong> {station.type === 'pickup' ? 'Điểm đón' : 'Điểm trả'}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Số học sinh:</strong> {station.studentCount || 0}
                    </p>
                    {station.thoiGianDuKien && (
                      <p style={{ margin: "4px 0" }}>
                        <strong>Giờ dự kiến:</strong> {station.thoiGianDuKien.substring(0, 5)}
                      </p>
                    )}
                    {!bus.pickedUpStations?.includes(station.id) && (
                      <button
                        style={{
                          marginTop: "8px",
                          padding: "6px 12px",
                          backgroundColor: "#4285F4",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                        onClick={() => handleStationPickupClick(station.id, bus.id)}
                      >
                        🎒 Đánh dấu đã đón
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Trường học */}
          <Marker
            key={`${bus.id}-school`}
            position={[bus.route.school.position.lat, bus.route.school.position.lng]}
            icon={createSchoolIcon()}
          >
            <Popup>
              <div style={{ minWidth: "150px" }}>
                <h4 style={{ margin: "0 0 8px 0" }}>{bus.route.school.name}</h4>
                <p style={{ margin: "4px 0" }}>
                  <strong>Giờ vào lớp:</strong> {bus.route.school.startTime}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Xe bus */}
          <Marker
            key={`bus-${bus.id}`}
            position={[bus.position.lat, bus.position.lng]}
            icon={createBusIcon(getBusColor(bus))}
            eventHandlers={{
              click: () => onBusSelect(bus),
            }}
          >
            <Popup>
              <div style={{ minWidth: "250px" }}>
                <h4 style={{ margin: "0 0 8px 0" }}>{bus.name}</h4>
                <p style={{ margin: "4px 0" }}>
                  <strong>Biển số:</strong> {bus.licensePlate}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Tài xế:</strong> {bus.route.driver}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Trạng thái:</strong> {getStatusText(bus.route.currentStatus)}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Tốc độ:</strong> {Math.round(bus.speed || 0)} km/h
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Cập nhật:</strong> {bus.lastUpdate}
                </p>
                {bus.nextStop && (
                  <p style={{ margin: "4px 0" }}>
                    <strong>Điểm tiếp theo:</strong> {bus.nextStop.station.name}
                  </p>
                )}
                <button
                  style={{
                    marginTop: "8px",
                    padding: "6px 12px",
                    backgroundColor: "#34A853",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                  onClick={() => onBusSelect(bus)}
                >
                  👁️ Theo dõi xe này
                </button>
              </div>
            </Popup>
          </Marker>
        </React.Fragment>
      ))}

      {/* Hiển thị vị trí real-time từ tracking API */}
      {currentPositions.map((position, index) => {
        const bus = buses.find(b => b.id === position.maChuyenXe?.toString());
        if (!bus) return null;

        return (
          <Marker
            key={`realtime-${position.maChuyenXe}-${index}`}
            position={[parseFloat(position.viDo), parseFloat(position.kinhDo)]}
            icon={L.divIcon({
              html: `
                <div style="
                  background-color: #FF6B6B;
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>
              `,
              className: 'realtime-marker',
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            })}
          >
            <Popup>
              <div style={{ minWidth: "200px" }}>
                <h4 style={{ margin: "0 0 8px 0" }}>Vị trí thực - {bus.name}</h4>
                <p style={{ margin: "4px 0" }}>
                  <strong>Thời gian:</strong> {new Date(position.thoiGianGhiNhan).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default BusMap;

// Export các hàm API (giữ nguyên từ phiên bản trước)
export const getMapData = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/map/map-data');
    if (!response.ok) throw new Error('Map API failed');
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching map data:', error);
    return null;
  }
};

export const getTrackingData = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/tracking/bus-data');
    if (!response.ok) throw new Error('Tracking API failed');
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    return null;
  }
};

export const getCurrentBusPositions = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/tracking/current-positions');
    if (!response.ok) throw new Error('Current positions API failed');
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching current positions:', error);
    return [];
  }
};

export const getAllBusData = async () => {
  try {
    const [mapData, trackingData, currentPositions] = await Promise.all([
      getMapData(),
      getTrackingData(),
      getCurrentBusPositions()
    ]);

    return {
      map: mapData,
      tracking: trackingData,
      currentPositions: currentPositions
    };
  } catch (error) {
    console.error('Error fetching all bus data:', error);
    return null;
  }
};

export const getStudentAllocations = async (maHocSinh: string) => {
  try {
    const response = await fetch(`http://localhost:5000/api/map/phanbohocsinhtram?maHocSinh=${maHocSinh}`);
    if (!response.ok) throw new Error('Student allocations API failed');
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching student allocations:', error);
    return [];
  }
};

export const getBusStops = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/map/diemdung');
    if (!response.ok) throw new Error('Bus stops API failed');
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching bus stops:', error);
    return [];
  }
};

export const getRouteDetails = async (maTuyenDuong?: string) => {
  try {
    const url = maTuyenDuong 
      ? `http://localhost:5000/api/map/chitiettuyenduong?maTuyenDuong=${maTuyenDuong}`
      : 'http://localhost:5000/api/map/chitiettuyenduong';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Route details API failed');
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching route details:', error);
    return [];
  }
};

export const getStudentsByStop = async (maDiemDung: string, loaiPhanBo: string) => {
  try {
    const response = await fetch(`http://localhost:5000/api/map/hocsinh-theo-diemdung/${maDiemDung}/${loaiPhanBo}`);
    if (!response.ok) throw new Error('Students by stop API failed');
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching students by stop:', error);
    return [];
  }
};

export const getTripsByRoute = async (maTuyenDuong: string) => {
  try {
    const response = await fetch(`http://localhost:5000/api/map/chuyenxe-theo-tuyen/${maTuyenDuong}`);
    if (!response.ok) throw new Error('Trips by route API failed');
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching trips by route:', error);
    return [];
  }
};

export const getBusStopAllocations = async (maDiemDung?: string, maChuyenXe?: string) => {
  try {
    let url = 'http://localhost:5000/api/map/phanbotramxe';
    const params = new URLSearchParams();
    if (maDiemDung) params.append('maDiemDung', maDiemDung);
    if (maChuyenXe) params.append('maChuyenXe', maChuyenXe);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Bus stop allocations API failed');
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching bus stop allocations:', error);
    return [];
  }
};