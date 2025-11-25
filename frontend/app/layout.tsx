// frontend/app/layout.tsx
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Container, Row, Col } from "react-bootstrap";
import LayoutWrapper from "./LayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body suppressHydrationWarning={true}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
