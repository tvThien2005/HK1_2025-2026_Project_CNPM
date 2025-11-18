"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom icons cho StationMap
const studentIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const stationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedStationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
});

const assignedStationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Student {
  maHocSinh: number;
  tenHocSinh: string;
  lop: string;
  viDo?: number;
  kinhDo?: number;
  soNha?: string;
  duong?: string;
  phuongXa?: string;
  quanHuyen?: string;
  thanhPho?: string;
}

interface Station {
  maDiemDung: number;
  tenDiemDung: string;
  moTa?: string;
  viDo?: number;
  kinhDo?: number;
  trangThai?: string;
}

interface AssignedStation {
  maDiemDung: number;
  tenDiemDung: string;
  loaiPhanBo: string;
  viDo?: number;
  kinhDo?: number;
}

interface StationMapProps {
  student: Student;
  allStations: Station[];
  selectedStation?: Station | null;
  assignedStations?: AssignedStation[];
  onStationClick?: (station: Station) => void;
}

const StationMap: React.FC<StationMapProps> = ({
  student,
  allStations,
  selectedStation,
  assignedStations = [],
  onStationClick,
}) => {
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper: Parse và validate tọa độ
  const parseCoordinate = (value: any): number | null => {
    if (value === null || value === undefined) return null;
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? null : num;
  };

  // Lấy tọa độ học sinh
  const getStudentPosition = (): [number, number] | null => {
    const lat = parseCoordinate(student.viDo);
    const lng = parseCoordinate(student.kinhDo);

    if (
      lat !== null &&
      lng !== null &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      return [lat, lng];
    }
    return null;
  };

  // Lọc các trạm có tọa độ hợp lệ
  const validStations = allStations.filter((station) => {
    const lat = parseCoordinate(station.viDo);
    const lng = parseCoordinate(station.kinhDo);
    return (
      lat !== null &&
      lng !== null &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  });

  // Tính center của map
  const getMapCenter = (): [number, number] => {
    const studentPos = getStudentPosition();

    if (studentPos) {
      return studentPos; // Ưu tiên vị trí học sinh
    }

    if (validStations.length > 0) {
      const totalLat = validStations.reduce((sum, s) => {
        const lat = parseCoordinate(s.viDo);
        return sum + (lat || 0);
      }, 0);

      const totalLng = validStations.reduce((sum, s) => {
        const lng = parseCoordinate(s.kinhDo);
        return sum + (lng || 0);
      }, 0);

      return [totalLat / validStations.length, totalLng / validStations.length];
    }

    // Default: Trung tâm TP.HCM
    return [10.7756592, 106.7018882];
  };

  // Tính khoảng cách giữa học sinh và trạm được chọn
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Bán kính Trái Đất (km)

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Tạo đường đi từ học sinh đến trạm được chọn
  useEffect(() => {
    if (selectedStation && getStudentPosition()) {
      calculateRoute();
    } else {
      setRoutePath([]);
    }
  }, [selectedStation, student]);

  const calculateRoute = async () => {
    const studentPos = getStudentPosition();
    if (!studentPos || !selectedStation) return;

    const stationLat = parseCoordinate(selectedStation.viDo);
    const stationLng = parseCoordinate(selectedStation.kinhDo);

    if (stationLat === null || stationLng === null) return;

    setIsLoading(true);
    try {
      const stationPos: [number, number] = [stationLat, stationLng];
      const route = await getRouteSegment(studentPos, stationPos);
      setRoutePath(route);
    } catch (error) {
      console.error("Error calculating route:", error);
      // Fallback: Đường thẳng
      setRoutePath([studentPos, [stationLat, stationLng]]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRouteSegment = async (
    start: [number, number],
    end: [number, number]
  ): Promise<[number, number][]> => {
    try {
      const coordinates = `${start[1]},${start[0]};${end[1]},${end[0]}`;
      const url = `https://router.project-osrm.org/route/v1/walking/${coordinates}?overview=full&geometries=geojson`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`OSRM error: ${response.status}`);

      const data = await response.json();

      if (data.code === "Ok" && data.routes?.length > 0) {
        const geometry = data.routes[0].geometry;
        return geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );
      }

      throw new Error("No valid route");
    } catch (error) {
      // Fallback: Đường thẳng
      return [start, end];
    }
  };

  // Render địa chỉ đầy đủ
  const renderFullAddress = (student: Student): string => {
    const parts = [
      student.soNha,
      student.duong,
      student.phuongXa,
      student.quanHuyen,
      student.thanhPho,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Chưa có địa chỉ";
  };

  const studentPosition = getStudentPosition();

  return (
    <div
      style={{
        height: "450px",
        width: "100%",
        borderRadius: "5px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={getMapCenter()}
        zoom={studentPosition ? 14 : 12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Marker học sinh */}
        {studentPosition && (
          <Marker position={studentPosition} icon={studentIcon}>
            <Popup>
              <div>
                <strong>👨‍🎓 {student.tenHocSinh}</strong>
                <p className="mb-1 small">Lớp: {student.lop}</p>
                <p className="mb-0 small text-muted">
                  📍 {renderFullAddress(student)}
                </p>
                <p className="mb-0 small text-success">
                  🎯 Vị trí hiện tại của học sinh
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Markers các trạm */}
        {validStations.map((station) => {
          const lat = parseCoordinate(station.viDo);
          const lng = parseCoordinate(station.kinhDo);

          if (lat === null || lng === null) return null;

          const isSelected = selectedStation?.maDiemDung === station.maDiemDung;
          const isAssigned = assignedStations.some(
            (s) => s.maDiemDung === station.maDiemDung
          );

          let icon = stationIcon;
          if (isSelected) icon = selectedStationIcon;
          else if (isAssigned) icon = assignedStationIcon;

          // Tính khoảng cách đến học sinh
          const distance = studentPosition
            ? calculateDistance(
                studentPosition[0],
                studentPosition[1],
                lat,
                lng
              )
            : null;

          return (
            <Marker
              key={station.maDiemDung}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => onStationClick?.(station),
              }}
            >
              <Popup>
                <div>
                  <strong
                    className={
                      isSelected
                        ? "text-danger"
                        : isAssigned
                        ? "text-warning"
                        : "text-primary"
                    }
                  >
                    🚌 {station.tenDiemDung}
                  </strong>
                  {station.moTa && <p className="mb-1 small">{station.moTa}</p>}
                  <p className="mb-1 small text-muted">
                    📍 Tọa độ: {lat.toFixed(6)}, {lng.toFixed(6)}
                  </p>

                  {distance !== null && (
                    <p className="mb-1 small">
                      <span
                        className={`badge ${
                          distance < 1
                            ? "bg-success"
                            : distance < 3
                            ? "bg-warning"
                            : "bg-secondary"
                        } me-1`}
                      >
                        🚶 {distance.toFixed(2)} km
                      </span>
                      {distance < 1 ? "Rất gần" : distance < 3 ? "Gần" : "Xa"}
                    </p>
                  )}

                  {isSelected && (
                    <p className="mb-0 small text-danger fw-bold">
                      ✅ Trạm được chọn
                    </p>
                  )}

                  {isAssigned && (
                    <p className="mb-0 small text-warning fw-bold">
                      🔗 Đã được gán
                    </p>
                  )}

                  <p className="mb-0 small text-info">
                    👆 Click để chọn trạm này
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Đường đi từ học sinh đến trạm được chọn */}
        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: selectedStation ? "#DC3545" : "#3B82F6",
              weight: 3,
              opacity: 0.7,
              dashArray: "10, 5",
            }}
          />
        )}
      </MapContainer>

      {/* Loading và thông tin */}
      {isLoading && (
        <div className="position-absolute top-50 start-50 translate-middle bg-white p-2 rounded shadow">
          <small className="text-muted">🗺️ Đang tính toán đường đi...</small>
        </div>
      )}

      {/* Thông tin bản đồ */}
      <div className="mt-2">
        <div className="d-flex justify-content-between align-items-center">
          <div className="small text-muted">
            <span className="me-3">🟢 Học sinh</span>
            <span className="me-3">🔵 Trạm có sẵn</span>
            <span className="me-3">🟠 Trạm đã gán</span>
            <span>🔴 Trạm được chọn</span>
          </div>
          <div className="small text-muted">
            📊 {validStations.length} trạm |
            {selectedStation
              ? ` 🎯 Đã chọn: ${selectedStation.tenDiemDung}`
              : " ⚠️ Chưa chọn trạm"}
          </div>
        </div>

        {!studentPosition && (
          <div className="alert alert-warning py-1 mt-2 mb-0">
            <small>⚠️ Không thể hiển thị vị trí học sinh do thiếu tọa độ</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationMap;
