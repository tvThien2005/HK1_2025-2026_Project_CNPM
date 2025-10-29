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
} from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaLock, FaUnlock } from "react-icons/fa";
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
  // tenXe: string;
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
  const itemsPerPage = 10;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAssign, setSelectedAssign] = useState<Assign | null>(null);

  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  // Form states for add / edit
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
      const res = await axios.get(
        "http://localhost:5000/api/assignDrivers/drivers"
      );
      setDrivers(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy tài xế:", err);
      showAlert("Lỗi khi tải danh sách tài xế", "danger");
    }
  };
  const fetchBuses = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/assignDrivers/buses"
      );
      setBuses(res.data);
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

  // Search filter (search by driver name, bus name, plate, route)
  const filtered = assigns.filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (a.tenTaiXe || "").toLowerCase().includes(q) ||
      (a.tenXe || "").toLowerCase().includes(q) ||
      (a.bienSoXe || "").toLowerCase().includes(q) ||
      (a.tenTuyenDuong || "").toLowerCase().includes(q)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssigns = filtered.slice(startIndex, startIndex + itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Format schedule display: B) "YYYY-MM-DD | hh:mm → hh:mm"
  const formatScheduleOption = (s: Schedule) =>
    `${new Date(s.ngay).toISOString().split("T")[0]} | ${s.thoiGianDi} → ${
      s.thoiGianDen
    }`;

  // Fallback mapping: if assign record lacks IDs, attempt to map by names
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

    // validation
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
      await axios.post("http://localhost:5000/api/assignDrivers", {
        maTaiXe: Number(formAdd.maTaiXe),
        maXeBuyt: Number(formAdd.maXeBuyt),
        maLichTrinh: Number(formAdd.maLichTrinh),
        maTuyenDuong: Number(formAdd.maTuyenDuong),
      });
      showAlert("Thêm phân công thành công", "success");
      setShowAddModal(false);
      fetchAssigns();
    } catch (err: any) {
      console.error("Lỗi thêm phân công:", err);
      showAlert(err?.response?.data?.message || "Lỗi khi thêm", "danger");
    }
  };

  // Show edit modal (prefill)
  const handleShowEdit = (a: Assign) => {
    setSelectedAssign(a);
    const mapped = mapAssignToIds(a);
    setFormEdit({
      maTaiXe: mapped.maTaiXe ? String(mapped.maTaiXe) : "",
      maXeBuyt: mapped.maXeBuyt ? String(mapped.maXeBuyt) : "",
      maLichTrinh: mapped.maLichTrinh ? String(mapped.maLichTrinh) : "",
      maTuyenDuong: mapped.maTuyenDuong ? String(mapped.maTuyenDuong) : "",
    });

    // Warning if mapping failed
    if (
      !mapped.maTaiXe ||
      !mapped.maXeBuyt ||
      !mapped.maLichTrinh ||
      !mapped.maTuyenDuong
    ) {
      // showAlert(
      //   "Lưu ý: backend chưa trả ID cho phân công; hệ thống đang cố gắng map từ tên (có thể không chính xác). Nên backend trả thêm maTaiXe, maXeBuyt, maLichTrinh, maTuyenDuong trong GET /api/assign.",
      //   "warning"
      // );
    }

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

  // Delete (mark inactive)
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

  // Utility: format display date
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
        <h2 className="my-2">Quản lý phân công</h2>

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
        <Row className="align-items-center mb-3">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                placeholder="Tìm kiếm theo tài xế / biển số xe / tuyến..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Button variant="secondary" onClick={() => setSearch("")}>
                Xóa
              </Button>
            </InputGroup>
          </Col>
          <Col md={6} className="text-end">
            <Button variant="primary" onClick={handleShowAdd}>
              Thêm phân công
            </Button>
          </Col>
        </Row>

        <div className="table-container">
          <Table striped bordered hover className="shadow-sm">
            <thead>
              <tr>
                <th>Mã chuyến</th>
                <th>Tài xế</th>
                <th>Biển số </th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Tuyến đường</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentAssigns.length > 0 ? (
                currentAssigns.map((a) => (
                  <tr key={a.maChuyenXe}>
                    <td>{a.maChuyenXe}</td>
                    <td>{a.tenTaiXe}</td>
                    <td>{a.bienSoXe}</td>
                    <td>{formatDate(a.ngay)}</td>
                    <td>
                      {a.thoiGianDi} → {a.thoiGianDen}
                    </td>
                    <td>{a.tenTuyenDuong}</td>
                    <td>
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
                        onClick={() => handleDelete(a.maChuyenXe)}
                        title="Xóa"
                      >
                        <FaTrash size={20} />
                      </Button>
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
              className="p-4 rounded-3 bg-white shadow-sm"
              style={{ width: 400 }}
            >
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
                  <option value="">Chọn tài xế </option>
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
                  <option value="">Chọn xe </option>
                  {buses.map((b) => (
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
                  <option value="">Chọn lịch trình </option>
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
                  <option value="">Chọn tuyến đường </option>
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
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Sửa phân công</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEdit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tài xế *</Form.Label>
                    <Form.Select
                      value={formEdit.maTaiXe}
                      onChange={(e) =>
                        setFormEdit((p) => ({ ...p, maTaiXe: e.target.value }))
                      }
                      required
                    >
                      <option value="">-- Chọn tài xế --</option>
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
                    <Form.Label>Xe (Buyt) *</Form.Label>
                    <Form.Select
                      value={formEdit.maXeBuyt}
                      onChange={(e) =>
                        setFormEdit((p) => ({ ...p, maXeBuyt: e.target.value }))
                      }
                      required
                    >
                      <option value="">-- Chọn xe --</option>
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
                    <Form.Label>Lịch trình *</Form.Label>
                    <Form.Select
                      value={formEdit.maLichTrinh}
                      onChange={(e) =>
                        setFormEdit((p) => ({
                          ...p,
                          maLichTrinh: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">-- Chọn lịch trình --</option>
                      {schedules.map((s) => (
                        <option key={s.maLichTrinh} value={s.maLichTrinh}>
                          {formatScheduleOption(s)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tuyến đường *</Form.Label>
                    <Form.Select
                      value={formEdit.maTuyenDuong}
                      onChange={(e) =>
                        setFormEdit((p) => ({
                          ...p,
                          maTuyenDuong: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">-- Chọn tuyến đường --</option>
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
                <div className="bg-light p-3 rounded">
                  <small className="text-muted">
                    <strong>Thông tin hệ thống:</strong>
                    <br />
                    Mã chuyến: {selectedAssign.maChuyenXe}
                    <br />
                    Tài xế: {selectedAssign.tenTaiXe}
                    <br />
                    Xe: {selectedAssign.tenXe} / {selectedAssign.bienSoXe}
                    <br />
                    Ngày: {formatDate(selectedAssign.ngay)}
                    <br />
                    Giờ: {selectedAssign.thoiGianDi} →{" "}
                    {selectedAssign.thoiGianDen}
                  </small>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
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

export default AssignPage;
