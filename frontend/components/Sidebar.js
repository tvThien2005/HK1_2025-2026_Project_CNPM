// frontend/components/Sidebar.js
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Nav, NavItem } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaBus,
  FaCar,
  FaUserCog,
  FaBell,
  FaMapMarkerAlt,
  FaUser,
  FaUserTie,
  FaRoute,
} from "react-icons/fa"; // Import icons

const Sidebar = () => {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/sign-in";
  };

  // Hàm kiểm tra active state
  const isActive = (href) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div
      className="bg-dark text-white p-4"
      style={{ height: "100%", width: "100%" }}
    >
      <div className="d-flex align-items-center mb-4">
        <FaTachometerAlt size={30} className="me-3" />
        <h2 className="text-white mb-0">Admin</h2>
      </div>

      <Nav className="flex-column sidebar-nav">
        <NavItem className="mb-2">
          <Link
            href="/"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/") ? "active" : ""
            }`}
          >
            <FaTachometerAlt className="me-2" /> Dashboard
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/schedules"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/schedules") ? "active" : ""
            }`}
          >
            <FaCalendarAlt className="me-2" /> Quản lý lịch trình
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            style={{ whiteSpace: "nowrap" }}
            href="/routes"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/routes") ? "active" : ""
            }`}
          >
            <FaRoute className="me-2" /> Quản lý tuyến đường
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/bus"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/bus") ? "active" : ""
            }`}
          >
            <FaBus className="me-2" /> Quản lý xe buýt
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/Students"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/Students") ? "active" : ""
            }`}
          >
            <FaUser className="me-2" /> Quản lý học sinh
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/Drivers"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/Drivers") ? "active" : ""
            }`}
          >
            <FaUserTie className="me-2" /> Quản lí tài xế
          </Link>
        </NavItem>
        <NavItem className="mb-2">
          <Link
            href="/Locations"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/Locations") ? "active" : ""
            }`}
          >
            <FaMapMarkerAlt className="me-2" /> Theo dõi chuyến xe
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/AssignDrivers"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/AssignDrivers") ? "active" : ""
            }`}
          >
            <FaCar className="me-2" /> Phân công tài xế
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/users"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/users") ? "active" : ""
            }`}
          >
            <FaUserCog className="me-2" /> Quản lý tài khoản
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/notifications"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/notifications") ? "active" : ""
            }`}
          >
            <FaBell className="me-2" /> Gửi thông báo
          </Link>
        </NavItem>
      </Nav>

      <style jsx>{`
        .nav-link-custom {
          padding: 10px 15px;
          border-radius: 5px;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .nav-link-custom:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .nav-link-custom.active {
          background-color: rgba(255, 255, 255, 0.2);
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
