"use client";

import React from "react";

// import explicit modules (an toàn với mọi bundler)
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

const Header = () => {
  const isLoggedIn = true;
  const userName = "Admin";

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
                title={
                  <>
                    <FaUserCircle className="me-2" />
                    {userName}
                  </>
                }
                id="user-nav-dropdown"
              >
                <NavDropdown.Item href="#profile">
                  Thông tin tài khoản
                </NavDropdown.Item>

                {/* Divider: dùng Dropdown.Divider (từ module riêng) */}
                <Dropdown.Divider />

                <NavDropdown.Item href="#logout">
                  <FaSignOutAlt className="me-2" />
                  Đăng xuất
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
