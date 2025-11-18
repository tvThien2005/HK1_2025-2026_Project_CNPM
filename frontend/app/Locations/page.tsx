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

// ✅ Hàm convert dữ liệu DB sang Bus objects
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
    phanbotramxe = [],
    phanbohocsinhtram = [],
    vitrithuc = [],
    vitrichuyenxe = [],
  } = dbData;

  console.log("🔍 Converting DB data to buses:");
  console.log(`  - Chuyến xe: ${chuyenxe.length}`);
  console.log(`  - Điểm dừng: ${diemdung.length}`);
  console.log(`  - Phân bổ trạm xe: ${phanbotramxe.length}`);
  console.log(`  - Phân bổ học sinh trạm: ${phanbohocsinhtram.length}`);

  // ✅ LOG ĐỂ DEBUG
  console.log("📊 Sample phanbotramxe:", phanbotramxe.slice(0, 5));

  return chuyenxe.map((chuyen: any) => {
    const xe = xebuyt.find((x: any) => x.maXeBuyt === chuyen.maXeBuyt);
    const taiXe = taixe.find((t: any) => t.maTaiXe === chuyen.maTaiXe);
    const lich = lichtrinh.find(
      (l: any) => l.maLichTrinh === chuyen.maLichTrinh
    );
    const tuyen = tuyenduong.find(
      (t: any) => t.maTuyenDuong === chuyen.maTuyenDuong
    );

    // ✅ FIX: So sánh cả số và chuỗi
    const tramCuaChuyenXe = phanbotramxe.filter(
      (pb: any) =>
        pb.maChuyenXe === chuyen.maChuyenXe ||
        pb.maChuyenXe === String(chuyen.maChuyenXe) ||
        String(pb.maChuyenXe) === String(chuyen.maChuyenXe)
    );

    console.log(`🚌 Chuyến xe ${chuyen.maChuyenXe} (${xe?.bienSoXe}):`);
    console.log(
      `   - maChuyenXe type: ${typeof chuyen.maChuyenXe}, value: ${
        chuyen.maChuyenXe
      }`
    );
    console.log(`   - Tìm thấy ${tramCuaChuyenXe.length} trạm`);

    // ✅ LOG CHI TIẾT
    if (tramCuaChuyenXe.length > 0) {
      console.log(
        `   - Chi tiết trạm:`,
        tramCuaChuyenXe.map((t: any) => ({
          maPhanBo: t.maPhanBoTramXe,
          maDiemDung: t.maDiemDung,
          thuTu: t.thuTuDon,
          maChuyenXeType: typeof t.maChuyenXe,
        }))
      );
    }

    // ✅ Sắp xếp theo thứ tự đón
    const sortedTram = tramCuaChuyenXe.sort((a: any, b: any) => {
      const thuTuA = parseInt(a.thuTuDon) || 0;
      const thuTuB = parseInt(b.thuTuDon) || 0;
      return thuTuA - thuTuB;
    });

    // ✅ Tạo danh sách Station objects
    const busStations: Station[] = sortedTram.map((pb: any, index: number) => {
      // ✅ FIX: Tìm trạm theo cả id và maDiemDung
      const tram = diemdung.find(
        (dd: any) =>
          dd.id === pb.maDiemDung ||
          dd.maDiemDung === pb.maDiemDung ||
          String(dd.id) === String(pb.maDiemDung)
      );

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
      const hocSinhTaiTram = phanbohocsinhtram.filter((pbhst: any) => {
        const matchDiemDung =
          pbhst.maDiemDung === pb.maDiemDung ||
          String(pbhst.maDiemDung) === String(pb.maDiemDung);

        const matchLoai = pbhst.loaiPhanBo === "Sang";
        const matchTrangThai = pbhst.trangThai === "Active";

        return matchDiemDung && matchLoai && matchTrangThai;
      });

      console.log(
        `   📍 Trạm ${pb.thuTuDon}: ${tram?.tenDiemDung || "Unknown"}`
      );
      console.log(
        `      - ID điểm dừng: ${pb.maDiemDung} (type: ${typeof pb.maDiemDung})`
      );
      console.log(`      - Học sinh: ${hocSinhTaiTram.length} em`);
      console.log(`      - Tọa độ: ${tram?.viDo}, ${tram?.kinhDo}`);

      return {
        id: `station-${chuyen.maChuyenXe}-${pb.maDiemDung}-${pb.thuTuDon}`,
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
        phanBoTramId: pb.maPhanBoTramXe,
        chuyenXeId: chuyen.maChuyenXe,
        thuTu: pb.thuTuDon,
      };
    });

    const totalStudents = busStations.reduce(
      (sum, st) => sum + st.studentCount,
      0
    );

    console.log(
      `✅ Xe ${xe?.bienSoXe}: ${busStations.length} trạm, ${totalStudents} học sinh\n`
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
      currentStatus:
        chuyen.trangThai === "Completed"
          ? "completed"
          : chuyen.trangThai === "InProgress"
          ? "picking_up"
          : "waiting",
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
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const stopTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // ✅ Hàm xử lý khi đón tại trạm
  const handleStationPickup = useCallback(
    (stationId: string) => {
      console.log(`🎒 Marking station ${stationId} as picked up`);

      if (!selectedBus) return;

      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          if (bus.id === selectedBus.id) {
            const updatedPickedUpStations = bus.pickedUpStations?.includes(
              stationId
            )
              ? bus.pickedUpStations
              : [...(bus.pickedUpStations || []), stationId];

            const updatedBus = {
              ...bus,
              pickedUpStations: updatedPickedUpStations,
            };

            if (selectedBus.id === bus.id) {
              setSelectedBus(updatedBus);
            }

            return updatedBus;
          }
          return bus;
        })
      );
    },
    [selectedBus]
  );

  // ✅ Fetch data khi component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const dbData = await fetchDataFromDBWithStations();
        if (dbData) {
          const busData = convertDBDataToBusWithStations(dbData);
          setBuses(busData);
          if (busData.length > 0) {
            setSelectedBus(busData[0]);
            calculateRouteSegments(busData[0]);
          }
        }
      } catch (error) {
        console.error("❌ Error loading bus data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // ✅ Tính toán route segments
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

      if (currentIndex < stations.length) {
        const nextStation = stations[currentIndex];
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

      setRouteSegments(segments);
    } catch (error) {
      console.error("❌ Error calculating route segments:", error);
      setRouteSegments([]);
    } finally {
      setIsLoadingRoute(false);
    }
  }, []);

  // ✅ Real-time movement logic
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

          // Kiểm tra đã hoàn thành tất cả trạm
          if (currentStationIndex >= stations.length) {
            if (bus.route.currentStatus !== "completed") {
              const school = bus.route.school;
              const distanceToSchool = Math.sqrt(
                Math.pow(school.position.lat - bus.position.lat, 2) +
                  Math.pow(school.position.lng - bus.position.lng, 2)
              );

              if (distanceToSchool <= 0.0005) {
                return {
                  ...bus,
                  position: school.position,
                  speed: 0,
                  route: { ...bus.route, currentStatus: "completed" },
                  lastUpdate: new Date().toLocaleTimeString("vi-VN"),
                };
              } else {
                const moveStep = 0.0001;
                const latDiff = school.position.lat - bus.position.lat;
                const lngDiff = school.position.lng - bus.position.lng;
                const distance = Math.sqrt(
                  latDiff * latDiff + lngDiff * lngDiff
                );
                const ratio = moveStep / distance;

                return {
                  ...bus,
                  position: {
                    lat: bus.position.lat + latDiff * ratio,
                    lng: bus.position.lng + lngDiff * ratio,
                  },
                  speed: 20,
                  route: { ...bus.route, currentStatus: "going_to_school" },
                  lastUpdate: new Date().toLocaleTimeString("vi-VN"),
                };
              }
            }
            return bus;
          }

          const currentStation = stations[currentStationIndex];
          const distanceToStation = Math.sqrt(
            Math.pow(currentStation.position.lat - bus.position.lat, 2) +
              Math.pow(currentStation.position.lng - bus.position.lng, 2)
          );

          // Đã đến trạm
          if (distanceToStation <= 0.0003) {
            stopTimersRef.current[stopTimerKey] = setTimeout(() => {
              console.log(`✅ ${bus.name} arrived at ${currentStation.name}`);

              handleStationPickup(currentStation.id);

              setBuses((prev) =>
                prev.map((b) => {
                  if (b.id === bus.id) {
                    const nextIndex = b.currentStationIndex + 1;
                    const newStatus =
                      nextIndex === b.route.stations.length
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
            }, 2000);

            return {
              ...bus,
              position: currentStation.position,
              speed: 0,
              lastUpdate: new Date().toLocaleTimeString("vi-VN"),
            };
          } else {
            // Di chuyển đến trạm
            const moveStep = 0.00015;
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
              speed: 25,
              lastUpdate: new Date().toLocaleTimeString("vi-VN"),
              nextStop: {
                station: currentStation,
                estimatedArrival: new Date(
                  Date.now() + (distance / moveStep) * 800
                ).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            };
          }
        })
      );
    }, 800);

    return () => {
      clearInterval(interval);
      Object.values(stopTimersRef.current).forEach((timer) =>
        clearTimeout(timer)
      );
      stopTimersRef.current = {};
    };
  }, [isRealTime, buses.length, handleStationPickup]);

  // ✅ Update selectedBus
  useEffect(() => {
    if (!selectedBus) return;

    const updatedBus = buses.find((b) => b.id === selectedBus.id);
    if (
      updatedBus &&
      (updatedBus.currentStationIndex !== selectedBus.currentStationIndex ||
        updatedBus.position.lat !== selectedBus.position.lat)
    ) {
      setSelectedBus(updatedBus);
    }
  }, [buses, selectedBus]);

  // ✅ Helper functions
  const getProgressPercentage = (bus: Bus) => {
    const totalStations = bus.route.stations.length;
    const completedStations = bus.pickedUpStations?.length || 0;
    return totalStations > 0 ? (completedStations / totalStations) * 100 : 0;
  };

  const isStationPickedUp = (bus: Bus, stationId: string): boolean => {
    return bus.pickedUpStations?.includes(stationId) || false;
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
  const toggleRealTime = () => setIsRealTime(!isRealTime);

  const resetSimulation = async () => {
    const dbData = await fetchDataFromDBWithStations();
    if (dbData) {
      const busData = convertDBDataToBusWithStations(dbData);
      setBuses(busData);
      if (busData.length > 0) {
        setSelectedBus(busData[0]);
        calculateRouteSegments(busData[0]);
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
                {isRealTime ? "Đang cập nhật real-time" : "Chế độ xem tĩnh"}
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
                    % (Đã đến: {selectedBus.pickedUpStations?.length || 0}/
                    {selectedBus.route.stations.length} trạm)
                  </small>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        <Row>
          <Col lg={isFullscreen ? 12 : 8}>
            <Card className="shadow-sm">
              <Card.Body>
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
                      <span>Số xe:</span>
                      <Badge bg="primary">{buses.length}</Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Tổng trạm:</span>
                      <Badge bg="info">
                        {buses.reduce(
                          (total, bus) => total + bus.route.stations.length,
                          0
                        )}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Cập nhật:</span>
                      <span className="text-muted small">
                        {buses[0]?.lastUpdate || "--:--:--"}
                      </span>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>

              {buses.length > 0 && (
                <Card className="shadow-sm mb-3">
                  <Card.Body>
                    <Card.Title>Danh sách xe</Card.Title>
                    <ListGroup variant="flush">
                      {buses.map((bus) => (
                        <ListGroup.Item
                          key={bus.id}
                          action
                          active={selectedBus?.id === bus.id}
                          onClick={() => handleBusSelect(bus)}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">
                                {bus.name}
                                {getCurrentStationInfo(bus) && " 🚏"}
                              </h6>
                              <small>{bus.licensePlate}</small>
                              <br />
                              <small>Tài xế: {bus.route.driver}</small>
                              <br />
                              <small className="text-muted">
                                Tốc độ: {bus.speed || 0} km/h
                              </small>
                              <br />
                              <small className="text-success">
                                ✅ Đã đến: {bus.pickedUpStations?.length || 0}/
                                {bus.route.stations.length} trạm
                              </small>
                              {getCurrentStationInfo(bus) && (
                                <>
                                  <br />
                                  <small className="text-warning">
                                    🚏 Hiện tại:{" "}
                                    {getCurrentStationInfo(bus)?.name}
                                  </small>
                                </>
                              )}
                            </div>
                            <Badge bg={getStatusColor(bus.route.currentStatus)}>
                              {getStatusText(bus.route.currentStatus)}
                            </Badge>
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
                    <Card.Title>Chi tiết lộ trình</Card.Title>
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

                    <h6 className="mt-3">Danh sách trạm:</h6>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {selectedBus.route.stations.map((station, index) => {
                        const isPickedUp = isStationPickedUp(
                          selectedBus,
                          station.id
                        );
                        const isCurrent =
                          index === selectedBus.currentStationIndex;

                        return (
                          <Card
                            key={station.id}
                            className="mb-2"
                            style={{
                              opacity: isPickedUp ? 0.7 : 1,
                              borderLeft: isCurrent
                                ? "4px solid #ffc107"
                                : isPickedUp
                                ? "4px solid #198754"
                                : "4px solid transparent",
                              backgroundColor: isCurrent ? "#fff3cd" : "white",
                            }}
                          >
                            <Card.Body className="py-2">
                              <div className="d-flex justify-content-between">
                                <div style={{ flex: 1 }}>
                                  <h6 className="mb-1">
                                    🟢 {station.name}
                                    {isCurrent && (
                                      <Badge bg="warning" className="ms-1">
                                        ⭐ Đang tại
                                      </Badge>
                                    )}
                                    {isPickedUp && !isCurrent && (
                                      <Badge bg="success" className="ms-1">
                                        ✅ Đã đến
                                      </Badge>
                                    )}
                                  </h6>
                                  <small className="text-muted d-block">
                                    <strong>Học sinh:</strong>{" "}
                                    {station.studentCount} em
                                  </small>
                                  <small className="text-muted d-block">
                                    <strong>Giờ dự kiến:</strong>{" "}
                                    {station.estimatedArrival}
                                  </small>
                                  {station.description && (
                                    <small className="text-muted d-block">
                                      <strong>Mô tả:</strong>{" "}
                                      {station.description}
                                    </small>
                                  )}
                                </div>
                                <Badge bg="success">{index + 1}</Badge>
                              </div>
                            </Card.Body>
                          </Card>
                        );
                      })}

                      {/* Trường học */}
                      <Card
                        className="mb-2"
                        style={{
                          borderLeft:
                            selectedBus.route.currentStatus === "completed"
                              ? "4px solid #198754"
                              : "4px solid #0d6efd",
                        }}
                      >
                        <Card.Body className="py-2">
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
                        </Card.Body>
                      </Card>
                    </div>

                    {/* Thống kê */}
                    <div className="mt-3 p-2 bg-light rounded">
                      <div className="row text-center">
                        <div className="col-4">
                          <div className="text-primary">
                            <strong>
                              {
                                selectedBus.route.stations.filter(
                                  (s) => s.type === "pickup"
                                ).length
                              }
                            </strong>
                            <br />
                            <small>Trạm đón</small>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-success">
                            <strong>
                              {
                                selectedBus.route.stations.filter(
                                  (s) => s.type === "dropoff"
                                ).length
                              }
                            </strong>
                            <br />
                            <small>Trạm trả</small>
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
                    </div>
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
