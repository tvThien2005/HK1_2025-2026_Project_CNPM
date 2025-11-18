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

// Custom icons
const stationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const schoolIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
});

interface Station {
  thuTu: number;
  tenDiemDung: string;
  moTa: string;
  thoiGianDuKien: string;
  viDo: number;
  kinhDo: number;
}

interface RouteMapProps {
  stations: Station[];
  routeName: string;
}

const RouteMap: React.FC<RouteMapProps> = ({ stations, routeName }) => {
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Vị trí trường (mặc định)
  const schoolPosition: [number, number] = [10.7597031, 106.6817595];

  // Helper: Convert và validate tọa độ
  const parseCoordinate = (value: any): number | null => {
    if (value === null || value === undefined) return null;
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? null : num;
  };

  // Lọc và validate các trạm có tọa độ hợp lệ
  const validStations = stations.filter((station) => {
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

  useEffect(() => {
    if (validStations.length > 0) {
      calculateRoute();
    }
  }, [stations]);

  const calculateRoute = async () => {
    setIsLoading(true);
    try {
      const allPoints: [number, number][] = [];

      // Sắp xếp các trạm theo thứ tự
      const sortedStations = [...validStations].sort(
        (a, b) => a.thuTu - b.thuTu
      );

      // Tạo đường đi giữa các trạm liên tiếp
      for (let i = 0; i < sortedStations.length; i++) {
        const currentStation = sortedStations[i];
        const lat = parseCoordinate(currentStation.viDo);
        const lng = parseCoordinate(currentStation.kinhDo);

        if (lat === null || lng === null) continue;

        const start: [number, number] = [lat, lng];

        let end: [number, number];
        if (i < sortedStations.length - 1) {
          // Đi đến trạm tiếp theo
          const nextStation = sortedStations[i + 1];
          const nextLat = parseCoordinate(nextStation.viDo);
          const nextLng = parseCoordinate(nextStation.kinhDo);

          if (nextLat === null || nextLng === null) continue;
          end = [nextLat, nextLng];
        } else {
          // Trạm cuối cùng đi đến trường
          end = schoolPosition;
        }

        // Lấy route từ OSRM
        const segment = await getRouteSegment(start, end);
        allPoints.push(...segment);
      }

      setRoutePath(allPoints);
    } catch (error) {
      console.error("Error calculating route:", error);
      // Fallback: Đường thẳng
      const fallbackPath = validStations
        .sort((a, b) => a.thuTu - b.thuTu)
        .map((s) => {
          const lat = parseCoordinate(s.viDo);
          const lng = parseCoordinate(s.kinhDo);
          return [lat!, lng!] as [number, number];
        })
        .filter((coord) => coord[0] !== null && coord[1] !== null);

      fallbackPath.push(schoolPosition);
      setRoutePath(fallbackPath);
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
      const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

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
      // Fallback: Đường thẳng với 10 điểm
      const points: [number, number][] = [];
      for (let i = 0; i <= 10; i++) {
        const ratio = i / 10;
        const lat = start[0] + (end[0] - start[0]) * ratio;
        const lng = start[1] + (end[1] - start[1]) * ratio;
        points.push([lat, lng]);
      }
      return points;
    }
  };

  // Tính center của map
  const getMapCenter = (): [number, number] => {
    if (validStations.length === 0) return schoolPosition;

    const totalLat = validStations.reduce((sum, s) => {
      const lat = parseCoordinate(s.viDo);
      return sum + (lat || 0);
    }, 0);

    const totalLng = validStations.reduce((sum, s) => {
      const lng = parseCoordinate(s.kinhDo);
      return sum + (lng || 0);
    }, 0);

    return [totalLat / validStations.length, totalLng / validStations.length];
  };

  // Nếu không có trạm hợp lệ
  if (validStations.length === 0) {
    return (
      <div className="alert alert-warning">
        ⚠️ Không có trạm nào với tọa độ hợp lệ để hiển thị trên bản đồ.
        <br />
        <small>Vui lòng kiểm tra lại dữ liệu tọa độ của các trạm.</small>
      </div>
    );
  }

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={getMapCenter()}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Hiển thị các trạm */}
        {validStations
          .sort((a, b) => a.thuTu - b.thuTu)
          .map((station, index) => {
            const lat = parseCoordinate(station.viDo);
            const lng = parseCoordinate(station.kinhDo);

            if (lat === null || lng === null) return null;

            return (
              <Marker key={index} position={[lat, lng]} icon={stationIcon}>
                <Popup>
                  <div>
                    <strong>
                      #{station.thuTu} - {station.tenDiemDung}
                    </strong>
                    {station.moTa && (
                      <p className="mb-1 small">{station.moTa}</p>
                    )}
                    <p className="mb-0 small text-muted">
                      Thời gian: {station.thoiGianDuKien}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Hiển thị trường */}
        <Marker position={schoolPosition} icon={schoolIcon}>
          <Popup>
            <div>
              <strong>🏫 Trường Đại học Sài Gòn</strong>
              <p className="mb-0 small">Điểm đến cuối cùng</p>
            </div>
          </Popup>
        </Marker>

        {/* Hiển thị đường đi */}
        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: "#3B82F6",
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}
      </MapContainer>

      {isLoading && (
        <div className="text-center mt-2">
          <small className="text-muted">Đang tính toán tuyến đường...</small>
        </div>
      )}

      {validStations.length < stations.length && (
        <div className="alert alert-warning mt-2 mb-0">
          ⚠️ {stations.length - validStations.length} trạm bị bỏ qua do thiếu
          tọa độ hợp lệ
        </div>
      )}
    </div>
  );
};

export default RouteMap;
