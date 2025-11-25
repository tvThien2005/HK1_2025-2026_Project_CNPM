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

const Sidebar = ({ collapsed = false, onToggle, onClose }) => {
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
      className={`bg-dark text-white ${
        collapsed ? "p-2" : "p-4"
      } position-relative`}
      style={{
        height: "100vh",
        width: "100%",
        transition: "all 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className={`d-flex align-items-center mb-4 ${
          collapsed ? "justify-content-center" : ""
        }`}
      >
        {!collapsed && <FaTachometerAlt size={30} className="me-3" />}
        {!collapsed && <h2 className="text-white mb-0">Admin</h2>}
        {collapsed && <FaTachometerAlt size={24} />}
      </div>

      {/* Toggle Button for Desktop */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="btn btn-sm btn-outline-light position-absolute"
          style={{
            top: "15px",
            right: collapsed ? "8px" : "15px",
            border: "none",
            fontSize: "12px",
            padding: "5px 8px",
          }}
        >
          {collapsed ? "→" : "←"}
        </button>
      )}

      {/* Close Button for Mobile */}
      {onClose && (
        <button
          onClick={onClose}
          className="btn btn-sm btn-outline-light position-absolute d-md-none"
          style={{
            top: "15px",
            right: "15px",
            border: "none",
            fontSize: "16px",
            padding: "5px 8px",
          }}
        >
          ✕
        </button>
      )}

      <Nav className="flex-column sidebar-nav">
        <NavItem className="mb-2">
          <Link
            href="/"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/") ? "active" : ""
            } ${collapsed ? "justify-content-center px-2" : ""}`}
            title={collapsed ? "Dashboard" : ""}
          >
            <FaTachometerAlt
              className={collapsed ? "" : "me-2"}
              size={collapsed ? 20 : 16}
            />
            {!collapsed && <span>Dashboard</span>}
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/schedules"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/schedules") ? "active" : ""
            } ${collapsed ? "justify-content-center px-2" : ""}`}
            title={collapsed ? "Quản lý lịch trình" : ""}
          >
            <FaCalendarAlt
              className={collapsed ? "" : "me-2"}
              size={collapsed ? 20 : 16}
            />
            {!collapsed && <span>Quản lý lịch trình</span>}
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/routes"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/routes") ? "active" : ""
            } ${collapsed ? "justify-content-center px-2" : ""}`}
            title={collapsed ? "Quản lý tuyến đường" : ""}
          >
            <FaRoute
              className={collapsed ? "" : "me-2"}
              size={collapsed ? 20 : 16}
            />
            {!collapsed && (
              <span style={{ whiteSpace: "nowrap" }}>Quản lý tuyến đường</span>
            )}
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/bus"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/bus") ? "active" : ""
            } ${collapsed ? "justify-content-center px-2" : ""}`}
            title={collapsed ? "Quản lý xe buýt" : ""}
          >
            <FaBus
              className={collapsed ? "" : "me-2"}
              size={collapsed ? 20 : 16}
            />
            {!collapsed && <span>Quản lý xe buýt</span>}
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/Students"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/Students") ? "active" : ""
            } ${collapsed ? "justify-content-center px-2" : ""}`}
            title={collapsed ? "Quản lý học sinh" : ""}
          >
            <FaUser
              className={collapsed ? "" : "me-2"}
              size={collapsed ? 20 : 16}
            />
            {!collapsed && <span>Quản lý học sinh</span>}
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/Drivers"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/Drivers") ? "active" : ""
            } ${collapsed ? "justify-content-center px-2" : ""}`}
            title={collapsed ? "Quản lí tài xế" : ""}
          >
            <FaUserTie
              className={collapsed ? "" : "me-2"}
              size={collapsed ? 20 : 16}
            />
            {!collapsed && <span>Quản lí tài xế</span>}
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/Locations"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/Locations") ? "active" : ""
            } ${collapsed ? "justify-content-center px-2" : ""}`}
            title={collapsed ? "Theo dõi chuyến xe" : ""}
          >
            <FaMapMarkerAlt
              className={collapsed ? "" : "me-2"}
              size={collapsed ? 20 : 16}
            />
            {!collapsed && <span>Theo dõi chuyến xe</span>}
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/AssignDrivers"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/AssignDrivers") ? "active" : ""
            } ${collapsed ? "justify-content-center px-2" : ""}`}
            title={collapsed ? "Phân công tài xế" : ""}
          >
            <FaCar
              className={collapsed ? "" : "me-2"}
              size={collapsed ? 20 : 16}
            />
            {!collapsed && <span>Phân công tài xế</span>}
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/users"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/users") ? "active" : ""
            } ${collapsed ? "justify-content-center px-2" : ""}`}
            title={collapsed ? "Quản lý tài khoản" : ""}
          >
            <FaUserCog
              className={collapsed ? "" : "me-2"}
              size={collapsed ? 20 : 16}
            />
            {!collapsed && <span>Quản lý tài khoản</span>}
          </Link>
        </NavItem>

        <NavItem className="mb-2">
          <Link
            href="/notifications"
            className={`nav-link text-white d-flex align-items-center nav-link-custom ${
              isActive("/notifications") ? "active" : ""
            } ${collapsed ? "justify-content-center px-2" : ""}`}
            title={collapsed ? "Gửi thông báo" : ""}
          >
            <FaBell
              className={collapsed ? "" : "me-2"}
              size={collapsed ? 20 : 16}
            />
            {!collapsed && <span>Gửi thông báo</span>}
          </Link>
        </NavItem>
      </Nav>

      <style jsx>{`
        .nav-link-custom {
          padding: ${collapsed ? "10px 8px" : "10px 15px"};
          border-radius: 5px;
          transition: all 0.3s ease;
          text-decoration: none;
          min-height: 45px;
          display: flex;
          align-items: center;
        }

        .nav-link-custom:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transform: ${collapsed ? "scale(1.05)" : "none"};
        }

        .nav-link-custom.active {
          background-color: rgba(255, 255, 255, 0.2);
          font-weight: bold;
        }

        .nav-link-custom span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
