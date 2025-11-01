"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Bus } from "../types/bus";
import L from "leaflet";

// Fix marker icons trong React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  buses?: Bus[];
  selectedBus?: Bus | null;
  onBusSelect?: (bus: Bus | null) => void;
  onStudentPickup?: (studentId: string) => void;
}

const svgToDataUrl = (svg: string) => {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const BusMap: React.FC<MapProps> = ({
  buses = [],
  selectedBus = null,
  onBusSelect,
  onStudentPickup,
}) => {
  const center: [number, number] = [10.762622, 106.660172];

  // Hàm kiểm tra xem học sinh đã được đón chưa
  const isStudentPickedUp = (studentId: string): boolean => {
    if (!selectedBus) return false;
    return selectedBus.pickedUpStudents?.includes(studentId) || false;
  };

  // Hàm xử lý khi click vào marker học sinh
  const handleStudentMarkerClick = (studentId: string) => {
    if (onStudentPickup && !isStudentPickedUp(studentId)) {
      onStudentPickup(studentId);
    }
  };

  // Hàm lấy màu sắc cho bus dựa trên trạng thái
  const getBusIconColor = (bus: Bus) => {
    if (bus.route.currentStatus === "completed") return "#4CAF50"; // Xanh - hoàn thành
    if (bus.route.currentStatus === "going_to_school") return "#2196F3"; // Xanh dương - đang đến trường
    if (bus.route.currentStatus === "picking_up") return "#FF9800"; // Cam - đang đón học sinh
    return "#DC2626"; // Đỏ - mặc định
  };

  // Tạo icon bus động với màu sắc theo trạng thái - ĐÃ SỬA
  const createBusIcon = (bus: Bus) => {
    const color = getBusIconColor(bus);
    return L.divIcon({
      html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        🚌
      </div>
    `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: "custom-bus-icon", // Thêm class để có thể style thêm nếu cần
    });
  };

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      {/* TileLayer từ OpenStreetMap */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Hiển thị các điểm đón học sinh CHƯA được đón */}
      {selectedBus?.route.students
        .filter((student) => !isStudentPickedUp(student.id))
        .map((student, index) => (
          <Marker
            key={`student-${student.id}`}
            position={[student.position.lat, student.position.lng]}
            eventHandlers={{
              click: () => handleStudentMarkerClick(student.id),
            }}
            icon={L.icon({
              iconUrl:
                "data:image/svg+xml;base64," +
                btoa(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#4CAF50" stroke="white" stroke-width="2"/>
                  <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${
                    index + 1
                  }</text>
                </svg>
              `),
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          >
            <Popup>
              <div style={{ minWidth: "200px" }}>
                <h6 style={{ margin: "0 0 8px 0", color: "#4CAF50" }}>
                  🎒 Điểm đón: {student.name}
                </h6>
                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                  <strong>Lớp:</strong> {student.grade}
                </p>
                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                  <strong>Địa chỉ:</strong> {student.address}
                </p>
                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                  <strong>Giờ đón:</strong> {student.pickupTime}
                </p>
                <div
                  style={{
                    marginTop: "8px",
                    padding: "8px",
                    backgroundColor: "#E8F5E8",
                    borderRadius: "4px",
                    textAlign: "center",
                  }}
                >
                  <strong style={{ color: "#4CAF50", fontSize: "12px" }}>
                    Click để đánh dấu đã đón
                  </strong>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Hiển thị các điểm đón ĐÃ được đón */}
      {selectedBus?.route.students
        .filter((student) => isStudentPickedUp(student.id))
        .map((student, index) => (
          <Marker
            key={`student-pickedup-${student.id}`}
            position={[student.position.lat, student.position.lng]}
            icon={L.icon({
              iconUrl:
                "data:image/svg+xml;base64," +
                btoa(`
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="8" fill="#9E9E9E" stroke="white" stroke-width="1"/>
                  <path d="M6 10L9 13L14 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              `),
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div style={{ minWidth: "180px" }}>
                <h6 style={{ margin: "0 0 8px 0", color: "#666" }}>
                  ✅ Đã đón: {student.name}
                </h6>
                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                  <strong>Lớp:</strong> {student.grade}
                </p>
                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                  <strong>Địa chỉ:</strong> {student.address}
                </p>
                <p style={{ margin: "4px 0", fontSize: "14px" }}>
                  <strong>Giờ đón:</strong> {student.pickupTime}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Hiển thị trường học */}
      {selectedBus && (
        <Marker
          position={[
            selectedBus.route.school.position.lat,
            selectedBus.route.school.position.lng,
          ]}
          icon={L.icon({
            iconUrl:
              svgToDataUrl(`<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
	 viewBox="0 0 508 508" xml:space="preserve">
<circle style="fill:#90DFAA;" cx="254" cy="254" r="254"/>
<polygon style="fill:#F1543F;" points="445.6,221.6 62.4,221.6 81.2,150.4 426.8,150.4 "/>
<path style="fill:#2C9984;" d="M53.2,409.2C99.6,469.2,172.4,508,254,508s154.4-38.8,200.8-98.8H53.2z"/>
<rect x="81.2" y="221.6" style="fill:#E6E9EE;" width="345.6" height="187.6"/>
<path style="fill:#FFFFFF;" d="M330,180.8c-20.8-20.8-43.6-40-65.6-59.6c-1.6-1.2-2.4-2.8-3.2-4h-18.4c-1.2,3.2-3.2,5.6-6.8,7.2
	c-6.8,2.8-9.6,10.8-12.8,16.4c-3.6,6.4-8,12.4-13.6,17.2c-9.6,9.2-21.6,15.2-32,23.2v228h153.2v-228
	C330.8,181.2,330.4,180.8,330,180.8z"/>
<rect x="81.2" y="390.8" style="fill:#2B3B4E;" width="345.6" height="18.4"/>
<rect x="177.6" y="390.8" style="fill:#324A5E;" width="153.2" height="18.4"/>
<polygon style="fill:#FF7058;" points="177.6,200.8 254,124.4 330.4,200.8 355.2,200.8 254,99.6 152.8,200.8 "/>
<g>
	<rect x="195.2" y="216.8" style="fill:#84DBFF;" width="33.2" height="33.2"/>
	<rect x="237.6" y="216.8" style="fill:#84DBFF;" width="33.2" height="33.2"/>
	<rect x="279.6" y="216.8" style="fill:#84DBFF;" width="33.2" height="33.2"/>
</g>
<rect x="222.8" y="318" style="fill:#FFD05B;" width="55.6" height="72.8"/>
<g>
	<rect x="341.2" y="249.2" style="fill:#84DBFF;" width="30.4" height="30.4"/>
	<rect x="380" y="249.2" style="fill:#84DBFF;" width="30.4" height="30.4"/>
	<rect x="341.2" y="287.6" style="fill:#84DBFF;" width="30.4" height="30.4"/>
	<rect x="380" y="287.6" style="fill:#84DBFF;" width="30.4" height="30.4"/>
	<rect x="97.6" y="249.2" style="fill:#84DBFF;" width="30.4" height="30.4"/>
	<rect x="136.4" y="249.2" style="fill:#84DBFF;" width="30.4" height="30.4"/>
	<rect x="97.6" y="287.6" style="fill:#84DBFF;" width="30.4" height="30.4"/>
	<rect x="136.4" y="287.6" style="fill:#84DBFF;" width="30.4" height="30.4"/>
</g>
<circle style="fill:#324A5E;" cx="254" cy="178.4" r="22.8"/>
<circle style="fill:#E6E9EE;" cx="254" cy="178.4" r="17.6"/>
<g>
	<rect x="253.6" y="162.8" style="fill:#ACB3BA;" width="1.2" height="2"/>
	<rect x="253.6" y="192.4" style="fill:#ACB3BA;" width="1.2" height="2"/>
	<rect x="267.6" y="178" style="fill:#ACB3BA;" width="2" height="1.2"/>
	<rect x="238.4" y="178" style="fill:#ACB3BA;" width="2" height="1.2"/>

		<rect x="263.904" y="167.301" transform="matrix(-0.7071 -0.7071 0.7071 -0.7071 332.5304 474.3411)" style="fill:#ACB3BA;" width="1.2" height="2"/>

		<rect x="243.124" y="188.134" transform="matrix(-0.7073 -0.7069 0.7069 -0.7073 282.412 495.2007)" style="fill:#ACB3BA;" width="1.2" height="2"/>

		<rect x="263.696" y="188.069" transform="matrix(0.7073 -0.7069 0.7069 0.7073 -56.2967 242.1719)" style="fill:#ACB3BA;" width="1.2" height="2"/>

		<rect x="242.791" y="167.254" transform="matrix(0.7073 -0.7069 0.7069 0.7073 -47.7006 221.3016)" style="fill:#ACB3BA;" width="1.2" height="2"/>
</g>
</svg>`),
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })}
        >
          <Popup>
            <div style={{ minWidth: "200px" }}>
              <h6 style={{ margin: "0 0 8px 0", color: "#2196F3" }}>
                🏫 {selectedBus.route.school.name}
              </h6>
              <p style={{ margin: "4px 0", fontSize: "14px" }}>
                <strong>Giờ vào lớp:</strong>{" "}
                {selectedBus.route.school.startTime}
              </p>
              <p style={{ margin: "4px 0", fontSize: "14px" }}>
                <strong>Địa chỉ:</strong>{" "}
                {selectedBus.route.school.address ||
                  "273 An Dương Vương, Quận 5, TP.HCM"}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Hiển thị các xe bus với icon động */}
      {buses.map((bus) => (
        <Marker
          key={bus.id}
          position={[bus.position.lat, bus.position.lng]}
          eventHandlers={{
            click: () => onBusSelect?.(bus),
          }}
          icon={createBusIcon(bus)}
        >
          <Popup>
            <div style={{ minWidth: "250px" }}>
              <h6 style={{ margin: "0 0 8px 0", color: getBusIconColor(bus) }}>
                {bus.name}
              </h6>
              <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
                <p style={{ margin: "4px 0" }}>
                  <strong>Biển số:</strong> {bus.licensePlate}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Tài xế:</strong> {bus.route.driver}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Tốc độ:</strong> {bus.speed || 0} km/h
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Trạng thái:</strong>
                  <span
                    style={{
                      color: getBusIconColor(bus),
                      fontWeight: "bold",
                      marginLeft: "4px",
                    }}
                  >
                    {bus.route.currentStatus === "completed" && "✅ Hoàn thành"}
                    {bus.route.currentStatus === "going_to_school" &&
                      "🏫 Đang đến trường"}
                    {bus.route.currentStatus === "picking_up" &&
                      "🎒 Đang đón học sinh"}
                    {bus.route.currentStatus === "waiting" && "⏳ Chờ bắt đầu"}
                  </span>
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Đã đón:</strong> {bus.pickedUpStudents?.length || 0}/
                  {bus.route.students.length} học sinh
                </p>
                {bus.nextStop && (
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "8px",
                      backgroundColor: "#FFF3CD",
                      borderRadius: "4px",
                      border: "1px solid #FFEaa7",
                    }}
                  >
                    <strong style={{ color: "#856404", fontSize: "12px" }}>
                      🎯 Điểm tiếp theo: {bus.nextStop.student.name}
                    </strong>
                    <br />
                    <span style={{ color: "#856404", fontSize: "11px" }}>
                      Dự kiến: {bus.nextStop.estimatedArrival}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Vẽ lộ trình - chỉ hiển thị các điểm CHƯA đón và trường học */}
      {selectedBus && (
        <Polyline
          positions={[
            [
              selectedBus.position.lat,
              selectedBus.position.lng,
            ] as L.LatLngExpression,
            ...selectedBus.route.students
              .filter((student) => !isStudentPickedUp(student.id))
              .map(
                (s) => [s.position.lat, s.position.lng] as L.LatLngExpression
              ),
            [
              selectedBus.route.school.position.lat,
              selectedBus.route.school.position.lng,
            ] as L.LatLngExpression,
          ]}
          color="blue"
          weight={4}
          opacity={0.7}
        />
      )}

      {/* Vẽ đường từ xe đến điểm tiếp theo (nếu có) */}
      {selectedBus &&
        selectedBus.route.currentStudentIndex <
          selectedBus.route.students.length && (
          <Polyline
            positions={[
              [
                selectedBus.position.lat,
                selectedBus.position.lng,
              ] as L.LatLngExpression,
              [
                selectedBus.route.students[
                  selectedBus.route.currentStudentIndex
                ].position.lat,
                selectedBus.route.students[
                  selectedBus.route.currentStudentIndex
                ].position.lng,
              ] as L.LatLngExpression,
            ]}
            color="red"
            weight={3}
            opacity={0.9}
            dashArray="5, 10"
          />
        )}
    </MapContainer>
  );
};

export default BusMap;

// "use client";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   Polyline,
// } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import { Bus } from "../types/bus";
// import L from "leaflet";
// import { useState, useEffect, useRef } from "react";

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

// interface MapProps {
//   buses?: Bus[];
//   selectedBus?: Bus | null;
//   onBusSelect?: (bus: Bus | null) => void;
//   onStudentPickup?: (studentId: string) => void;
// }

// interface RouteSegment {
//   positions: [number, number][];
//   color: string;
//   weight: number;
//   opacity: number;
//   dashArray?: string;
// }

// // Hàm encode SVG an toàn cho btoa
// const encodeSvg = (svgString: string): string => {
//   const safeSvgString = svgString
//     .replace(/[\u{1F300}-\u{1F9FF}]/gu, (char) => {
//       const code = char.codePointAt(0)?.toString(16);
//       return code ? `&#x${code};` : char;
//     })
//     .replace(/#/g, "%23")
//     .replace(/\n/g, " ")
//     .replace(/\s+/g, " ");

//   try {
//     return btoa(unescape(encodeURIComponent(safeSvgString)));
//   } catch (error) {
//     console.error("Error encoding SVG:", error);
//     return "";
//   }
// };

// // SVG strings được định nghĩa trước
// const STUDENT_SVG = (index: number) => `
// <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//   <circle cx="12" cy="12" r="10" fill="#4CAF50" stroke="white" stroke-width="2"/>
//   <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${
//     index + 1
//   }</text>
// </svg>`;

// const PICKED_UP_SVG = `
// <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//   <circle cx="10" cy="10" r="8" fill="#9E9E9E" stroke="white" stroke-width="1"/>
//   <path d="M6 10L9 13L14 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
// </svg>`;

// const SCHOOL_SVG = `
// <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
//   <circle cx="15" cy="15" r="14" fill="#2196F3" stroke="white" stroke-width="2"/>
//   <text x="15" y="19" text-anchor="middle" fill="white" font-size="12" font-weight="bold">SCH</text>
// </svg>`;

// // Hàm tạo đường đi mượt mà hơn (smooth path) thay vì đường thẳng
// const createSmoothPath = (points: [number, number][]): [number, number][] => {
//   if (points.length < 2) return points;

//   const smoothPoints: [number, number][] = [];

//   for (let i = 0; i < points.length - 1; i++) {
//     const [startLat, startLng] = points[i];
//     const [endLat, endLng] = points[i + 1];

//     // Thêm điểm bắt đầu
//     smoothPoints.push([startLat, startLng]);

//     // Tạo các điểm trung gian để đường cong mượt hơn
//     const steps = 3;
//     for (let j = 1; j < steps; j++) {
//       const t = j / steps;
//       // Sử dụng curve easing để tạo đường cong tự nhiên
//       const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

//       const midLat = startLat + (endLat - startLat) * easedT;
//       const midLng = startLng + (endLng - startLng) * easedT;

//       // Thêm một chút ngẫu nhiên nhỏ để đường không quá thẳng
//       const randomOffset = 0.00001;
//       const finalLat = midLat + (Math.random() - 0.5) * randomOffset;
//       const finalLng = midLng + (Math.random() - 0.5) * randomOffset;

//       smoothPoints.push([finalLat, finalLng]);
//     }
//   }

//   // Thêm điểm cuối
//   smoothPoints.push(points[points.length - 1]);

//   return smoothPoints;
// };

// const BusMap: React.FC<MapProps> = ({
//   buses = [],
//   selectedBus = null,
//   onBusSelect,
//   onStudentPickup,
// }) => {
//   const center: [number, number] = [10.762622, 106.660172];
//   const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
//   const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
//   const [useRealRoutes, setUseRealRoutes] = useState(true);
//   const routesCache = useRef<Map<string, RouteSegment[]>>(new Map());

//   // Hàm kiểm tra xem học sinh đã được đón chưa
//   const isStudentPickedUp = (studentId: string): boolean => {
//     if (!selectedBus) return false;
//     return selectedBus.pickedUpStudents?.includes(studentId) || false;
//   };

//   // Hàm xử lý khi click vào marker học sinh
//   const handleStudentMarkerClick = (studentId: string) => {
//     if (onStudentPickup && !isStudentPickedUp(studentId)) {
//       onStudentPickup(studentId);
//     }
//   };

//   // Hàm lấy màu sắc cho bus dựa trên trạng thái
//   const getBusIconColor = (bus: Bus) => {
//     if (bus.route.currentStatus === "completed") return "#4CAF50";
//     if (bus.route.currentStatus === "going_to_school") return "#2196F3";
//     if (bus.route.currentStatus === "picking_up") return "#FF9800";
//     return "#DC2626";
//   };

//   // Hàm lấy đường đi từ OSRM API với timeout và retry
//   const getRouteFromOSRM = async (
//     waypoints: [number, number][]
//   ): Promise<[number, number][]> => {
//     if (waypoints.length < 2) return [];

//     try {
//       const coordinates = waypoints
//         .map((coord) => `${coord[1]},${coord[0]}`)
//         .join(";");
//       const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

//       // Thêm timeout để tránh treo
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

//       const response = await fetch(url, {
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data.code === "Ok" && data.routes.length > 0) {
//         const geometry = data.routes[0].geometry;
//         if (geometry.type === "LineString") {
//           return geometry.coordinates.map((coord: [number, number]) => [
//             coord[1],
//             coord[0],
//           ]);
//         }
//       }

//       throw new Error("No valid route found");
//     } catch (error) {
//       console.warn("OSRM API failed, using fallback routes:", error);
//       // Return empty array để dùng fallback
//       return [];
//     }
//   };

//   // Hàm tính toán tuyến đường - cải tiến với fallback mượt mà
//   const calculateRealRoutes = async (bus: Bus) => {
//     const cacheKey = `${bus.id}-${
//       bus.route.currentStudentIndex
//     }-${bus.pickedUpStudents?.join(",")}`;

//     if (routesCache.current.has(cacheKey)) {
//       setRouteSegments(routesCache.current.get(cacheKey) || []);
//       return;
//     }

//     setIsLoadingRoutes(true);

//     try {
//       let segments: RouteSegment[] = [];
//       const students = bus.route.students;
//       const currentIndex = bus.route.currentStudentIndex;

//       // Thử dùng OSRM API nếu được bật
//       if (useRealRoutes) {
//         try {
//           // 1. Đường từ xe đến điểm đón tiếp theo
//           if (currentIndex < students.length) {
//             const nextStudent = students[currentIndex];
//             const busToNextStop = await getRouteFromOSRM([
//               [bus.position.lat, bus.position.lng],
//               [nextStudent.position.lat, nextStudent.position.lng],
//             ]);

//             if (busToNextStop.length > 0) {
//               segments.push({
//                 positions: busToNextStop,
//                 color: "#DC2626",
//                 weight: 4,
//                 opacity: 0.9,
//                 dashArray: "5, 10",
//               });
//             }
//           }

//           // 2. Đường giữa các điểm đón
//           const waitingStudents = students
//             .filter(
//               (student, index) =>
//                 index >= currentIndex && !isStudentPickedUp(student.id)
//             )
//             .map(
//               (student) =>
//                 [student.position.lat, student.position.lng] as [number, number]
//             );

//           if (waitingStudents.length >= 2) {
//             const betweenStopsRoute = await getRouteFromOSRM(waitingStudents);
//             if (betweenStopsRoute.length > 0) {
//               segments.push({
//                 positions: betweenStopsRoute,
//                 color: "#2196F3",
//                 weight: 4,
//                 opacity: 0.7,
//               });
//             }
//           }

//           // 3. Đường đến trường
//           if (
//             currentIndex >= students.length ||
//             bus.route.currentStatus === "going_to_school"
//           ) {
//             const lastStudent = students[students.length - 1];
//             const lastStopToSchool = await getRouteFromOSRM([
//               [lastStudent.position.lat, lastStudent.position.lng],
//               [bus.route.school.position.lat, bus.route.school.position.lng],
//             ]);

//             if (lastStopToSchool.length > 0) {
//               segments.push({
//                 positions: lastStopToSchool,
//                 color: "#10B981",
//                 weight: 4,
//                 opacity: 0.7,
//               });
//             }
//           }
//         } catch (error) {
//           console.warn("Real routing failed, switching to smooth paths");
//           setUseRealRoutes(false);
//         }
//       }

//       // Nếu không có segments từ OSRM hoặc OSRM failed, dùng smooth paths
//       if (segments.length === 0) {
//         segments = getSmoothRoutes(bus);
//       }

//       routesCache.current.set(cacheKey, segments);
//       setRouteSegments(segments);
//     } catch (error) {
//       console.error("Error calculating routes:", error);
//       setRouteSegments(getSmoothRoutes(bus));
//     } finally {
//       setIsLoadingRoutes(false);
//     }
//   };

//   // Fallback routes với đường cong mượt mà
//   const getSmoothRoutes = (bus: Bus): RouteSegment[] => {
//     const segments: RouteSegment[] = [];
//     const students = bus.route.students;
//     const currentIndex = bus.route.currentStudentIndex;

//     // Đường từ xe đến điểm tiếp theo (màu đỏ, nét đứt)
//     if (currentIndex < students.length) {
//       const nextStudent = students[currentIndex];
//       const busToNextStop = createSmoothPath([
//         [bus.position.lat, bus.position.lng],
//         [nextStudent.position.lat, nextStudent.position.lng],
//       ]);

//       segments.push({
//         positions: busToNextStop,
//         color: "#DC2626",
//         weight: 4,
//         opacity: 0.9,
//         dashArray: "5, 10",
//       });
//     }

//     // Đường giữa các điểm đón (màu xanh dương)
//     const waitingStudents = students
//       .filter((_, index) => index >= currentIndex)
//       .map(
//         (student) =>
//           [student.position.lat, student.position.lng] as [number, number]
//       );

//     if (waitingStudents.length > 0) {
//       const allStopsPath = createSmoothPath([
//         ...waitingStudents,
//         [bus.route.school.position.lat, bus.route.school.position.lng],
//       ]);

//       segments.push({
//         positions: allStopsPath,
//         color: "#2196F3",
//         weight: 4,
//         opacity: 0.7,
//       });
//     }

//     // Đường đến trường nếu đang trên đường (màu xanh lá)
//     if (
//       bus.route.currentStatus === "going_to_school" &&
//       currentIndex >= students.length
//     ) {
//       const busToSchool = createSmoothPath([
//         [bus.position.lat, bus.position.lng],
//         [bus.route.school.position.lat, bus.route.school.position.lng],
//       ]);

//       segments.push({
//         positions: busToSchool,
//         color: "#10B981",
//         weight: 4,
//         opacity: 0.9,
//         dashArray: "5, 10",
//       });
//     }

//     return segments;
//   };

//   // Tính toán lại routes khi selectedBus thay đổi
//   useEffect(() => {
//     if (selectedBus) {
//       calculateRealRoutes(selectedBus);
//     } else {
//       setRouteSegments([]);
//     }
//   }, [selectedBus]);

//   // Tạo icon bus động
//   const createBusIcon = (bus: Bus) => {
//     const color = getBusIconColor(bus);
//     return L.divIcon({
//       html: `
//       <div style="
//         background-color: ${color};
//         width: 30px;
//         height: 30px;
//         border-radius: 50%;
//         border: 3px solid white;
//         box-shadow: 0 2px 4px rgba(0,0,0,0.3);
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         color: white;
//         font-weight: bold;
//         font-size: 12px;
//       ">
//         🚌
//       </div>
//     `,
//       iconSize: [30, 30],
//       iconAnchor: [15, 15],
//       className: "custom-bus-icon",
//     });
//   };

//   // Tạo icon cho học sinh
//   const createStudentIcon = (index: number, isPickedUp: boolean) => {
//     if (isPickedUp) {
//       return L.icon({
//         iconUrl: `data:image/svg+xml;base64,${encodeSvg(PICKED_UP_SVG)}`,
//         iconSize: [20, 20],
//         iconAnchor: [10, 10],
//       });
//     }

//     return L.icon({
//       iconUrl: `data:image/svg+xml;base64,${encodeSvg(STUDENT_SVG(index))}`,
//       iconSize: [24, 24],
//       iconAnchor: [12, 12],
//     });
//   };

//   // Tạo icon cho trường học
//   const createSchoolIcon = () => {
//     return L.icon({
//       iconUrl: `data:image/svg+xml;base64,${encodeSvg(SCHOOL_SVG)}`,
//       iconSize: [30, 30],
//       iconAnchor: [15, 15],
//     });
//   };

//   return (
//     <div className="relative">
//       {isLoadingRoutes && (
//         <div className="absolute top-2 left-2 z-[1000] bg-blue-500 text-white px-3 py-1 rounded-md text-sm">
//           🗺️ Đang tải tuyến đường...
//         </div>
//       )}

//       {!useRealRoutes && (
//         <div className="absolute top-2 right-2 z-[1000] bg-yellow-500 text-white px-3 py-1 rounded-md text-sm">
//           ⚠️ Đang dùng đường mượt mà (OSRM không khả dụng)
//         </div>
//       )}

//       <MapContainer
//         center={center}
//         zoom={13}
//         style={{ height: "500px", width: "100%" }}
//         className="rounded-lg"
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         />

//         {/* Hiển thị các tuyến đường */}
//         {routeSegments.map((segment, index) => (
//           <Polyline
//             key={`route-${index}`}
//             positions={segment.positions}
//             color={segment.color}
//             weight={segment.weight}
//             opacity={segment.opacity}
//             dashArray={segment.dashArray}
//           />
//         ))}

//         {/* Hiển thị các điểm đón học sinh CHƯA được đón */}
//         {selectedBus?.route.students
//           .filter((student) => !isStudentPickedUp(student.id))
//           .map((student, index) => (
//             <Marker
//               key={`student-${student.id}`}
//               position={[student.position.lat, student.position.lng]}
//               eventHandlers={{
//                 click: () => handleStudentMarkerClick(student.id),
//               }}
//               icon={createStudentIcon(index, false)}
//             >
//               <Popup>
//                 <div style={{ minWidth: "200px" }}>
//                   <h6 style={{ margin: "0 0 8px 0", color: "#4CAF50" }}>
//                     🎒 Điểm đón: {student.name}
//                   </h6>
//                   <p style={{ margin: "4px 0", fontSize: "14px" }}>
//                     <strong>Lớp:</strong> {student.grade}
//                   </p>
//                   <p style={{ margin: "4px 0", fontSize: "14px" }}>
//                     <strong>Địa chỉ:</strong> {student.address}
//                   </p>
//                   <p style={{ margin: "4px 0", fontSize: "14px" }}>
//                     <strong>Giờ đón:</strong> {student.pickupTime}
//                   </p>
//                   <div
//                     style={{
//                       marginTop: "8px",
//                       padding: "8px",
//                       backgroundColor: "#E8F5E8",
//                       borderRadius: "4px",
//                       textAlign: "center",
//                     }}
//                   >
//                     <strong style={{ color: "#4CAF50", fontSize: "12px" }}>
//                       Click để đánh dấu đã đón
//                     </strong>
//                   </div>
//                 </div>
//               </Popup>
//             </Marker>
//           ))}

//         {/* Hiển thị các điểm đón ĐÃ được đón */}
//         {selectedBus?.route.students
//           .filter((student) => isStudentPickedUp(student.id))
//           .map((student, index) => (
//             <Marker
//               key={`student-pickedup-${student.id}`}
//               position={[student.position.lat, student.position.lng]}
//               icon={createStudentIcon(index, true)}
//             >
//               <Popup>
//                 <div style={{ minWidth: "180px" }}>
//                   <h6 style={{ margin: "0 0 8px 0", color: "#666" }}>
//                     ✅ Đã đón: {student.name}
//                   </h6>
//                   <p style={{ margin: "4px 0", fontSize: "14px" }}>
//                     <strong>Lớp:</strong> {student.grade}
//                   </p>
//                   <p style={{ margin: "4px 0", fontSize: "14px" }}>
//                     <strong>Địa chỉ:</strong> {student.address}
//                   </p>
//                   <p style={{ margin: "4px 0", fontSize: "14px" }}>
//                     <strong>Giờ đón:</strong> {student.pickupTime}
//                   </p>
//                 </div>
//               </Popup>
//             </Marker>
//           ))}

//         {/* Hiển thị trường học */}
//         {selectedBus && (
//           <Marker
//             position={[
//               selectedBus.route.school.position.lat,
//               selectedBus.route.school.position.lng,
//             ]}
//             icon={createSchoolIcon()}
//           >
//             <Popup>
//               <div style={{ minWidth: "200px" }}>
//                 <h6 style={{ margin: "0 0 8px 0", color: "#2196F3" }}>
//                   🏫 {selectedBus.route.school.name}
//                 </h6>
//                 <p style={{ margin: "4px 0", fontSize: "14px" }}>
//                   <strong>Giờ vào lớp:</strong>{" "}
//                   {selectedBus.route.school.startTime}
//                 </p>
//                 <p style={{ margin: "4px 0", fontSize: "14px" }}>
//                   <strong>Địa chỉ:</strong>{" "}
//                   {selectedBus.route.school.address ||
//                     "273 An Dương Vương, Quận 5, TP.HCM"}
//                 </p>
//               </div>
//             </Popup>
//           </Marker>
//         )}

//         {/* Hiển thị các xe bus */}
//         {buses.map((bus) => (
//           <Marker
//             key={bus.id}
//             position={[bus.position.lat, bus.position.lng]}
//             eventHandlers={{
//               click: () => onBusSelect?.(bus),
//             }}
//             icon={createBusIcon(bus)}
//           >
//             <Popup>
//               <div style={{ minWidth: "250px" }}>
//                 <h6
//                   style={{ margin: "0 0 8px 0", color: getBusIconColor(bus) }}
//                 >
//                   {bus.name}
//                 </h6>
//                 <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
//                   <p style={{ margin: "4px 0" }}>
//                     <strong>Biển số:</strong> {bus.licensePlate}
//                   </p>
//                   <p style={{ margin: "4px 0" }}>
//                     <strong>Tài xế:</strong> {bus.route.driver}
//                   </p>
//                   <p style={{ margin: "4px 0" }}>
//                     <strong>Tốc độ:</strong> {bus.speed || 0} km/h
//                   </p>
//                   <p style={{ margin: "4px 0" }}>
//                     <strong>Trạng thái:</strong>
//                     <span
//                       style={{
//                         color: getBusIconColor(bus),
//                         fontWeight: "bold",
//                         marginLeft: "4px",
//                       }}
//                     >
//                       {bus.route.currentStatus === "completed" &&
//                         "✅ Hoàn thành"}
//                       {bus.route.currentStatus === "going_to_school" &&
//                         "🏫 Đang đến trường"}
//                       {bus.route.currentStatus === "picking_up" &&
//                         "🎒 Đang đón học sinh"}
//                       {bus.route.currentStatus === "waiting" &&
//                         "⏳ Chờ bắt đầu"}
//                     </span>
//                   </p>
//                   <p style={{ margin: "4px 0" }}>
//                     <strong>Đã đón:</strong> {bus.pickedUpStudents?.length || 0}
//                     /{bus.route.students.length} học sinh
//                   </p>
//                   {bus.nextStop && (
//                     <div
//                       style={{
//                         marginTop: "8px",
//                         padding: "8px",
//                         backgroundColor: "#FFF3CD",
//                         borderRadius: "4px",
//                         border: "1px solid #FFEaa7",
//                       }}
//                     >
//                       <strong style={{ color: "#856404", fontSize: "12px" }}>
//                         🎯 Điểm tiếp theo: {bus.nextStop.student.name}
//                       </strong>
//                       <br />
//                       <span style={{ color: "#856404", fontSize: "11px" }}>
//                         Dự kiến: {bus.nextStop.estimatedArrival}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// };

// export default BusMap;
