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
  Card,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaUserTie, FaUpload } from "react-icons/fa";
import axios from "axios";

interface Driver {
  maTaiXe: number;
  tenTaiXe: string;
  ngaySinh: string;
  anhTaiXe: string;
  soDienThoai: string;
  soBangLai: string;
  trangThai: string;
  maTaiKhoan: number;
}

const DriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const itemsPerPage = 8;

  // Form state
  const [formData, setFormData] = useState({
    tenTaiXe: "",
    ngaySinh: "",
    anhTaiXe: "",
    soDienThoai: "",
    soBangLai: "",
  });

  // Lấy dữ liệu từ backend
  const fetchDrivers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/drivers");
      setDrivers(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài xế:", error);
      showAlert("Lỗi khi tải dữ liệu", "danger");
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý chọn file ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith("image/")) {
        showAlert("Vui lòng chọn file ảnh", "warning");
        return;
      }

      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert("Kích thước ảnh không được vượt quá 5MB", "warning");
        return;
      }

      setSelectedImage(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Lưu đường dẫn file (sẽ xử lý upload sau)
      setFormData((prev) => ({
        ...prev,
        anhTaiXe: file.name,
      }));
    }
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      anhTaiXe: "",
    }));
  };

  // Xóa tài xế
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa tài xế này?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/drivers/${id}`);
      setDrivers(drivers.filter((driver) => driver.maTaiXe !== id));
      showAlert("Xóa tài xế thành công", "success");
    } catch (error) {
      console.error("Lỗi khi xóa tài xế:", error);
      showAlert("Lỗi khi xóa tài xế", "danger");
    }
  };

  // Mở modal thêm
  const handleShowAddModal = () => {
    setFormData({
      tenTaiXe: "",
      ngaySinh: "",
      anhTaiXe: "",
      soDienThoai: "",
      soBangLai: "",
    });
    setSelectedImage(null);
    setImagePreview("");
    setShowAddModal(true);
  };

  // Mở modal sửa
  const handleShowEditModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormData({
      tenTaiXe: driver.tenTaiXe,
      ngaySinh: driver.ngaySinh.split("T")[0],
      anhTaiXe: driver.anhTaiXe || "",
      soDienThoai: driver.soDienThoai,
      soBangLai: driver.soBangLai,
    });
    // Hiển thị ảnh hiện tại nếu có
    if (driver.anhTaiXe) {
      setImagePreview(`http://localhost:5000${driver.anhTaiXe}`);
    } else {
      setImagePreview("");
    }
    setSelectedImage(null);
    setShowEditModal(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedDriver(null);
    setSelectedImage(null);
    setImagePreview("");
  };

  // Validation form
  const validateForm = () => {
    if (!formData.tenTaiXe.trim()) {
      showAlert("Vui lòng nhập tên tài xế", "warning");
      return false;
    }

    if (!formData.soDienThoai.trim()) {
      showAlert("Vui lòng nhập số điện thoại", "warning");
      return false;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.soDienThoai)) {
      showAlert("Số điện thoại phải có 10-11 chữ số", "warning");
      return false;
    }

    if (!formData.ngaySinh) {
      showAlert("Vui lòng nhập ngày sinh", "warning");
      return false;
    }

    const birthDate = new Date(formData.ngaySinh);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (birthDate > today) {
      showAlert("Ngày sinh không thể lớn hơn ngày hiện tại", "warning");
      return false;
    }

    if (age < 18) {
      showAlert("Tài xế phải từ 18 tuổi trở lên", "warning");
      return false;
    }

    if (!formData.soBangLai.trim()) {
      showAlert("Vui lòng nhập số bằng lái", "warning");
      return false;
    }

    return true;
  };

  // Upload ảnh lên server (nếu có)
  const uploadImage = async (): Promise<string> => {
    if (!selectedImage) return formData.anhTaiXe;

    try {
      // Tạo FormData đúng cách
      const formDataToSend = new FormData();

      // QUAN TRỌNG: Append file với đúng tên field "image"
      // Và truyền file object trực tiếp, không phải base64 hay string
      if (selectedImage instanceof File) {
        formDataToSend.append("image", selectedImage);
      } else if (typeof selectedImage === "string") {
        // Nếu selectedImage là base64 string, chuyển thành blob
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const file = new File([blob], "driver-image.jpg", {
          type: "image/jpeg",
        });
        formDataToSend.append("image", file);
      } else {
        throw new Error("Định dạng ảnh không hợp lệ");
      }

      console.log("📤 Đang upload ảnh...");

      const response = await axios.post(
        "http://localhost:5000/api/upload/driver",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          // Thêm timeout
          timeout: 30000,
        }
      );

      console.log("✅ Upload thành công:", response.data);
      return response.data.imageUrl;
    } catch (error: any) {
      console.error("❌ Lỗi upload ảnh:", error);

      if (error.code === "ECONNABORTED") {
        throw new Error("Timeout khi upload ảnh");
      }

      throw new Error(error.response?.data?.message || "Không thể upload ảnh");
    }
  };

  // Thêm tài xế
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Upload ảnh nếu có
      let imageUrl = formData.anhTaiXe;
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const driverData = {
        ...formData,
        anhTaiXe: imageUrl,
      };

      const res = await axios.post(
        "http://localhost:5000/api/drivers",
        driverData
      );

      if (res.data.exists) {
        showAlert("Số điện thoại đã tồn tại!", "danger");
        return;
      }
      fetchDrivers();
      handleCloseModal();
      showAlert("Thêm tài xế thành công", "success");
    } catch (error: any) {
      console.error("❌ Lỗi chi tiết:", error);
      showAlert(
        error.response?.data?.message || "Lỗi khi thêm tài xế",
        "danger"
      );
    }
  };

  // Sửa tài xế
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedDriver) return;

    try {
      // Upload ảnh nếu có ảnh mới
      let imageUrl = formData.anhTaiXe;
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const driverData = {
        ...formData,
        anhTaiXe: imageUrl,
      };

      await axios.put(
        `http://localhost:5000/api/drivers/${selectedDriver.maTaiXe}`,
        driverData
      );
      fetchDrivers();
      handleCloseModal();
      showAlert("Cập nhật tài xế thành công", "success");
    } catch (error) {
      console.error("Lỗi khi cập nhật tài xế:", error);
      showAlert("Lỗi khi cập nhật tài xế", "danger");
    }
  };

  // Hiển thị alert
  const showAlert = (message: string, type: string) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Lọc tài xế theo search
  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.tenTaiXe.toLowerCase().includes(search.toLowerCase()) ||
      driver.soDienThoai.includes(search) ||
      driver.soBangLai.toLowerCase().includes(search.toLowerCase())
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDrivers = filteredDrivers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Format ngày
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Tính tuổi
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <>
      <Head>
        <title>Quản lý tài xế | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="my-2 mb-0">Quản lý tài xế</h2>
          <Button variant="primary" onClick={handleShowAddModal}>
            Thêm tài xế mới
          </Button>
        </div>

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

        {/* Thanh tìm kiếm */}
        <Row className="mb-3">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                placeholder="Tìm kiếm theo tên, số điện thoại hoặc bằng lái..."
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
        </Row>

        {/* Bảng dữ liệu - ĐÃ SỬA: Bỏ cột ảnh riêng, hiển thị ảnh cùng tên */}
        <div className="table-container">
          <Table striped bordered hover className="shadow-sm no-border-table">
            <thead>
              <tr style={{ border: "none" }}>
                <th>Mã TX</th>
                <th>Tài xế</th>
                <th>Ngày sinh</th>
                <th>Tuổi</th>
                <th>Số điện thoại</th>
                <th>Số bằng lái</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentDrivers.length > 0 ? (
                currentDrivers.map((driver) => (
                  <tr key={driver.maTaiXe}>
                    <td>
                      <Badge bg="secondary">#{driver.maTaiXe}</Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {/* Hiển thị ảnh tài xế bên cạnh tên */}
                        {driver.anhTaiXe ? (
                          <img
                            src={`http://localhost:5000${driver.anhTaiXe}`}
                            alt={driver.tenTaiXe}
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                              borderRadius: "50%",
                              marginRight: "12px",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              backgroundColor: "#f8f9fa",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#6c757d",
                              marginRight: "12px",
                            }}
                          >
                            <FaUserTie size={16} />
                          </div>
                        )}
                        <span className="fw-semibold">{driver.tenTaiXe}</span>
                      </div>
                    </td>
                    <td>{formatDate(driver.ngaySinh)}</td>
                    <td>
                      <Badge bg="info">
                        {calculateAge(driver.ngaySinh)} tuổi
                      </Badge>
                    </td>
                    <td>{driver.soDienThoai}</td>
                    <td>
                      <Badge bg="warning" text="dark">
                        {driver.soBangLai}
                      </Badge>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          driver.trangThai === "Active"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {driver.trangThai === "Active"
                          ? "Hoạt động"
                          : "Ngừng hoạt động"}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2 mb-1"
                        style={{ border: "none" }}
                        onClick={() => handleShowEditModal(driver)}
                        title="Sửa"
                      >
                        <FaEdit size={18} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="mb-1 me-2"
                        style={{ border: "none" }}
                        onClick={() => handleDelete(driver.maTaiXe)}
                        title="Xóa"
                      >
                        <FaTrash size={18} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    Không có dữ liệu tài xế
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
                onClick={() => setCurrentPage(currentPage - 1)}
              />

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
                  </Pagination.Item>
                )
              )}

              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              />
            </Pagination>
          </div>
        )}

        {/* Modal Thêm tài xế - ĐÃ SỬA: Hiển thị ảnh preview lớn hơn */}
        <Modal
          show={showAddModal}
          onHide={handleCloseModal}
          centered
          backdrop="static"
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title className="w-100 text-center fw-semibold">
              Thêm tài xế mới
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAdd}>
            <Modal.Body>
              <Row>
                <Col md={7}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tên tài xế *</Form.Label>
                    <Form.Control
                      type="text"
                      name="tenTaiXe"
                      value={formData.tenTaiXe}
                      onChange={handleInputChange}
                      placeholder="Nhập họ tên tài xế"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Ngày sinh *</Form.Label>
                    <Form.Control
                      type="date"
                      name="ngaySinh"
                      value={formData.ngaySinh}
                      onChange={handleInputChange}
                      required
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="soDienThoai"
                      value={formData.soDienThoai}
                      onChange={handleInputChange}
                      placeholder="0912345678"
                      pattern="[0-9]{10,11}"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Số bằng lái *</Form.Label>
                    <Form.Control
                      type="text"
                      name="soBangLai"
                      value={formData.soBangLai}
                      onChange={handleInputChange}
                      placeholder="Nhập số bằng lái"
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={5}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ảnh tài xế</Form.Label>
                    <div className="border rounded p-3 text-center">
                      {imagePreview ? (
                        <div>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              width: "200px",
                              height: "200px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              marginBottom: "10px",
                            }}
                          />
                          <div>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={handleRemoveImage}
                            >
                              Xóa ảnh
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <FaUpload size={40} className="text-muted mb-2" />
                          <div>
                            <Form.Control
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              style={{ display: "none" }}
                              id="image-upload"
                            />
                            <Button
                              variant="outline-primary"
                              onClick={() =>
                                document.getElementById("image-upload")?.click()
                              }
                            >
                              Chọn ảnh
                            </Button>
                          </div>
                          <small className="text-muted d-block mt-2">
                            Chấp nhận: JPG, PNG, GIF (tối đa 5MB)
                          </small>
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  {selectedImage && (
                    <Card className="bg-light">
                      <Card.Body className="py-2">
                        <small className="text-muted">
                          <strong>File đã chọn:</strong> {selectedImage.name}
                          <br />
                          <strong>Kích thước:</strong>{" "}
                          {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                        </small>
                      </Card.Body>
                    </Card>
                  )}
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Thêm tài xế
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal Sửa tài xế - ĐÃ SỬA: Hiển thị ảnh preview lớn hơn */}
        <Modal show={showEditModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="w-100 text-center fw-semibold">
              Sửa thông tin tài xế
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEdit}>
            <Modal.Body>
              <Row>
                <Col md={7}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tên tài xế *</Form.Label>
                    <Form.Control
                      type="text"
                      name="tenTaiXe"
                      value={formData.tenTaiXe}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Ngày sinh *</Form.Label>
                    <Form.Control
                      type="date"
                      name="ngaySinh"
                      value={formData.ngaySinh}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="soDienThoai"
                      value={formData.soDienThoai}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Số bằng lái *</Form.Label>
                    <Form.Control
                      type="text"
                      name="soBangLai"
                      value={formData.soBangLai}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={5}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ảnh tài xế</Form.Label>
                    <div className="border rounded p-3 text-center">
                      {imagePreview ? (
                        <div>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              width: "200px",
                              height: "200px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              marginBottom: "10px",
                            }}
                          />
                          <div>
                            <Form.Control
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              style={{ display: "none" }}
                              id="image-upload-edit"
                            />
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() =>
                                document
                                  .getElementById("image-upload-edit")
                                  ?.click()
                              }
                            >
                              Đổi ảnh
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={handleRemoveImage}
                            >
                              Xóa ảnh
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <FaUpload size={40} className="text-muted mb-2" />
                          <div>
                            <Form.Control
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              style={{ display: "none" }}
                              id="image-upload-edit"
                            />
                            <Button
                              variant="outline-primary"
                              onClick={() =>
                                document
                                  .getElementById("image-upload-edit")
                                  ?.click()
                              }
                            >
                              Chọn ảnh
                            </Button>
                          </div>
                          <small className="text-muted d-block mt-2">
                            Chấp nhận: JPG, PNG, GIF (tối đa 5MB)
                          </small>
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  {selectedImage && (
                    <Card className="bg-light">
                      <Card.Body className="py-2">
                        <small className="text-muted">
                          <strong>File mới:</strong> {selectedImage.name}
                          <br />
                          <strong>Kích thước:</strong>{" "}
                          {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                        </small>
                      </Card.Body>
                    </Card>
                  )}
                </Col>
              </Row>

              {selectedDriver && (
                <div className="bg-light p-3 rounded">
                  <small className="text-muted">
                    <strong>Thông tin hệ thống:</strong>
                    <br />
                    Mã tài xế: {selectedDriver.maTaiXe}
                    <br />
                    Mã tài khoản: {selectedDriver.maTaiKhoan}
                    <br />
                    Trạng thái: {selectedDriver.trangThai}
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

export default DriversPage;
