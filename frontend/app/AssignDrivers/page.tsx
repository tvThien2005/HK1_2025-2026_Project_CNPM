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
  Card,
  Badge,
} from "react-bootstrap";
import { FaEdit, FaTrash, FaCog } from "react-icons/fa";
import axios from "axios";

interface Assign {
  maChuyenXe: number;
  tenTaiXe: string;
  tenXe: string;
  bienSoXe: string;
  ngay: string;
  thoiGianDi: string;
  thoiGianDen: string;
  tenTuyenDuong: string;
  trangThai: string;

  // optional IDs (recommended backend should provide)
  maTaiXe?: number;
  maXeBuyt?: number;
  maLichTrinh?: number;
  maTuyenDuong?: number;
}

interface Driver {
  maTaiXe: number;
  tenTaiXe: string;
}

interface Bus {
  maXeBuyt: number;
  bienSoXe: string;
}

interface Schedule {
  maLichTrinh: number;
  ngay: string;
  thoiGianDi: string;
  thoiGianDen: string;
}

interface Route {
  maTuyenDuong: number;
  tenTuyenDuong: string;
}

const AssignPage = () => {
  const [assigns, setAssigns] = useState<Assign[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedBus, setSelectedBus] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAssign, setSelectedAssign] = useState<Assign | null>(null);
  const [selectedStatusAssign, setSelectedStatusAssign] =
    useState<Assign | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const [formAdd, setFormAdd] = useState({
    maTaiXe: "",
    maXeBuyt: "",
    maLichTrinh: "",
    maTuyenDuong: "",
  });
  const [formEdit, setFormEdit] = useState({
    maTaiXe: "",
    maXeBuyt: "",
    maLichTrinh: "",
    maTuyenDuong: "",
  });

  // Hàm lấy màu badge cho trạng thái
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-info text-dark";
      case "InProgress":
        return "bg-warning text-dark";
      case "Completed":
        return "bg-success";
      default:
        return "bg-danger";
    }
  };

  // Hàm lấy tên hiển thị cho trạng thái
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "Đã lên lịch";
      case "InProgress":
        return "Đang thực hiện";
      case "Completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  // Hàm cập nhật trạng thái
  const handleStatusUpdate = async () => {
    if (!selectedStatusAssign || !newStatus) {
      showAlert("Vui lòng chọn trạng thái mới", "warning");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/assignDrivers/${selectedStatusAssign.maChuyenXe}/status`,
        { trangThai: newStatus }
      );
      showAlert("Cập nhật trạng thái thành công", "success");
      setShowStatusModal(false);
      setSelectedStatusAssign(null);
      setNewStatus("");
      fetchAssigns();
    } catch (err: any) {
      console.error("Lỗi cập nhật trạng thái:", err);
      showAlert(
        err?.response?.data?.error || "Lỗi khi cập nhật trạng thái",
        "danger"
      );
    }
  };

  // Fetch functions
  const fetchAssigns = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/assignDrivers");
      setAssigns(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy phân công:", err);
      showAlert("Lỗi khi tải phân công", "danger");
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/drivers");
      setDrivers(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy tài xế:", err);
      showAlert("Lỗi khi tải danh sách tài xế", "danger");
    }
  };

  const fetchBuses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/buses");
      setBuses(res.data.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy xe:", err);
      showAlert("Lỗi khi tải danh sách xe", "danger");
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/assignDrivers/schedules"
      );
      setSchedules(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy lịch trình:", err);
      showAlert("Lỗi khi tải lịch trình", "danger");
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/assignDrivers/routes"
      );
      setRoutes(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy tuyến:", err);
      showAlert("Lỗi khi tải danh sách tuyến", "danger");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([
      fetchAssigns(),
      fetchDrivers(),
      fetchBuses(),
      fetchSchedules(),
      fetchRoutes(),
    ]);
  };

  // Helpers
  const showAlert = (message: string, type: string) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  // Search filter
  const filtered = assigns.filter((a) => {
    const q = search.trim().toLowerCase();
    if (
      q &&
      !(
        (a.tenTaiXe || "").toLowerCase().includes(q) ||
        (a.tenXe || "").toLowerCase().includes(q) ||
        (a.bienSoXe || "").toLowerCase().includes(q) ||
        (a.tenTuyenDuong || "").toLowerCase().includes(q) ||
        (getStatusDisplayName(a.trangThai) || "")
          .toLowerCase()
          .includes(getStatusDisplayName(q))
      )
    ) {
      return false;
    }

    if (dateFrom) {
      const assignDate = new Date(a.ngay);
      const fromDate = new Date(dateFrom);
      if (assignDate < fromDate) {
        return false;
      }
    }

    if (dateTo) {
      const assignDate = new Date(a.ngay);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (assignDate > toDate) {
        return false;
      }
    }

    if (selectedTime && a.thoiGianDi !== selectedTime) {
      return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssigns = filtered.slice(startIndex, startIndex + itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Format schedule display
  const formatScheduleOption = (s: Schedule) =>
    `${new Date(s.ngay).toISOString().split("T")[0]} | ${s.thoiGianDi} → ${
      s.thoiGianDen
    }`;

  // Fallback mapping
  const mapAssignToIds = (a: Assign) => {
    const out = {
      maTaiXe:
        a.maTaiXe ?? drivers.find((d) => d.tenTaiXe === a.tenTaiXe)?.maTaiXe,
      maXeBuyt:
        a.maXeBuyt ?? buses.find((b) => b.bienSoXe === a.bienSoXe)?.maXeBuyt,
      maLichTrinh:
        a.maLichTrinh ??
        schedules.find(
          (s) =>
            new Date(s.ngay).toISOString().split("T")[0] ===
              new Date(a.ngay).toISOString().split("T")[0] &&
            s.thoiGianDi === a.thoiGianDi &&
            s.thoiGianDen === a.thoiGianDen
        )?.maLichTrinh,
      maTuyenDuong:
        a.maTuyenDuong ??
        routes.find((r) => r.tenTuyenDuong === a.tenTuyenDuong)?.maTuyenDuong,
      // maPhanCong:
      //   a.maChuyenXe ??
      //   assigns.find((as) => as.trangThai === a.trangThai)?.maChuyenXe,
    };
    return out;
  };

  // Open Add modal
  const handleShowAdd = () => {
    setFormAdd({
      maTaiXe: "",
      maXeBuyt: "",
      maLichTrinh: "",
      maTuyenDuong: "",
    });
    setShowAddModal(true);
  };

  // Add
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formAdd.maTaiXe ||
      !formAdd.maXeBuyt ||
      !formAdd.maLichTrinh ||
      !formAdd.maTuyenDuong
    ) {
      showAlert("Vui lòng chọn đủ thông tin", "warning");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/assignDrivers", {
        maTaiXe: Number(formAdd.maTaiXe),
        maXeBuyt: Number(formAdd.maXeBuyt),
        maLichTrinh: Number(formAdd.maLichTrinh),
        maTuyenDuong: Number(formAdd.maTuyenDuong),
      });
      if (!res.data.success) {
        showAlert(res.data.message, "warning");
        return;
      }
      showAlert("Thêm phân công thành công", "success");
      setShowAddModal(false);
      fetchAssigns();
    } catch (err: any) {
      console.error("Lỗi thêm phân công:", err);
      showAlert(err?.response?.data?.message || "Lỗi khi thêm", "danger");
    }
  };

  // Show edit modal
  const handleShowEdit = (a: Assign) => {
    setSelectedAssign(a);
    const mapped = mapAssignToIds(a);
    setFormEdit({
      maTaiXe: mapped.maTaiXe ? String(mapped.maTaiXe) : "",
      maXeBuyt: mapped.maXeBuyt ? String(mapped.maXeBuyt) : "",
      maLichTrinh: mapped.maLichTrinh ? String(mapped.maLichTrinh) : "",
      maTuyenDuong: mapped.maTuyenDuong ? String(mapped.maTuyenDuong) : "",
    });
    setShowEditModal(true);
  };

  // Edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssign) return;
    if (
      !formEdit.maTaiXe ||
      !formEdit.maXeBuyt ||
      !formEdit.maLichTrinh ||
      !formEdit.maTuyenDuong
    ) {
      showAlert("Vui lòng chọn đủ thông tin", "warning");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/assignDrivers/${selectedAssign.maChuyenXe}`,
        {
          maTaiXe: Number(formEdit.maTaiXe),
          maXeBuyt: Number(formEdit.maXeBuyt),
          maLichTrinh: Number(formEdit.maLichTrinh),
          maTuyenDuong: Number(formEdit.maTuyenDuong),
        }
      );
      showAlert("Cập nhật phân công thành công", "success");
      setShowEditModal(false);
      setSelectedAssign(null);
      fetchAssigns();
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      showAlert("Lỗi khi cập nhật phân công", "danger");
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa (ngừng hoạt động) phân công này?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/api/assignDrivers/${id}`);
      showAlert("Xóa phân công thành công", "success");
      fetchAssigns();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      showAlert("Lỗi khi xóa phân công", "danger");
    }
  };

  // Reset filters
  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedTime("");
    setSelectedDriver("");
    setSelectedBus("");
    setSearch("");
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Head>
        <title>Phân công tài xế | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="my-2 mb-0">Quản lý phân công</h2>
          <Button variant="primary" onClick={handleShowAdd} size="sm">
            Tạo phân công
          </Button>
        </div>

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

        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={8}>
                <Row>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Từ ngày</Form.Label>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Đến ngày</Form.Label>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Giờ đi</Form.Label>
                      <Form.Select
                        size="sm"
                        value={selectedTime}
                        onChange={(e) => {
                          setSelectedTime(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">Tất cả giờ</option>
                        {Array.from(new Set(schedules.map((s) => s.thoiGianDi)))
                          .sort()
                          .map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Tìm kiếm</Form.Label>
                  <InputGroup>
                    <Form.Control
                      placeholder="Tìm kiếm..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      size="sm"
                    />
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={resetFilters}
                    >
                      Xóa
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-2">
              <Col>
                <Alert variant="info" className="py-2 mb-0">
                  <small>
                    <strong>Kết quả lọc:</strong> Tìm thấy {filtered.length}{" "}
                    phân công
                    {dateFrom && ` từ ${dateFrom}`}
                    {dateTo && ` đến ${dateTo}`}
                    {selectedTime && ` - Giờ: ${selectedTime}`}
                  </small>
                </Alert>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="table-container">
          <Table striped bordered hover className="shadow-sm no-border-table">
            <thead>
              <tr style={{ border: "none" }}>
                <th>Mã chuyến</th>
                <th>Tài xế</th>
                <th>Biển số</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Tuyến đường</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentAssigns.length > 0 ? (
                currentAssigns.map((a) => {
                  return (
                    <tr key={a.maChuyenXe}>
                      <td>
                        <Badge bg="secondary">#{a.maChuyenXe}</Badge>
                      </td>
                      <td>{a.tenTaiXe}</td>
                      <td>{a.bienSoXe}</td>
                      <td>{formatDate(a.ngay)}</td>
                      <td>
                        {a.thoiGianDi} → {a.thoiGianDen}
                      </td>
                      <td>{a.tenTuyenDuong}</td>
                      <td>
                        <span
                          className={`badge ${getStatusBadgeVariant(
                            a.trangThai
                          )}`}
                        >
                          {getStatusDisplayName(a.trangThai)}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-1">
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="me-2 mb-1"
                            style={{ border: "none" }}
                            onClick={() => handleShowEdit(a)}
                            title="Sửa"
                          >
                            <FaEdit size={20} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="mb-1"
                            style={{ border: "none" }}
                            onClick={() => {
                              handleDelete(a.maChuyenXe).then(() => {
                                resetFilters();
                              });
                            }}
                            title="Xóa"
                          >
                            <FaTrash size={20} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

        {totalPages > 1 && (
          <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              />
              {pageNumbers.map((n) => (
                <Pagination.Item
                  key={n}
                  active={n === currentPage}
                  onClick={() => setCurrentPage(n)}
                >
                  {n}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              />
            </Pagination>
          </div>
        )}

        {/* Modal Add */}
        <Modal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
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
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
              ></button>
              <h5 className="text-center mb-4 fw-semibold">
                Thêm phân công mới
              </h5>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Tài xế *</Form.Label>
                <Form.Select
                  size="sm"
                  value={formAdd.maTaiXe}
                  onChange={(e) =>
                    setFormAdd((p) => ({ ...p, maTaiXe: e.target.value }))
                  }
                  required
                >
                  <option value="">Chọn tài xế</option>
                  {drivers.map((d) => (
                    <option key={d.maTaiXe} value={d.maTaiXe}>
                      {d.tenTaiXe}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Xe buýt *</Form.Label>
                <Form.Select
                  size="sm"
                  value={formAdd.maXeBuyt}
                  onChange={(e) =>
                    setFormAdd((p) => ({ ...p, maXeBuyt: e.target.value }))
                  }
                  required
                >
                  <option value="">Chọn xe</option>
                  {(buses || []).map((b) => (
                    <option key={b.maXeBuyt} value={b.maXeBuyt}>
                      {b.bienSoXe}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">
                  Lịch trình *
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={formAdd.maLichTrinh}
                  onChange={(e) =>
                    setFormAdd((p) => ({ ...p, maLichTrinh: e.target.value }))
                  }
                  required
                >
                  <option value="">Chọn lịch trình</option>
                  {schedules.map((s) => (
                    <option key={s.maLichTrinh} value={s.maLichTrinh}>
                      {formatScheduleOption(s)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold">
                  Tuyến đường *
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={formAdd.maTuyenDuong}
                  onChange={(e) =>
                    setFormAdd((p) => ({ ...p, maTuyenDuong: e.target.value }))
                  }
                  required
                >
                  <option value="">Chọn tuyến đường</option>
                  {routes.map((r) => (
                    <option key={r.maTuyenDuong} value={r.maTuyenDuong}>
                      {r.tenTuyenDuong}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Thêm phân công
                </Button>
              </div>
            </div>
          </Form>
        </Modal>

        {/* Modal Edit */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
          backdrop="static"
          dialogClassName="w-auto"
          contentClassName="no-frame"
        >
          <Form onSubmit={handleEdit}>
            <div
              className="p-4 rounded-3 bg-white shadow-sm position-relative"
              style={{ width: 600 }}
            >
              <button
                type="button"
                className="btn-close position-absolute"
                style={{ top: 20, right: 20 }}
                onClick={() => setShowEditModal(false)}
                aria-label="Close"
              ></button>
              <h5 className="text-center mb-4 fw-semibold fs-5">
                Sửa phân công
              </h5>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">
                      Tài xế *
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      value={formEdit.maTaiXe}
                      onChange={(e) =>
                        setFormEdit((p) => ({ ...p, maTaiXe: e.target.value }))
                      }
                      required
                    >
                      <option value="">Chọn tài xế</option>
                      {drivers.map((d) => (
                        <option key={d.maTaiXe} value={d.maTaiXe}>
                          {d.tenTaiXe}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">
                      Xe buýt *
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      value={formEdit.maXeBuyt}
                      onChange={(e) =>
                        setFormEdit((p) => ({ ...p, maXeBuyt: e.target.value }))
                      }
                      required
                    >
                      <option value="">Chọn xe</option>
                      {buses.map((b) => (
                        <option key={b.maXeBuyt} value={b.maXeBuyt}>
                          {b.bienSoXe}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">
                      Lịch trình *
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      value={formEdit.maLichTrinh}
                      onChange={(e) =>
                        setFormEdit((p) => ({
                          ...p,
                          maLichTrinh: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Chọn lịch trình</option>
                      {schedules.map((s) => (
                        <option key={s.maLichTrinh} value={s.maLichTrinh}>
                          {formatScheduleOption(s)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold">
                      Tuyến đường *
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      value={formEdit.maTuyenDuong}
                      onChange={(e) =>
                        setFormEdit((p) => ({
                          ...p,
                          maTuyenDuong: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Chọn tuyến đường</option>
                      {routes.map((r) => (
                        <option key={r.maTuyenDuong} value={r.maTuyenDuong}>
                          {r.tenTuyenDuong}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {selectedAssign && (
                <div className="border-start border-3 border-primary bg-light bg-opacity-10 p-3 rounded mb-4">
                  <h6 className="text-primary mb-3 fw-semibold small">
                    <i className="fas fa-info-circle me-2"></i>
                    THÔNG TIN HỆ THỐNG
                  </h6>
                  <div className="row small text-muted">
                    <div className="col-md-6 mb-2">
                      <span className="fw-medium">Mã chuyến:</span>{" "}
                      {selectedAssign.maChuyenXe}
                    </div>
                    <div className="col-md-6 mb-2">
                      <span className="fw-medium">Tài xế:</span>{" "}
                      {selectedAssign.tenTaiXe}
                    </div>
                    <div className="col-md-6 mb-2">
                      <span className="fw-medium">Xe:</span>{" "}
                      {selectedAssign.tenXe} / {selectedAssign.bienSoXe}
                    </div>
                    <div className="col-md-6 mb-2">
                      <span className="fw-medium">Ngày:</span>{" "}
                      {formatDate(selectedAssign.ngay)}
                    </div>
                    <div className="col-12 mb-2">
                      <span className="fw-medium">Giờ:</span>
                      <span className="badge bg-primary ms-2">
                        {selectedAssign.thoiGianDi} →{" "}
                        {selectedAssign.thoiGianDen}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-2"
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  className="px-3 py-2"
                >
                  Cập nhật
                </Button>
              </div>
            </div>
          </Form>
        </Modal>
      </Container>
    </>
  );
};

export default AssignPage;
