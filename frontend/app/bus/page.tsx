"use client";
import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import Layout from "../../components/Layout";
import { FaSearch } from "react-icons/fa";

interface Vehicle {
  maXe: string;
  bienSo: string;
  sucChua: number;
  mauXe: string;
  trangThai: string;
}

// Dữ liệu giả để hiển thị giao diện
const MOCK_VEHICLES: Vehicle[] = [
  {
    maXe: "X01",
    bienSo: "51K-123.45",
    sucChua: 40,
    mauXe: "Hyundai",
    trangThai: "Hoạt động",
  },
  {
    maXe: "X02",
    bienSo: "51K-678.90",
    sucChua: 45,
    mauXe: "Mercedes",
    trangThai: "Ngừng hoạt động",
  },
  {
    maXe: "X03",
    bienSo: "51K-111.22",
    sucChua: 35,
    mauXe: "Ford",
    trangThai: "Hoạt động",
  },
];

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<Vehicle>({
    maXe: "",
    bienSo: "",
    sucChua: 0,
    mauXe: "",
    trangThai: "Hoạt động",
  });

  useEffect(() => {
    // Sử dụng dữ liệu giả thay vì gọi API
    setVehicles(MOCK_VEHICLES);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredVehicles = vehicles.filter((vehicle) =>
    Object.values(vehicle).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleShowModal = (vehicle: Vehicle | null = null) => {
    setCurrentVehicle(vehicle);
    if (vehicle) {
      setFormData({
        maXe: vehicle.maXe,
        bienSo: vehicle.bienSo,
        sucChua: vehicle.sucChua,
        mauXe: vehicle.mauXe,
        trangThai: vehicle.trangThai,
      });
    } else {
      setFormData({
        maXe: "",
        bienSo: "",
        sucChua: 0,
        mauXe: "",
        trangThai: "Hoạt động",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "sucChua" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Dữ liệu đã gửi:", formData);
    // Logic thêm/sửa dữ liệu giả tại đây (chỉ để demo)
    if (currentVehicle) {
      setVehicles((prev) =>
        prev.map((v) => (v.maXe === currentVehicle.maXe ? { ...formData } : v))
      );
    } else {
      setVehicles((prev) => [...prev, { ...formData }]);
    }
    handleCloseModal();
  };

  const handleDelete = (maXe: string) => {
    console.log("Xóa xe có mã:", maXe);
    // Logic xóa dữ liệu giả
    setVehicles((prev) => prev.filter((v) => v.maXe !== maXe));
  };

  return (
    <>
      <Container>
        <h1 className="my-4">Quản Lí Xe Buýt</h1>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <span className="input-group-text">
              <FaSearch />
            </span>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Button variant="primary" onClick={() => handleShowModal()}>
            Thêm Xe Mới
          </Button>
        </div>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Mã Xe</th>
              <th>Biển Số</th>
              <th>Sức Chứa</th>
              <th>Mẫu Xe</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <tr key={vehicle.maXe}>
                  <td>{vehicle.maXe}</td>
                  <td>{vehicle.bienSo}</td>
                  <td>{vehicle.sucChua}</td>
                  <td>{vehicle.mauXe}</td>
                  <td>{vehicle.trangThai}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowModal(vehicle)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(vehicle.maXe)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  Không tìm thấy xe nào.
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {currentVehicle ? "Sửa Thông Tin Xe" : "Thêm Xe Mới"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Mã Xe</Form.Label>
                <Form.Control
                  type="text"
                  name="maXe"
                  value={formData.maXe}
                  // onChange={handleChange}
                  required
                  disabled={!!currentVehicle}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Biển Số</Form.Label>
                <Form.Control
                  type="text"
                  name="bienSo"
                  value={formData.bienSo}
                  // onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Sức Chứa</Form.Label>
                <Form.Control
                  type="number"
                  name="sucChua"
                  value={formData.sucChua}
                  // onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mẫu Xe</Form.Label>
                <Form.Control
                  type="text"
                  name="mauXe"
                  value={formData.mauXe}
                  // onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Trạng Thái</Form.Label>
                <Form.Select
                  name="trangThai"
                  value={formData.trangThai}
                  onChange={handleChange}
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                </Form.Select>
              </Form.Group>
              <Button variant="primary" type="submit">
                {currentVehicle ? "Lưu Thay Đổi" : "Thêm Xe"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
};

export default VehiclesPage;
