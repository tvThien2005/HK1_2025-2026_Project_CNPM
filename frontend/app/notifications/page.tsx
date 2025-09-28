// frontend/app/notifications/page.tsx
"use client";
import Head from "next/head";
// import Layout from "../../components/Layout";
import { Container, Form, Button } from "react-bootstrap";
import { SetStateAction, useState } from "react";

const NotificationsPage = () => {
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    alert(`Đã gửi thông báo đến ${target} với nội dung: "${message}"`);
    setMessage("");
  };

  return (
    <>
      <Head>
        <title>Gửi thông báo | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <h1 className="my-4">Gửi thông báo</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Đối tượng nhận</Form.Label>
            <Form.Select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="drivers">Tài xế</option>
              <option value="parents">Phụ huynh</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nội dung thông báo</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={message}
              onChange={(e: { target: { value: SetStateAction<string> } }) =>
                setMessage(e.target.value)
              }
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Gửi thông báo
          </Button>
        </Form>
      </Container>
    </>
  );
};

export default NotificationsPage;
