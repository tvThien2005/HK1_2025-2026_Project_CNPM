// frontend/app/page.tsx
"use client";
import Head from "next/head";
import Layout from "../components/Layout";
import { Container, Row, Col, Card } from "react-bootstrap";

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Dashboard | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <h1 className="my-4">Dashboard</h1>
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
    </>
  );
};

export default HomePage;
