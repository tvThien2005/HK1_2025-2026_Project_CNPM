// frontend/app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/sign-in");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/sign-in");
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="my-4">Dashboard</h1>
        {/* <Button variant="outline-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1"></i>
          Đăng xuất
        </Button> */}
      </div>

      <Row>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Tổng số xe</Card.Title>
              <Card.Text className="h1 text-primary">300</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Tuyến đang hoạt động</Card.Title>
              <Card.Text className="h1 text-success">10</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Tài xế</Card.Title>
              <Card.Text className="h1 text-warning">20</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
