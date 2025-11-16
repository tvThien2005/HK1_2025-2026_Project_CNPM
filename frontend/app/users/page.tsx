"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Container,
  Table,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
  Pagination,
  Modal,
  Alert,
  Badge,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaLock, FaUnlock } from "react-icons/fa";
import axios from "axios";
import { LuRadius } from "react-icons/lu";

interface User {
  maTaiKhoan: number;
  tenDangNhap: string;
  matKhau: string;
  ngayTao: string;
  capDo: string;
  trangThai: string;
  tinhTrang: number;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const itemsPerPage = 10;

  // Form state - CHỈ các trường cần thiết
  const [formData, setFormData] = useState({
    tenDangNhap: "",
    matKhau: "",
    capDo: "Manager",
    hoTen: "",
  });
  const [formData1, setFormData1] = useState({
    tenDangNhap: "",
    matKhau: "",
    capDo: "",
  });

  // Lấy dữ liệu từ backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài khoản:", error);
      showAlert("Lỗi khi tải dữ liệu", "danger");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (showAddModal) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setFormData1((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xóa tài khoản
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa tài khoản này?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      setUsers(users.filter((user) => user.maTaiKhoan !== id));
      showAlert("Xóa tài khoản thành công", "success");
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
      showAlert("Lỗi khi xóa tài khoản", "danger");
    }
  };

  // Mở modal thêm
  const handleShowAddModal = () => {
    setFormData({
      tenDangNhap: "",
      matKhau: "",
      capDo: "Parent",
      hoTen: "",
    });
    setShowAddModal(true);
  };

  // Mở modal sửa
  const handleShowEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData1({
      tenDangNhap: user.tenDangNhap,
      matKhau: user.matKhau.split("T")[0],
      capDo: user.capDo,
    });
    setShowEditModal(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  // Validation form
  const validateForm = () => {
    if (!formData.tenDangNhap.trim()) {
      showAlert("Vui lòng nhập số điện thoại", "warning");
      return false;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.tenDangNhap)) {
      showAlert("Số điện thoại phải có 10-11 chữ số", "warning");
      return false;
    }

    if (!formData.matKhau) {
      showAlert("Vui lòng nhập mật khẩu", "warning");
      return false;
    }

    const birthDate = new Date(formData.matKhau);
    const today = new Date();
    if (birthDate > today) {
      showAlert("Ngày sinh không thể lớn hơn ngày hiện tại", "warning");
      return false;
    }

    return true;
  };
  const validateFormEdit = () => {
    if (!formData1.tenDangNhap.trim()) {
      showAlert("Vui lòng nhập số điện thoại", "warning");
      return false;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData1.tenDangNhap)) {
      showAlert("Số điện thoại phải có 10-11 chữ số", "warning");
      return false;
    }

    if (!formData1.matKhau) {
      showAlert("Vui lòng nhập ngày sinh", "warning");
      return false;
    }

    const birthDate = new Date(formData1.matKhau);
    const today = new Date();
    if (birthDate > today) {
      showAlert("Ngày sinh không thể lớn hơn ngày hiện tại", "warning");
      return false;
    }

