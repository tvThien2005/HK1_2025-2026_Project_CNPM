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
  Tabs,
  Tab,
  Accordion,
} from "react-bootstrap";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Bus, Station, BusRoute } from "../../types/bus";

const BusMap = dynamic(() => import("../../components/Map"), {
  ssr: false,
});

interface RouteSegment {
  positions: [number, number][];
  color: string;
  weight: number;
  opacity: number;
  dashArray?: string;
}

// ✅ Service function: Fetch data từ database
const fetchDataFromDBWithStations = async () => {
  try {
    console.log("🔄 Fetching bus data with stations...");

    const response = await fetch(
      "http://localhost:5000/api/tracking/bus-data-with-stations"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("📦 Raw API response:", result);

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || "Unknown error from server");
    }
  } catch (error) {
    console.error("❌ Error fetching data from database:", error);
    return null;
  }
};

// Hàm convert dữ liệu DB sang Bus objects
const convertDBDataToBusWithStations = (dbData: any): Bus[] => {
  if (!dbData) {
    console.warn("⚠️ No data to convert");
    return [];
  }

  const {
    chuyenxe = [],
    xebuyt = [],
    taixe = [],
    lichtrinh = [],
    tuyenduong = [],
    diemdung = [],
    chitiettuyenduong = [],
    phanbohocsinhtram = [],
    vitrithuc = [],
    vitrichuyenxe = [],
  } = dbData;

  console.log("🔍 Converting DB data to buses:");
  console.log(`  - Chuyến xe: ${chuyenxe.length}`);
  console.log(`  - Điểm dừng: ${diemdung.length}`);
  console.log(`  - Phân bổ trạm xe: ${chitiettuyenduong.length}`);
  console.log(`  - Phân bổ học sinh trạm: ${phanbohocsinhtram.length}`);

  // ✅ DEBUG: Log sample data để debug
  console.log("📊 SAMPLE DATA FOR DEBUGGING:");
  console.log("   - Sample chuyenxe:", chuyenxe.slice(0, 2));
  console.log("   - Sample chitiettuyenduong:", chitiettuyenduong.slice(0, 5));
  console.log("   - Sample diemdung:", diemdung.slice(0, 3));
  console.log("   - Sample phanbohocsinhtram:", phanbohocsinhtram.slice(0, 5));

  // ✅ DEBUG: Kiểm tra cấu trúc dữ liệu
  console.log("🔍 DATA STRUCTURE CHECK:");
  console.log(
    "   - chitiettuyenduong keys:",
    chitiettuyenduong.length > 0 ? Object.keys(chitiettuyenduong[0]) : "No data"
  );
  console.log(
    "   - diemdung keys:",
    diemdung.length > 0 ? Object.keys(diemdung[0]) : "No data"
  );
  console.log(
    "   - phanbohocsinhtram keys:",
    phanbohocsinhtram.length > 0 ? Object.keys(phanbohocsinhtram[0]) : "No data"
  );

  // ✅ LOG ĐỂ DEBUG
  console.log("📊 Sample chitiettuyenduong:", chitiettuyenduong.slice(0, 5));

  return chuyenxe.map((chuyen: any) => {
    const xe = xebuyt.find((x: any) => x.maXeBuyt === chuyen.maXeBuyt);
    const taiXe = taixe.find((t: any) => t.maTaiXe === chuyen.maTaiXe);
    const lich = lichtrinh.find(
      (l: any) => l.maLichTrinh === chuyen.maLichTrinh
    );
    const tuyen = tuyenduong.find(
      (t: any) => t.maTuyenDuong === chuyen.maTuyenDuong
    );

    // ✅ FIX: Lọc trạm theo tuyến đường và loại bỏ duplicate
    const tramCuaChuyenXe = chitiettuyenduong.filter(
      (pb: any) =>
        pb.maTuyenDuong === chuyen.maTuyenDuong ||
        pb.maTuyenDuong === String(chuyen.maTuyenDuong) ||
        String(pb.maTuyenDuong) === String(chuyen.maTuyenDuong)
    );

    // ✅ Loại bỏ duplicate trạm một cách thông minh hơn
    const uniqueTramMap = new Map();
    tramCuaChuyenXe.forEach((tram: any) => {
      // ✅ Tạo key duy nhất dựa trên điểm dừng và tuyến đường
      const key = `${tram.maDiemDung}`;

      // ✅ Chỉ giữ lại record đầu tiên hoặc record có thuTu hợp lệ nhất
      if (!uniqueTramMap.has(key)) {
        uniqueTramMap.set(key, tram);
      } else {
        // ✅ Ưu tiên record có thuTu/thuTuDon hợp lệ
        const existing = uniqueTramMap.get(key);
        const existingThuTu = existing.thuTu || existing.thuTuDon;
        const currentThuTu = tram.thuTu || tram.thuTuDon;

        if (currentThuTu && !existingThuTu) {
          uniqueTramMap.set(key, tram);
        } else if (
          currentThuTu &&
          existingThuTu &&
          currentThuTu < existingThuTu
        ) {
          uniqueTramMap.set(key, tram);
        }
      }
    });

    const uniqueTramCuaChuyenXe = Array.from(uniqueTramMap.values());

    // ✅ DEBUG: Log để kiểm tra deduplication
    console.log(
      `   - Duplicate check: ${tramCuaChuyenXe.length} raw → ${uniqueTramCuaChuyenXe.length} unique`
    );

    console.log(`🚌 Chuyến xe ${chuyen.maChuyenXe} (${xe?.bienSoXe}):`);
    console.log(
      `   - maChuyenXe type: ${typeof chuyen.maChuyenXe}, value: ${
        chuyen.maChuyenXe
      }`
    );
    console.log(
      `   - Tìm thấy ${tramCuaChuyenXe.length} trạm (raw), ${uniqueTramCuaChuyenXe.length} trạm (unique)`
    );

    // ✅ LOG CHI TIẾT - Debug tuyến đường vs chuyến xe
    console.log(
      `   - maTuyenDuong của chuyến xe: ${
        chuyen.maTuyenDuong
      } (type: ${typeof chuyen.maTuyenDuong})`
    );

    if (uniqueTramCuaChuyenXe.length > 0) {
      console.log(
        `   - Chi tiết trạm (sau dedup):`,
        uniqueTramCuaChuyenXe.map((t: any) => ({
          maChiTietTuyenDuong: t.maChiTietTuyenDuong,
          maDiemDung: t.maDiemDung,
          thuTu: t.thuTu || t.thuTuDon,
          maTuyenDuong: t.maTuyenDuong,
          tenDiemDung: t.tenDiemDung,
        }))
      );

      // ✅ DEBUG: Kiểm tra raw data
      console.log(`   - Raw data trước dedup:`, tramCuaChuyenXe.slice(0, 10));

      // ✅ DEBUG: Log raw data để kiểm tra
      console.log(
        `   - RAW tramCuaChuyenXe for xe ${chuyen.maChuyenXe}:`,
        tramCuaChuyenXe
      );
      console.log(
        `   - Available diemdung IDs:`,
        diemdung.map((d: any) => ({
          id: d.id,
          maDiemDung: d.maDiemDung,
          tenDiemDung: d.tenDiemDung,
        }))
      );
    }

    // ✅ Sắp xếp theo thứ tự đón với xử lý null/undefined
    const sortedTram = uniqueTramCuaChuyenXe.sort((a: any, b: any) => {
      const thuTuA =
        a.thuTu || a.thuTuDon ? parseInt(a.thuTu || a.thuTuDon) : 999;
      const thuTuB =
        b.thuTu || b.thuTuDon ? parseInt(b.thuTu || b.thuTuDon) : 999;
      return thuTuA - thuTuB;
    });

    // ✅ Tạo danh sách Station objects
    const busStations: Station[] = sortedTram.map((pb: any, index: number) => {
      // ✅ FIX: Tìm trạm theo cả id và maDiemDung
      console.log(
        `🔍 FINDING STATION for pb.maDiemDung: ${
          pb.maDiemDung
        } (type: ${typeof pb.maDiemDung})`
      );
      console.log(
        `   - Searching in diemdung:`,
        diemdung.map((d: any) => ({
          id: d.id,
          maDiemDung: d.maDiemDung,
          tenDiemDung: d.tenDiemDung,
          idType: typeof d.id,
          maDiemDungType: typeof d.maDiemDung,
        }))
      );

      const tram = diemdung.find(
        (dd: any) =>
          dd.id === pb.maDiemDung ||
          dd.maDiemDung === pb.maDiemDung ||
          String(dd.id) === String(pb.maDiemDung)
      );

      console.log(`🎯 FOUND STATION:`, tram || "NOT FOUND");

      if (!tram) {
        console.warn(
          `⚠️ Không tìm thấy trạm ID ${pb.maDiemDung} trong diemdung`
        );
        console.warn(
          `   Available diemdung IDs:`,
          diemdung
            .map((d: any) => ({ id: d.id, maDiemDung: d.maDiemDung }))
            .slice(0, 5)
        );
      }

      // ✅ Đếm số học sinh tại trạm
      console.log(`🎒 COUNTING STUDENTS for station ${pb.maDiemDung}:`);
      console.log(
        `   - phanbohocsinhtram data:`,
        phanbohocsinhtram.map((p: any) => ({
          maDiemDung: p.maDiemDung,
          loaiPhanBo: p.loaiPhanBo,
          trangThai: p.trangThai,
          maDiemDungType: typeof p.maDiemDung,
        }))
      );

      const hocSinhTaiTram = phanbohocsinhtram.filter((pbhst: any) => {
        const matchDiemDung =
          pbhst.maDiemDung === pb.maDiemDung ||
          String(pbhst.maDiemDung) === String(pb.maDiemDung);

        const matchLoai = pbhst.loaiPhanBo === "Sang";
        const matchTrangThai = pbhst.trangThai === "Active";

        console.log(
          `     - Checking student: maDiemDung=${pbhst.maDiemDung}, loaiPhanBo=${pbhst.loaiPhanBo}, trangThai=${pbhst.trangThai}`
        );
        console.log(
          `     - Match results: diemDung=${matchDiemDung}, loai=${matchLoai}, trangThai=${matchTrangThai}`
        );

        return matchDiemDung && matchLoai && matchTrangThai;
      });

      console.log(
        `🎒 RESULT: Found ${hocSinhTaiTram.length} students at station ${pb.maDiemDung}`
      );

      // ✅ FIX: Sử dụng trường đúng từ database
      const thuTuValue = pb.thuTu || pb.thuTuDon || index + 1;

      console.log(
        `   📍 Trạm ${thuTuValue}: ${tram?.tenDiemDung || "Unknown"}`
      );
      console.log(
        `      - ID điểm dừng: ${pb.maDiemDung} (type: ${typeof pb.maDiemDung})`
      );
      console.log(`      - Học sinh: ${hocSinhTaiTram.length} em`);
      console.log(`      - Tọa độ: ${tram?.viDo}, ${tram?.kinhDo}`);
      console.log(
        `      - thuTu from DB: ${pb.thuTu}, thuTuDon from DB: ${pb.thuTuDon}`
      );

      // ✅ FIX: Đảm bảo thuTu không undefined và tạo unique key
      const uniqueStationId = `station-${chuyen.maChuyenXe}-${pb.maDiemDung}-${thuTuValue}-${index}`;

      console.log(`      - 🔍 STATION CREATED:`, {
        id: uniqueStationId,
        name: tram?.tenDiemDung || `Trạm ${index + 1}`,
        position: {
          lat: parseFloat(tram?.viDo) || 10.762622,
          lng: parseFloat(tram?.kinhDo) || 106.660172,
        },
        originalDiemDungId: pb.maDiemDung,
        thuTu: thuTuValue,
      });

      return {
        id: uniqueStationId,
        name: tram?.tenDiemDung || `Trạm ${index + 1}`,
        position: {
          lat: parseFloat(tram?.viDo) || 10.762622,
          lng: parseFloat(tram?.kinhDo) || 106.660172,
        },
        description: tram?.moTa || "",
        studentCount: hocSinhTaiTram.length,
        estimatedArrival: pb.thoiGianDuKien
          ? pb.thoiGianDuKien.substring(0, 5)
          : undefined,
        type: "pickup",
        originalDiemDungId: pb.maDiemDung,
        phanBoTramId: pb.machitiettuyenduong,
        chuyenXeId: chuyen.maChuyenXe,
        thuTu: thuTuValue,
      };
    });

    const totalStudents = busStations.reduce(
      (sum, st) => sum + st.studentCount,
      0
    );

    console.log(
      `✅ Xe ${xe?.bienSoXe}: ${busStations.length} trạm, ${totalStudents} học sinh\n`
    );

    // ✅ DEBUG: Log danh sách trạm cuối cùng
    console.log(
      `🚌 FINAL STATIONS cho xe ${xe?.bienSoXe}:`,
      busStations.map((s) => ({
        id: s.id,
        name: s.name,
        position: s.position,
        originalDiemDungId: (s as any).originalDiemDungId,
        thuTu: (s as any).thuTu,
      }))
    );

    // ...existing code cho BusRoute và return Bus object...
    const busRoute: BusRoute = {
      id: chuyen.maChuyenXe.toString(),
      name: tuyen?.tenTuyenDuong || `Tuyến ${chuyen.maTuyenDuong}`,
      busNumber: xe?.bienSoXe || "Unknown",
      driver: taiXe?.tenTaiXe || "Chưa xác định",
      school: {
        name: "Trường Đại học Sài Gòn",
        position: { lat: 10.762622, lng: 106.682243 },
        startTime: "07:30",
      },
      stations: busStations,
      // ✅ FIX: Tất cả xe đều bắt đầu với trạng thái "waiting"
      currentStatus: "waiting",
      currentStationIndex: 0,
    };

    const viTriXe = vitrichuyenxe.find(
      (v: any) => v.maChuyenXe === chuyen.maChuyenXe
    );
    const viTriThuc = viTriXe
      ? vitrithuc.find((vt: any) => vt.maViTriThuc === viTriXe.maViTriThuc)
      : null;

    // ✅ BAN ĐẦU TẤT CẢ XE Ở ĐIỂM TẬP TRUNG
    const busDepotPosition: [number, number] = [10.782622, 106.640172];

    return {
      id: chuyen.maChuyenXe.toString(),
      name: `Xe ${xe?.bienSoXe || chuyen.maChuyenXe}`,
      licensePlate: xe?.bienSoXe || "Unknown",
      route: busRoute,
      position: {
        lat: busDepotPosition[0],
        lng: busDepotPosition[1],
      },
      speed: 0,
      lastUpdate: new Date().toLocaleTimeString("vi-VN"),
      nextStop:
        busStations.length > 0
          ? {
              station: busStations[0],
              estimatedArrival: lich?.thoiGianDi?.substring(0, 5) || "06:30",
            }
          : undefined,
      pickedUpStations: [],
      currentStationIndex: 0,
    };
  });
};

