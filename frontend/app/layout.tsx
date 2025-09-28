// frontend/app/layout.tsx
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header"; // Thêm Header
import { Container, Row, Col } from "react-bootstrap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Container fluid className="p-0">
          <Row className="g-0">
            {/* Sidebar cho màn hình lớn */}
            <Col xs={12} md={3} lg={2} className="d-none d-md-block">
              <Sidebar />
            </Col>
            {/* Vùng nội dung của trang */}
            <Col xs={12} md={9} lg={10} className="p-0 min-vh-100">
              <Header /> {/* Thêm Header vào đây */}
              <div className="p-4 bg-light min-vh-100">{children}</div>
            </Col>
          </Row>
        </Container>
      </body>
    </html>
  );
}