    return true;
  };

  // Thêm tài khoản
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await axios.post("http://localhost:5000/api/users", {
        ...formData,
        trangThai: "Hoạt động", // Trạng thái mặc định
      });
      fetchUsers();
      handleCloseModal();
      showAlert("Thêm tài khoản thành công", "success");
    } catch (error: any) {
      console.error("❌ Lỗi chi tiết:", error);
      console.error("📊 Error response:", error.response?.data);
      console.error("🔢 Status code:", error.response?.status);
      showAlert(
        error.response?.data?.message || "Lỗi khi thêm tài khoản",
        "danger"
      );
    }
  };

  // Sửa tài khoản
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFormEdit() || !selectedUser) return;

    try {
      await axios.put(
        `http://localhost:5000/api/users/${selectedUser.maTaiKhoan}`,
        {
          ...formData1,
          trangThai: selectedUser.trangThai, // Giữ nguyên trạng thái
        }
      );
      fetchUsers();
      handleCloseModal();
      showAlert("Cập nhật tài khoản thành công", "success");
    } catch (error) {
      console.error("Lỗi khi cập nhật tài khoản:", error);
      showAlert("Lỗi khi cập nhật tài khoản", "danger");
    }
  };

  const handleBlock = async (id: number) => {
    if (!confirm("Bạn có chắc muốn khóa tài khoản này?")) return;
    try {
      await axios.patch(`http://localhost:5000/api/users/${id}/block`);
      fetchUsers();
      showAlert("Khóa tài khoản thành công", "success");
    } catch (error) {
      console.error("Lỗi khi khóa tài khoản:", error);
      showAlert("Lỗi khi khóa tài khoản", "danger");
    }
  };

  const handleUnblock = async (id: number) => {
    if (!confirm("Bạn có chắc muốn mở khóa tài khoản này?")) return;
    try {
      await axios.patch(`http://localhost:5000/api/users/${id}/unblock`);
      fetchUsers();
      showAlert("Mở khóa tài khoản thành công", "success");
    } catch (error) {
      console.error("Lỗi khi mở khóa tài khoản:", error);
      showAlert("Lỗi khi mở khóa tài khoản", "danger");
    }
  };

  // Hiển thị alert
  const showAlert = (message: string, type: string) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Lọc tài khoản theo search
  const filteredUsers = users.filter(
    (u) =>
      u.tenDangNhap &&
      u.tenDangNhap.toLowerCase().includes(search.toLowerCase())
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Tạo mảng số trang cho Pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Xử lý chuyển trang
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Format ngày
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <>
      <Head>
        <title>Quản lý tài khoản | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <h2 className="my-2">Quản lý tài khoản</h2>

        {/* Alert */}
        {alert.show && (
          <div
            className="position-fixed bottom-0 end-0 p-3"
            style={{ zIndex: 2000 }}
          >
            <Alert variant={alert.type} className="shadow">
              {alert.message}
            </Alert>
          </div>
        )}

        {/* Thanh tìm kiếm và nút thêm - nằm ngang hàng */}
        <Row className="align-items-center mb-3">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                placeholder="Tìm kiếm theo số điện thoại..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
              <Button variant="secondary" onClick={() => setSearch("")}>
                Xóa
              </Button>
            </InputGroup>
          </Col>
          <Col md={6} className="text-end">
            <Button variant="primary" onClick={handleShowAddModal}>
              Thêm tài khoản mới
            </Button>
          </Col>
        </Row>
        <div className="table-container">
          <Table striped bordered hover className="shadow-sm no-border-table">
            <thead>
              <tr style={{ border: "none" }}>
                <th>Mã Tài Khoản</th>
                <th>Tên đăng nhập</th>
                <th>Mật khẩu</th>
                <th>Ngày tạo</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={user.maTaiKhoan}>
                    <td>
                      <Badge bg="secondary">#{user.maTaiKhoan}</Badge>
                    </td>
                    <td>{user.tenDangNhap}</td>
                    <td>{user.matKhau}</td>
                    <td>{user.ngayTao.split("T")[0]}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.capDo === "Manager"
                            ? "bg-primary"
                            : user.capDo === "Driver"
                            ? "bg-success"
                            : "bg-warning"
                        }`}
                      >
                        {user.capDo}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.trangThai === "Active"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {user.trangThai}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2 mb-1"
                        style={{ border: "none" }}
                        onClick={() => handleShowEditModal(user)}
                        title="Sửa"
                      >
                        <FaEdit size={20} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="me-2 mb-1"
                        style={{ border: "none" }}
                        onClick={() => handleDelete(user.maTaiKhoan)}
                        title="Xóa"
                      >
                        <FaTrash size={20} />
                      </Button>
                      {user.tinhTrang === 1 ? (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="mb-1"
                          style={{ border: "none" }}
                          onClick={() => handleBlock(user.maTaiKhoan)}
                          title="Khóa"
                        >
                          <FaLock size={20} />
                        </Button>
                      ) : (
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="mb-1"
                          style={{ border: "none" }}
                          onClick={() => handleUnblock(user.maTaiKhoan)}
                          title="Mở khóa"
                        >
                          <FaUnlock size={20} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Phân trang */}
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

        {/* Modal Thêm tài khoản */}
        <Modal
          show={showAddModal}
          onHide={handleCloseModal}
          centered
          backdrop="static"
          dialogClassName="w-auto"
          contentClassName="no-frame"
        >
          <Form onSubmit={handleAdd}>
            <div
              className="p-4 rounded-3 bg-white shadow-sm position-relative"
              style={{ width: 400 }}
            >
              <button
                type="button"
                className="btn-close position-absolute"
                style={{ top: 15, right: 15 }}
                onClick={handleCloseModal}
                aria-label="Close"
              ></button>
              <h5 className="text-center mb-4 fw-semibold">
                Thêm tài khoản mới
              </h5>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">
                  Họ và tên *
                </Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  name="hoTen"
                  value={formData.hoTen}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">
                  Tên đăng nhập (SDT) *
                </Form.Label>
                <Form.Control
                  size="sm"
                  type="tel"
                  name="tenDangNhap"
                  value={formData.tenDangNhap}
                  onChange={handleInputChange}
                  placeholder="0912345678"
                  pattern="[0-9]{10,11}"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">
                  Mật khẩu (Ngày sinh) *
                </Form.Label>
                <Form.Control
                  size="sm"
                  type="date"
                  name="matKhau"
                  value={formData.matKhau}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold">Cấp độ *</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value="Quản lý"
                  disabled
                  readOnly
                  className="fw-bold text-center"
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="light" size="sm" onClick={handleCloseModal}>
                  Hủy
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Thêm tài khoản
                </Button>
              </div>
            </div>
          </Form>
        </Modal>

        {/* Modal Sửa tài khoản */}
        <Modal show={showEditModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Sửa thông tin tài khoản</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEdit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="tenDangNhap"
                      value={formData1.tenDangNhap}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ngày sinh *</Form.Label>
                    <Form.Control
                      type="date"
                      name="matKhau"
                      value={formData1.matKhau}
                      onChange={handleInputChange}
                      required
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Vai trò *</Form.Label>
                <Form.Select
                  name="capDo"
                  value={formData1.capDo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Parent">Phụ huynh</option>
                  <option value="Manager">Quản lý</option>
                  <option value="Driver">Tài xế</option>
                </Form.Select>
              </Form.Group>

              {selectedUser && (
                <div className="bg-light p-3 rounded">
                  <small className="text-muted">
                    <strong>Thông tin hệ thống:</strong>
                    <br />
                    Mã tài khoản: {selectedUser.maTaiKhoan}
                    <br />
                    Trạng thái: {selectedUser.trangThai}
                    <br />
                    Ngày tạo: {formatDate(selectedUser.ngayTao)}
                  </small>
                </div>
              )}
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

export default UsersPage;
