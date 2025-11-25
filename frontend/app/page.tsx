// frontend/app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

interface DashboardStats {
  totalBuses: number;
  activeRoutes: number;
  totalDrivers: number;
  totalStudents: number;
  totalUsers: number;
}

const HomePage = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalBuses: 0,
    activeRoutes: 0,
    totalDrivers: 0,
    totalStudents: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/sign-in");
      return;
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Gọi multiple APIs để lấy thống kê từ tracking endpoints
      const [busRes, driverRes, routeRes, studentRes, userRes] =
        await Promise.allSettled([
          axios.get(`${API_BASE}/tracking/xebuyt`), // Sử dụng tracking API để lấy xe buýt
          axios.get(`${API_BASE}/tracking/taixe`), // Sử dụng tracking API để lấy tài xế
          axios.get(`${API_BASE}/tracking/tuyenduong`), // Sử dụng tracking API để lấy tuyến đường
          axios.get(`${API_BASE}/tracking/hocsinh`), // Sử dụng tracking API để lấy học sinh
          axios.get(`${API_BASE}/users`), // API users
        ]);

      const newStats: DashboardStats = {
        totalBuses:
          busRes.status === "fulfilled"
            ? (busRes.value.data?.data || busRes.value.data || []).length
            : 0,
        totalDrivers:
          driverRes.status === "fulfilled"
            ? (driverRes.value.data?.data || driverRes.value.data || []).length
            : 0,
        activeRoutes:
          routeRes.status === "fulfilled"
            ? (routeRes.value.data?.data || routeRes.value.data || []).length
            : 0,
        totalStudents:
          studentRes.status === "fulfilled"
            ? (studentRes.value.data?.data || studentRes.value.data || [])
                .length
            : 0,
        totalUsers:
          userRes.status === "fulfilled"
            ? (userRes.value.data?.data || userRes.value.data || []).length
            : 0,
      };

      setStats(newStats);
      console.log("Dashboard stats loaded:", newStats); // Debug log
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/sign-in");
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="my-4">Dashboard</h1>
        <Button
          variant="outline-primary"
          onClick={fetchDashboardData}
          disabled={loading}
          size="sm"
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          {loading ? "Đang tải..." : "Làm mới"}
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Đang tải dữ liệu dashboard...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards - Equal Width Layout */}
          <Row className="g-4 mb-4">
            <Col>
              <Row className="row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-5 g-4">
                <Col>
                  <Card className="shadow-sm border-0 h-100 stat-card">
                    <Card.Body className="d-flex flex-column justify-content-center text-center p-4">
                      <div className="mb-3">
                        <div
                          className="stat-icon bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: "80px", height: "80px" }}
                        >
                          <i className="bi bi-bus-front display-5 text-primary"></i>
                        </div>
                      </div>
                      <Card.Title className="h6 mb-2 text-muted">
                        Tổng số xe
                      </Card.Title>
                      <Card.Text className="h2 text-primary mb-0 fw-bold">
                        {stats.totalBuses.toLocaleString()}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col>
                  <Card className="shadow-sm border-0 h-100 stat-card">
                    <Card.Body className="d-flex flex-column justify-content-center text-center p-4">
                      <div className="mb-3">
                        <div
                          className="stat-icon bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: "80px", height: "80px" }}
                        >
                          <i className="bi bi-signpost-2 display-5 text-success"></i>
                        </div>
                      </div>
                      <Card.Title className="h6 mb-2 text-muted">
                        Tuyến hoạt động
                      </Card.Title>
                      <Card.Text className="h2 text-success mb-0 fw-bold">
                        {stats.activeRoutes.toLocaleString()}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col>
                  <Card className="shadow-sm border-0 h-100 stat-card">
                    <Card.Body className="d-flex flex-column justify-content-center text-center p-4">
                      <div className="mb-3">
                        <div
                          className="stat-icon bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: "80px", height: "80px" }}
                        >
                          <i className="bi bi-person-badge display-5 text-warning"></i>
                        </div>
                      </div>
                      <Card.Title className="h6 mb-2 text-muted">
                        Tài xế
                      </Card.Title>
                      <Card.Text className="h2 text-warning mb-0 fw-bold">
                        {stats.totalDrivers.toLocaleString()}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col>
                  <Card className="shadow-sm border-0 h-100 stat-card">
                    <Card.Body className="d-flex flex-column justify-content-center text-center p-4">
                      <div className="mb-3">
                        <div
                          className="stat-icon bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: "80px", height: "80px" }}
                        >
                          <i className="bi bi-mortarboard display-5 text-info"></i>
                        </div>
                      </div>
                      <Card.Title className="h6 mb-2 text-muted">
                        Học sinh
                      </Card.Title>
                      <Card.Text className="h2 text-info mb-0 fw-bold">
                        {stats.totalStudents.toLocaleString()}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col>
                  <Card className="shadow-sm border-0 h-100 stat-card">
                    <Card.Body className="d-flex flex-column justify-content-center text-center p-4">
                      <div className="mb-3">
                        <div
                          className="stat-icon bg-secondary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: "80px", height: "80px" }}
                        >
                          <i className="bi bi-people display-5 text-secondary"></i>
                        </div>
                      </div>
                      <Card.Title className="h6 mb-2 text-muted">
                        Người dùng
                      </Card.Title>
                      <Card.Text className="h2 text-secondary mb-0 fw-bold">
                        {stats.totalUsers.toLocaleString()}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Row className="mt-4">
            <Col>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-light border-0">
                  <h5 className="mb-0">
                    <i className="bi bi-lightning-charge me-2"></i>
                    Hành động nhanh
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col lg={2} md={3} sm={4} xs={6}>
                      <Button
                        variant="outline-primary"
                        className="w-100 py-3 h-100"
                        onClick={() => router.push("/bus")}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-bus-front display-6 mb-2"></i>
                          <span className="small">Quản lý xe bus</span>
                        </div>
                      </Button>
                    </Col>
                    <Col lg={2} md={3} sm={4} xs={6}>
                      <Button
                        variant="outline-success"
                        className="w-100 py-3 h-100"
                        onClick={() => router.push("/Drivers")}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-person-badge display-6 mb-2"></i>
                          <span className="small">Quản lý tài xế</span>
                        </div>
                      </Button>
                    </Col>
                    <Col lg={2} md={3} sm={4} xs={6}>
                      <Button
                        variant="outline-warning"
                        className="w-100 py-3 h-100"
                        onClick={() => router.push("/Students")}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-mortarboard display-6 mb-2"></i>
                          <span className="small">Quản lý học sinh</span>
                        </div>
                      </Button>
                    </Col>
                    <Col lg={2} md={3} sm={4} xs={6}>
                      <Button
                        variant="outline-info"
                        className="w-100 py-3 h-100"
                        onClick={() => router.push("/Locations")}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-geo-alt display-6 mb-2"></i>
                          <span className="small">Theo dõi vị trí</span>
                        </div>
                      </Button>
                    </Col>
                    <Col lg={2} md={3} sm={4} xs={6}>
                      <Button
                        variant="outline-danger"
                        className="w-100 py-3 h-100"
                        onClick={() => router.push("/notifications")}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-bell display-6 mb-2"></i>
                          <span className="small">Thông báo</span>
                        </div>
                      </Button>
                    </Col>
                    <Col lg={2} md={3} sm={4} xs={6}>
                      <Button
                        variant="outline-secondary"
                        className="w-100 py-3 h-100"
                        onClick={() => router.push("/schedules")}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-calendar3 display-6 mb-2"></i>
                          <span className="small">Lịch trình</span>
                        </div>
                      </Button>
                    </Col>
                    <Col lg={2} md={3} sm={4} xs={6}>
                      <Button
                        variant="outline-dark"
                        className="w-100 py-3 h-100"
                        onClick={() => router.push("/users")}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-person-gear display-6 mb-2"></i>
                          <span className="small">Quản lý user</span>
                        </div>
                      </Button>
                    </Col>
                    <Col lg={2} md={3} sm={4} xs={6}>
                      <Button
                        variant="outline-primary"
                        className="w-100 py-3 h-100"
                        onClick={() => router.push("/routes")}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-map display-6 mb-2"></i>
                          <span className="small">Tuyến đường</span>
                        </div>
                      </Button>
                    </Col>
                    <Col lg={2} md={3} sm={4} xs={6}>
                      <Button
                        variant="outline-success"
                        className="w-100 py-3 h-100"
                        onClick={() => router.push("/AssignDrivers")}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-person-plus display-6 mb-2"></i>
                          <span className="small">Phân công</span>
                        </div>
                      </Button>
                    </Col>
                    <Col lg={2} md={3} sm={4} xs={6}>
                      <Button
                        variant="outline-warning"
                        className="w-100 py-3 h-100"
                        onClick={handleLogout}
                      >
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-box-arrow-right display-6 mb-2"></i>
                          <span className="small">Đăng xuất</span>
                        </div>
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default HomePage;
