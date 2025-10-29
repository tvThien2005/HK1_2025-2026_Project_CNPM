// frontend/components/Sidebar.js
import React from "react";
import Link from "next/link";
import { Nav, NavItem, NavLink } from "react-bootstrap";
import NavbarCollapse from "react-bootstrap/NavbarCollapse";
import NavbarToggle from "react-bootstrap/NavbarToggle";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaBus,
  FaCar,
  FaUserCog,
  FaBell,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa"; // Import icons

const Sidebar = () => {
  return (
    <div
      className="bg-dark text-white p-4"
      style={{ height: "100%", width: "100%" }}
    >
      <div className="d-flex align-items-center mb-4">
        <FaTachometerAlt size={30} className="me-3" />
        <h2 className="text-white mb-0">Admin</h2>
      </div>
      <NavbarToggle aria-controls="basic-navbar-nav" />
      <NavbarCollapse
        id="basic-navbar-nav"
        className="justify-content-end"
      ></NavbarCollapse>
      <Nav className="flex-column">
        <NavItem className="mb-2">
          <NavLink
            as={Link}
            href="/"
            className="text-white d-flex align-items-center"
          >
            <FaTachometerAlt className="me-2" /> Dashboard
          </NavLink>
        </NavItem>
        <NavItem className="mb-2">
          <NavLink
            as={Link}
            href="/schedules"
            className="text-white d-flex align-items-center"
          >
            <FaCalendarAlt className="me-2" /> Quản lí lịch trình
          </NavLink>
        </NavItem>
        <NavItem className="mb-2">
          <NavLink
            as={Link}
            href="/bus"
            className="text-white d-flex align-items-center"
          >
            <FaBus className="me-2" /> Quản lí xe buýt
          </NavLink>
        </NavItem>
        <NavItem className="mb-2">
          <NavLink
            as={Link}
            href="/Students"
            className="text-white d-flex align-items-center"
          >
            <FaUser className="me-2" /> Quản lí học sinh
          </NavLink>
        </NavItem>
        <NavItem className="mb-2">
          <NavLink
            as={Link}
            href="/Locations"
            className="text-white d-flex align-items-center"
          >
            <FaMapMarkerAlt className="me-2" /> Cập nhật vị trí xe
          </NavLink>
        </NavItem>
        <NavItem className="mb-2">
          <NavLink
            as={Link}
            href="/AssignDrivers"
            className="text-white d-flex align-items-center"
          >
            <FaCar className="me-2" /> Phân công tài xế
          </NavLink>
        </NavItem>
        <NavItem className="mb-2">
          <NavLink
            as={Link}
            href="/users"
            className="text-white d-flex align-items-center"
          >
            <FaUserCog className="me-2" /> Quản lí tài khoản
          </NavLink>
        </NavItem>
        <NavItem className="mb-2">
          <NavLink
            as={Link}
            href="/notifications"
            className="text-white d-flex align-items-center"
          >
            <FaBell className="me-2" /> Gửi thông báo
          </NavLink>
        </NavItem>
      </Nav>
    </div>
  );
};

export default Sidebar;
