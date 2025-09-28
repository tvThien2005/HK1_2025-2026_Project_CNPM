// frontend/app/drivers/page.tsx
"use client";
import Head from "next/head";
// import Layout from "../../components/Layout";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useState, useEffect } from "react";

// Định nghĩa kiểu dữ liệu cho Vehicle và Driver
interface Vehicle {
  id: number;
  license_plate: string;
  assigned_driver_id: number | null;
}

interface Driver {
  id: number;
  name: string;
}

const DriversPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    // Dữ liệu giả định
    setVehicles([
      { id: 1, license_plate: "29A-123.45", assigned_driver_id: null },
      { id: 2, license_plate: "30B-678.90", assigned_driver_id: 101 },
      { id: 3, license_plate: "34C-987.65", assigned_driver_id: null },
    ]);
    setDrivers([
      { id: 101, name: "Nguyễn Văn A" },
      { id: 102, name: "Trần Thị B" },
      { id: 103, name: "Phạm Văn C" },
    ]);
  }, []);

  const handleAssignDriver = (vehicleId: number, driverId: number | null) => {
    // Cập nhật state cục bộ để giao diện thay đổi
    setVehicles((prevVehicles) =>
      prevVehicles.map((vehicle) =>
        vehicle.id === vehicleId
          ? { ...vehicle, assigned_driver_id: driverId }
          : vehicle
      )
    );
  };

  return (
    <>
      <Head>
        <title>Phân công tài xế | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <h1 className="my-4">Phân công tài xế cho xe</h1>
        <Row xs={1} md={2} lg={3} className="g-4">
          {vehicles.map((vehicle) => (
            <Col key={vehicle.id}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>{`Xe: ${vehicle.license_plate}`}</Card.Title>
                  <Form.Group className="mt-3">
                    <Form.Label>Phân công tài xế:</Form.Label>
                    <Form.Select
                      value={vehicle.assigned_driver_id || ""}
                      onChange={(e) => {
                        const newDriverId = e.target.value
                          ? parseInt(e.target.value)
                          : null;
                        handleAssignDriver(vehicle.id, newDriverId);
                      }}
                    >
                      <option value="">-- Chọn tài xế --</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default DriversPage;
