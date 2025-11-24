"use client";
import Header from "../components/Header";
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
import { 
  ExtendedBus, 
  ExtendedBusRoute, 
  ExtendedStation, 
  StudentData, 
  StudentAllocation,
  School 
} from "../../types/bus";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { useRouter } from "next/navigation";

// Dynamic import BusMap với ssr: false
const BusMap = dynamic(() => import("../components/BusMap"), {
  ssr: false,
  loading: () => (
    <div className="text-center py-5">
      <p>Đang tải bản đồ...</p>
    </div>
  )
});

// Service functions để fetch data từ cả hai API
const fetchCombinedDataFromDB = async () => {
  try {
    console.log("🔄 Fetching combined data from both APIs...");
    
    // Fetch từ cả hai API song song
    const [mapData, trackingData] = await Promise.all([
      // API Map
      fetch("http://localhost:5000/api/bus/map-data").then(res => {
        if (!res.ok) throw new Error(`Map API error: ${res.status}`);
        return res.json();
      }),
      // API Tracking
      fetch("http://localhost:5000/api/tracking/bus-data").then(res => {
        if (!res.ok) {
          console.warn("⚠️ Tracking API not available, using map data only");
          return { success: true, data: {} };
        }
        return res.json();
      }).catch(error => {
        console.warn("⚠️ Tracking API failed:", error);
        return { success: true, data: {} };
      })
    ]);

    // Kiểm tra kết quả
    if (!mapData.success) {
      throw new Error(mapData.error || "Map API failed");
    }

    // Kết hợp dữ liệu từ cả hai nguồn
    const combinedData = {
      // Dữ liệu từ Map API
      ...mapData.data,
      // Bổ sung dữ liệu từ Tracking API nếu có
      ...(trackingData.success ? trackingData.data : {})
    };

    console.log("✅ Combined data loaded successfully");
    console.log("📊 Data sources:", {
      mapData: Object.keys(mapData.data || {}),
      trackingData: trackingData.success ? Object.keys(trackingData.data || {}) : 'none'
    });

    return combinedData;
  } catch (error) {
    console.error("❌ Error fetching combined data:", error);
    
    // Thử fallback chỉ với Map API
    try {
      console.log("🔄 Trying fallback to Map API only...");
      const mapResponse = await fetch("http://localhost:5000/api/bus/map-data");
      if (mapResponse.ok) {
        const mapData = await mapResponse.json();
        if (mapData.success) {
          console.log("✅ Fallback to Map API successful");
          return mapData.data;
        }
      }
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError);
    }

    return null;
  }
};

// Hàm tính khoảng cách giữa 2 điểm
const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
  const latDiff = point2.lat - point1.lat;
  const lngDiff = point2.lng - point1.lng;
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
};

// Hàm tính tổng khoảng cách lộ trình
const calculateTotalRouteDistance = (bus: ExtendedBus): number => {
  const stations = bus.route.stations;
  const school = bus.route.school;
  
  if (stations.length === 0) return 0;

  let totalDistance = 0;
  
  if (bus.isDonXe) {
    // CHIỀU ĐÓN: Điểm xuất phát → Các điểm đón → Trường
    const points = [
      { lat: 10.782622, lng: 106.640172 },
      ...stations.map(s => s.position),
      school.position
    ];

    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += calculateDistance(points[i], points[i + 1]);
    }
  } else {
    // CHIỀU TRẢ: Trường → Các điểm trả → Điểm kết thúc
    const points = [
      school.position,
      ...stations.map(s => s.position),
      { lat: 10.782622, lng: 106.640172 }
    ];

    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += calculateDistance(points[i], points[i + 1]);
    }
  }

  return totalDistance;
};

