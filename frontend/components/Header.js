"use client";

import React from "react";
import Navbar from "react-bootstrap/Navbar";
import NavbarBrand from "react-bootstrap/NavbarBrand";
import NavbarToggle from "react-bootstrap/NavbarToggle";
import NavbarCollapse from "react-bootstrap/NavbarCollapse";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const isLoggedIn = true;
  const userName = "Văn Thiện";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/sign-in");
  };

  return (
    <Navbar
      bg="white"
      variant="light"
      expand="lg"
      className="border-bottom shadow-sm"
    >
      <Container fluid>
        <NavbarBrand href="#home">Smart School Bus Tracking</NavbarBrand>
        <NavbarToggle aria-controls="basic-navbar-nav" />
        <NavbarCollapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            {isLoggedIn ? (
              <NavDropdown
                align="end"
                id="user-nav-dropdown"
                title={
                  <span className="d-flex align-items-center">
                    <FaUserCircle className="me-2" size={22} />
                    <span>{userName}</span>
                  </span>
                }
              >
                <NavDropdown.Item href="#profile">
                  Thông tin tài khoản
                </NavDropdown.Item>

                <Dropdown.Divider />

                <NavDropdown.Item href="sign-in">
                  <Button variant="warning" className="w-100 text-start">
                    <span className="d-flex align-items-center">
                      <FaSignOutAlt className="me-2" />
                      <span>Đăng xuất</span>
                    </span>
                  </Button>
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button variant="outline-primary">Đăng nhập</Button>
            )}
          </Nav>
        </NavbarCollapse>
      </Container>
    </Navbar>
  );
};

export default Header;
