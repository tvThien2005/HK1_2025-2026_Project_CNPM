"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  Alert,
  Pagination,
} from "react-bootstrap";
import Head from "next/head";
import { FaEdit, FaTrash, FaLock, FaUnlock } from "react-icons/fa";
import axios from "axios";

interface Bus {
  maXeBuyt: number;
  bienSoXe: string;
  sucChua: number;
  mauXe: string;
  trangThai: string;
}

interface BusForm {
  bienSoXe: string;
  sucChua: string;
  mauXe: string;
}

const BusesPage = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const itemsPerPage = 8;

  const [formData, setFormData] = useState<BusForm>({
    bienSoXe: "",
    sucChua: "",
    mauXe: "",
  });

  const fetchBuses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/buses");
      // backend returns { success: true, data: buses }
      setBuses(res.data.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách xe:", error);
      showAlert("Lỗi khi tải dữ liệu", "danger");
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.bienSoXe.trim()) {
      showAlert("Vui lòng nhập biển số xe", "warning");
      return false;
    }
    if (!formData.sucChua.trim() || isNaN(Number(formData.sucChua))) {
      showAlert("Vui lòng nhập sức chứa hợp lệ (số)", "warning");
      return false;
    }
    if (!formData.mauXe.trim()) {
      showAlert("Vui lòng nhập màu xe", "warning");
      return false;
    }
    return true;
  };

  const handleShowAddModal = () => {
    setFormData({ bienSoXe: "", sucChua: "", mauXe: "" });
    setShowAddModal(true);
  };

  const handleShowEditModal = (bus: Bus) => {
    setSelectedBus(bus);
    setFormData({
      bienSoXe: bus.bienSoXe,
      sucChua: String(bus.sucChua),
      mauXe: bus.mauXe,
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedBus(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = {
        bienSoXe: formData.bienSoXe.trim(),
        sucChua: Number(formData.sucChua),
        mauXe: formData.mauXe.trim(),
        trangThai: "Active",
      };
      await axios.post("http://localhost:5000/api/buses", payload);
      fetchBuses();
      handleCloseModal();
      showAlert("Thêm xe thành công", "success");
    } catch (error: any) {
      console.error("Lỗi khi thêm xe:", error);
      showAlert(error.response?.data?.error || "Lỗi khi thêm xe", "danger");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedBus) return;
    try {
      const payload = {
        bienSoXe: formData.bienSoXe.trim(),
        sucChua: Number(formData.sucChua),
        mauXe: formData.mauXe.trim(),
        trangThai: selectedBus.trangThai,
      };
      await axios.put(
        `http://localhost:5000/api/buses/${selectedBus.maXeBuyt}`,
        payload
      );
      fetchBuses();
      handleCloseModal();
      showAlert("Cập nhật xe thành công", "success");
    } catch (error: any) {
      console.error("Lỗi khi cập nhật xe:", error);
      showAlert(error.response?.data?.error || "Lỗi khi cập nhật xe", "danger");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa xe này?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/buses/${id}`);
      setBuses(buses.filter((b) => b.maXeBuyt !== id));
      showAlert("Xóa xe thành công", "success");
    } catch (error) {
      console.error("Lỗi khi xóa xe:", error);
      showAlert("Lỗi khi xóa xe", "danger");
    }
  };

  const handleBlock = async (id: number) => {
    if (!confirm("Bạn có chắc muốn khóa xe này?")) return;
    try {
      await axios.patch(`http://localhost:5000/api/buses/${id}/block`);
      fetchBuses();
      showAlert("Khóa xe thành công", "success");
    } catch (error) {
      console.error("Lỗi khi khóa xe:", error);
      showAlert("Lỗi khi khóa xe", "danger");
    }
  };

  const handleUnblock = async (id: number) => {
    if (!confirm("Bạn có chắc muốn mở khóa xe này?")) return;
    try {
      await axios.patch(`http://localhost:5000/api/buses/${id}/unblock`);
      fetchBuses();
      showAlert("Mở khóa xe thành công", "success");
    } catch (error) {
      console.error("Lỗi khi mở khóa xe:", error);
      showAlert("Lỗi khi mở khóa xe", "danger");
    }
  };

  const showAlert = (message: string, type: string) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 3000);
  };

  const filtered = buses.filter(
    (u) =>
      (u.bienSoXe || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.mauXe || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <Head>
        <title>Quản lý xe buýt | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <h2 className="my-4">Quản lý xe buýt</h2>

        {alert.show && (
          <Alert variant={alert.type} className="mb-3">
            {alert.message}
          </Alert>
        )}

        <Row className="align-items-center mb-3">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                placeholder="Tìm kiếm theo biển số hoặc màu xe..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="secondary" onClick={() => setSearch("")}>
                Xóa
              </Button>
            </InputGroup>
          </Col>
          <Col md={6} className="text-end">
            <Button variant="primary" onClick={handleShowAddModal}>
              Thêm xe mới
            </Button>
          </Col>
        </Row>

        <div className="table-container">
          <Table
            striped
            bordered
            hover
            className="shadow-sm text-center"
            style={{ verticalAlign: "middle", textAlign: "center" }}
          >
            <thead>
              <tr>
                <th>Mã xe</th>
                <th>Biển số</th>
                <th>Sức chứa</th>
                <th>Màu xe</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((bus) => (
                  <tr key={bus.maXeBuyt}>
                    <td>{bus.maXeBuyt}</td>
                    <td>{bus.bienSoXe}</td>
                    <td>{bus.sucChua}</td>
                    <td>{bus.mauXe}</td>
                    <td>
                      <span
                        className={`badge ${
                          bus.trangThai === "Active"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {bus.trangThai}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2 mb-1"
                        style={{ border: "none" }}
                        onClick={() => handleShowEditModal(bus)}
                        title="Sửa"
                      >
                        <FaEdit size={16} />
                      </Button>
                      {/* 
                      {bus.trangThai === "Active" ? (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="me-2 mb-1"
                          style={{ border: "none" }}
                          onClick={() => handleBlock(bus.maXeBuyt)}
                          title="Khóa"
                        >
                          <FaLock size={16} />
                        </Button>
                      ) : (
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="me-2 mb-1"
                          style={{ border: "none" }}
                          onClick={() => handleUnblock(bus.maXeBuyt)}
                          title="Mở khóa"
                        >
                          <FaUnlock size={16} />
                        </Button>
                      )} */}

                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="mb-1"
                        style={{ border: "none" }}
                        onClick={() => handleDelete(bus.maXeBuyt)}
                        title="Xóa"
                      >
                        <FaTrash size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              />
              {pageNumbers.map((number) => (
                <Pagination.Item
                  key={number}
                  active={number === currentPage}
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </Pagination>
          </div>
        )}

        {/* Modal Thêm xe */}
        <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Thêm xe buýt mới</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAdd}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Biển số *</Form.Label>
                    <Form.Control
                      type="text"
                      name="bienSoXe"
                      value={formData.bienSoXe}
                      onChange={handleInputChange}
                      placeholder="Nhập biển số"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Sức chứa *</Form.Label>
                    <Form.Control
                      type="number"
                      name="sucChua"
                      value={formData.sucChua}
                      onChange={handleInputChange}
                      placeholder="Số lượng chỗ ngồi"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Màu xe *</Form.Label>
                    <Form.Control
                      type="text"
                      name="mauXe"
                      value={formData.mauXe}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Trắng, Xanh..."
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Thêm xe
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal Sửa xe */}
        <Modal show={showEditModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Sửa thông tin xe</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEdit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Biển số *</Form.Label>
                    <Form.Control
                      type="text"
                      name="bienSoXe"
                      value={formData.bienSoXe}
                      onChange={handleInputChange}
                      placeholder="Nhập biển số"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Sức chứa *</Form.Label>
                    <Form.Control
                      type="number"
                      name="sucChua"
                      value={formData.sucChua}
                      onChange={handleInputChange}
                      placeholder="Số lượng chỗ ngồi"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Màu xe *</Form.Label>
                    <Form.Control
                      type="text"
                      name="mauXe"
                      value={formData.mauXe}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Trắng, Xanh..."
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  {selectedBus && (
                    <div className="bg-light p-3 rounded">
                      <small className="text-muted">
                        <strong>Thông tin hệ thống:</strong>
                        <br />
                        Mã xe: {selectedBus.maXeBuyt}
                        <br />
                        Trạng thái: {selectedBus.trangThai}
                      </small>
                    </div>
                  )}
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Cập nhật
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </>
  );
};

export default BusesPage;