const convertDBDataToBus = (dbData: any, targetStudentName: string): ExtendedBus[] => {
  if (!dbData) return [];

  // Xử lý cả hai cấu trúc dữ liệu có thể có
  const {
    // Từ Map API
    diemdung = [],
    phanbohocsinhtram = [],
    phanbotramxe = [],
    chitiettuyenduong = [],
    
    // Từ Tracking API
    hocsinh = [],
    diachi = [],
    vitrithuc = [],
    taixe = [],
    xebuyt = [],
    chuyenxe = [],
    lichtrinh = [],
    tuyenduong = [],
    vitrichuyenxe = []
  } = dbData;

  // Log để debug
  console.log("📊 Data structure analysis:", {
    diemdung: diemdung.length,
    phanbohocsinhtram: phanbohocsinhtram.length,
    phanbotramxe: phanbotramxe.length,
    hocsinh: hocsinh.length,
    chuyenxe: chuyenxe.length,
    lichtrinh: lichtrinh.length
  });

  // Lấy thời gian hiện tại
  const now = new Date();
  const today = now.toLocaleDateString('en-CA');
  const currentTimeStr = now.toTimeString().substring(0, 8);
  
  console.log("🎯 Target student:", targetStudentName);

  // TÌM HỌC SINH MỤC TIÊU - hỗ trợ cả hai cấu trúc
  let targetStudent = hocsinh.find((hs: any) => hs.tenHocSinh === targetStudentName);
  
  // Nếu không tìm thấy trong hocsinh, thử trong phanbohocsinhtram
  if (!targetStudent && phanbohocsinhtram.length > 0) {
    const studentAlloc = phanbohocsinhtram.find((pb: any) => 
      pb.tenHocSinh === targetStudentName
    );
    if (studentAlloc) {
      targetStudent = {
        maHocSinh: studentAlloc.maHocSinh,
        tenHocSinh: studentAlloc.tenHocSinh,
        lop: studentAlloc.lop
      };
    }
  }

  if (!targetStudent) {
    console.log("❌ Không tìm thấy học sinh:", targetStudentName);
    console.log("📋 Available students:", hocsinh.map((h: any) => h.tenHocSinh));
    return [];
  }

  // TÌM PHÂN BỐ TRẠM CỦA HỌC SINH
  const studentAllocations: StudentAllocation[] = phanbohocsinhtram.filter((pb: any) => 
    pb.maHocSinh === targetStudent.maHocSinh && 
    (pb.trangThai === 'Active' || pb.trangThai === undefined)
  );

  console.log("📋 Student allocations:", studentAllocations);

  if (studentAllocations.length === 0) {
    console.log("❌ Không tìm thấy phân bố trạm cho học sinh");
    return [];
  }

  // TÌM CÁC CHUYẾN XE LIÊN QUAN
  const relevantTrips: any[] = [];
  
  for (const allocation of studentAllocations) {
    // Tìm các phân bố trạm xe có cùng điểm dừng
    const busStopAllocations = phanbotramxe.filter((pbtx: any) => 
      pbtx.maDiemDung === allocation.maDiemDung && 
      (pbtx.trangThai === 'Active' || pbtx.trangThai === undefined)
    );
    
    for (const busAllocation of busStopAllocations) {
      const chuyen = chuyenxe.find((cx: any) => cx.maChuyenXe === busAllocation.maChuyenXe);
      if (chuyen && !relevantTrips.find(rt => rt.maChuyenXe === chuyen.maChuyenXe)) {
        const enrichedTrip = {
          ...chuyen,
          loaiPhanBo: allocation.loaiPhanBo
        };
        relevantTrips.push(enrichedTrip);
      }
    }
  }

  console.log("🚌 Relevant trips:", relevantTrips);

  // LỌC CHỈ NHỮNG CHUYẾN XE CÓ LỊCH TRÌNH HÔM NAY
  const filteredChuyenXe = relevantTrips.filter((chuyen: any) => {
    // Nếu không có lịch trình, giả sử chạy hôm nay
    if (!chuyen.maLichTrinh || lichtrinh.length === 0) {
      console.log(`ℹ️ Chuyen xe ${chuyen.maChuyenXe} - no schedule, assuming today`);
      return true;
    }

    const lich = lichtrinh.find((l: any) => l.maLichTrinh === chuyen.maLichTrinh);
    
    if (!lich || !lich.ngay) {
      console.log(`ℹ️ Chuyen xe ${chuyen.maChuyenXe} - no schedule date, assuming today`);
      return true;
    }

    let scheduleDate: string;
    if (typeof lich.ngay === 'string' && lich.ngay.includes('T')) {
      scheduleDate = new Date(lich.ngay).toLocaleDateString('en-CA');
    } else {
      scheduleDate = lich.ngay.split('T')[0];
    }

    const isToday = scheduleDate === today;
    if (!isToday) {
      console.log(`❌ Chuyen xe ${chuyen.maChuyenXe} skipped - wrong date: ${scheduleDate} vs ${today}`);
    }
    
    return isToday;
  });

  console.log("✅ Filtered chuyen xe:", filteredChuyenXe.length);

  // CHUYỂN ĐỔI DỮ LIỆU
  const busesWithSortInfo = filteredChuyenXe.map((chuyen: any) => {
    const xe = xebuyt.find((x: any) => x.maXeBuyt === chuyen.maXeBuyt);
    const taiXe = taixe.find((t: any) => t.maTaiXe === chuyen.maTaiXe);
    const lich = lichtrinh.find((l: any) => l.maLichTrinh === chuyen.maLichTrinh);
    const tuyen = tuyenduong.find((t: any) => t.maTuyenDuong === chuyen.maTuyenDuong);

    // Lấy vị trí hiện tại từ vitrichuyenxe
    const viTriChuyenXe = vitrichuyenxe?.find((vt: any) => vt.maChuyenXe === chuyen.maChuyenXe);
    const viTriThuc = viTriChuyenXe 
      ? vitrithuc?.find((vt: any) => vt.maViTriThuc === viTriChuyenXe.maViTriThuc)
      : null;

    // XÁC ĐỊNH LOẠI CHUYẾN (ĐÓN HAY TRẢ)
    const isDonXe = chuyen.loaiPhanBo === 'Sang';
    console.log(`🎯 Chuyen xe ${chuyen.maChuyenXe} is ${isDonXe ? 'ĐÓN' : 'TRẢ'}`);

    // Lấy danh sách stations từ phân bố trạm
    const busStations: ExtendedStation[] = [];
    
    const busStopAllocations = phanbotramxe
      .filter((pbtx: any) => 
        pbtx.maChuyenXe === chuyen.maChuyenXe
      )
      .sort((a:any, b:any) => (a.thuTuDon || 0) - (b.thuTuDon || 0));

    for (const busAllocation of busStopAllocations) {
      const studentAllocationsForStop = phanbohocsinhtram.filter((pb: any) => 
        pb.maDiemDung === busAllocation.maDiemDung && 
        pb.loaiPhanBo === chuyen.loaiPhanBo
      );
      
      // Tạo station từ điểm dừng
      const diemDungInfo = diemdung.find((dd: any) => dd.maDiemDung === busAllocation.maDiemDung);
      const stopLocation = diemDungInfo 
        ? vitrithuc.find((vt: any) => vt.maViTriThuc === diemDungInfo.maViTriThuc)
        : null;

      if (diemDungInfo && !busStations.find(bs => bs.id === diemDungInfo.maDiemDung.toString())) {
        const studentIds = studentAllocationsForStop.map((sa: any) => sa.maHocSinh.toString());
        
        busStations.push({
          id: diemDungInfo.maDiemDung.toString(),
          name: diemDungInfo.tenDiemDung,
          position: {
            lat: stopLocation?.viDo || diemDungInfo.viDo || 10.762622,
            lng: stopLocation?.kinhDo || diemDungInfo.kinhDo || 106.660172,
          },
          type: isDonXe ? "pickup" : "dropoff",
          studentCount: studentAllocationsForStop.length,
          studentIds: studentIds,
          loaiPhanBo: chuyen.loaiPhanBo,
          maDiemDung: diemDungInfo.maDiemDung,
          thuTuDon: busAllocation.thuTuDon,
          thoiGianDuKien: busAllocation.thoiGianDuKien,
          estimatedArrival: busAllocation.thoiGianDuKien?.substring(0, 5)
        });
      }
    }

    // SẮP XẾP LẠI DANH SÁCH STATIONS THEO THỨ TỰ ĐÓN
    busStations.sort((a, b) => (a.thuTuDon || 0) - (b.thuTuDon || 0));

    // Xác định trạng thái realtime
    const startTime = lich?.thoiGianDi ? lich.thoiGianDi + ':00' : '06:30:00';
    const endTime = lich?.thoiGianDen ? lich.thoiGianDen + ':00' : '07:15:00';
    
    const shouldStartRealtime = currentTimeStr >= startTime && currentTimeStr <= endTime;
    const isUpcoming = currentTimeStr < startTime;
    
    // XÁC ĐỊNH TRẠNG THÁI REAL-TIME
    let currentStatus: "waiting" | "picking_up" | "going_to_school" | "completed" = "waiting";
    
    if (currentTimeStr >= startTime && currentTimeStr <= endTime) {
      currentStatus = "picking_up";
    } else if (currentTimeStr > endTime) {
      currentStatus = "completed";
    }

    // Ẩn xe đã hoàn thành > 30 phút
    const endDateTime = new Date(`${today}T${endTime}`);
    endDateTime.setSeconds(endDateTime.getSeconds() - 1);
    
    const hideThreshold = new Date();
    hideThreshold.setMinutes(hideThreshold.getMinutes() + 30);
    
    const isHidden = new Date() > endDateTime && hideThreshold > endDateTime;

    console.log(`⏰ Bus ${chuyen.maChuyenXe}: ${currentTimeStr} vs ${startTime}-${endTime} = status:${currentStatus}, realtime:${shouldStartRealtime}, hidden:${isHidden}`);

    // Tạo route
    const busRoute: ExtendedBusRoute = {
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
      stations: busStations,
      currentStatus: currentStatus,
      currentStationIndex: 0,
      schedule: {
        startTime: startTime,
        endTime: endTime
      },
      isDonXe: isDonXe,
      loaiPhanBo: chuyen.loaiPhanBo
    };

    const bus : ExtendedBus = {
      id: chuyen.maChuyenXe.toString(),
      name: `Xe ${xe?.bienSoXe || chuyen.maChuyenXe}`,
      licensePlate: xe?.bienSoXe || "Unknown",
      route: busRoute,
      position: {
        lat: viTriThuc?.viDo || 10.782622,
        lng: viTriThuc?.kinhDo || 106.640172,
      },
      speed: 0,
      lastUpdate: new Date().toLocaleTimeString(),
      currentStationIndex: 0,
      nextStop: busStations.length > 0 ? {
        station: busStations[0],
        estimatedArrival: busStations[0].thoiGianDuKien?.substring(0, 5) || "06:30",
      } : undefined,
      pickedUpStations: [],
      shouldStartRealtime: shouldStartRealtime,
      isHidden: isHidden,
      actualStartTime: shouldStartRealtime ? currentTimeStr : undefined,
      totalDistance: 0,
      currentSegmentProgress: 0,
      isDonXe: isDonXe
    };

    // Tính tổng khoảng cách
    bus.totalDistance = calculateTotalRouteDistance(bus);

    return {
      bus,
      startTime: lich?.thoiGianDi || "00:00:00",
      isActive: shouldStartRealtime,
      isUpcoming: isUpcoming,
      isHidden: isHidden
    };
  });

  // Sắp xếp - ưu tiên xe không bị ẩn
  busesWithSortInfo.sort((a: any, b: any) => {
    if (!a.isHidden && b.isHidden) return -1;
    if (a.isHidden && !b.isHidden) return 1;
    
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    if (!a.isActive && !b.isActive) {
      if (a.isUpcoming && !b.isUpcoming) return -1;
      if (!a.isUpcoming && b.isUpcoming) return 1;
    }
    
    return a.startTime.localeCompare(b.startTime);
  });

  console.log("📋 Sorted buses:", busesWithSortInfo.length);
  
  return busesWithSortInfo.map((item: any) => item.bus) as ExtendedBus[];
};

