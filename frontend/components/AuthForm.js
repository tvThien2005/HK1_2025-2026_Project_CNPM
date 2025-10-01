// frontend/components/AuthForm.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Button, Container, Row, Col } from "react-bootstrap";

export default function AuthForm({ mode = "signin" }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    phone: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Kiểm tra mật khẩu xác nhận (chỉ cho đăng ký)
    if (mode === "signup" && formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      alert(
        mode === "signin" ? "Đăng nhập thành công!" : "Đăng ký thành công!"
      );
      router.push("/");
      setIsLoading(false);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const title = mode === "signin" ? "ĐĂNG NHẬP" : "ĐĂNG KÝ TÀI KHOẢN";
  const description =
    mode === "signin"
      ? "Hệ thống quản lý xe buýt trường học"
      : "Tạo tài khoản mới cho hệ thống";

  return (
    <Container fluid className="auth-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={12} sm={8} md={6} lg={4}>
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-white fw-bold" style={{ fontSize: "2.5rem" }}>
              Admin
            </h1>
            <div className="text-white-50">
              <small style={{ fontSize: "1.2rem" }}>
                Smart School Bus Tracking
              </small>
            </div>
          </div>

          <Card className="auth-card">
            <Card.Body className="p-4">
              {/* Form Header */}
              <div className="text-center mb-4">
                <h4 className="fw-bold text-dark mb-2">{title}</h4>
                <p className="text-muted mb-0">{description}</p>
              </div>

              <Form onSubmit={handleSubmit}>
                {/* Các trường chỉ hiển thị khi đăng ký */}
                {mode === "signup" && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-dark">
                        Họ và tên
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nhập họ và tên đầy đủ"
                        required
                        className="py-2"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-dark">
                        Email
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ email"
                        required
                        className="py-2"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-dark">
                        Số điện thoại
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                        className="py-2"
                      />
                    </Form.Group>
                  </>
                )}

                {/* Tên đăng nhập */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium text-dark">
                    Tên đăng nhập
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nhập tên đăng nhập"
                    required
                    className="py-2"
                  />
                </Form.Group>

                {/* Mật khẩu */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium text-dark">
                    Mật khẩu
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu"
                    required
                    className="py-2"
                  />
                </Form.Group>

                {/* Xác nhận mật khẩu (chỉ cho đăng ký) */}
                {mode === "signup" && (
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium text-dark">
                      Xác nhận mật khẩu
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Nhập lại mật khẩu"
                      required
                      className="py-2"
                    />
                  </Form.Group>
                )}

                {/* Nút submit */}
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-medium"
                  disabled={isLoading}
                  style={{
                    backgroundColor: "#3b71ca",
                    borderColor: "#3b71ca",
                    fontSize: "16px",
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {mode === "signin"
                        ? "Đang đăng nhập..."
                        : "Đang đăng ký..."}
                    </>
                  ) : mode === "signin" ? (
                    "Đăng nhập"
                  ) : (
                    "Đăng ký"
                  )}
                </Button>
              </Form>

              {/* Footer links */}
              <div className="mt-4 text-center">
                <div className="mb-2">
                  <a
                    href={mode === "signin" ? "/sign-up" : "/sign-in"}
                    className="text-decoration-none text-primary"
                  >
                    {mode === "signin"
                      ? "Chưa có tài khoản? Đăng ký ngay"
                      : "Đã có tài khoản? Đăng nhập"}
                  </a>
                </div>
                {mode === "signin" && (
                  <div>
                    <a
                      href="/forgot-password"
                      className="text-decoration-none text-muted"
                    >
                      ⇔ Quên mật khẩu?
                    </a>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
