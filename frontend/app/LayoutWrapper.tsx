// frontend/app/LayoutWrapper.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Thêm /sign-up vào danh sách trang auth
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

  // Đảm bảo component đã mount để tránh hydration error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");

      if (!isLoggedIn && !isAuthPage) {
        router.push("/sign-in");
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router, isAuthPage, isMounted]);

  // Show loading nếu chưa mount hoặc đang checking auth (không phải trang auth)
  if (!isMounted || (isChecking && !isAuthPage)) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (isAuthPage) {
    return <div>{children}</div>;
  }

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        <Col xs={12} md={3} lg={2} className="d-none d-md-block">
          <Sidebar />
        </Col>
        <Col xs={12} md={9} lg={10} className="p-0 min-vh-100">
          <Header />
          <div className="p-4 bg-light min-vh-100">{children}</div>
        </Col>
      </Row>
    </Container>
  );
}
