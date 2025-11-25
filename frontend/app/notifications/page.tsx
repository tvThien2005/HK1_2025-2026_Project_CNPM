"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaTrash,
  FaPlus,
  FaTimes,
  FaPaperPlane,
  FaFilter,
  FaSearch,
  FaEye,
} from "react-icons/fa";
import {
  Button,
  Card,
  Modal,
  Form,
  Table,
  Badge,
  Row,
  Col,
  InputGroup,
  Spinner,
  Alert,
  Pagination,
  Container,
} from "react-bootstrap";

const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:5000/api/notifications";

interface Notification {
  tenTaiKhoan: string | undefined;
  maThongBao: number;
  noiDung: string;
  thoiGianTao: string;
  tenQuanLyXe?: string;
  recipientType: "driver" | "parent";
  maTaiKhoan?: number;
  tenTaiXe?: string;
  tenPhuHuynh?: string;
  ten?: string;
}
interface Driver {
  maTaiXe: number;
  tenTaiXe?: string;
  maTaiKhoan: number;
}
interface Parent {
  maPhuHuynh: number;
  tenPhuHuynh?: string;
  maTaiKhoan: number;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);

  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: string;
  }>({
    show: false,
    message: "",
    type: "",
  });

  // Filters / form state
  const [qDateFrom, setQDateFrom] = useState("");
  const [qDateTo, setQDateTo] = useState("");
  const [qRecipient, setQRecipient] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 4;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [detailInfo, setDetailInfo] = useState<any | null>(null);
  const [recipientType, setRecipientType] = useState<
    "driver" | "parent" | "both"
  >("both");
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);

  // Thêm state để kiểm soát hydration
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchAll();
    fetchPeopleLists();
  }, []);

  const fetchAll = async () => {
    try {
      const [dRes, pRes] = await Promise.all([
        axios.get(`${API_BASE}/drivers`),
        axios.get(`${API_BASE}/parents`),
      ]);

      const driversWithType: Notification[] = (
        dRes.data?.data ||
        dRes.data ||
        []
      ).map((it: any) => ({
        ...it,
        recipientType: "driver" as const,
      }));
      const parentsWithType: Notification[] = (
        pRes.data?.data ||
        pRes.data ||
        []
      ).map((it: any) => ({
        ...it,
        recipientType: "parent" as const,
      }));

      const merged = [...driversWithType, ...parentsWithType];
      merged.sort(
        (a, b) =>
          new Date(b.thoiGianTao).getTime() - new Date(a.thoiGianTao).getTime()
      );
      setNotifications(merged);
    } catch (err) {
      console.error("Lỗi khi fetch notifications", err);
    }
  };
  const showAlert = (message: string, type: string) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 3000);
  };

  const fetchPeopleLists = async () => {
    try {
      console.log("🔄 Đang tải danh sách tài xế và phụ huynh...");

      const [dRes, pRes] = await Promise.all([
        axios.get(`${API_BASE}/driver`),
        axios.get(`${API_BASE}/parent`),
      ]);

      console.log("✅ Dữ liệu tài xế RAW:", dRes.data);
      console.log("✅ Dữ liệu phụ huynh RAW:", pRes.data);

      let driversData = dRes.data?.data || dRes.data || dRes.data?.users || [];
      let parentsData = pRes.data?.data || pRes.data || pRes.data?.users || [];

      // MAPPING DỮ LIỆU - QUAN TRỌNG!
      // Nếu API không trả về maTaiKhoan, tạo mapping từ maTaiXe/maPhuHuynh
      driversData = driversData.map((driver: any) => {
        // Nếu đã có maTaiKhoan, giữ nguyên
        if (driver.maTaiKhoan) {
          return driver;
        }
        // Nếu không có, tạo maTaiKhoan từ maTaiXe (hoặc logic khác)
        console.log(
          `🔄 Mapping driver: maTaiXe ${driver.maTaiXe} -> maTaiKhoan`
        );
        return {
          ...driver,
          maTaiKhoan: driver.maTaiXe, // Hoặc driver.maTaiKhoan = driver.maTaiXe + 1000 nếu cần phân biệt
        };
      });

      parentsData = parentsData.map((parent: any) => {
        // Nếu đã có maTaiKhoan, giữ nguyên
        if (parent.maTaiKhoan) {
          return parent;
        }
        // Nếu không có, tạo maTaiKhoan từ maPhuHuynh
        console.log(
          `🔄 Mapping parent: maPhuHuynh ${parent.maPhuHuynh} -> maTaiKhoan`
        );
        return {
          ...parent,
          maTaiKhoan: parent.maPhuHuynh, // Hoặc parent.maTaiKhoan = parent.maPhuHuynh + 2000 nếu cần phân biệt
        };
      });

      console.log("✅ Drivers sau mapping:", driversData);
      console.log("✅ Parents sau mapping:", parentsData);

      // Kiểm tra xem còn undefined không
      const driversWithoutMaTaiKhoan = driversData.filter(
        (d: { maTaiKhoan: any }) => !d.maTaiKhoan
      );
      const parentsWithoutMaTaiKhoan = parentsData.filter(
        (p: { maTaiKhoan: any }) => !p.maTaiKhoan
      );

      if (
        driversWithoutMaTaiKhoan.length > 0 ||
        parentsWithoutMaTaiKhoan.length > 0
      ) {
        console.warn("⚠️ Vẫn còn dữ liệu không có maTaiKhoan:", {
          drivers: driversWithoutMaTaiKhoan,
          parents: parentsWithoutMaTaiKhoan,
        });
      }

      setDrivers(driversData);
      setParents(parentsData);
    } catch (err: any) {
      console.warn(
        "❌ Không thể load danh sách người nhận:",
        err.response?.data || err.message
      );

      // Dữ liệu mẫu để test - ĐẢM BẢO CÓ maTaiKhoan
    }
  };

  // Format date function - đồng bộ server/client
  const formatDate = (dateString: string) => {
    if (!isClient) return dateString;

    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Lấy danh sách người nhận theo loại
  const getRecipientsByType = (): (Driver | Parent)[] => {
    switch (recipientType) {
      case "driver":
        return drivers;
      case "parent":
        return parents;
      case "both":
        return [...drivers, ...parents];
      default:
        return [];
    }
  };

  // Toggle chọn tất cả
  const handleSelectAll = () => {
    const recipients = getRecipientsByType();
    if (selectAll) {
      setSelectedRecipients([]);
    } else {
      const allIds = recipients.map((person) => person.maTaiKhoan);
      setSelectedRecipients(allIds);
    }
    setSelectAll(!selectAll);
  };
  // Toggle chọn từng người
  const toggleSelectRecipient = (maTaiKhoan: number) => {
    setSelectedRecipients((prev) =>
      prev.includes(maTaiKhoan)
        ? prev.filter((x) => x !== maTaiKhoan)
        : [...prev, maTaiKhoan]
    );
  };
  // Mở modal tạo thông báo
  const openCreateModal = () => {
    setShowModal(true);
    setContent("");
    setSelectedRecipients([]);
    setRecipientType("both");
    setSelectAll(false);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setContent("");
    setSelectedRecipients([]);
    setRecipientType("both");
    setSelectAll(false);
    setLoading(false);
  };

  // Xác nhận gửi thông báo
  // Xác nhận gửi thông báo - SỬA LẠI
  // Xác nhận gửi thông báo - SỬA LẠI HOÀN TOÀN
  const confirmSendNotification = async () => {
    if (!content.trim()) {
      showAlert("Vui lòng nhập nội dung thông báo", "danger");
      return;
    }

    if (selectedRecipients.length === 0) {
      showAlert("Vui lòng chọn ít nhất một đối tượng nhận", "danger");
      return;
    }

    setLoading(true);
    try {
      console.log(
        "📤 Đang gửi thông báo đến các maTaiKhoan:",
        selectedRecipients
      );

      // Gửi 1 request chứa MẢNG maTaiKhoan
      const requestData = {
        maQuanLyXe: 6,
        noiDung: content,
        maTaiKhoan: selectedRecipients, // Gửi mảng các maTaiKhoan
      };

      console.log("📦 Dữ liệu gửi lên server:", requestData);

      const response = await axios.post(`${API_BASE}`, requestData);

      console.log("✅ Phản hồi từ server:", response.data);

      closeModal();
      await fetchAll();
      showAlert(
        `✅ Đã gửi thông báo thành công cho ${selectedRecipients.length} người`,
        "success"
      );
    } catch (err: any) {
      console.error(
        "❌ Gửi thông báo thất bại:",
        err.response?.data || err.message
      );
      console.log("🔍 Chi tiết lỗi:", {
        status: err.response?.status,
        data: err.response?.data,
      });
      showAlert(
        "Không thể gửi thông báo. Kiểm tra console để biết chi tiết.",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (maThongBao: number, maTaiKhoan?: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;
    try {
      // Nếu backend cần maTaiKhoan để xóa
      if (maTaiKhoan) {
        await axios.delete(`${API_BASE}/${maThongBao}`, {
          data: { maTaiKhoan: maTaiKhoan },
        });
      } else {
        await axios.delete(`${API_BASE}/${maThongBao}`);
      }
      await fetchAll();
      showAlert("Xóa thành công", "success");
    } catch (err) {
      console.error("Xóa thất bại", err);
      showAlert("Xóa thất bại", "danger");
    }
  };

  // Fetch and show notification details (recipients with names)
  const openDetailModal = async (maThongBao: number) => {
    setDetailLoading(true);
    setDetailData([]);
    setDetailInfo(null);
    try {
      const res = await axios.get(`${API_BASE}/${maThongBao}`);
      const data = res.data?.data || [];
      setDetailData(data);
      if (data.length > 0) {
        setDetailInfo({
          maThongBao: data[0].maThongBao,
          noiDung: data[0].noiDung,
          thoiGianTao: data[0].thoiGianTao,
        });
      }
      setShowDetailModal(true);
    } catch (err: any) {
      console.error(
        "❌ Lỗi khi lấy chi tiết thông báo:",
        err?.response?.data || err.message
      );
      showAlert("Không thể tải chi tiết thông báo", "danger");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setShowDetailModal(false);
    setDetailData([]);
    setDetailInfo(null);
  };

  // Filters applied list
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (qRecipient !== "all") {
        if (qRecipient === "driver" && n.recipientType !== "driver")
          return false;
        if (qRecipient === "parent" && n.recipientType !== "parent")
          return false;
      }
      if (qDateFrom) {
        if (new Date(n.thoiGianTao) < new Date(qDateFrom)) return false;
      }
      if (qDateTo) {
        const end = new Date(qDateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(n.thoiGianTao) > end) return false;
      }
      return true;
    });
  }, [notifications, qRecipient, qDateFrom, qDateTo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="container-fluid py-4">
      {alert.show && (
        <Alert
          variant={alert.type === "success" ? "success" : "danger"}
          className="position-fixed top-0 start-50 translate-middle-x mt-3"
          style={{ zIndex: 9999, minWidth: "300px" }}
        >
          {alert.message}
        </Alert>
      )}
      {/* Header */}
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="my-4">Quản lý thông báo</h2>
          <Button variant="primary" onClick={openCreateModal} size="sm">
            Gửi thông báo
          </Button>
        </div>
        {/* Bộ lọc */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header className="bg-light">
                <div className="d-flex align-items-center">
                  <FaFilter className="me-2" />
                  <h5 className="mb-0">Bộ lọc & Tìm kiếm</h5>
                </div>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Đối tượng nhận</Form.Label>
                      <Form.Select
                        value={qRecipient}
                        onChange={(e) => {
                          setQRecipient(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="all">Tất cả</option>
                        <option value="driver">Tài xế</option>
                        <option value="parent">Phụ huynh</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Từ ngày</Form.Label>
                      <Form.Control
                        type="date"
                        value={qDateFrom}
                        onChange={(e) => {
                          setQDateFrom(e.target.value);
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
                        value={qDateTo}
                        onChange={(e) => {
                          setQDateTo(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>&nbsp;</Form.Label>
                      {/* <div className="d-grid"> */}
                      <Button
                        variant="outline-secondary"
                        style={{ border: "none" }}
                        onClick={() => {
                          setQRecipient("all");
                          setQDateFrom("");
                          setQDateTo("");
                          setCurrentPage(1);
                        }}
                      >
                        <FaTimes />
                      </Button>
                      {/* </div> */}
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <Alert variant="info" className="mb-0 py-2">
                      {/* <FaSearch className="me-2" /> */}
                      <strong>
                        Tìm thấy {filtered.length} thông báo phù hợp
                      </strong>
                    </Alert>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* Detail modal */}
        <Modal show={showDetailModal} onHide={closeDetail} size="lg" centered>
          <Modal.Header className="bg-light position-relative border-0">
            <div className="w-100 text-center">
              <Modal.Title className="fw-bold text-primary mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Chi tiết thông báo
              </Modal.Title>
            </div>
            <button
              type="button"
              className="btn-close position-absolute end-0 me-3"
              onClick={closeDetail}
              aria-label="Close"
            ></button>
          </Modal.Header>
          <Modal.Body className="p-4">
            {detailLoading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner
                  animation="border"
                  variant="primary"
                  className="me-3"
                />
                <span className="text-muted">Đang tải dữ liệu...</span>
              </div>
            ) : (
              <>
                {detailInfo && (
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                      <h6 className="card-title fw-bold text-dark mb-3">
                        <i className="bi bi-chat-text me-2"></i>
                        Nội dung thông báo
                      </h6>
                      <p className="card-text mb-3">{detailInfo.noiDung}</p>
                      <div className="d-flex align-items-center text-muted">
                        <i className="bi bi-calendar3 me-2"></i>
                        <small>
                          Ngày tạo: {formatDate(detailInfo.thoiGianTao)}
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-bottom-0 text-center">
                    <h6 className="mb-0 fw-bold text-dark">
                      <i className="bi bi-people me-2"></i>
                      Danh sách người nhận
                    </h6>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="text-center">#</th>
                            <th className="text-center">Mã tài khoản</th>
                            <th className="text-center">Tên người nhận</th>
                            <th className="text-center">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailData.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-4">
                                <div className="text-muted">
                                  <i className="bi bi-inbox display-6 d-block mb-2"></i>
                                  Không có dữ liệu
                                </div>
                              </td>
                            </tr>
                          ) : (
                            detailData.map((r, idx) => (
                              <tr
                                key={`${r.maThongBao}-${r.maTaiKhoan}-${idx}`}
                              >
                                <td className="text-center text-muted">
                                  {idx + 1}
                                </td>
                                <td className="text-center">
                                  <code className="text-primary">
                                    {r.maTaiKhoan}
                                  </code>
                                </td>
                                <td className="text-center">
                                  <span className="fw-medium">
                                    {r.tenNguoiNhan || r.tenTaiKhoan || "-"}
                                  </span>
                                </td>
                                <td className="text-center">
                                  {r.daXem ? (
                                    <span className="badge bg-success bg-opacity-10 text-success">
                                      <i className="bi bi-check-circle me-1"></i>
                                      Đã xem
                                    </span>
                                  ) : (
                                    <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                      <i className="bi bi-clock me-1"></i>
                                      Chưa xem
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-light justify-content-center">
            <Button
              variant="outline-secondary"
              onClick={closeDetail}
              className="d-flex align-items-center px-4"
            >
              <i className="bi bi-x-circle me-2"></i>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Bảng thông báo */}
        <Row>
          <Col>
            <Card>
              <Card.Header className="bg-light">
                <h5 className="mb-0">Danh sách thông báo</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table striped hover className="mb-0 no-border-table">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "80px" }}>Mã TB</th>
                        <th style={{ width: "150px" }}>Người gửi</th>
                        <th style={{ width: "250px" }}>Nội dung</th>
                        <th style={{ width: "150px" }}>Ngày tạo</th>
                        <th style={{ width: "120px" }}>Đối tượng</th>
                        <th style={{ width: "80px" }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((n) => (
                        <tr key={`${n.maThongBao}-${n.maTaiKhoan}`}>
                          <td>
                            <Badge bg="secondary">#{n.maThongBao}</Badge>
                          </td>
                          <td>
                            <div className="fw-semibold">
                              {n.tenQuanLyXe || n.tenTaiKhoan || "System"}
                            </div>
                          </td>
                          <td>
                            <div
                              className="notification-content"
                              style={{
                                whiteSpace: "normal",
                                wordWrap: "break-word",
                                lineHeight: "1.5",
                                maxHeight: "100px",
                                overflow: "hidden",
                                cursor: "pointer",
                              }}
                              title={n.noiDung} // Hiển thị tooltip khi hover
                            >
                              {n.noiDung}
                            </div>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(n.thoiGianTao)}
                            </small>
                          </td>
                          <td>
                            <Badge
                              bg={
                                n.recipientType === "driver"
                                  ? "primary"
                                  : "success"
                              }
                            >
                              {n.recipientType === "driver"
                                ? "Tài xế"
                                : "Phụ huynh"}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center align-items-center">
                              <Button
                                variant="outline-secondary"
                                style={{ border: "none" }}
                                size="sm"
                                className="me-2 mb-1"
                                onClick={() => openDetailModal(n.maThongBao)}
                                title="Xem chi tiết"
                              >
                                <FaEye size={20} />
                              </Button>

                              <Button
                                variant="outline-danger"
                                style={{ border: "none" }}
                                size="sm"
                                onClick={() => handleDelete(n.maThongBao)}
                                className="mb-1"
                              >
                                <FaTrash size={20} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pageItems.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-4">
                            <div className="text-muted">
                              <FaSearch size={32} className="mb-2" />
                              <p>Không có thông báo phù hợp</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* Pagination */}
        {totalPages > 1 && (
          <Row className="mt-4">
            <Col>
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
            </Col>
          </Row>
        )}
        {/* Modal tạo thông báo */}
        <Modal
          show={showModal}
          onHide={closeModal}
          size="lg"
          centered
          backdrop="static"
        >
          <Modal.Header closeButton>
            <div className="w-100 d-flex justify-content-center align-items-center">
              <h3>Gửi thông báo mới</h3>
            </div>
          </Modal.Header>

          <Modal.Body>
            {/* Nội dung thông báo */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                Nội dung thông báo <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung thông báo..."
                className="focus-ring"
              />
            </Form.Group>

            {/* Chọn đối tượng nhận */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Chọn đối tượng nhận <span className="text-danger">*</span>
              </Form.Label>

              <div className="mb-3">
                <Form.Check
                  inline
                  type="radio"
                  label="Cả hai (Tài xế & Phụ huynh)"
                  name="recipientType"
                  value="both"
                  checked={recipientType === "both"}
                  onChange={(e) => {
                    setRecipientType(e.target.value as any);
                    setSelectedRecipients([]);
                    setSelectAll(false);
                  }}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Chỉ tài xế"
                  name="recipientType"
                  value="driver"
                  checked={recipientType === "driver"}
                  onChange={(e) => {
                    setRecipientType(e.target.value as any);
                    setSelectedRecipients([]);
                    setSelectAll(false);
                  }}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Chỉ phụ huynh"
                  name="recipientType"
                  value="parent"
                  checked={recipientType === "parent"}
                  onChange={(e) => {
                    setRecipientType(e.target.value as any);
                    setSelectedRecipients([]);
                    setSelectAll(false);
                  }}
                />
              </div>

              <Card>
                <Card.Header className="bg-light py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">
                      Đã chọn:{" "}
                      <Badge bg="primary">{selectedRecipients.length}</Badge> /{" "}
                      {getRecipientsByType().length} người
                    </span>
                    {getRecipientsByType().length > 0 && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectAll ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                      </Button>
                    )}
                  </div>
                </Card.Header>
                <Card.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {getRecipientsByType().length > 0 ? (
                    <Row>
                      {getRecipientsByType().map((person, index) => {
                        const isDriver = "maTaiXe" in person;
                        const name = isDriver
                          ? person.tenTaiXe
                          : person.tenPhuHuynh;

                        // Tạo key an toàn, tránh undefined
                        const safeKey = `${isDriver ? "driver" : "parent"}-${
                          person.maTaiKhoan || index
                        }-${isDriver ? person.maTaiXe : person.maPhuHuynh}`;

                        return (
                          <Col
                            md={6}
                            key={safeKey} // Sử dụng key an toàn
                            className="mb-2"
                          >
                            <Form.Check
                              type="checkbox"
                              id={`recipient-${person.maTaiKhoan || index}`}
                              label={
                                <div>
                                  <span className="fw-medium">
                                    {name ||
                                      `Người dùng ${
                                        person.maTaiKhoan || "N/A"
                                      }`}
                                  </span>
                                  <Badge
                                    bg={isDriver ? "primary" : "success"}
                                    className="ms-2"
                                  >
                                    {isDriver ? "Tài xế" : "Phụ huynh"}
                                  </Badge>
                                </div>
                              }
                              checked={selectedRecipients.includes(
                                person.maTaiKhoan
                              )}
                              onChange={() =>
                                person.maTaiKhoan &&
                                toggleSelectRecipient(person.maTaiKhoan)
                              }
                              disabled={!person.maTaiKhoan} // Disable nếu không có maTaiKhoan
                            />
                            {/* Hiển thị cảnh báo nếu không có maTaiKhoan */}
                            {!person.maTaiKhoan && (
                              <small className="text-danger">
                                ⚠️ Thiếu mã tài khoản
                              </small>
                            )}
                          </Col>
                        );
                      })}
                    </Row>
                  ) : (
                    <div className="text-center py-4 text-muted">
                      <FaSearch size={32} className="mb-2" />
                      <p>
                        Không có dữ liệu{" "}
                        {recipientType === "both"
                          ? "tài xế và phụ huynh"
                          : recipientType === "driver"
                          ? "tài xế"
                          : "phụ huynh"}
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={closeModal}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={confirmSendNotification}
              disabled={
                loading || !content.trim() || selectedRecipients.length === 0
              }
              className="d-flex align-items-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Gửi cho {selectedRecipients.length} người
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
