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
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import axios from "axios";

interface Schedule {
  maLichTrinh: number;
  ngay: string;
  thoiGianDi: string;
  thoiGianDen: string;
}

const ScheduledPage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTimeFrom, setSelectedTimeFrom] = useState("");
  const [selectedTimeTo, setSelectedTimeTo] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );

  // Alert state
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  // Form states
  const [formAdd, setFormAdd] = useState({
    ngay: "",
    thoiGianDi: "",
    thoiGianDen: "",
  });
  const [formEdit, setFormEdit] = useState({
    ngay: "",
    thoiGianDi: "",
    thoiGianDen: "",
  });

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/scheduled");
      console.log("📥 API Response:", res.data);
      setSchedules(res.data.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy lịch trình:", err);
      showAlert("Lỗi khi tải danh sách lịch trình", "danger");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Alert helper
  const showAlert = (message: string, type: string) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  // 🔥 FIX: Convert 12h to 24h format manually
  const convertTo24Hour = (timeString: string) => {
    return timeString?.substring(0, 5) || "";
  };

  // Format time for display (remove seconds)
  const formatTimeForDisplay = (timeString: string) => {
    if (!timeString) return "";
    return convertTo24Hour(timeString);
  };

  // Format time for input (ensure HH:MM format)
  const formatTimeForInput = (timeString: string) => {
    if (!timeString) return "";
    return convertTo24Hour(timeString);
  };

  // 🔥 FIX: Handle time input change with manual conversion
  const handleTimeInputChange = (
    field: "thoiGianDi" | "thoiGianDen",
    value: string,
    isEdit: boolean = false
  ) => {
    console.log(`⏰ Time input changed - Field: ${field}, Value: ${value}`);

    // Manual conversion from 12h to 24h if needed
    let convertedValue = value;

    if (isEdit) {
      setFormEdit((prev) => ({ ...prev, [field]: convertedValue }));
    } else {
      setFormAdd((prev) => ({ ...prev, [field]: convertedValue }));
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  // Add new schedule - FIXED TIME HANDLING
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("📤 Form data before submit:", formAdd);

    if (!formAdd.ngay || !formAdd.thoiGianDi || !formAdd.thoiGianDen) {
      showAlert("Vui lòng điền đầy đủ thông tin", "warning");
      return;
    }

    // Validate time order
    const timeDi = formAdd.thoiGianDi;
    const timeDen = formAdd.thoiGianDen;

    if (timeDi >= timeDen) {
      showAlert("Thời gian đi phải sớm hơn thời gian đến", "warning");
      return;
    }

    try {
      // 🔥 FIX: Ensure correct time format for MySQL
      const dataToSend = {
        ngay: formAdd.ngay,
        thoiGianDi: formAdd.thoiGianDi + ":00", // Add seconds for MySQL TIME format
        thoiGianDen: formAdd.thoiGianDen + ":00", // Add seconds for MySQL TIME format
      };

      console.log("🚀 Data sending to API:", dataToSend);
      console.log(
        "🕒 Time check - Di:",
        dataToSend.thoiGianDi,
        "Den:",
        dataToSend.thoiGianDen
      );

      const response = await axios.post(
        "http://localhost:5000/api/scheduled",
        dataToSend
      );

      console.log("✅ API Response:", response.data);

      showAlert("Thêm lịch trình thành công", "success");
      setShowAddModal(false);
      setFormAdd({ ngay: "", thoiGianDi: "", thoiGianDen: "" });
      fetchSchedules();
    } catch (err: any) {
      console.error("❌ Lỗi thêm lịch trình:", err);
      console.error("📊 Error details:", err.response?.data);
      showAlert(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Lỗi khi thêm lịch trình",
        "danger"
      );
    }
  };

  // Show edit modal - FIXED TIME FORMAT
  const handleShowEdit = (schedule: Schedule) => {
    console.log("📝 Editing schedule:", schedule);

    setSelectedSchedule(schedule);
    setFormEdit({
      ngay: schedule.ngay,
      thoiGianDi: formatTimeForInput(schedule.thoiGianDi),
      thoiGianDen: formatTimeForInput(schedule.thoiGianDen),
    });
    setShowEditModal(true);
  };

  // Edit schedule - FIXED TIME HANDLING
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSchedule) return;

    console.log("📤 Edit form data:", formEdit);

    if (!formEdit.ngay || !formEdit.thoiGianDi || !formEdit.thoiGianDen) {
      showAlert("Vui lòng điền đầy đủ thông tin", "warning");
      return;
    }

    // Validate time order
    const timeDi = formEdit.thoiGianDi;
    const timeDen = formEdit.thoiGianDen;

    if (timeDi >= timeDen) {
      showAlert("Thời gian đi phải sớm hơn thời gian đến", "warning");
      return;
    }

    try {
      // 🔥 FIX: Ensure correct time format for MySQL
      const dataToSend = {
        ngay: formEdit.ngay,
        thoiGianDi: formEdit.thoiGianDi + ":00",
        thoiGianDen: formEdit.thoiGianDen + ":00",
      };

      console.log("🚀 Edit data sending to API:", dataToSend);
      console.log(
        "🕒 Edit time check - Di:",
        dataToSend.thoiGianDi,
        "Den:",
        dataToSend.thoiGianDen
      );

      const response = await axios.put(
        `http://localhost:5000/api/scheduled/${selectedSchedule.maLichTrinh}`,
        dataToSend
      );

      console.log("✅ Edit API Response:", response.data);

      showAlert("Cập nhật lịch trình thành công", "success");
      setShowEditModal(false);
      setSelectedSchedule(null);
      fetchSchedules();
    } catch (err: any) {
      console.error("❌ Lỗi cập nhật:", err);
      console.error("📊 Error details:", err.response?.data);
      showAlert(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Lỗi khi cập nhật lịch trình",
        "danger"
      );
    }
  };

  // Filter schedules
  const filteredSchedules = schedules.filter((schedule) => {
    // Filter by date range
    if (dateFrom) {
      const scheduleDate = new Date(schedule.ngay);
      const fromDate = new Date(dateFrom);
      if (scheduleDate < fromDate) {
        return false;
      }
    }

    if (dateTo) {
      const scheduleDate = new Date(schedule.ngay);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (scheduleDate > toDate) {
        return false;
      }
    }

    // Filter by time from
    if (
      selectedTimeFrom &&
      formatTimeForInput(schedule.thoiGianDi) < selectedTimeFrom
    ) {
      return false;
    }

    // Filter by time to
    if (
      selectedTimeTo &&
      formatTimeForInput(schedule.thoiGianDen) > selectedTimeTo
    ) {
      return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSchedules = filteredSchedules.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Reset filters
  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedTimeFrom("");
    setSelectedTimeTo("");
    setCurrentPage(1);
  };

  // Get unique times for filter dropdowns
  const uniqueTimesFrom = Array.from(
    new Set(schedules.map((s) => formatTimeForInput(s.thoiGianDi)))
  )
    .sort()
    .filter((time) => time);

  const uniqueTimesTo = Array.from(
    new Set(schedules.map((s) => formatTimeForInput(s.thoiGianDen)))
  )
    .sort()
    .filter((time) => time);

  // Delete schedule (placeholder)
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa lịch trình này?")) return;
    try {
      // Note: You need to implement delete endpoint in backend
      showAlert("Tính năng xóa đang được phát triển", "info");
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      showAlert("Lỗi khi xóa lịch trình", "danger");
    }
  };

  return (
    <>
      <Head>
        <title>Quản lý lịch trình | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="my-4">Quản lý lịch trình</h2>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            size="sm"
          >
            Tạo lịch trình
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

        {/* Filter Card - giữ nguyên */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={10}>
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
                      <Form.Label>Giờ đi từ</Form.Label>
                      <Form.Select
                        size="sm"
                        value={selectedTimeFrom}
                        onChange={(e) => {
                          setSelectedTimeFrom(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">Tất cả giờ đi</option>
                        {uniqueTimesFrom.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Giờ đến đến</Form.Label>
                      <Form.Select
                        size="sm"
                        value={selectedTimeTo}
                        onChange={(e) => {
                          setSelectedTimeTo(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">Tất cả giờ đến</option>
                        {uniqueTimesTo.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col md={2} className="text-end">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={resetFilters}
                >
                  Xóa bộ lọc
                </Button>
              </Col>
            </Row>

            <Row className="mt-2">
              <Col>
                <Alert variant="info" className="py-2 mb-0">
                  <small>
                    <strong>Kết quả lọc:</strong> Tìm thấy{" "}
                    {filteredSchedules.length} lịch trình
                    {dateFrom && ` từ ${formatDate(dateFrom)}`}
                    {dateTo && ` đến ${formatDate(dateTo)}`}
                    {selectedTimeFrom && ` - Giờ đi từ: ${selectedTimeFrom}`}
                    {selectedTimeTo && ` - Giờ đến đến: ${selectedTimeTo}`}
                  </small>
                </Alert>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Schedule Table - giữ nguyên */}
        <div className="table-container">
          <Table striped bordered hover className="shadow-sm no-border-table">
            <thead>
              <tr style={{ border: "none" }}>
                <th>Mã lịch trình</th>
                <th>Ngày</th>
                <th>Giờ đi</th>
                <th>Giờ đến</th>
                <th>Khoảng thời gian</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentSchedules.length > 0 ? (
                currentSchedules.map((schedule) => (
                  <tr key={schedule.maLichTrinh}>
                    <td>
                      <Badge bg="secondary">#{schedule.maLichTrinh}</Badge>
                    </td>
                    <td>{formatDate(schedule.ngay)}</td>
                    <td>
                      <Badge bg="warning" text="dark">
                        {formatTimeForDisplay(schedule.thoiGianDi)}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg="info" text="dark">
                        {formatTimeForDisplay(schedule.thoiGianDen)}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatTimeForDisplay(schedule.thoiGianDi)} →{" "}
                        {formatTimeForDisplay(schedule.thoiGianDen)}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-1">
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="me-2 mb-1"
                          style={{ border: "none" }}
                          onClick={() => handleShowEdit(schedule)}
                          title="Sửa"
                        >
                          <FaEdit size={20} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="mb-1"
                          style={{ border: "none" }}
                          onClick={() => handleDelete(schedule.maLichTrinh)}
                          title="Xóa"
                        >
                          <FaTrash size={20} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
                    Không có dữ liệu lịch trình
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination - giữ nguyên */}
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

        {/* Add Schedule Modal - SỬA QUAN TRỌNG */}
        <Modal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          centered
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>Thêm lịch trình mới</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAdd}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Ngày *</Form.Label>
                <Form.Control
                  type="date"
                  value={formAdd.ngay}
                  onChange={(e) =>
                    setFormAdd((p) => ({ ...p, ngay: e.target.value }))
                  }
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thời gian đi *</Form.Label>
                    <Form.Control
                      type="time"
                      value={formAdd.thoiGianDi}
                      onChange={(e) => {
                        console.log("🕒 Time Di changed:", e.target.value);
                        handleTimeInputChange(
                          "thoiGianDi",
                          e.target.value,
                          false
                        );
                      }}
                      required
                      step="3600" // Force 1-hour steps to avoid minutes
                    />
                    <Form.Text className="text-muted">
                      Định dạng 24h. Ví dụ: 06:30 = 6:30 sáng, 18:30 = 6:30 tối
                    </Form.Text>
                    <div className="mt-1">
                      <small className="text-info">
                        Giá trị hiện tại:{" "}
                        <strong>{formAdd.thoiGianDi || "chưa chọn"}</strong>
                      </small>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thời gian đến *</Form.Label>
                    <Form.Control
                      type="time"
                      value={formAdd.thoiGianDen}
                      onChange={(e) => {
                        console.log("🕒 Time Den changed:", e.target.value);
                        handleTimeInputChange(
                          "thoiGianDen",
                          e.target.value,
                          false
                        );
                      }}
                      required
                      step="3600" // Force 1-hour steps to avoid minutes
                    />
                    <Form.Text className="text-muted">
                      Định dạng 24h. Ví dụ: 07:30 = 7:30 sáng, 19:30 = 7:30 tối
                    </Form.Text>
                    <div className="mt-1">
                      <small className="text-info">
                        Giá trị hiện tại:{" "}
                        <strong>{formAdd.thoiGianDen || "chưa chọn"}</strong>
                      </small>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {formAdd.thoiGianDi && formAdd.thoiGianDen && (
                <Alert
                  variant={
                    formAdd.thoiGianDi >= formAdd.thoiGianDen
                      ? "danger"
                      : "success"
                  }
                  className="py-2"
                >
                  <small>
                    {formAdd.thoiGianDi >= formAdd.thoiGianDen
                      ? "⚠️ Thời gian đi phải sớm hơn thời gian đến"
                      : `✅ Khoảng thời gian: ${formAdd.thoiGianDi} → ${formAdd.thoiGianDen}`}
                    <br />
                    📤 Sẽ gửi đến server: {formAdd.thoiGianDi}:00 →{" "}
                    {formAdd.thoiGianDen}:00
                  </small>
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={formAdd.thoiGianDi >= formAdd.thoiGianDen}
              >
                Thêm lịch trình
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Edit Schedule Modal - SỬA TƯƠNG TỰ */}
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
              style={{ width: 500 }}
            >
              <button
                type="button"
                className="btn-close position-absolute"
                style={{ top: 20, right: 20 }}
                onClick={() => setShowEditModal(false)}
                aria-label="Close"
              ></button>
              <h5 className="text-center mb-4 fw-semibold fs-5">
                Sửa lịch trình
              </h5>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold">Ngày *</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={formEdit.ngay}
                  onChange={(e) =>
                    setFormEdit((p) => ({ ...p, ngay: e.target.value }))
                  }
                  required
                  className="py-2"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">
                      Thời gian đi *
                    </Form.Label>
                    <Form.Control
                      type="time"
                      size="sm"
                      value={formEdit.thoiGianDi}
                      onChange={(e) => {
                        console.log("🕒 Edit Time Di changed:", e.target.value);
                        handleTimeInputChange(
                          "thoiGianDi",
                          e.target.value,
                          true
                        );
                      }}
                      required
                      step="3600"
                      className="py-2"
                    />
                    <Form.Text className="text-muted small">
                      Định dạng 24h
                    </Form.Text>
                    <div className="mt-1">
                      <small className="text-info">
                        Giá trị:{" "}
                        <strong>{formEdit.thoiGianDi || "chưa chọn"}</strong>
                      </small>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">
                      Thời gian đến *
                    </Form.Label>
                    <Form.Control
                      type="time"
                      size="sm"
                      value={formEdit.thoiGianDen}
                      onChange={(e) => {
                        console.log(
                          "🕒 Edit Time Den changed:",
                          e.target.value
                        );
                        handleTimeInputChange(
                          "thoiGianDen",
                          e.target.value,
                          true
                        );
                      }}
                      required
                      step="3600"
                      className="py-2"
                    />
                    <Form.Text className="text-muted small">
                      Định dạng 24h
                    </Form.Text>
                    <div className="mt-1">
                      <small className="text-info">
                        Giá trị:{" "}
                        <strong>{formEdit.thoiGianDen || "chưa chọn"}</strong>
                      </small>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {formEdit.thoiGianDi && formEdit.thoiGianDen && (
                <Alert
                  variant={
                    formEdit.thoiGianDi >= formEdit.thoiGianDen
                      ? "danger"
                      : "success"
                  }
                  className="py-2 small mb-4"
                >
                  {formEdit.thoiGianDi >= formEdit.thoiGianDen
                    ? "⚠️ Thời gian đi phải sớm hơn thời gian đến"
                    : `✅ Khoảng thời gian: ${formEdit.thoiGianDi} → ${formEdit.thoiGianDen}`}
                  <br />
                  📤 Sẽ gửi đến server: {formEdit.thoiGianDi}:00 →{" "}
                  {formEdit.thoiGianDen}:00
                </Alert>
              )}

              {selectedSchedule && (
                <div className="border-start border-3 border-info bg-light bg-opacity-10 p-3 rounded mb-4">
                  <h6 className="text-info mb-3 fw-semibold small">
                    <i className="fas fa-history me-2"></i>
                    THÔNG TIN HỆ THỐNG
                  </h6>
                  <div className="row small text-muted">
                    <div className="col-md-6 mb-2">
                      <span className="fw-medium">Mã lịch trình:</span>
                      <br />
                      <code className="text-dark">
                        {selectedSchedule.maLichTrinh}
                      </code>
                    </div>
                    <div className="col-md-6 mb-2">
                      <span className="fw-medium">Ngày gốc:</span>
                      <br />
                      {formatDate(selectedSchedule.ngay)}
                    </div>
                    <div className="col-12 mb-2">
                      <span className="fw-medium">Giờ gốc:</span>
                      <br />
                      <span className="badge bg-secondary">
                        {formatTimeForDisplay(selectedSchedule.thoiGianDi)} →{" "}
                        {formatTimeForDisplay(selectedSchedule.thoiGianDen)}
                      </span>
                    </div>
                    <div className="col-12 mt-2 pt-2 border-top">
                      <small>
                        <i className="fas fa-database me-1"></i>
                        Dữ liệu tham khảo từ hệ thống
                      </small>
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
                  disabled={formEdit.thoiGianDi >= formEdit.thoiGianDen}
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

export default ScheduledPage;
