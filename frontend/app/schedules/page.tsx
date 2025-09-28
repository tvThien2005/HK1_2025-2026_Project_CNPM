// frontend/app/schedules/page.tsx
"use client";
import Head from "next/head";
// import Layout from "../../components/Layout";
import { Container, Button, Table, Modal, Form } from "react-bootstrap";
import { useState } from "react";

const SchedulesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  return (
    <>
      <Head>
        <title>Quản lý lịch trình | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center my-4">
          <h1>Quản lý lịch trình</h1>
          <Button variant="primary" onClick={handleShow}>
            Tạo lịch trình mới
          </Button>
        </div>
        <Table striped bordered hover className="shadow-sm">
          <thead>
            <tr>
              <th>Tuyến</th>
              <th>Xe</th>
              <th>Tài xế</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tuyến số 1</td>
              <td>BKS 29A-123.45</td>
              <td>Nguyễn Văn A</td>
              <td>7:00 AM</td>
              <td>
                <Button variant="warning" size="sm" className="me-2">
                  Sửa
                </Button>
                <Button variant="danger" size="sm">
                  Xóa
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Tạo lịch trình mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Chọn xe</Form.Label>
                <Form.Select>
                  <option>Xe 1</option>
                  <option>Xe 2</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Chọn tuyến đường</Form.Label>
                <Form.Select>
                  <option>Tuyến số 1</option>
                  <option>Tuyến số 2</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Đóng
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Lưu
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default SchedulesPage;