const VehiclesPage: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [osrmApiAvailable, setOsrmApiAvailable] = useState(true);

  // ✅ State để lưu cached routes cho mỗi xe bus
  const [busRouteCache, setBusRouteCache] = useState<{
    [busId: string]: { [stationId: string]: [number, number][] };
  }>({});

  const stopTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // ✅ SHARED MODE: Function để cập nhật trạng thái tất cả xe khi có trạm mới được đón
  const updateAllBusesForSharedStation = useCallback((stationId: string) => {
    setBuses((prevBuses) =>
      prevBuses.map((bus) => {
        // ✅ Kiểm tra xe này có trạm được đón không
        const hasThisStation = bus.route.stations.some(
          (station) => station.id === stationId
        );

        if (hasThisStation && !bus.pickedUpStations?.includes(stationId)) {
          // ✅ Thêm trạm vào danh sách đã đón
          const updatedPickedUpStations = [
            ...(bus.pickedUpStations || []),
            stationId,
          ];

          console.log(
            `🔄 SHARED: Auto-updating ${bus.name} for station ${stationId}`
          );

          return {
            ...bus,
            pickedUpStations: updatedPickedUpStations,
          };
        }

        return bus; // Xe không có trạm này hoặc đã có rồi thì không thay đổi
      })
    );
  }, []);

  // Đảm bảo component đã mount để tránh hydration error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ Helper function để test OSRM API availability
  const testOsrmApiAvailability = useCallback(async () => {
    try {
      const testResponse = await fetch(
        "https://router.project-osrm.org/route/v1/driving/106.640172,10.782622;106.645172,10.787622?overview=false",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(3000), // Short timeout for test
        }
      );

      if (testResponse.ok) {
        setOsrmApiAvailable(true);
        console.log("✅ OSRM API is available");
        return true;
      } else {
        setOsrmApiAvailable(false);
        console.warn("⚠️ OSRM API is not responding properly");
        return false;
      }
    } catch (error) {
      setOsrmApiAvailable(false);
      console.warn("⚠️ OSRM API is not available:", error);
      return false;
    }
  }, []);

  // ✅ Hàm xử lý khi đón tại trạm - SHARED STATION MODE
  const handleStationPickup = useCallback(
    (stationId: string) => {
      console.log(
        `🎒 SHARED MODE: Station ${stationId} picked up - updating ALL buses that have this station`
      );

      // ✅ Cập nhật tất cả xe có trạm này
      updateAllBusesForSharedStation(stationId);
    },
    [updateAllBusesForSharedStation]
  );

  // ✅ Function để pre-fetch routes cho tất cả xe bus
  const preloadBusRoutes = useCallback(async (buses: Bus[]) => {
    const routeCache: {
      [busId: string]: { [stationId: string]: [number, number][] };
    } = {};

    for (const bus of buses) {
      routeCache[bus.id] = {};
      const busDepotPosition = [10.782622, 106.640172]; // Điểm bãi xe
      let currentPos = busDepotPosition;

      // Nếu xe không có trạm nào, pre-load route từ bãi xe đến trường
      if (bus.route.stations.length === 0) {
        try {
          const routeResponse = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${currentPos[1]},${currentPos[0]};${bus.route.school.position.lng},${bus.route.school.position.lat}?overview=full&geometries=geojson`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
              signal: AbortSignal.timeout(10000), // Longer timeout for preload
            }
          );

          if (routeResponse.ok) {
            const routeData = await routeResponse.json();
            if (routeData.routes && routeData.routes.length > 0) {
              const coordinates = routeData.routes[0].geometry.coordinates;
              routeCache[bus.id]["depot-to-school"] = coordinates.map(
                (coord: [number, number]) => [coord[1], coord[0]]
              );
            }
          }
        } catch (error) {
          console.warn(
            `⚠️ Could not load route for bus ${bus.id} directly to school:`,
            error
          );
        }
      }
      // Pre-load routes từ bãi xe đến trạm đầu tiên (cho xe có trạm)
      else {
        const firstStation = bus.route.stations[0];
        try {
          const routeResponse = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${currentPos[1]},${currentPos[0]};${firstStation.position.lng},${firstStation.position.lat}?overview=full&geometries=geojson`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
              signal: AbortSignal.timeout(10000),
            }
          );

          if (routeResponse.ok) {
            const routeData = await routeResponse.json();
            if (routeData.routes && routeData.routes.length > 0) {
              const coordinates = routeData.routes[0].geometry.coordinates;
              routeCache[bus.id][`depot-to-${firstStation.id}`] =
                coordinates.map((coord: [number, number]) => [
                  coord[1],
                  coord[0],
                ]);
            }
          }
        } catch (error) {
          console.warn(
            `⚠️ Could not load route for bus ${bus.id} to first station:`,
            error
          );
        }

        // Pre-load routes giữa các trạm
        for (let i = 0; i < bus.route.stations.length - 1; i++) {
          const currentStation = bus.route.stations[i];
          const nextStation = bus.route.stations[i + 1];

          try {
            const routeResponse = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${currentStation.position.lng},${currentStation.position.lat};${nextStation.position.lng},${nextStation.position.lat}?overview=full&geometries=geojson`,
              {
                method: "GET",
                headers: {
                  Accept: "application/json",
                },
                signal: AbortSignal.timeout(10000),
              }
            );

            if (routeResponse.ok) {
              const routeData = await routeResponse.json();
              if (routeData.routes && routeData.routes.length > 0) {
                const coordinates = routeData.routes[0].geometry.coordinates;
                routeCache[bus.id][
                  `${currentStation.id}-to-${nextStation.id}`
                ] = coordinates.map((coord: [number, number]) => [
                  coord[1],
                  coord[0],
                ]);
              }
            }
          } catch (error) {
            console.warn(
              `⚠️ Could not load route between stations for bus ${bus.id}:`,
              error
            );
          }
        }

        // Pre-load route từ trạm cuối đến trường
        const lastStation = bus.route.stations[bus.route.stations.length - 1];
        try {
          const routeResponse = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${lastStation.position.lng},${lastStation.position.lat};${bus.route.school.position.lng},${bus.route.school.position.lat}?overview=full&geometries=geojson`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
              signal: AbortSignal.timeout(10000),
            }
          );

          if (routeResponse.ok) {
            const routeData = await routeResponse.json();
            if (routeData.routes && routeData.routes.length > 0) {
              const coordinates = routeData.routes[0].geometry.coordinates;
              routeCache[bus.id][`${lastStation.id}-to-school`] =
                coordinates.map((coord: [number, number]) => [
                  coord[1],
                  coord[0],
                ]);
            }
          }
        } catch (error) {
          console.warn(
            `⚠️ Could not load route to school for bus ${bus.id}:`,
            error
          );
        }
      }
    }

    setBusRouteCache(routeCache);
    console.log(
      "🗺️ Pre-loaded routes for all buses:",
      Object.keys(routeCache).length
    );
  }, []);

  // ✅ Fetch data khi component mount và pre-load routes
  useEffect(() => {
    if (!isMounted) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // ✅ Test OSRM API availability first
        await testOsrmApiAvailability();

        const dbData = await fetchDataFromDBWithStations();
        if (dbData) {
          const busData = convertDBDataToBusWithStations(dbData);
          setBuses(busData);
          if (busData.length > 0) {
            setSelectedBus(busData[0]);
            calculateRouteSegments(busData[0]);
            // Pre-load tất cả routes nếu API available
            if (osrmApiAvailable) {
              await preloadBusRoutes(busData);
            } else {
              console.log(
                "📍 Using straight-line routes due to OSRM API unavailability"
              );
            }
          }
        }
      } catch (error) {
        console.error("❌ Error loading bus data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isMounted, preloadBusRoutes, testOsrmApiAvailability, osrmApiAvailable]);

  // ✅ Tính toán route segments với routing API
  const calculateRouteSegments = useCallback(async (bus: Bus) => {
    if (!bus) {
      setRouteSegments([]);
      return;
    }

    setIsLoadingRoute(true);
    try {
      const stations = bus.route.stations;
      const currentIndex = bus.currentStationIndex;
      const segments: RouteSegment[] = [];

      // Nếu xe không có trạm, hiển thị route đến trường
      if (stations.length === 0) {
        try {
          const routeResponse = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${bus.position.lng},${bus.position.lat};${bus.route.school.position.lng},${bus.route.school.position.lat}?overview=full&geometries=geojson`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
              signal: AbortSignal.timeout(5000),
            }
          );

          if (routeResponse.ok) {
            const routeData = await routeResponse.json();
            if (routeData.routes && routeData.routes.length > 0) {
              const coordinates = routeData.routes[0].geometry.coordinates;
              const routePositions = coordinates.map(
                (coord: [number, number]) =>
                  [coord[1], coord[0]] as [number, number]
              );

              segments.push({
                positions: routePositions,
                color: "#0D6EFD",
                weight: 4,
                opacity: 0.9,
              });
            } else {
              throw new Error("No routes found");
            }
          } else {
            throw new Error(`HTTP ${routeResponse.status}`);
          }
        } catch (error) {
          console.warn(
            "⚠️ OSRM API failed for school route, using straight line:",
            error
          );
          // Fallback to straight line if API fails
          const routeToSchool = [
            [bus.position.lat, bus.position.lng],
            [bus.route.school.position.lat, bus.route.school.position.lng],
          ] as [number, number][];

          segments.push({
            positions: routeToSchool,
            color: "#0D6EFD",
            weight: 4,
            opacity: 0.9,
          });
        }
      }
      // Xe có trạm, hiển thị route đến trạm tiếp theo
      else if (currentIndex < stations.length) {
        const nextStation = stations[currentIndex];

        // ✅ Sử dụng OSRM API với error handling
        try {
          const routeResponse = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${bus.position.lng},${bus.position.lat};${nextStation.position.lng},${nextStation.position.lat}?overview=full&geometries=geojson`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
              signal: AbortSignal.timeout(5000), // 5 second timeout
            }
          );

          if (routeResponse.ok) {
            const routeData = await routeResponse.json();
            if (routeData.routes && routeData.routes.length > 0) {
              const coordinates = routeData.routes[0].geometry.coordinates;
              const routePositions = coordinates.map(
                (coord: [number, number]) =>
                  [coord[1], coord[0]] as [number, number]
              );

              segments.push({
                positions: routePositions,
                color: "#DC2626",
                weight: 4,
                opacity: 0.9,
              });
            } else {
              throw new Error("No routes found in response");
            }
          } else {
            throw new Error(
              `HTTP ${routeResponse.status}: ${routeResponse.statusText}`
            );
          }
        } catch (error) {
          console.warn("⚠️ OSRM API failed, using straight line:", error);
          // Fallback to straight line if API fails
          const routeToNextStation = [
            [bus.position.lat, bus.position.lng],
            [nextStation.position.lat, nextStation.position.lng],
          ] as [number, number][];

          segments.push({
            positions: routeToNextStation,
            color: "#DC2626",
            weight: 4,
            opacity: 0.9,
          });
        }
      }
      // Xe đã hoàn thành tất cả trạm, hiển thị route đến trường
      else {
        try {
          const routeResponse = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${bus.position.lng},${bus.position.lat};${bus.route.school.position.lng},${bus.route.school.position.lat}?overview=full&geometries=geojson`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
              signal: AbortSignal.timeout(5000),
            }
          );

          if (routeResponse.ok) {
            const routeData = await routeResponse.json();
            if (routeData.routes && routeData.routes.length > 0) {
              const coordinates = routeData.routes[0].geometry.coordinates;
              const routePositions = coordinates.map(
                (coord: [number, number]) =>
                  [coord[1], coord[0]] as [number, number]
              );

              segments.push({
                positions: routePositions,
                color: "#0D6EFD",
                weight: 4,
                opacity: 0.9,
              });
            } else {
              throw new Error("No routes found");
            }
          } else {
            throw new Error(`HTTP ${routeResponse.status}`);
          }
        } catch (error) {
          console.warn(
            "⚠️ OSRM API failed for final school route, using straight line:",
            error
          );
          // Fallback to straight line if API fails
          const routeToSchool = [
            [bus.position.lat, bus.position.lng],
            [bus.route.school.position.lat, bus.route.school.position.lng],
          ] as [number, number][];

          segments.push({
            positions: routeToSchool,
            color: "#0D6EFD",
            weight: 4,
            opacity: 0.9,
          });
        }
      }

      setRouteSegments(segments);
    } catch (error) {
      console.error("❌ Error calculating route segments:", error);
      // Fallback to straight line on error
      const stations = bus.route.stations;
      const currentIndex = bus.currentStationIndex;
      if (currentIndex < stations.length) {
        const nextStation = stations[currentIndex];
        const routeToNextStation = [
          [bus.position.lat, bus.position.lng],
          [nextStation.position.lat, nextStation.position.lng],
        ] as [number, number][];

        setRouteSegments([
          {
            positions: routeToNextStation,
            color: "#DC2626",
            weight: 4,
            opacity: 0.9,
          },
        ]);
      } else {
        setRouteSegments([]);
      }
    } finally {
      setIsLoadingRoute(false);
    }
  }, []);

  // ✅ Real-time movement logic với routing API và tốc độ nhanh hơn
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
              lastUpdate: new Date().toLocaleTimeString("vi-VN"),
            };
          }

          const currentStationIndex = bus.currentStationIndex;
          const stations = bus.route.stations;

          // Kiểm tra an toàn cho bus route
          if (!stations || !Array.isArray(stations)) {
            console.warn(`⚠️ Invalid stations array for bus ${bus.id}`);
            return {
              ...bus,
              lastUpdate: new Date().toLocaleTimeString("vi-VN"),
            };
          }

          // Kiểm tra đã hoàn thành tất cả trạm
          if (currentStationIndex >= stations.length) {
            if (bus.route.currentStatus !== "completed") {
              const school = bus.route.school;

              // Nếu không có trạm nào, sử dụng OSRM để đi đến trường
              if (stations.length === 0) {
                const routeKey = "depot-to-school";
                const cachedRoute = busRouteCache[bus.id]?.[routeKey];

                if (cachedRoute && cachedRoute.length > 0) {
                  // Tìm vị trí hiện tại trong route
                  const currentPos = [bus.position.lat, bus.position.lng];
                  let closestIndex = 0;
                  let minDistance = Infinity;

                  for (let i = 0; i < cachedRoute.length; i++) {
                    const distance = Math.sqrt(
                      Math.pow(cachedRoute[i][0] - currentPos[0], 2) +
                        Math.pow(cachedRoute[i][1] - currentPos[1], 2)
                    );
                    if (distance < minDistance) {
                      minDistance = distance;
                      closestIndex = i;
                    }
                  }

                  // Di chuyển đến điểm tiếp theo trong route
                  const nextIndex = Math.min(
                    closestIndex + 3,
                    cachedRoute.length - 1
                  ); // Nhảy 3 điểm để tăng tốc
                  const nextPoint = cachedRoute[nextIndex];

                  if (nextIndex >= cachedRoute.length - 1) {
                    // ✅ Kiểm tra thực sự hoàn thành chưa
                    const isCompleted = isBusReallyCompleted({
                      ...bus,
                      position: school.position,
                    });

                    return {
                      ...bus,
                      position: school.position,
                      speed: 0,
                      route: {
                        ...bus.route,
                        currentStatus: isCompleted
                          ? "completed"
                          : "going_to_school",
                      },
                      lastUpdate: new Date().toLocaleTimeString("vi-VN"),
                    };
                  } else {
                    return {
                      ...bus,
                      position: {
                        lat: nextPoint[0],
                        lng: nextPoint[1],
                      },
                      speed: 45,
                      route: { ...bus.route, currentStatus: "going_to_school" },
                      lastUpdate: new Date().toLocaleTimeString("vi-VN"),
                    };
                  }
                } else {
                  // Fallback to straight line nếu không có cached route
                  const distanceToSchool = Math.sqrt(
                    Math.pow(school.position.lat - bus.position.lat, 2) +
                      Math.pow(school.position.lng - bus.position.lng, 2)
                  );

                  if (distanceToSchool <= 0.001) {
                    return {
                      ...bus,
                      position: school.position,
                      speed: 0,
                      route: { ...bus.route, currentStatus: "completed" },
                      lastUpdate: new Date().toLocaleTimeString("vi-VN"),
                    };
                  } else {
                    const moveStep = 0.0015;
                    const latDiff = school.position.lat - bus.position.lat;
                    const lngDiff = school.position.lng - bus.position.lng;
                    const distance = Math.sqrt(
                      latDiff * latDiff + lngDiff * lngDiff
                    );
                    const ratio = Math.min(moveStep / distance, 1);

                    return {
                      ...bus,
                      position: {
                        lat: bus.position.lat + latDiff * ratio,
                        lng: bus.position.lng + lngDiff * ratio,
                      },
                      speed: 45,
                      route: { ...bus.route, currentStatus: "going_to_school" },
                      lastUpdate: new Date().toLocaleTimeString("vi-VN"),
                    };
                  }
                }
              }

              // Sử dụng cached route từ trạm cuối đến trường (với kiểm tra an toàn)
              const lastStation =
                stations.length > 0 ? stations[stations.length - 1] : null;
              const routeKey = lastStation
                ? `${lastStation.id}-to-school`
                : null;
              const cachedRoute = routeKey
                ? busRouteCache[bus.id]?.[routeKey]
                : null;

              if (cachedRoute && cachedRoute.length > 0 && lastStation) {
                // Tìm vị trí hiện tại trong route
                const currentPos = [bus.position.lat, bus.position.lng];
                let closestIndex = 0;
                let minDistance = Infinity;

                for (let i = 0; i < cachedRoute.length; i++) {
                  const distance = Math.sqrt(
                    Math.pow(cachedRoute[i][0] - currentPos[0], 2) +
                      Math.pow(cachedRoute[i][1] - currentPos[1], 2)
                  );
                  if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = i;
                  }
                }

                // Di chuyển đến điểm tiếp theo trong route
                const nextIndex = Math.min(
                  closestIndex + 3,
                  cachedRoute.length - 1
                ); // Nhảy 3 điểm để tăng tốc
                const nextPoint = cachedRoute[nextIndex];

                if (nextIndex >= cachedRoute.length - 1) {
                  // ✅ Kiểm tra thực sự hoàn thành chưa
                  const isCompleted = isBusReallyCompleted({
                    ...bus,
                    position: school.position,
                  });

                  return {
                    ...bus,
                    position: school.position,
                    speed: 0,
                    route: {
                      ...bus.route,
                      currentStatus: isCompleted
                        ? "completed"
                        : "going_to_school",
                    },
                    lastUpdate: new Date().toLocaleTimeString("vi-VN"),
                  };
                } else {
                  return {
                    ...bus,
                    position: {
                      lat: nextPoint[0],
                      lng: nextPoint[1],
                    },
                    speed: 45,
                    route: { ...bus.route, currentStatus: "going_to_school" },
                    lastUpdate: new Date().toLocaleTimeString("vi-VN"),
                  };
                }
              } else {
                // Fallback to straight line movement cho xe không có trạm
                console.warn(
                  `⚠️ No cached route found for bus ${bus.id} depot-to-school, using straight line`
                );
                const distanceToSchool = Math.sqrt(
                  Math.pow(school.position.lat - bus.position.lat, 2) +
                    Math.pow(school.position.lng - bus.position.lng, 2)
                );

                if (distanceToSchool <= 0.001) {
                  // ✅ Kiểm tra thực sự hoàn thành chưa (fallback case)
                  const isCompleted = isBusReallyCompleted({
                    ...bus,
                    position: school.position,
                  });

                  return {
                    ...bus,
                    position: school.position,
                    speed: 0,
                    route: {
                      ...bus.route,
                      currentStatus: isCompleted
                        ? "completed"
                        : "going_to_school",
                    },
                    lastUpdate: new Date().toLocaleTimeString("vi-VN"),
                  };
                } else {
                  const moveStep = 0.0015;
                  const latDiff = school.position.lat - bus.position.lat;
                  const lngDiff = school.position.lng - bus.position.lng;
                  const distance = Math.sqrt(
                    latDiff * latDiff + lngDiff * lngDiff
                  );
                  const ratio = Math.min(moveStep / distance, 1);

                  return {
                    ...bus,
                    position: {
                      lat: bus.position.lat + latDiff * ratio,
                      lng: bus.position.lng + lngDiff * ratio,
                    },
                    speed: 45,
                    route: { ...bus.route, currentStatus: "going_to_school" },
                    lastUpdate: new Date().toLocaleTimeString("vi-VN"),
                  };
                }
              }
            }
            return bus;
          }

          const currentStation = stations[currentStationIndex];

          // Kiểm tra an toàn cho currentStation
          if (!currentStation) {
            console.warn(
              `⚠️ Current station not found for bus ${bus.id}, index ${currentStationIndex}`
            );
            return bus;
          }

          // ✅ DEBUG: Log chi tiết về trạm hiện tại
          console.log(`🚌 Bus ${bus.name} đang đi đến:`, {
            currentStationIndex,
            stationId: currentStation.id,
            stationName: currentStation.name,
            position: currentStation.position,
            originalDiemDungId: (currentStation as any).originalDiemDungId,
            thuTu: (currentStation as any).thuTu,
            totalStations: stations.length,
          });

          // Xác định route key
          let routeKey: string;
          if (currentStationIndex === 0) {
            routeKey = `depot-to-${currentStation.id}`;
          } else {
            const previousStation = stations[currentStationIndex - 1];
            if (!previousStation) {
              console.warn(
                `⚠️ Previous station not found for bus ${bus.id}, index ${
                  currentStationIndex - 1
                }`
              );
              return bus;
            }
            routeKey = `${previousStation.id}-to-${currentStation.id}`;
          }

          // Sử dụng cached route
          const cachedRoute = busRouteCache[bus.id]?.[routeKey];

          if (cachedRoute && cachedRoute.length > 0) {
            // Tìm vị trí hiện tại trong route
            const currentPos = [bus.position.lat, bus.position.lng];
            let closestIndex = 0;
            let minDistance = Infinity;

            for (let i = 0; i < cachedRoute.length; i++) {
              const distance = Math.sqrt(
                Math.pow(cachedRoute[i][0] - currentPos[0], 2) +
                  Math.pow(cachedRoute[i][1] - currentPos[1], 2)
              );
              if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
              }
            }

            // Di chuyển đến điểm tiếp theo trong route
            const nextIndex = Math.min(
              closestIndex + 2,
              cachedRoute.length - 1
            ); // Nhảy 2 điểm để tăng tốc
            const nextPoint = cachedRoute[nextIndex];

            // Kiểm tra đã đến trạm
            if (nextIndex >= cachedRoute.length - 1) {
              // ✅ SHARED MODE: Kiểm tra xem trạm này đã được đón bởi bất kì xe nào chưa
              const isAlreadyPickedUp =
                bus.pickedUpStations?.includes(currentStation.id) || false;

              console.log(`🔍 SHARED DEBUG PICKUP CHECK cho ${bus.name}:`, {
                currentStationId: currentStation.id,
                currentStationName: currentStation.name,
                busPickedUpStations: bus.pickedUpStations,
                isAlreadyPickedUp,
                currentStationIndex: bus.currentStationIndex,
                totalStations: bus.route.stations.length,
              });

              if (isAlreadyPickedUp) {
                console.log(
                  `⚠️ SHARED MODE: Station ${currentStation.name} (${currentStation.id}) already picked up globally, ${bus.name} skipping...`
                );
                // ✅ Bỏ qua trạm này và chuyển sang trạm tiếp theo
                setBuses((prev) =>
                  prev.map((b) => {
                    if (b.id === bus.id) {
                      const nextIndex = b.currentStationIndex + 1;
                      const newStatus =
                        nextIndex >= b.route.stations.length
                          ? "going_to_school"
                          : "picking_up";

                      console.log(
                        `🔄 SHARED: ${b.name} skipping to station ${nextIndex}/${b.route.stations.length}`
                      );

                      return {
                        ...b,
                        currentStationIndex: nextIndex,
                        route: { ...b.route, currentStatus: newStatus },
                      };
                    }
                    return b;
                  })
                );

                return bus; // Return early
              }

              // ✅ Random thời gian dừng từ 5-10 giây
              const pickupTime =
                Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;

              stopTimersRef.current[stopTimerKey] = setTimeout(() => {
                console.log(
                  `✅ ${bus.name} arrived at ${
                    currentStation.name
                  } - Đón học sinh trong ${pickupTime / 1000}s`
                );

                handleStationPickup(currentStation.id);

                setBuses((prev) =>
                  prev.map((b) => {
                    if (b.id === bus.id) {
                      const nextIndex = b.currentStationIndex + 1;
                      // ✅ Cải thiện logic trạng thái
                      const newStatus =
                        nextIndex >= b.route.stations.length
                          ? "going_to_school"
                          : "picking_up";

                      return {
                        ...b,
                        currentStationIndex: nextIndex,
                        route: { ...b.route, currentStatus: newStatus },
                      };
                    }
                    return b;
                  })
                );

                delete stopTimersRef.current[stopTimerKey];
              }, pickupTime);

              return {
                ...bus,
                position: currentStation.position,
                speed: 0,
                lastUpdate: new Date().toLocaleTimeString("vi-VN"),
              };
            } else {
              // Di chuyển theo route
              return {
                ...bus,
                position: {
                  lat: nextPoint[0],
                  lng: nextPoint[1],
                },
                speed: 40,
                lastUpdate: new Date().toLocaleTimeString("vi-VN"),
                nextStop: {
                  station: currentStation,
                  estimatedArrival: new Date(
                    Date.now() + (cachedRoute.length - nextIndex) * 3000
                  ).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              };
            }
          } else {
            // Fallback to straight line movement
            const distanceToStation = Math.sqrt(
              Math.pow(currentStation.position.lat - bus.position.lat, 2) +
                Math.pow(currentStation.position.lng - bus.position.lng, 2)
            );

            // Đã đến trạm
            if (distanceToStation <= 0.001) {
              // ✅ SHARED MODE: Kiểm tra xem trạm này đã được đón bởi bất kì xe nào chưa (fallback case)
              const isAlreadyPickedUp =
                bus.pickedUpStations?.includes(currentStation.id) || false;

              console.log(
                `🔍 SHARED DEBUG PICKUP CHECK (fallback) cho ${bus.name}:`,
                {
                  currentStationId: currentStation.id,
                  currentStationName: currentStation.name,
                  busPickedUpStations: bus.pickedUpStations,
                  isAlreadyPickedUp,
                  currentStationIndex: bus.currentStationIndex,
                  totalStations: bus.route.stations.length,
                }
              );

              if (isAlreadyPickedUp) {
                console.log(
                  `⚠️ SHARED MODE: Station ${currentStation.name} (${currentStation.id}) already picked up globally, ${bus.name} skipping (fallback)...`
                );
                // ✅ Bỏ qua trạm này và chuyển sang trạm tiếp theo
                setBuses((prev) =>
                  prev.map((b) => {
                    if (b.id === bus.id) {
                      const nextIndex = b.currentStationIndex + 1;
                      const newStatus =
                        nextIndex >= b.route.stations.length
                          ? "going_to_school"
                          : "picking_up";

                      console.log(
                        `🔄 SHARED (fallback): ${b.name} skipping to station ${nextIndex}/${b.route.stations.length}`
                      );

                      return {
                        ...b,
                        currentStationIndex: nextIndex,
                        route: { ...b.route, currentStatus: newStatus },
                      };
                    }
                    return b;
                  })
                );

                return bus; // Return early
              }

              // ✅ Random thời gian dừng từ 5-10 giây
              const pickupTime =
                Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;

              stopTimersRef.current[stopTimerKey] = setTimeout(() => {
                console.log(
                  `✅ ${bus.name} arrived at ${
                    currentStation.name
                  } - Đón học sinh trong ${pickupTime / 1000}s`
                );

                handleStationPickup(currentStation.id);

                setBuses((prev) =>
                  prev.map((b) => {
                    if (b.id === bus.id) {
                      const nextIndex = b.currentStationIndex + 1;
                      // ✅ Cải thiện logic trạng thái
                      const newStatus =
                        nextIndex >= b.route.stations.length
                          ? "going_to_school"
                          : "picking_up";

                      return {
                        ...b,
                        currentStationIndex: nextIndex,
                        route: { ...b.route, currentStatus: newStatus },
                      };
                    }
                    return b;
                  })
                );

                delete stopTimersRef.current[stopTimerKey];
              }, pickupTime);

              return {
                ...bus,
                position: currentStation.position,
                speed: 0,
                lastUpdate: new Date().toLocaleTimeString("vi-VN"),
              };
            } else {
              // Di chuyển đến trạm với tốc độ nhanh hơn
              const moveStep = 0.0015;
              const latDiff = currentStation.position.lat - bus.position.lat;
              const lngDiff = currentStation.position.lng - bus.position.lng;
              const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
              const ratio = Math.min(moveStep / distance, 1);

              return {
                ...bus,
                position: {
                  lat: bus.position.lat + latDiff * ratio,
                  lng: bus.position.lng + lngDiff * ratio,
                },
                speed: 40,
                lastUpdate: new Date().toLocaleTimeString("vi-VN"),
                nextStop: {
                  station: currentStation,
                  estimatedArrival: new Date(
                    Date.now() + (distance / moveStep) * 3000
                  ).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              };
            }
          }
        })
      );
    }, 3000); // Interval 3000ms

    return () => {
      clearInterval(interval);
      Object.values(stopTimersRef.current).forEach((timer) =>
        clearTimeout(timer)
      );
      stopTimersRef.current = {};
    };
  }, [isRealTime, buses.length, handleStationPickup]);

  // ✅ Update selectedBus - SHARED MODE
  useEffect(() => {
    if (!selectedBus) return;

    const updatedBus = buses.find((b) => b.id === selectedBus.id);
    if (
      updatedBus &&
      (updatedBus.currentStationIndex !== selectedBus.currentStationIndex ||
        updatedBus.position.lat !== selectedBus.position.lat ||
        JSON.stringify(updatedBus.pickedUpStations) !==
          JSON.stringify(selectedBus.pickedUpStations))
    ) {
      console.log(
        `🔄 SHARED: Updating selectedBus ${selectedBus.name} with new state`
      );
      setSelectedBus(updatedBus);
    }
  }, [buses, selectedBus]);

  // ✅ Helper functions
  const getProgressPercentage = (bus: Bus) => {
    const totalStations = bus.route.stations.length;
    // ✅ Đếm unique stations đã được picked up
    const uniquePickedUpStations = new Set(bus.pickedUpStations || []).size;
    return totalStations > 0
      ? (uniquePickedUpStations / totalStations) * 100
      : 0;
  };

  // ✅ Helper để đếm unique picked up stations
  const getUniquePickedUpCount = (bus: Bus) => {
    return new Set(bus.pickedUpStations || []).size;
  };

  const isStationPickedUp = (bus: Bus, stationId: string): boolean => {
    return bus.pickedUpStations?.includes(stationId) || false;
  };

  // ✅ Kiểm tra xe bus có thực sự hoàn thành chưa
  const isBusReallyCompleted = (bus: Bus): boolean => {
    const totalStations = bus.route.stations.length;
    const pickedUpStations = bus.pickedUpStations?.length || 0;

    // Chỉ hoàn thành khi đã đón hết học sinh TẠI TẤT CẢ trạm và đã đến trường
    const allStationsCompleted =
      totalStations > 0 ? pickedUpStations === totalStations : true;
    const atSchool = bus.currentStationIndex >= totalStations;
    const nearSchool =
      Math.sqrt(
        Math.pow(bus.route.school.position.lat - bus.position.lat, 2) +
          Math.pow(bus.route.school.position.lng - bus.position.lng, 2)
      ) <= 0.001;

    return allStationsCompleted && atSchool && nearSchool;
  };

  const getCurrentStationInfo = (bus: Bus) => {
    if (bus.currentStationIndex < bus.route.stations.length) {
      return bus.route.stations[bus.currentStationIndex];
    }
    return null;
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
        return "Chờ bắt đầu";
      case "picking_up":
        return "Đang đón học sinh";
      case "going_to_school":
        return "Đến trường";
      case "completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const toggleRealTime = () => {
    if (!isRealTime) {
      // ✅ Khi bật real-time, chuyển tất cả xe từ "waiting" sang "picking_up"
      setBuses((prevBuses) =>
        prevBuses.map((bus) => ({
          ...bus,
          route: {
            ...bus.route,
            currentStatus:
              bus.route.stations.length > 0 ? "picking_up" : "going_to_school",
          },
        }))
      );
    }
    setIsRealTime(!isRealTime);
  };

  const resetSimulation = async () => {
    const dbData = await fetchDataFromDBWithStations();
    if (dbData) {
      const busData = convertDBDataToBusWithStations(dbData);

      // ✅ Reset tất cả xe về trạng thái ban đầu
      const resetBusData = busData.map((bus) => ({
        ...bus,
        route: {
          ...bus.route,
          currentStatus: "waiting" as const,
        },
        currentStationIndex: 0,
        pickedUpStations: [],
        position: {
          lat: 10.782622,
          lng: 106.640172,
        },
        speed: 0,
      }));

      setBuses(resetBusData);
      if (resetBusData.length > 0) {
        setSelectedBus(resetBusData[0]);
        calculateRouteSegments(resetBusData[0]);
        // Reset và pre-load lại routes
        setBusRouteCache({});
        await preloadBusRoutes(resetBusData);
      }
    }
    setIsRealTime(false);
  };

  const skipCurrentStop = () => {
    if (selectedBus) {
      setBuses((prev) =>
        prev.map((bus) => {
          if (bus.id === selectedBus.id) {
            const nextIndex = bus.currentStationIndex + 1;
            const newStatus =
              nextIndex === bus.route.stations.length
                ? "going_to_school"
                : "picking_up";

            return {
              ...bus,
              currentStationIndex: nextIndex,
              route: { ...bus.route, currentStatus: newStatus },
            };
          }
          return bus;
        })
      );
    }
  };

  const handleBusSelect = (bus: Bus | null) => {
    setSelectedBus(bus);
    if (bus) {
      calculateRouteSegments(bus);
    } else {
      setRouteSegments([]);
    }
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

  // Chỉ render sau khi component đã mount để tránh hydration error
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Vị trí xe bus học sinh | Hệ thống trạm</title>
      </Head>
      <Container fluid>
        <Row className="my-4">
          <Col>
            <h1>Theo dõi xe bus học sinh - Hệ thống trạm</h1>
            <div className="d-flex align-items-center gap-3 mb-3">
              <Badge bg={isRealTime ? "success" : "secondary"}>
                {isRealTime
                  ? "Đang cập nhật real-time (3s)"
                  : "Chế độ xem tĩnh"}
              </Badge>
              {Object.keys(busRouteCache).length > 0 && (
                <Badge bg="info">
                  🗺️ Routes loaded: {Object.keys(busRouteCache).length} xe
                </Badge>
              )}
              <Badge bg={osrmApiAvailable ? "success" : "warning"}>
                {osrmApiAvailable ? "🌐 OSRM API OK" : "📍 Straight Lines"}
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
              {selectedBus && (
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={skipCurrentStop}
                >
                  ⏭️ Bỏ qua trạm
                </Button>
              )}
            </div>

            {selectedBus && isRealTime && (
              <Card className="mb-3 bg-light">
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{selectedBus.name}</strong> -
                      {getCurrentStationInfo(selectedBus) ? (
                        <span className="text-warning">
                          🚏 Tại trạm:{" "}
                          <strong>
                            {getCurrentStationInfo(selectedBus)?.name}
                          </strong>
                          {selectedBus.speed === 0 && (
                            <small className="text-muted">
                              {" "}
                              (đang đón học sinh 5-10s)
                            </small>
                          )}
                        </span>
                      ) : (
                        <span className="text-primary">
                          {getStatusText(selectedBus.route.currentStatus)}
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
                      }}
                    ></div>
                  </div>
                  <small className="text-muted mt-1 d-block">
                    Tiến trình: {Math.round(getProgressPercentage(selectedBus))}
                    % (Đã đến: {getUniquePickedUpCount(selectedBus)}/
                    {selectedBus.route.stations.length} trạm)
                  </small>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        <Row className="g-3">
          <Col lg={isFullscreen ? 12 : 7}>
            <Card className="shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Card.Title className="mb-0">
                    Bản đồ theo dõi
                    {selectedBus && (
                      <Badge
                        bg={getStatusColor(selectedBus.route.currentStatus)}
                        className="ms-2"
                      >
                        {getStatusText(selectedBus.route.currentStatus)}
                      </Badge>
                    )}
                  </Card.Title>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Thu nhỏ" : "Mở rộng"}
                  >
                    {isFullscreen ? "🗗" : "⛶"}
                  </Button>
                </div>
                <div
                  style={{
                    height: isFullscreen ? "calc(100vh - 250px)" : "500px",
                  }}
                >
                  {buses.length > 0 ? (
                    <BusMap
                      buses={buses}
                      selectedBus={selectedBus}
                      onBusSelect={handleBusSelect}
                      onStationPickup={handleStationPickup}
                    />
                  ) : (
                    <div className="text-center py-5">
                      <h5>Không có dữ liệu xe bus</h5>
                      <p>Vui lòng kiểm tra database</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {!isFullscreen && (
            <Col lg={5}>
              <Card className="shadow-sm mb-3">
                <Card.Body className="p-3">
                  <Card.Title className="mb-2">Trạng thái hệ thống</Card.Title>
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                        <small>Chế độ:</small>
                        <Badge
                          bg={isRealTime ? "success" : "secondary"}
                          className="small"
                        >
                          {isRealTime ? "Real-time" : "Tĩnh"}
                        </Badge>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                        <small>Số xe:</small>
                        <Badge bg="primary" className="small">
                          {buses.length}
                        </Badge>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                        <small>Tổng trạm:</small>
                        <Badge bg="info" className="small">
                          {buses.reduce(
                            (total, bus) => total + bus.route.stations.length,
                            0
                          )}
                        </Badge>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                        <small>Cập nhật:</small>
                        <small className="text-muted">
                          {buses[0]?.lastUpdate || "--:--:--"}
                        </small>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {buses.length > 0 && (
                <Card className="shadow-sm mb-3">
                  <Card.Body>
                    <Card.Title>Danh sách xe ({buses.length})</Card.Title>
                    <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                      <ListGroup variant="flush">
                        {buses.map((bus) => (
                          <ListGroup.Item
                            key={bus.id}
                            action
                            active={selectedBus?.id === bus.id}
                            onClick={() => handleBusSelect(bus)}
                            className="py-2"
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center">
                                  <h6 className="mb-0">
                                    {bus.name}{" "}
                                    {getCurrentStationInfo(bus) && "🚏"}
                                  </h6>
                                  <Badge
                                    bg={getStatusColor(bus.route.currentStatus)}
                                    className="ms-2"
                                  >
                                    {getStatusText(bus.route.currentStatus)}
                                  </Badge>
                                </div>
                                <div className="d-flex justify-content-between mt-1">
                                  <small className="text-muted">
                                    {bus.licensePlate} • {bus.route.driver}
                                  </small>
                                  <small className="text-success fw-bold">
                                    {getUniquePickedUpCount(bus)}/
                                    {bus.route.stations.length}
                                  </small>
                                </div>
                                {getCurrentStationInfo(bus) && (
                                  <small className="text-warning d-block">
                                    🚏 {getCurrentStationInfo(bus)?.name}
                                  </small>
                                )}
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {selectedBus && (
                <Card className="shadow-sm">
                  <Card.Body>
                    <Card.Title className="d-flex justify-content-between align-items-center">
                      <span>Chi tiết: {selectedBus.name}</span>
                      <small className="text-muted">
                        {selectedBus.licensePlate}
                      </small>
                    </Card.Title>

                    {/* Compact Info */}
                    <div className="mb-3 p-2 bg-light rounded">
                      <div className="row g-0 text-center">
                        <div className="col-6">
                          <div className="text-primary">
                            <strong>
                              {Math.round(getProgressPercentage(selectedBus))}%
                            </strong>
                            <br />
                            <small>Tiến độ</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-success">
                            <strong>
                              {getUniquePickedUpCount(selectedBus)}/
                              {selectedBus.route.stations.length}
                            </strong>
                            <br />
                            <small>Trạm hoàn thành</small>
                          </div>
                        </div>
                      </div>
                      <div className="progress mt-2" style={{ height: "8px" }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${getProgressPercentage(selectedBus)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <Tabs defaultActiveKey="stations" className="mb-3">
                      {/* Tab Trạm */}
                      <Tab
                        eventKey="stations"
                        title={`Trạm (${selectedBus.route.stations.length})`}
                      >
                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                          {selectedBus.route.stations.map((station, index) => {
                            const isPickedUp = isStationPickedUp(
                              selectedBus,
                              station.id
                            );
                            const isCurrent =
                              index === selectedBus.currentStationIndex;

                            return (
                              <div
                                key={station.id}
                                className={`d-flex align-items-center p-2 mb-2 rounded ${
                                  isCurrent
                                    ? "bg-warning-subtle border border-warning"
                                    : isPickedUp
                                    ? "bg-success-subtle"
                                    : "bg-light"
                                }`}
                                style={{
                                  opacity: isPickedUp && !isCurrent ? 0.6 : 1,
                                }}
                              >
                                <div className="me-2">
                                  <Badge
                                    bg={
                                      isCurrent
                                        ? "warning"
                                        : isPickedUp
                                        ? "success"
                                        : "secondary"
                                    }
                                  >
                                    {index + 1}
                                  </Badge>
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium">
                                      {station.name}
                                    </span>
                                    <div>
                                      {isCurrent && (
                                        <Badge bg="warning">Đang tại</Badge>
                                      )}
                                      {isPickedUp && !isCurrent && (
                                        <Badge bg="success">✓</Badge>
                                      )}
                                    </div>
                                  </div>
                                  <small className="text-muted">
                                    {station.studentCount} học sinh
                                    {station.estimatedArrival &&
                                      ` • ${station.estimatedArrival}`}
                                  </small>
                                </div>
                              </div>
                            );
                          })}

                          {/* Trường học - compact */}
                          <div
                            className={`d-flex align-items-center p-2 mt-3 rounded ${
                              selectedBus.route.currentStatus === "completed"
                                ? "bg-success-subtle border border-success"
                                : "bg-primary-subtle"
                            }`}
                          >
                            <div className="me-2">
                              <Badge bg="primary">🏫</Badge>
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-medium">
                                  {selectedBus.route.school.name}
                                </span>
                                {selectedBus.route.currentStatus ===
                                  "going_to_school" && (
                                  <Badge bg="primary">Đang đến</Badge>
                                )}
                                {selectedBus.route.currentStatus ===
                                  "completed" && (
                                  <Badge bg="success">✓ Đã đến</Badge>
                                )}
                              </div>
                              <small className="text-muted">
                                Giờ vào lớp:{" "}
                                {selectedBus.route.school.startTime}
                              </small>
                            </div>
                          </div>
                        </div>
                      </Tab>

                      {/* Tab Thông tin */}
                      <Tab eventKey="info" title="Thông tin">
                        <div className="row g-2">
                          <div className="col-12">
                            <Card className="border-0 bg-light">
                              <Card.Body className="py-2">
                                <h6>🚌 Thông tin xe</h6>
                                <p className="mb-1">
                                  <strong>Biển số:</strong>{" "}
                                  {selectedBus.licensePlate}
                                </p>
                                <p className="mb-1">
                                  <strong>Tài xế:</strong>{" "}
                                  {selectedBus.route.driver}
                                </p>
                                <p className="mb-1">
                                  <strong>Tuyến:</strong>{" "}
                                  {selectedBus.route.name}
                                </p>
                                <p className="mb-0">
                                  <strong>Tốc độ:</strong>{" "}
                                  {selectedBus.speed || 0} km/h
                                </p>
                              </Card.Body>
                            </Card>
                          </div>
                          <div className="col-12">
                            <Card className="border-0 bg-light">
                              <Card.Body className="py-2">
                                <h6>📊 Thống kê</h6>
                                <div className="row text-center">
                                  <div className="col-4">
                                    <div className="text-primary">
                                      <strong>
                                        {selectedBus.route.stations.length}
                                      </strong>
                                      <br />
                                      <small>Tổng trạm</small>
                                    </div>
                                  </div>
                                  <div className="col-4">
                                    <div className="text-success">
                                      <strong>
                                        {getUniquePickedUpCount(selectedBus)}
                                      </strong>
                                      <br />
                                      <small>Đã hoàn thành</small>
                                    </div>
                                  </div>
                                  <div className="col-4">
                                    <div className="text-warning">
                                      <strong>
                                        {selectedBus.route.stations.reduce(
                                          (sum, s) => sum + s.studentCount,
                                          0
                                        )}
                                      </strong>
                                      <br />
                                      <small>Học sinh</small>
                                    </div>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </div>
                        </div>
                      </Tab>
                    </Tabs>
                  </Card.Body>
                </Card>
              )}
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
};

export default VehiclesPage;
