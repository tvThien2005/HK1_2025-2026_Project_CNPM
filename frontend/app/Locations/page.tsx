// frontend/app/vehicles/page.tsx
"use client";
import Head from "next/head";
// import Layout from "../../components/Layout";
import { Container, Row, Col, Card } from "react-bootstrap";

const VehiclesPage = () => {
  return (
    <>
      <Head>
        <title>Vị trí xe | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <h1 className="my-4">Cập nhật vị trí xe</h1>
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>Bản đồ theo dõi vị trí</Card.Title>
            <Card.Text>
              Khu vực này sẽ hiển thị bản đồ với vị trí theo thời gian thực của
              các xe buýt. Bạn sẽ cần tích hợp một thư viện bản đồ như Leaflet
              hoặc Google Maps API và kết nối với backend thông qua WebSocket để
              nhận dữ liệu vị trí.
            </Card.Text>
            <div
              style={{
                height: "500px",
                backgroundColor: "#e9ecef",
                borderRadius: "8px",
              }}
              className="d-flex justify-content-center align-items-center"
            >
              <p className="text-muted">
                Hình ảnh bản đồ sẽ được hiển thị ở đây
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default VehiclesPage;
