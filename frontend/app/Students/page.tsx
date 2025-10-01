"use client";

import React, { useState, useEffect, useRef } from "react";
// Lưu ý: Dòng import CSS này đã bị xóa để tránh lỗi biên dịch.
// Để hiển thị giao diện đúng, bạn cần thêm Bootstrap CSS vào trang HTML chính của mình,
// ví dụ: <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  Image,
  Alert,
} from "react-bootstrap";

interface Student {
  id: number;
  name: string;
  photo: string;
  class: string;
  status: string;
}

interface FormState {
  name: string;
  class: string;
  status: string;
  photo: File | null;
  photoPreview: string | null;
}

export default function StudentManagerPage() {
  const initialData: Student[] = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      photo: "https://via.placeholder.com/80x80?text=NV1",
      class: "10A1",
      status: "Hoạt động",
    },
    {
      id: 2,
      name: "Trần Thị B",
      photo: "https://via.placeholder.com/80x80?text=TTB",
      class: "10A2",
      status: "Tạm nghỉ",
    },
    {
      id: 3,
      name: "Lê Văn C",
      photo: "https://via.placeholder.com/80x80?text=LVC",
      class: "11B1",
      status: "Hoạt động",
    },
  ];

  const [students, setStudents] = useState<Student[]>(initialData);
  const [query, setQuery] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    class: "",
    status: "Hoạt động",
    photo: null,
    photoPreview: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    variant: string;
  } | null>(null);

  useEffect(() => {
    // This is where you would fetch data from your backend API
    // Ví dụ:
    // const fetchStudents = async () => {
    //   const response = await fetch('/api/students');
    //   const data = await response.json();
    //   setStudents(data);
    // };
    // fetchStudents();
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
  };

  const filtered = students.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      String(s.id).includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.class.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      class: "",
      status: "Hoạt động",
      photo: null,
      photoPreview: null,
    });
    setShowModal(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setForm({
      name: student.name,
      class: student.class,
      status: student.status,
      photo: null,
      photoPreview: student.photo,
    });
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, photo: file, photoPreview: url }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.class.trim()) {
      setMessage({ text: "Vui lòng nhập tên và lớp.", variant: "danger" });
      return;
    }

    if (editing) {
      // Cập nhật
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editing.id
            ? {
                ...s,
                name: form.name,
                class: form.class,
                status: form.status,
                photo: form.photoPreview || s.photo,
              }
            : s
        )
      );
      setMessage({ text: "Cập nhật học sinh thành công!", variant: "success" });
    } else {
      // Thêm mới
      const newStudent: Student = {
        id: Date.now(),
        name: form.name,
        class: form.class,
        status: form.status,
        photo:
          form.photoPreview || "https://via.placeholder.com/80x80?text=New",
      };
      setStudents((prev) => [newStudent, ...prev]);
      setMessage({ text: "Thêm học sinh thành công!", variant: "success" });
    }

    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setStudentToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete !== null) {
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete));
      setMessage({ text: "Xóa học sinh thành công!", variant: "success" });
    }
    setShowConfirmModal(false);
    setStudentToDelete(null);
  };

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center">
        <Col xs={12} md={4} className="mb-2 mb-md-0">
          <h1 className="my-4">Quản lý học sinh</h1>
        </Col>
        <Col xs={12} md={5}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Tìm theo mã, tên, lớp hoặc trạng thái..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={() => setQuery("")}>
              Clear
            </Button>
          </InputGroup>
        </Col>
        <Col xs={12} md={3} className="text-md-end mt-2 mt-md-0">
          <Button onClick={openAdd}>+ Thêm học sinh</Button>
        </Col>
      </Row>

      {message && (
        <Alert
          variant={message.variant}
          onClose={() => setMessage(null)}
          dismissible
        >
          {message.text}
        </Alert>
      )}

      <Row>
        <Col>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th style={{ width: 80 }}>Mã</th>
                <th>Tên</th>
                <th style={{ width: 100 }}>Ảnh</th>
                <th>Lớp</th>
                <th>Trạng thái</th>
                <th style={{ width: 200 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Không có học sinh.
                  </td>
                </tr>
              )}

              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>
                    <Image
                      src={s.photo}
                      alt={s.name}
                      rounded
                      width={60}
                      height={60}
                    />
                  </td>
                  <td>{s.class}</td>
                  <td>{s.status}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => openEdit(s)}
                    >
                      Sửa
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(s.id)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editing ? "Sửa học sinh" : "Thêm học sinh"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lớp</Form.Label>
              <Form.Control
                value={form.class}
                onChange={(e) =>
                  setForm((f) => ({ ...f, class: e.target.value }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option>Hoạt động</option>
                <option>Tạm nghỉ</option>
                <option>Chuyển trường</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ảnh (tùy chọn)</Form.Label>
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: 80,
                    height: 80,
                    border: "1px solid #ddd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {form.photoPreview ? (
                    <img
                      src={form.photoPreview}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: 12, color: "#777" }}>No image</div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button type="submit">Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa học sinh này không?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