const updateTripStatus = async (maChuyenXe: string, trangThai: string) => {
  try {
    const response = await fetch(`http://localhost:5000/api/chuyenxe/${maChuyenXe}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trangThai }),
    });

    if (response.ok) {
      console.log(`✅ Đã cập nhật trạng thái chuyến xe ${maChuyenXe} thành: ${trangThai}`);
    } else {
      console.error(`❌ Lỗi cập nhật trạng thái chuyến xe ${maChuyenXe}`);
    }
  } catch (error) {
    console.error('❌ Lỗi kết nối khi cập nhật trạng thái:', error);
  }
};

const VehiclesPage = ({ onLogout, onInfo }: { onLogout?: () => void; onInfo?: () => void }) => {
  const router = useRouter();
  const [buses, setBuses] = useState<ExtendedBus[]>([]);
  const [selectedBus, setSelectedBus] = useState<ExtendedBus | null>(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [notification, setNotification] = useState<{ message: string; timeAgo: string; type: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

  // Ref để lưu thời gian dừng tại mỗi điểm và animation
  const stopTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const studentRef = useRef<StudentData | null>(null);

  const sendPickupNotification = async (stationId: string, busId: string) => {
    try {
      const station = selectedBus?.route.stations.find(s => s.id === stationId);
      const bus = buses.find(b => b.id === busId);
      
      if (!station || !bus) return;

      const response = await fetch('http://localhost:5000/api/notifications/pickup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maDiemDung: parseInt(stationId),
          maChuyenXe: parseInt(busId),
          tenDiemDung: station.name,
          tenTaiXe: bus.route.driver,
          bienSoXe: bus.licensePlate
        })
      });

      if (response.ok) {
        console.log('✅ Thông báo đón học sinh đã được gửi');
      }
    } catch (error) {
      console.error('❌ Lỗi gửi thông báo:', error);
    }
  };

  const handleStationPickup = useCallback(
    (stationId: string, busId?: string) => {
      console.log(`🎒 Marking station ${stationId} as picked up for bus ${busId || selectedBus?.id}`);

      // Gửi thông báo
      const targetBusId = busId || selectedBus?.id;
      if (targetBusId) {
        sendPickupNotification(stationId, targetBusId);
      }

      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          const shouldUpdate = busId ? bus.id === busId : bus.id === selectedBus?.id;

          if (shouldUpdate) {
            const updatedPickedUpStations = bus.pickedUpStations?.includes(stationId)
              ? bus.pickedUpStations
              : [...(bus.pickedUpStations || []), stationId];

            console.log(`✅ Updated picked up stations for ${bus.name}:`, updatedPickedUpStations);

            return {
              ...bus,
              pickedUpStations: updatedPickedUpStations,
            };
          }
          return bus;
        })
      );
    },
    [selectedBus]
  );

  // SỬA LỖI: Sử dụng handleStationPickupRef để tránh dependency issues
  const handleStationPickupRef = useRef(handleStationPickup);
  useEffect(() => {
    handleStationPickupRef.current = handleStationPickup;
  }, [handleStationPickup]);

  // Hàm tính tiến trình dựa trên thời gian thực tế
  const calculateTimeBasedProgress = (bus: ExtendedBus): number => {
    if (!bus.route.schedule?.startTime || !bus.route.schedule?.endTime) {
      return 0;
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    try {
      // Chuẩn hóa định dạng thời gian
      const normalizeTimeFormat = (timeStr: string): string => {
        if (!timeStr) return '00:00:00';
        
        const parts = timeStr.split(':');
        if (parts.length >= 3) {
          return `${parts[0]}:${parts[1]}:${parts[2]}`;
        }
        return timeStr;
      };

      const normalizedStartTime = normalizeTimeFormat(bus.route.schedule.startTime);
      const normalizedEndTime = normalizeTimeFormat(bus.route.schedule.endTime);

      const startDateTime = new Date(`${today}T${normalizedStartTime}`);
      const endDateTime = new Date(`${today}T${normalizedEndTime}`);
      endDateTime.setSeconds(endDateTime.getSeconds() - 1);
      
      const currentDateTime = now;

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        console.error('❌ Invalid date after normalization:', {
          start: normalizedStartTime,
          end: normalizedEndTime
        });
        return 0;
      }

      if (currentDateTime < startDateTime) return 0;
      if (currentDateTime > endDateTime) return 100;

      const totalDuration = endDateTime.getTime() - startDateTime.getTime();
      const elapsedDuration = currentDateTime.getTime() - startDateTime.getTime();
      
      if (totalDuration <= 0) return 0;

      const progress = (elapsedDuration / totalDuration) * 100;
      return Math.min(Math.max(progress, 0), 100);
    } catch (error) {
      console.error('❌ Error calculating time-based progress:', error);
      return 0;
    }
  };

  // Hàm tính toán vị trí chính xác theo thời gian dự kiến
  const calculatePreciseTimeProgress = (bus: ExtendedBus): number => {
    if (!bus.route.schedule?.startTime || !bus.route.schedule?.endTime) {
      return 0;
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTimeStr = now.toTimeString().substring(0, 8);

    const startTime = bus.route.schedule.startTime;
    const endTime = bus.route.schedule.endTime;

    // Nếu chưa đến giờ bắt đầu
    if (currentTimeStr < startTime) return 0;
    
    // Nếu đã qua giờ kết thúc
    if (currentTimeStr > endTime) return 100;

    // Tính progress dựa trên thời gian thực tế giữa các điểm dừng
    const stations = bus.route.stations;
    const currentIndex = bus.currentStationIndex || 0;

    if (stations.length === 0) return 0;

    // Tìm khoảng thời gian hiện tại nằm giữa các điểm dừng nào
    let segmentStartTime = startTime;
    let segmentEndTime = endTime;

    if (currentIndex < stations.length) {
      segmentEndTime = stations[currentIndex].thoiGianDuKien || endTime;
    }

    if (currentIndex > 0) {
      segmentStartTime = stations[currentIndex - 1].thoiGianDuKien || startTime;
    }

    const totalSegmentDuration = new Date(`${today}T${segmentEndTime}`).getTime() - 
                                new Date(`${today}T${segmentStartTime}`).getTime();
    
    const elapsedInSegment = new Date(`${today}T${currentTimeStr}`).getTime() - 
                            new Date(`${today}T${segmentStartTime}`).getTime();

    if (totalSegmentDuration <= 0) return 0;

    const segmentProgress = Math.min(Math.max(elapsedInSegment / totalSegmentDuration, 0), 1);
    
    // Tính tổng progress
    const baseProgress = (currentIndex / stations.length) * 100;
    const segmentContribution = (1 / stations.length) * 100 * segmentProgress;

    return Math.min(baseProgress + segmentContribution, 100);
  };

  const animateBuses = useCallback((timestamp: number) => {
    if (!isRealTime) return;

    const deltaTime = timestamp - lastUpdateTimeRef.current;
    
    if (deltaTime < 100) {
      animationRef.current = requestAnimationFrame(animateBuses);
      return;
    }

    lastUpdateTimeRef.current = timestamp;

    setBuses((prevBuses) =>
      prevBuses.map((bus) => {
        if (!bus.shouldStartRealtime || bus.isHidden) {
          return bus;
        }

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTimeStr = now.toTimeString().substring(0, 8);

        // KIỂM TRA THEO THỜI GIAN DỰ KIẾN CỦA TỪNG ĐIỂM DỪNG
        const currentStationIndex = bus.currentStationIndex || 0;
        const stations = bus.route.stations;
        
        if (currentStationIndex < stations.length) {
          const currentStation = stations[currentStationIndex];
          const scheduledTime = currentStation.thoiGianDuKien || '00:00:00';
          
          // Nếu đã đến thời gian dự kiến của điểm dừng hiện tại
          if (currentTimeStr >= scheduledTime) {
            // Đánh dấu station đã đón
            if (!bus.pickedUpStations?.includes(currentStation.id)) {
              handleStationPickupRef.current(currentStation.id, bus.id);
            }
            
            // Chuyển sang điểm dừng tiếp theo
            const nextIndex = currentStationIndex + 1;
            const newStatus = nextIndex === stations.length ? "going_to_school" : "picking_up";
            
            return {
              ...bus,
              currentStationIndex: nextIndex,
              route: {
                ...bus.route,
                currentStationIndex: nextIndex,
                currentStatus: newStatus,
              },
              lastUpdate: new Date().toLocaleTimeString(),
            };
          }
        }

        // Tính toán vị trí dựa trên thời gian thực tế so với lịch trình
        const timeProgress = calculatePreciseTimeProgress(bus);
        const adjustedBus = adjustBusPositionBasedOnTimeProgress(bus, timeProgress);

        return {
          ...adjustedBus,
          speed: 30 + Math.random() * 20,
          lastUpdate: new Date().toLocaleTimeString(),
        };
      })
    );

    animationRef.current = requestAnimationFrame(animateBuses);
  }, [isRealTime]);

  const adjustBusPositionBasedOnTimeProgress = (bus: ExtendedBus, progress: number): ExtendedBus => {
  if (bus.route.stations.length === 0 || !bus.totalDistance) return bus;
  
  const stations = bus.route.stations;
  const school = bus.route.school;
  
  let points: { lat: number; lng: number }[] = [];
  
  if (bus.isDonXe) {
    points = [
      { lat: 10.782622, lng: 106.640172 },
      ...stations.map(s => s.position),
      school.position
    ];
  } else {
    points = [
      school.position,
      ...stations.map(s => s.position),
      { lat: 10.782622, lng: 106.640172 }
    ];
  }

  // Tính khoảng cách đã đi dựa trên progress
  const traveledDistance = (progress / 100) * bus.totalDistance;

  // Tìm đoạn đường hiện tại
  let accumulatedDistance = 0;
  let currentSegmentIndex = 0;
  
  for (let i = 0; i < points.length - 1; i++) {
    const segmentDistance = calculateDistance(points[i], points[i + 1]);
    
    if (traveledDistance <= accumulatedDistance + segmentDistance) {
      currentSegmentIndex = i;
      break;
    }
    accumulatedDistance += segmentDistance;
  }

  // Tính vị trí trong đoạn đường hiện tại
  const segmentStart = points[currentSegmentIndex];
  const segmentEnd = points[currentSegmentIndex + 1];
  const segmentDistance = calculateDistance(segmentStart, segmentEnd);
  
  const remainingInSegment = traveledDistance - accumulatedDistance;
  const segmentProgress = segmentDistance > 0 ? remainingInSegment / segmentDistance : 0;

  // FIX: Đảm bảo newLat và newLng là number
  const newLat = Number(segmentStart.lat) + (Number(segmentEnd.lat) - Number(segmentStart.lat)) * Number(segmentProgress);
  const newLng = Number(segmentStart.lng) + (Number(segmentEnd.lng) - Number(segmentStart.lng)) * Number(segmentProgress);

  // Cập nhật trạng thái dựa trên segment index
  let currentStationIndex = Math.max(0, currentSegmentIndex - (bus.isDonXe ? 0 : 1));
  let currentStatus = bus.route.currentStatus;

  // Đảm bảo currentStationIndex không vượt quá số lượng stations
  currentStationIndex = Math.min(currentStationIndex, stations.length);

  return {
    ...bus,
    position: { 
      lat: parseFloat(Number(newLat).toFixed(8)), 
      lng: parseFloat(Number(newLng).toFixed(8)) 
    },
    currentStationIndex: currentStationIndex,
    route: {
      ...bus.route,
      currentStationIndex: currentStationIndex,
      currentStatus: currentStatus,
    },
    currentSegmentProgress: segmentProgress
  };
};

  // THÊM HÀM XỬ LÝ TẤT CẢ NGAY KHI MOUNT
  const initializeCompletedBuses = useCallback(() => {
    console.log("⚡ Initializing completed buses...");
    
    setBuses((prevBuses) =>
      prevBuses.map((bus) => {
        if (bus.isHidden) {
          return bus;
        }

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        if (!bus.route.schedule?.startTime || !bus.route.schedule?.endTime) {
          return bus;
        }

        // Chuẩn hóa định dạng thời gian
        const normalizeTimeFormat = (timeStr: string): string => {
          if (!timeStr) return '00:00:00';
          const parts = timeStr.split(':');
          if (parts.length >= 3) {
            return `${parts[0]}:${parts[1]}:${parts[2]}`;
          }
          return timeStr;
        };

        const normalizedEndTime = normalizeTimeFormat(bus.route.schedule.endTime);
        const endDateTime = new Date(`${today}T${normalizedEndTime}`);
        endDateTime.setSeconds(endDateTime.getSeconds() - 1);

        // Nếu chuyến xe đã kết thúc
        if (now > endDateTime) {
          const allStationIds = bus.route.stations.map(s => s.id);
          
          return {
            ...bus,
            position: {
              lat: bus.route.school.position.lat,
              lng: bus.route.school.position.lng
            },
            speed: 0,
            currentStationIndex: bus.route.stations.length,
            route: {
              ...bus.route,
              currentStatus: "completed",
              currentStationIndex: bus.route.stations.length
            },
            pickedUpStations: allStationIds,
            lastUpdate: new Date().toLocaleTimeString(),
          };
        }
        return bus;
      })
    );
  }, []);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      initializeCompletedBuses();
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [isRealTime, initializeCompletedBuses]);

  // Kiểm tra và chuyển hướng nếu không có chuyến xe nào
  useEffect(() => {
    const visibleBuses = buses.filter(bus => !bus.isHidden);
    if (!isLoading && visibleBuses.length === 0) {
      const timer = setTimeout(() => {
        router.push("/");
        alert("Hôm nay không có chuyến xe nào đang hoạt động");
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [buses, isLoading, router]);

  // Fetch data chính SỬ DỤNG CẢ HAI API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const rawUser = localStorage.getItem("user");
        const user = rawUser ? JSON.parse(rawUser) : null;
        if (!user) {
          setError("Chưa đăng nhập");
          return;
        }

        let selectedStudent: StudentData | null = null;

        if (user.capDo === "Parent") {
          const res = await axios.get(`http://localhost:5000/api/phuhuynh/${user.maTaiKhoan}/hocsinh`);
          const data = res.data.data || res.data.students || [];
          if (data.length) selectedStudent = data[0];
        } else {
          setError("Tài khoản không phải phụ huynh");
          return;
        }

        try {
          const res = await axios.get("http://localhost:5000/api/hocsinh");
          const students = Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
          if (students.length && !selectedStudent) {
            selectedStudent = students[0];
          }
        } catch (err) {
          console.error("❌ Lỗi khi lấy danh sách học sinh:", err);
        }

        if (selectedStudent) {
          setStudentData(selectedStudent);
          studentRef.current = selectedStudent;
          console.log("🎯 Học sinh cần theo dõi:", selectedStudent);
        } else {
          console.error("❌ Không tìm thấy học sinh");
          setError("Không tìm thấy thông tin học sinh");
          return;
        }

        if (user.maTaiKhoan) {
          try {
            const tbRes = await axios.get(`http://localhost:5000/api/thongbao/${user.maTaiKhoan}`);
            const tb = Array.isArray(tbRes.data.data) ? tbRes.data.data : Array.isArray(tbRes.data) ? tbRes.data : [];
            if (tb.length) {
              setNotification({
                message: tb[0].noiDung,
                timeAgo: new Date(tb[0].thoiGianTao).toLocaleString(),
                type: "info"
              });
            }
          } catch (err) {
            console.error("❌ Lỗi khi lấy thông báo:", err);
          }
        }

        await loadBusData(selectedStudent);

      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    const loadBusData = async (student: StudentData) => {
      try {
        console.log("🔄 Loading bus data for student:", student.tenHocSinh);
        
        const dbData = await fetchCombinedDataFromDB();
        if (dbData) {
          console.log("✅ Combined data loaded, converting to bus format...");
          const busData = convertDBDataToBus(dbData, student.tenHocSinh);
          console.log(`✅ Converted ${busData.length} buses`);
          
          setBuses(busData);
          const visibleBuses = busData.filter(bus => !bus.isHidden);
          console.log(`👀 ${visibleBuses.length} visible buses`);
          
          if (visibleBuses.length > 0) {
            setSelectedBus(visibleBuses[0]);
            console.log("🎯 Selected bus:", visibleBuses[0].name);
          } else {
            console.log("⚠️ No visible buses found");
          }
        } else {
          console.error("❌ No data loaded from APIs");
          setError("Không thể tải dữ liệu từ server");
        }
      } catch (error) {
        console.error("❌ Error loading bus data:", error);
        setError("Lỗi khi tải dữ liệu xe bus");
      }
    };

    fetchData();
  }, []);

  // useEffect cho animation
  useEffect(() => {
    if (!isRealTime) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      Object.values(stopTimersRef.current).forEach((timer) => clearTimeout(timer));
      stopTimersRef.current = {};
      return;
    }

    lastUpdateTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animateBuses);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isRealTime, animateBuses]);

  // Sync selectedBus với buses
  useEffect(() => {
    if (!selectedBus) return;

    const updatedBus = buses.find((b) => b.id === selectedBus.id);
    if (!updatedBus) return;

    const hasSignificantChange = 
      updatedBus.currentStationIndex !== selectedBus.currentStationIndex ||
      updatedBus.route.currentStatus !== selectedBus.route.currentStatus ||
      Math.abs(updatedBus.position.lat - selectedBus.position.lat) > 0.00001 ||
      Math.abs(updatedBus.position.lng - selectedBus.position.lng) > 0.00001 ||
      updatedBus.speed !== selectedBus.speed ||
      JSON.stringify(updatedBus.pickedUpStations) !== JSON.stringify(selectedBus.pickedUpStations);

    if (hasSignificantChange) {
      console.log("🔄 Syncing selectedBus with updated bus data");
      setSelectedBus(updatedBus);
    }
  }, [buses, selectedBus]);

  // Các hàm còn lại
  const toggleRealTime = () => {
    console.log("🔄 Toggling real-time from:", isRealTime, "to:", !isRealTime);
    setIsRealTime(!isRealTime);
  };

  const resetSimulation = async () => {
    console.log("🔄 Resetting simulation...");
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    Object.values(stopTimersRef.current).forEach((timer) => clearTimeout(timer));
    stopTimersRef.current = {};
    
    setIsRealTime(false);
    
    if (studentRef.current) {
      try {
        const dbData = await fetchCombinedDataFromDB();
        if (dbData) {
          const busData = convertDBDataToBus(dbData, studentRef.current.tenHocSinh);
          setBuses(busData);
          const visibleBuses = busData.filter(bus => !bus.isHidden);
          if (visibleBuses.length > 0) {
            setSelectedBus(visibleBuses[0]);
          }
          console.log("✅ Reset simulation thành công");
        }
      } catch (error) {
        console.error("❌ Lỗi khi reset simulation:", error);
      }
    }
  };

  const getProgressPercentage = (bus: ExtendedBus) => {
    if (bus.route.currentStatus === "completed") {
      return 100;
    }

    if (isRealTime && bus.shouldStartRealtime) {
      const progress = calculatePreciseTimeProgress(bus);
      return isNaN(progress) ? 0 : progress;
    }
    
    const stations = bus.route.stations;
    const currentIndex = bus.currentStationIndex || 0;
    
    if (stations.length === 0) return 0;

    const totalStops = stations.length + 1;
    let completedStops = bus.pickedUpStations?.length || 0;

    if (bus.route.currentStatus === "going_to_school" && completedStops === stations.length) {
      completedStops = totalStops - 1;
    }

    if (completedStops === stations.length && currentIndex >= stations.length) {
      return 100;
    }

    const percentage = totalStops > 0 ? (completedStops / totalStops) * 100 : 0;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const isBusStopped = (bus: ExtendedBus) => {
    return !!stopTimersRef.current[`bus-${bus.id}`];
  };

  const getCurrentStopInfo = (bus: ExtendedBus) => {
    const currentIndex = bus.currentStationIndex || 0;
    if (currentIndex < bus.route.stations.length) {
      return bus.route.stations[currentIndex];
    } else if (bus.route.currentStatus === "going_to_school") {
      return { name: bus.route.school.name, type: "school" };
    }
    return null;
  };

  const isStationPickedUp = (bus: ExtendedBus, stationId: string): boolean => {
    return bus.pickedUpStations?.includes(stationId) || false;
  };

  const handleBusSelect = (bus: ExtendedBus | null) => {
    setSelectedBus(bus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "secondary";
      case "picking_up": return "warning";
      case "going_to_school": return "primary";
      case "completed": return "success";
      default: return "secondary";
    }
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

  const getBusRealtimeStatus = (bus: ExtendedBus) => {
    if (!bus.route.schedule?.startTime || !bus.route.schedule?.endTime) {
      return "Không có lịch trình";
    }
    
    const currentTimeStr = new Date().toTimeString().substring(0, 8);
    const startTime = bus.route.schedule.startTime;
    const endTime = bus.route.schedule.endTime;

    if (currentTimeStr < startTime) {
      return `Chờ bắt đầu lúc ${startTime.substring(0, 5)}`;
    } else if (currentTimeStr >= startTime && currentTimeStr <= endTime) {
      return "Đang chạy realtime";
    } else {
      return "Đã kết thúc";
    }
  };

  const visibleBuses = buses.filter(bus => !bus.isHidden);

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
      <Header onLogout={onLogout} onInfo={onInfo} />
      <Container fluid>
        <Row className="my-4">
          <Col>
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <h1>Theo dõi xe bus học sinh {studentData?.tenHocSinh || ""}</h1>
              <Button 
                variant="outline-secondary" 
                onClick={() => router.push("/")}
              >
                ← Trở lại
              </Button>
            </div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <Badge bg={isRealTime ? "success" : "secondary"}>
                {isRealTime ? "Đang cập nhật thời gian thực" : "Chế độ xem tĩnh"}
              </Badge>
              <Button
                variant={isRealTime ? "outline-danger" : "outline-success"}
                size="sm"
                onClick={toggleRealTime}
                disabled={visibleBuses.length === 0}
              >
                {isRealTime ? "Dừng real-time" : "Bật real-time"}
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={resetSimulation}
                disabled={visibleBuses.length === 0}
              >
                Reset
              </Button>
              {selectedBus && isBusStopped(selectedBus) && (
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => {
                    if (selectedBus) {
                      setBuses((prev) =>
                        prev.map((bus) => {
                          if (bus.id === selectedBus.id) {
                            const nextIndex = (bus.currentStationIndex || 0) + 1;
                            const newStatus =
                              nextIndex === bus.route.stations.length
                                ? "going_to_school"
                                : "picking_up";

                            const stopTimerKey = `bus-${bus.id}`;
                            if (stopTimersRef.current[stopTimerKey]) {
                              clearTimeout(stopTimersRef.current[stopTimerKey]);
                              delete stopTimersRef.current[stopTimerKey];
                            }

                            return {
                              ...bus,
                              currentStationIndex: nextIndex,
                              route: {
                                ...bus.route,
                                currentStationIndex: nextIndex,
                                currentStatus: newStatus,
                              },
                            };
                          }
                          return bus;
                        })
                      );
                    }
                  }}
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
                          {selectedBus.route.currentStatus === "picking_up" && "🚌 Đang di chuyển đến điểm đón"}
                          {selectedBus.route.currentStatus === "going_to_school" && "🏫 Đang đến trường"}
                          {selectedBus.route.currentStatus === "completed" && "✅ Đã hoàn thành lộ trình"}
                          {selectedBus.route.currentStatus === "waiting" && "⏳ Chờ bắt đầu"}
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
                        backgroundColor: getStatusColor(selectedBus.route.currentStatus) === "success" 
                          ? "#198754" 
                          : getStatusColor(selectedBus.route.currentStatus) === "primary" 
                          ? "#0d6efd" 
                          : getStatusColor(selectedBus.route.currentStatus) === "warning" 
                          ? "#ffc107" 
                          : "#6c757d",
                      }}
                    ></div>
                  </div>
                  <small className="text-muted mt-1 d-block">
                    Tiến trình: {isNaN(getProgressPercentage(selectedBus)) ? 0 : Math.round(getProgressPercentage(selectedBus))}%
                    (Đã đón: {selectedBus.pickedUpStations?.length || 0}/{selectedBus.route.stations.length})
                  </small>
                  <small className="text-info d-block">
                    Trạng thái realtime: {getBusRealtimeStatus(selectedBus)}
                  </small>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            <Card className="shadow-sm" style={{ zIndex: "1" }}>
              <Card.Body>
                <Card.Title>
                  Bản đồ theo dõi lộ trình
                  {selectedBus && (
                    <Badge bg={getStatusColor(selectedBus.route.currentStatus)} className="ms-2">
                      {getStatusText(selectedBus.route.currentStatus)}
                      {isBusStopped(selectedBus) && " ⏸️"}
                    </Badge>
                  )}
                </Card.Title>
                <Card.Text>
                  {visibleBuses.length === 0 ? (
                    <span className="text-danger">
                      ⚠️ Không có chuyến xe nào đang hoạt động
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
                      ⏸️ Chế độ xem tĩnh - Tự động bật realtime khi đến giờ chạy
                    </span>
                  )}
                </Card.Text>
                {visibleBuses.length > 0 ? (
                  <BusMap
                    buses={visibleBuses}
                    selectedBus={selectedBus}
                    onBusSelect={handleBusSelect}
                    onStationPickup={handleStationPickup}
                    isRealTime={isRealTime}
                  />
                ) : (
                  <div className="text-center py-5">
                    <h5>Không có chuyến xe nào đang hoạt động</h5>
                    <p>Đang chuyển hướng về trang chủ...</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
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
                    <span>Thời gian hiện tại:</span>
                    <span className="text-muted small">{currentTime}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Xe đang hiển thị:</span>
                    <Badge bg="primary">
                      {visibleBuses.length}/{buses.length}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Xe đang chạy realtime:</span>
                    <Badge bg="success">
                      {visibleBuses.filter(bus => bus.shouldStartRealtime).length}/{visibleBuses.length}
                    </Badge>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

            {visibleBuses.length > 0 && (
              <Card className="shadow-sm mb-3">
                <Card.Body>
                  <Card.Title>Danh sách xe bus</Card.Title>
                  <ListGroup variant="flush">
                    {visibleBuses.map((bus) => (
                      <ListGroup.Item
                        key={bus.id}
                        action
                        active={selectedBus?.id === bus.id}
                        onClick={() => handleBusSelect(bus)}
                        className="d-flex justify-content-between align-items-start"
                      >
                        <div>
                          <h6 className="mb-1">
                            {bus.name}
                            {isBusStopped(bus) && " 🛑"}
                            {bus.shouldStartRealtime && " 🟢"}
                          </h6>
                          <small>{bus.licensePlate}</small>
                          <br />
                          <small>Tài xế: {bus.route.driver}</small>
                          <br />
                          <small className="text-muted">
                            Giờ chạy: {bus.route.schedule?.startTime?.substring(0, 5)} - {bus.route.schedule?.endTime?.substring(0, 5)}
                          </small>
                          <br />
                          <small className={bus.shouldStartRealtime ? "text-success" : "text-warning"}>
                            {getBusRealtimeStatus(bus)}
                          </small>
                          <br />
                          <small className="text-muted">
                            Tốc độ: {Math.round(bus.speed || 0)} km/h
                          </small>
                          <br />
                          <small className="text-muted">
                            Tiến trình: {Math.round(getProgressPercentage(bus))}%
                          </small>
                          <br />
                          <small className="text-success">
                            ✅ Đã đón: {bus.pickedUpStations?.length || 0}/{bus.route.stations.length}
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
                    <strong>Giờ vào lớp:</strong> {selectedBus.route.school.startTime}
                  </p>
                  <p>
                    <strong>Giờ chạy:</strong> {selectedBus.route.schedule?.startTime?.substring(0, 5)} - {selectedBus.route.schedule?.endTime?.substring(0, 5)}
                  </p>
                  <p>
                    <strong>Trạng thái realtime:</strong>{" "}
                    <Badge bg={selectedBus.shouldStartRealtime ? "success" : "warning"}>
                      {getBusRealtimeStatus(selectedBus)}
                    </Badge>
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
                    {selectedBus.route.stations.map((station, index) => {
                      const isPickedUp = isStationPickedUp(selectedBus, station.id);
                      const currentIndex = selectedBus.currentStationIndex || 0;
                      const isCurrent = index === currentIndex;

                      return (
                        <Card
                          key={station.id}
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
                                  {index + 1}. {station.name}
                                  {isCurrent &&
                                    selectedBus.route.currentStatus === "picking_up" && (
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
                                    index > currentIndex && (
                                      <Badge bg="secondary" className="ms-1">
                                        ⏳ Chờ đón
                                      </Badge>
                                    )}
                                </h6>
                                <small className="text-muted">
                                  Số học sinh: {station.studentCount} - {station.type === 'pickup' ? 'Điểm đón' : 'Điểm trả'}
                                </small>
                                <br />
                                {station.thoiGianDuKien && (
                                  <small>Giờ dự kiến: {station.thoiGianDuKien.substring(0, 5)}</small>
                                )}
                                <br />
                                <small className="text-info">
                                  Thứ tự: {station.thuTuDon}
                                </small>
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
                              {selectedBus.route.currentStatus === "going_to_school" && (
                                <Badge bg="primary" className="ms-1">
                                  Đang đến
                                </Badge>
                              )}
                              {selectedBus.route.currentStatus === "completed" && (
                                <Badge bg="success" className="ms-1">
                                  ✅ Đã đến
                                </Badge>
                              )}
                            </h6>
                            {/* <small className="text-muted">
                              Giờ vào lớp: {selectedBus.route.school.startTime}
                            </small> */}
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