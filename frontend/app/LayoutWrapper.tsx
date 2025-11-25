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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
    <>
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div
          className="position-fixed w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 1040 }}
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      <Container fluid className="p-0">
        <Row className="g-0">
          {/* Desktop Sidebar */}
          <Col
            xs={12}
            md={sidebarCollapsed ? 1 : 3}
            lg={sidebarCollapsed ? 1 : 2}
            className="d-none d-md-block position-relative"
            style={{
              transition: "all 0.3s ease",
              minWidth: sidebarCollapsed ? "60px" : "auto",
            }}
          >
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              onClose={() => {}}
            />
          </Col>

          {/* Mobile Sidebar */}
          <div
            className={`position-fixed top-0 start-0 h-100 d-md-none ${
              showMobileSidebar ? "translate-x-0" : "translate-x-n100"
            }`}
            style={{
              zIndex: 1050,
              width: "280px",
              transition: "transform 0.3s ease",
              transform: showMobileSidebar
                ? "translateX(0)"
                : "translateX(-100%)",
            }}
          >
            <Sidebar
              collapsed={false}
              onToggle={() => {}}
              onClose={() => setShowMobileSidebar(false)}
            />
          </div>

          {/* Main Content */}
          <Col
            xs={12}
            md={sidebarCollapsed ? 11 : 9}
            lg={sidebarCollapsed ? 11 : 10}
            className="p-0 min-vh-100"
            style={{
              transition: "all 0.3s ease",
              marginLeft: 0,
            }}
          >
            <Header
              onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
              sidebarCollapsed={sidebarCollapsed}
            />
            <div className="p-4 bg-light min-vh-100">{children}</div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
