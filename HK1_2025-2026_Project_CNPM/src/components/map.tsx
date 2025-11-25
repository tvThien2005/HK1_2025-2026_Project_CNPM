"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Bus, Station } from "../types/bus";
import L from "leaflet";
import { useState, useEffect } from "react";
import { Badge } from "react-bootstrap";

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
  onStationPickup?: (stationId: string) => void;
}

// ✅ ĐIỂM TẬP TRUNG MẶC ĐỊNH
const RALLY_POINT = {
  name: "Điểm tập trung xe buýt",
  position: { lat: 10.762622, lng: 106.680172 },
  description: "Tất cả xe xuất phát từ đây",
};

const BusMap: React.FC<MapProps> = ({
  buses = [],
  selectedBus = null,
  onBusSelect,
  onStationPickup,
}) => {
  const [routePaths, setRoutePaths] = useState<{
    [key: string]: [number, number][];
  }>({});
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // ✅ Parse và validate tọa độ
  const parseCoordinate = (value: any): number | null => {
    if (value === null || value === undefined) return null;
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? null : num;
  };

  // ✅ Tính center của map dựa trên xe được chọn
  const getMapCenter = (): [number, number] => {
    if (selectedBus) {
      const lat = parseCoordinate(selectedBus.position.lat);
      const lng = parseCoordinate(selectedBus.position.lng);
      if (lat !== null && lng !== null) {
        return [lat, lng];
      }
    }

    // Default: Điểm tập trung
    return [RALLY_POINT.position.lat, RALLY_POINT.position.lng];
  };

  // ✅ Kiểm tra trạm đã qua chưa
  const isStationPickedUp = (stationId: string): boolean => {
    if (!selectedBus) return false;
    return selectedBus.pickedUpStations?.includes(stationId) || false;
  };

  // ✅ Xử lý click vào trạm
  const handleStationMarkerClick = (stationId: string) => {
    if (onStationPickup && !isStationPickedUp(stationId)) {
      onStationPickup(stationId);
    }
  };

  // ✅ Lấy màu bus theo trạng thái
  const getBusIconColor = (bus: Bus) => {
    if (bus.route.currentStatus === "completed") return "#4CAF50";
    if (bus.route.currentStatus === "going_to_school") return "#2196F3";
    if (bus.route.currentStatus === "picking_up") return "#FF9800";
    return "#9E9E9E";
  };

  // ✅ Gọi OSRM API để lấy đường đi thực tế
  const getRouteFromOSRM = async (
    start: [number, number],
    end: [number, number],
    retries = 2
  ): Promise<[number, number][]> => {
    // Nếu 2 điểm quá gần, trả về đường thẳng
    const distance = Math.sqrt(
      Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
    );
    if (distance < 0.001) {
      return [start, end];
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const coordinates = `${start[1]},${start[0]};${end[1]},${end[0]}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 5000); // Giảm timeout xuống 5s

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.code === "Ok" && data.routes?.length > 0) {
          const geometry = data.routes[0].geometry;
          const route = geometry.coordinates.map(
            (coord: [number, number]) =>
              [coord[1], coord[0]] as [number, number]
          );

          console.log(`✅ OSRM success: ${route.length} points`);
          return route;
        }

        throw new Error(`OSRM returned: ${data.code}`);
      } catch (error: any) {
        console.warn(
          `⚠️ OSRM attempt ${attempt + 1}/${retries + 1} failed:`,
          error.message
        );

        // Nếu là lần thử cuối, trả về đường thẳng
        if (attempt === retries) {
          console.log(`📍 Fallback to straight line for ${start} -> ${end}`);
          return [start, end];
        }

        // Chờ một chút trước khi retry
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
      }
    }

    // Fallback cuối cùng
    return [start, end];
  };

  // ✅ Tính toán tất cả đường đi của xe được chọn
  useEffect(() => {
    if (!selectedBus) {
      setRoutePaths({});
      return;
    }

    let isCancelled = false;

    const calculateAllRoutes = async () => {
      setIsLoadingRoute(true);
      const newPaths: { [key: string]: [number, number][] } = {};

      try {
        const stations = selectedBus.route.stations;
        const busLat = parseCoordinate(selectedBus.position.lat);
        const busLng = parseCoordinate(selectedBus.position.lng);

        if (busLat === null || busLng === null) {
          console.warn("⚠️ Invalid bus position");
          setIsLoadingRoute(false);
          return;
        }

        const busPos: [number, number] = [busLat, busLng];
        const currentIndex = selectedBus.currentStationIndex || 0;

        console.log(`🗺️ Calculating routes for ${selectedBus.name}...`);

        // 1️⃣ Từ điểm tập trung → trạm đầu (nếu chưa bắt đầu)
        if (
          selectedBus.route.currentStatus === "waiting" &&
          stations.length > 0
        ) {
          const firstStationLat = parseCoordinate(stations[0].position.lat);
          const firstStationLng = parseCoordinate(stations[0].position.lng);

          if (firstStationLat !== null && firstStationLng !== null) {
            console.log("📍 Calculating: Rally Point → First Station");
            const rallyToFirst = await getRouteFromOSRM(
              [RALLY_POINT.position.lat, RALLY_POINT.position.lng],
              [firstStationLat, firstStationLng]
            );
            if (!isCancelled) {
              newPaths["rally-to-first"] = rallyToFirst;
            }
          }
        }

        // 2️⃣ Từ xe → trạm tiếp theo (đang đi)
        if (currentIndex < stations.length && !isCancelled) {
          const nextStation = stations[currentIndex];
          const nextLat = parseCoordinate(nextStation.position.lat);
          const nextLng = parseCoordinate(nextStation.position.lng);

          if (nextLat !== null && nextLng !== null) {
            console.log(`📍 Calculating: Bus → Station ${currentIndex + 1}`);
            const currentRoute = await getRouteFromOSRM(busPos, [
              nextLat,
              nextLng,
            ]);
            if (!isCancelled) {
              newPaths["current"] = currentRoute;
            }
          }
        }

        // 3️⃣ Các đoạn giữa các trạm còn lại (giới hạn tối đa 3 đoạn)
        const maxFutureSegments = Math.min(3, stations.length - 1);
        for (
          let i = currentIndex;
          i < currentIndex + maxFutureSegments && i < stations.length - 1;
          i++
        ) {
          if (isCancelled) break;

          const stationA = stations[i];
          const stationB = stations[i + 1];

          const latA = parseCoordinate(stationA.position.lat);
          const lngA = parseCoordinate(stationA.position.lng);
          const latB = parseCoordinate(stationB.position.lat);
          const lngB = parseCoordinate(stationB.position.lng);

          if (
            latA !== null &&
            lngA !== null &&
            latB !== null &&
            lngB !== null
          ) {
            console.log(`📍 Calculating: Station ${i + 1} → ${i + 2}`);
            const route = await getRouteFromOSRM([latA, lngA], [latB, lngB]);
            if (!isCancelled) {
              newPaths[`station-${i}-${i + 1}`] = route;
            }
          }
        }

        // 4️⃣ Từ trạm cuối → trường
        if (
          stations.length > 0 &&
          selectedBus.route.currentStatus === "going_to_school" &&
          !isCancelled
        ) {
          const lastStation = stations[stations.length - 1];
          const lastLat = parseCoordinate(lastStation.position.lat);
          const lastLng = parseCoordinate(lastStation.position.lng);
          const schoolLat = parseCoordinate(
            selectedBus.route.school.position.lat
          );
          const schoolLng = parseCoordinate(
            selectedBus.route.school.position.lng
          );

          if (
            lastLat !== null &&
            lastLng !== null &&
            schoolLat !== null &&
            schoolLng !== null
          ) {
            console.log("📍 Calculating: Last Station → School");
            const schoolRoute = await getRouteFromOSRM(
              [lastLat, lastLng],
              [schoolLat, schoolLng]
            );
            if (!isCancelled) {
              newPaths["to-school"] = schoolRoute;
            }
          }
        }

        if (!isCancelled) {
          setRoutePaths(newPaths);
          console.log(
            `✅ Routes calculated: ${Object.keys(newPaths).length} segments`
          );
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("❌ Error calculating routes:", error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRoute(false);
        }
      }
    };

    calculateAllRoutes();

    // Cleanup function
    return () => {
      isCancelled = true;
    };
  }, [
    selectedBus?.id,
    selectedBus?.currentStationIndex,
    selectedBus?.position.lat,
    selectedBus?.position.lng,
    selectedBus?.route.currentStatus,
  ]);

  // ✅ Icon điểm tập trung
  const createRallyPointIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          background-color: #9C27B0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          animation: pulse 2s infinite;
        ">
          🅿️
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        </style>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  // ✅ Icon bus
  const createBusIcon = (bus: Bus) => {
    const color = getBusIconColor(bus);
    const isWaiting = bus.route.currentStatus === "waiting";

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
        ${isWaiting ? "animation: blink 1.5s infinite;" : ""}
      ">
        🚌
      </div>
      <style>
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>
    `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: "custom-bus-icon",
    });
  };

  // ✅ Icon trường học
  const createSchoolIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          background-color: #2196F3;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">
          🏫
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  // ✅ Icon trạm
  const createStationIcon = (station: Station, isPickedUp: boolean) => {
    if (isPickedUp) {
      return L.divIcon({
        html: `
          <div style="
            background-color: #9E9E9E;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
          ">
            ✓
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    }

    const color =
      station.type === "pickup"
        ? "#4CAF50"
        : station.type === "dropoff"
        ? "#2196F3"
        : "#FF9800";

    const icon =
      station.type === "pickup"
        ? "🚏"
        : station.type === "dropoff"
        ? "🏁"
        : "🔄";

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
          position: relative;
        ">
          ${icon}
          ${
            station.studentCount > 0
              ? `<div style="
                position: absolute;
                top: -8px;
                right: -8px;
                background-color: #DC2626;
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: bold;
                border: 2px solid white;
              ">${station.studentCount}</div>`
              : ""
          }
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Loading indicator */}
      {isLoadingRoute && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            backgroundColor: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            className="spinner-border spinner-border-sm text-primary"
            role="status"
          />
          <span style={{ fontSize: "14px", color: "#333" }}>
            🗺️ Đang tính toán đường đi...
          </span>
        </div>
      )}

      <MapContainer
        center={getMapCenter()}
        zoom={selectedBus ? 14 : 13}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* ✅ VẼ TẤT CẢ ĐƯỜNG ĐI */}
        {Object.entries(routePaths).map(([key, positions]) => {
          let color = "#3B82F6";
          let weight = 3;
          let opacity = 0.6;
          let dashArray = "5, 10";

          if (key === "current") {
            // Đường đang đi
            color = "#DC2626";
            weight = 5;
            opacity = 0.9;
            dashArray = "10, 5";
          } else if (key === "rally-to-first") {
            // Từ điểm tập trung
            color = "#9C27B0";
            weight = 4;
            opacity = 0.7;
            dashArray = "10, 5";
          } else if (key === "to-school") {
            // Đến trường
            color = "#10B981";
            weight = 4;
            opacity = 0.7;
            dashArray = "5, 10";
          }

          return (
            <Polyline
              key={`route-${key}`}
              positions={positions}
              pathOptions={{
                color,
                weight,
                opacity,
                dashArray,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          );
        })}

        {/* ✅ ĐIỂM TẬP TRUNG */}
        <Marker
          position={[RALLY_POINT.position.lat, RALLY_POINT.position.lng]}
          icon={createRallyPointIcon()}
        >
          <Popup>
            <div style={{ minWidth: "250px" }}>
              <h6 style={{ margin: "0 0 8px 0", color: "#9C27B0" }}>
                🅿️ {RALLY_POINT.name}
              </h6>
              <p style={{ fontSize: "14px", margin: "4px 0" }}>
                {RALLY_POINT.description}
              </p>
              <div
                style={{
                  marginTop: "10px",
                  padding: "8px",
                  backgroundColor: "#F3E5F5",
                  borderRadius: "6px",
                  border: "2px solid #9C27B0",
                }}
              >
                <strong style={{ color: "#9C27B0", fontSize: "12px" }}>
                  📍 Tất cả xe xuất phát từ đây
                </strong>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* ✅ HIỂN THỊ CÁC TRẠM CỦA XE ĐƯỢC CHỌN */}
        {selectedBus?.route.stations.map((station, index) => {
          const isPickedUp = isStationPickedUp(station.id);
          const isCurrent = selectedBus.currentStationIndex === index;

          const lat = parseCoordinate(station.position.lat);
          const lng = parseCoordinate(station.position.lng);

          if (lat === null || lng === null) return null;

          return (
            <Marker
              key={`station-${selectedBus.id}-${station.id}-${index}`}
              position={[lat, lng]}
              eventHandlers={{
                click: () => handleStationMarkerClick(station.id),
              }}
              icon={createStationIcon(station, isPickedUp)}
            >
              <Popup>
                <div style={{ minWidth: "280px" }}>
                  <h6
                    style={{
                      margin: "0 0 8px 0",
                      color: isPickedUp
                        ? "#666"
                        : station.type === "pickup"
                        ? "#4CAF50"
                        : station.type === "dropoff"
                        ? "#2196F3"
                        : "#FF9800",
                    }}
                  >
                    {isPickedUp ? "✅ Đã qua:" : "🚏 Trạm:"} {station.name}
                    {isCurrent && !isPickedUp && (
                      <Badge bg="warning" className="ms-1">
                        ⭐ Đang đến
                      </Badge>
                    )}
                  </h6>

                  <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                    <p style={{ margin: "6px 0" }}>
                      <strong>📍 Loại trạm:</strong>
                      <span
                        style={{
                          color:
                            station.type === "pickup"
                              ? "#4CAF50"
                              : station.type === "dropoff"
                              ? "#2196F3"
                              : "#FF9800",
                          fontWeight: "bold",
                          marginLeft: "4px",
                        }}
                      >
                        {station.type === "pickup"
                          ? "TRẠM ĐÓN"
                          : station.type === "dropoff"
                          ? "TRẠM TRẢ"
                          : "ĐÓN & TRẢ"}
                      </span>
                    </p>

                    <p style={{ margin: "6px 0" }}>
                      <strong>👥 Số học sinh:</strong>{" "}
                      <span
                        style={{
                          color: "#DC2626",
                          fontWeight: "bold",
                          fontSize: "16px",
                        }}
                      >
                        {station.studentCount} em
                      </span>
                    </p>

                    <p style={{ margin: "6px 0" }}>
                      <strong>⏰ Giờ dự kiến:</strong>{" "}
                      {station.estimatedArrival || "Chưa xác định"}
                    </p>

                    <p style={{ margin: "6px 0" }}>
                      <strong>🔢 Thứ tự:</strong> {index + 1}/
                      {selectedBus.route.stations.length}
                    </p>

                    {station.description && (
                      <p style={{ margin: "6px 0" }}>
                        <strong>📝 Mô tả:</strong> {station.description}
                      </p>
                    )}

                    <div
                      style={{
                        marginTop: "12px",
                        padding: "10px",
                        backgroundColor: isPickedUp ? "#E8F5E8" : "#FFF3CD",
                        borderRadius: "6px",
                        textAlign: "center",
                        border: `2px solid ${
                          isPickedUp ? "#4CAF50" : "#FF9800"
                        }`,
                      }}
                    >
                      {isPickedUp ? (
                        <span
                          style={{
                            color: "#4CAF50",
                            fontWeight: "bold",
                            fontSize: "13px",
                          }}
                        >
                          ✅ XE ĐÃ QUA TRẠM
                        </span>
                      ) : isCurrent ? (
                        <span
                          style={{
                            color: "#FF9800",
                            fontWeight: "bold",
                            fontSize: "13px",
                          }}
                        >
                          🚌 XE ĐANG ĐẾN TRẠM NÀY
                        </span>
                      ) : (
                        <span style={{ color: "#2196F3", fontSize: "12px" }}>
                          📍 Click để đánh dấu xe đã đến
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "11px",
                        color: "#666",
                        backgroundColor: "#F5F5F5",
                        padding: "6px",
                        borderRadius: "4px",
                      }}
                    >
                      <strong>Tọa độ:</strong> {lat.toFixed(6)},{" "}
                      {lng.toFixed(6)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ✅ TRƯỜNG HỌC */}
        {selectedBus && (
          <Marker
            key={`school-${selectedBus.id}`}
            position={[
              selectedBus.route.school.position.lat,
              selectedBus.route.school.position.lng,
            ]}
            icon={createSchoolIcon()}
          >
            <Popup>
              <div style={{ minWidth: "220px" }}>
                <h6 style={{ margin: "0 0 8px 0", color: "#2196F3" }}>
                  🏫 {selectedBus.route.school.name}
                </h6>
                <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
                  <p style={{ margin: "4px 0" }}>
                    <strong>⏰ Giờ vào lớp:</strong>{" "}
                    {selectedBus.route.school.startTime}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>📍 Địa chỉ:</strong>{" "}
                    {"273 An Dương Vương, Quận 5, TP.HCM"}
                  </p>
                  {selectedBus.route.currentStatus === "completed" && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "8px",
                        backgroundColor: "#E8F5E8",
                        borderRadius: "6px",
                        textAlign: "center",
                        border: "2px solid #4CAF50",
                      }}
                    >
                      <span
                        style={{
                          color: "#4CAF50",
                          fontWeight: "bold",
                          fontSize: "13px",
                        }}
                      >
                        ✅ XE ĐÃ ĐẾN TRƯỜNG
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ✅ CÁC XE BUÝT */}
        {buses.map((bus) => {
          const lat = parseCoordinate(bus.position.lat);
          const lng = parseCoordinate(bus.position.lng);

          if (lat === null || lng === null) return null;

          return (
            <Marker
              key={bus.id}
              position={[lat, lng]}
              eventHandlers={{
                click: () => onBusSelect?.(bus),
              }}
              icon={createBusIcon(bus)}
            >
              <Popup>
                <div style={{ minWidth: "300px" }}>
                  <h6
                    style={{ margin: "0 0 8px 0", color: getBusIconColor(bus) }}
                  >
                    🚌 {bus.name}
                  </h6>
                  <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
                    <p style={{ margin: "4px 0" }}>
                      <strong>🚗 Biển số:</strong> {bus.licensePlate}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>👨‍✈️ Tài xế:</strong> {bus.route.driver}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>⚡ Tốc độ:</strong> {bus.speed || 0} km/h
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>📊 Trạng thái:</strong>
                      <span
                        style={{
                          color: getBusIconColor(bus),
                          fontWeight: "bold",
                          marginLeft: "4px",
                        }}
                      >
                        {bus.route.currentStatus === "completed" &&
                          "✅ Hoàn thành"}
                        {bus.route.currentStatus === "going_to_school" &&
                          "🏫 Đang đến trường"}
                        {bus.route.currentStatus === "picking_up" &&
                          "🚏 Đang đi giữa các trạm"}
                        {bus.route.currentStatus === "waiting" &&
                          "⏳ Đang tập trung"}
                      </span>
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>📍 Tiến trình:</strong>{" "}
                      <span style={{ fontWeight: "bold", color: "#2196F3" }}>
                        {bus.pickedUpStations?.length || 0}/
                        {bus.route.stations.length} trạm
                      </span>
                    </p>

                    {bus.nextStop && (
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "10px",
                          backgroundColor: "#FFF3CD",
                          borderRadius: "6px",
                          border: "2px solid #FFE082",
                        }}
                      >
                        <strong
                          style={{
                            color: "#856404",
                            fontSize: "13px",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          🎯 Trạm tiếp theo:
                        </strong>
                        <div style={{ color: "#856404", fontSize: "12px" }}>
                          <strong>{bus.nextStop.station.name}</strong>
                          <br />
                          <span>
                            ⏰ Dự kiến: {bus.nextStop.estimatedArrival}
                          </span>
                          <br />
                          <span>
                            👥 Số học sinh: {bus.nextStop.station.studentCount}{" "}
                            em
                          </span>
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => onBusSelect?.(bus)}
                        style={{
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                          width: "100%",
                          fontWeight: "bold",
                        }}
                      >
                        📍 Theo dõi xe này
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Legend */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "10px",
            zIndex: 1000,
            backgroundColor: "white",
            padding: "12px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            fontSize: "12px",
            border: "2px solid #E0E0E0",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "8px",
              fontSize: "13px",
              color: "#333",
            }}
          >
            📍 Chú thích:
          </div>
          <div style={{ marginBottom: "5px" }}>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                backgroundColor: "#9C27B0",
                borderRadius: "50%",
                marginRight: "8px",
                border: "2px solid white",
              }}
            ></span>
            <span>Điểm tập trung</span>
          </div>
          <div style={{ marginBottom: "5px" }}>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                backgroundColor: "#4CAF50",
                borderRadius: "50%",
                marginRight: "8px",
                border: "2px solid white",
              }}
            ></span>
            <span>Trạm đón</span>
          </div>
          <div style={{ marginBottom: "5px" }}>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                backgroundColor: "#9E9E9E",
                borderRadius: "50%",
                marginRight: "8px",
                border: "2px solid white",
              }}
            ></span>
            <span>Đã qua trạm</span>
          </div>
          <hr style={{ margin: "8px 0", borderColor: "#E0E0E0" }} />
          <div style={{ fontSize: "11px", color: "#666" }}>
            <strong style={{ color: "#DC2626" }}>━━</strong> Đang đi
            <br />
            <strong style={{ color: "#9C27B0" }}>┄┄</strong> Từ điểm tập trung
            <br />
            <strong style={{ color: "#3B82F6" }}>┄┄</strong> Chưa đến
            <br />
            <strong style={{ color: "#10B981" }}>┄┄</strong> Đến trường
          </div>
        </div>
      </MapContainer>
    </div>
  );
};

export default BusMap;