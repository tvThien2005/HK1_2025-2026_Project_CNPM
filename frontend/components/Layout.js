// frontend/components/Layout.js
import React from "react";
import Sidebar from "./Sidebar";
import { Container, Row, Col } from "react-bootstrap";

const Layout = ({ children }) => {
  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        <Col xs={12} md={3} lg={2} className="d-none d-md-block">
          <Sidebar />
        </Col>
        <Col xs={12} md={9} lg={10} className="p-4 bg-light min-vh-100">
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;
