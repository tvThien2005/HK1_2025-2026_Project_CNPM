"use client";
import { useEffect, useState } from "react";
import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import {
  Container,
  Table,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
  Pagination,
  Modal,
  Alert,
  Badge,
  Card as BootstrapCard,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaMapMarkedAlt,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaSearch,
} from "react-icons/fa";
import axios from "axios";

// Dynamic import để tránh SSR issue
const RouteMap = dynamic(() => import("../../components/RouteMap"), {
  ssr: false,
});

interface Route {
  maTuyenDuong: number;
  tenTuyenDuong: string;
  loai: string;
  soTram: number;
}

interface Station {
  maChiTietTuyenDuong: number;
  maTuyenDuong: number;
  maDiemDung: number;
  thuTu: number;
  thoiGianDuKien: string;
  loaiDiem: string;
  tenDiemDung: string;
  moTa: string;
  trangThai: string;
  viDo: number;
  kinhDo: number;
}

interface AvailableStation {
  maDiemDung: number;
  tenDiemDung: string;
  moTa: string;
  trangThai: string;
}

const RoutesPage = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [availableStations, setAvailableStations] = useState<
    AvailableStation[]
  >([]);
  const [selectedRouteStations, setSelectedRouteStations] = useState<{
    [key: number]: Station[];
  }>({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showCreateStationModal, setShowCreateStationModal] = useState(false); // NEW
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const itemsPerPage = 10;

  // State cho chức năng sắp xếp
  const [isReordering, setIsReordering] = useState(false);
  const [tempStations, setTempStations] = useState<Station[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const [formData, setFormData] = useState({
    tenTuyenDuong: "",
    loai: "Chính",
  });

  const [stationFormData, setStationFormData] = useState({
    maDiemDung: "",
    thuTu: 1,
    thoiGianDuKien: "06:30",
    loaiDiem: "Đón",
  });

  // NEW: States cho địa chỉ phân cấp
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [streets, setStreets] = useState<any[]>([]);

  // NEW: State cho form tạo trạm mới với địa chỉ phân cấp
  const [newStationFormData, setNewStationFormData] = useState({
    tenDiemDung: "",
    moTa: "",
    province: "",
    provinceName: "",
    district: "",
    districtName: "",
    ward: "",
    wardName: "",
    street: "",
    houseNumber: "",
    fullAddress: "",
    viDo: "",
    kinhDo: "",
    trangThai: "Active",
  });

  // NEW: States cho geocoding
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [geocodeError, setGeocodeError] = useState("");

  // Fetch tất cả tuyến đường
  const fetchRoutes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/routes");
      setRoutes(res.data.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy tuyến đường:", err);
      showAlert("Lỗi khi tải danh sách tuyến đường", "danger");
    }
  };

  // Fetch danh sách trạm có sẵn
  const fetchAvailableStations = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/tracking/diemdung"
      );
      setAvailableStations(res.data.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách trạm:", err);
    }
  };

  // Fetch các trạm của một tuyến đường
  const fetchRouteStations = async (routeId: number) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/routes/${routeId}/stations`
      );
      setSelectedRouteStations((prev) => ({
        ...prev,
        [routeId]: res.data.data || [],
      }));
    } catch (err) {
      console.error("Lỗi khi lấy trạm của tuyến:", err);
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchAvailableStations();
  }, []);

  // NEW: Fetch provinces khi component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // NEW: Fetch danh sách tỉnh/thành phố
  const fetchProvinces = async () => {
    try {
      const response = await fetch("https://provinces.open-api.vn/api/p/");
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tỉnh thành:", error);
    }
  };

  // NEW: Fetch quận/huyện khi chọn tỉnh
  const fetchDistricts = async (provinceCode: string) => {
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const data = await response.json();
      setDistricts(data.districts || []);
      setWards([]);
    } catch (error) {
      console.error("Lỗi khi tải danh sách quận huyện:", error);
    }
  };

  // NEW: Fetch phường/xã khi chọn quận
  const fetchWards = async (districtCode: string) => {
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const data = await response.json();
      setWards(data.wards || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phường xã:", error);
    }
  };

  // NEW: Handle thay đổi tỉnh/thành phố
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const province = provinces.find((p) => p.code.toString() === code);

    setNewStationFormData((prev) => ({
      ...prev,
      province: code,
      provinceName: province?.name || "",
      district: "",
      districtName: "",
      ward: "",
      wardName: "",
      street: "",
      viDo: "",
      kinhDo: "",
    }));

    setDistricts([]);
    setWards([]);
    setSearchResults([]);
    setSelectedLocation(null);

    if (code) {
      fetchDistricts(code);
    }
  };

  // NEW: Handle thay đổi quận/huyện
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const district = districts.find((d) => d.code.toString() === code);

    setNewStationFormData((prev) => ({
      ...prev,
      district: code,
      districtName: district?.name || "",
      ward: "",
      wardName: "",
      street: "",
      viDo: "",
      kinhDo: "",
    }));

    setWards([]);
    setSearchResults([]);
    setSelectedLocation(null);

    if (code) {
      fetchWards(code);
    }
  };

  // NEW: Handle thay đổi phường/xã
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const ward = wards.find((w) => w.code.toString() === code);

    setNewStationFormData((prev) => ({
      ...prev,
      ward: code,
      wardName: ward?.name || "",
      viDo: "",
      kinhDo: "",
    }));

    setSearchResults([]);
    setSelectedLocation(null);
  };

  // NEW: Handle thay đổi đường và số nhà
  const handleAddressFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStationFormData((prev) => ({
      ...prev,
      [name]: value,
      viDo: "",
      kinhDo: "",
    }));
    setSearchResults([]);
    setSelectedLocation(null);
  };

  // NEW: Tạo địa chỉ đầy đủ để geocoding
  const buildFullAddress = () => {
    const { houseNumber, street, wardName, districtName, provinceName } =
      newStationFormData;

    const parts = [];
    if (houseNumber) parts.push(houseNumber);
    if (street) parts.push(street);
    if (wardName) parts.push(wardName);
    // if (districtName) parts.push(districtName);
    if (provinceName) parts.push(provinceName);

    return parts.join(", ");
  };

  // Mở modal map với tuyến đường
  const handleShowMapModal = async (route: Route) => {
    setSelectedRoute(route);
    if (!selectedRouteStations[route.maTuyenDuong]) {
      await fetchRouteStations(route.maTuyenDuong);
    }
    setIsReordering(false);
    setShowMapModal(true);
  };

  // Bắt đầu sắp xếp lại
  const handleStartReorder = () => {
    if (!selectedRoute) return;
    const stations = selectedRouteStations[selectedRoute.maTuyenDuong];
    setTempStations([...stations].sort((a, b) => a.thuTu - b.thuTu));
    setIsReordering(true);
  };

  // Hủy sắp xếp
  const handleCancelReorder = () => {
    setIsReordering(false);
    setTempStations([]);
  };

  // Di chuyển trạm lên
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newStations = [...tempStations];
    [newStations[index], newStations[index - 1]] = [
      newStations[index - 1],
      newStations[index],
    ];
    newStations.forEach((station, idx) => {
      station.thuTu = idx + 1;
    });
    setTempStations(newStations);
  };

  // Di chuyển trạm xuống
  const handleMoveDown = (index: number) => {
    if (index === tempStations.length - 1) return;
    const newStations = [...tempStations];
    [newStations[index], newStations[index + 1]] = [
      newStations[index + 1],
      newStations[index],
    ];
    newStations.forEach((station, idx) => {
      station.thuTu = idx + 1;
    });
    setTempStations(newStations);
  };

  // Lưu thứ tự mới
  const handleSaveOrder = async () => {
    if (!selectedRoute) return;

    setIsSavingOrder(true);
    try {
      const reorderData = tempStations.map((station, index) => ({
        maDiemDung: station.maDiemDung,
        thuTu: index + 1,
      }));

      console.log("📤 FRONTEND - Sending reorder request:");
      console.log("  Route ID:", selectedRoute.maTuyenDuong);
      console.log(
        "  URL:",
        `http://localhost:5000/api/routes/${selectedRoute.maTuyenDuong}/stations/reorder`
      );
      console.log("  Reorder data:", reorderData);

      // Log trước khi gửi
      console.log("🔍 tempStations:", tempStations);
      console.log(
        "🔍 Original stations:",
        selectedRouteStations[selectedRoute.maTuyenDuong]
      );

      const response = await axios.put(
        `http://localhost:5000/api/routes/${selectedRoute.maTuyenDuong}/stations/reorder`,
        { stations: reorderData }
      );

      console.log("✅ FRONTEND - Response:", response.data);

      // QUAN TRỌNG: Fetch lại data ngay sau khi update
      console.log("🔄 Fetching updated data...");
      await fetchRouteStations(selectedRoute.maTuyenDuong);

      console.log(
        "🔍 Updated stations:",
        selectedRouteStations[selectedRoute.maTuyenDuong]
      );

      showAlert("Cập nhật thứ tự trạm thành công", "success");

      setIsReordering(false);
      setTempStations([]);
    } catch (err: any) {
      console.error("❌ FRONTEND - Lỗi khi cập nhật thứ tự:", err);
      console.error("📋 Error response:", err.response?.data);

      showAlert(
        err.response?.data?.error || "Lỗi khi cập nhật thứ tự trạm",
        "danger"
      );
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Hiển thị alert
  const showAlert = (message: string, type: string) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Mở modal thêm tuyến đường
  const handleShowAdd = () => {
    setFormData({ tenTuyenDuong: "", loai: "Chính" });
    setShowAddModal(true);
  };

  // Mở modal sửa tuyến đường
  const handleShowEdit = (route: Route) => {
    setSelectedRoute(route);
    setFormData({
      tenTuyenDuong: route.tenTuyenDuong,
      loai: route.loai,
    });
    setShowEditModal(true);
  };

  // ...existing code...

  // UPDATED: Mở modal thêm trạm vào tuyến - Fetch trước khi mở
  const handleShowAddStation = async (route: Route) => {
    setSelectedRoute(route);

    // Fetch lại danh sách trạm hiện tại để đảm bảo dữ liệu mới nhất
    try {
      const res = await axios.get(
        `http://localhost:5000/api/routes/${route.maTuyenDuong}/stations`
      );
      const currentStations = res.data.data || [];

      // Cập nhật state
      setSelectedRouteStations((prev) => ({
        ...prev,
        [route.maTuyenDuong]: currentStations,
      }));

      // Tìm số thứ tự lớn nhất và +1
      const maxThuTu =
        currentStations.length > 0
          ? Math.max(...currentStations.map((s: Station) => s.thuTu))
          : 0;

      // Set form data với thứ tự tiếp theo
      setStationFormData({
        maDiemDung: "",
        thuTu: maxThuTu + 1,
        thoiGianDuKien: "06:30",
        loaiDiem: "Đón",
      });

      setShowStationModal(true);
    } catch (err) {
      console.error("Lỗi khi lấy trạm của tuyến:", err);
      showAlert("Lỗi khi tải danh sách trạm", "danger");
    }
  };

  // ...existing code...

  // NEW: Geocoding - Tìm kiếm địa chỉ
  // UPDATED: Geocoding - Tìm kiếm địa chỉ với địa chỉ được build
  const handleSearchAddress = async () => {
    const fullAddress = buildFullAddress();

    if (!fullAddress) {
      setGeocodeError("Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }

    setIsSearching(true);
    setGeocodeError("");
    setSearchResults([]);
    setSelectedLocation(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(fullAddress)}&` +
          `format=json&` +
          `addressdetails=1&` +
          `limit=5&` +
          `countrycodes=vn`,
        {
          headers: {
            "Accept-Language": "vi",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi tìm kiếm địa chỉ");
      }

      const data = await response.json();

      if (data.length === 0) {
        setGeocodeError(
          "Không tìm thấy tọa độ chính xác. Vui lòng thử lại với địa chỉ khác hoặc kiểm tra lại thông tin."
        );
        setSearchResults([]);
      } else {
        // TỰ ĐỘNG CHỌN KẾT QUẢ ĐẦU TIÊN
        const firstResult = data[0];
        setSelectedLocation(firstResult);
        setNewStationFormData((prev) => ({
          ...prev,
          viDo: firstResult.lat,
          kinhDo: firstResult.lon,
          fullAddress: fullAddress,
        }));
        setSearchResults(data); // Vẫn lưu để hiển thị nếu cần
        setGeocodeError("");
      }
    } catch (error) {
      console.error("Lỗi geocoding:", error);
      setGeocodeError("Lỗi khi tìm kiếm địa chỉ. Vui lòng thử lại.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // UPDATED: Mở modal tạo trạm mới
  const handleShowCreateStation = () => {
    setNewStationFormData({
      tenDiemDung: "",
      moTa: "",
      province: "",
      provinceName: "",
      district: "",
      districtName: "",
      ward: "",
      wardName: "",
      street: "",
      houseNumber: "",
      fullAddress: "",
      viDo: "",
      kinhDo: "",
      trangThai: "Active",
    });
    setDistricts([]);
    setWards([]);
    setSearchResults([]);
    setSelectedLocation(null);
    setGeocodeError("");
    setShowCreateStationModal(true);
  };

  // UPDATED: Chọn địa chỉ từ kết quả tìm kiếm
  const handleSelectLocation = (location: any) => {
    const fullAddress = buildFullAddress();
    setSelectedLocation(location);
    setNewStationFormData((prev) => ({
      ...prev,
      viDo: location.lat,
      kinhDo: location.lon,
      fullAddress: fullAddress,
    }));
    setSearchResults([]);
  };

  // UPDATED: Tạo trạm mới - ĐÃ SỬA
  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra tọa độ
    if (!newStationFormData.viDo || !newStationFormData.kinhDo) {
      setGeocodeError("Vui lòng tìm kiếm và chọn tọa độ trước khi tạo trạm");
      return;
    }

    try {
      const fullAddress = buildFullAddress();

      // Payload đúng với API endpoint
      const payload = {
        tenDiemDung: newStationFormData.tenDiemDung,
        moTa: newStationFormData.moTa || fullAddress,
        viDo: parseFloat(newStationFormData.viDo),
        kinhDo: parseFloat(newStationFormData.kinhDo),
        trangThai: newStationFormData.trangThai,
        // Thêm các trường mặc định nếu cần
        thuTu: 0, // Mặc định khi tạo trạm độc lập
        thoiGianDuKien: "00:00:00", // Mặc định
        loaiDiem: "trạm", // Mặc định
      };

      // Gọi API đúng endpoint
      await axios.post(
        "http://localhost:5000/api/routes/stations/new",
        payload
      );

      showAlert("Thêm trạm mới thành công", "success");
      await fetchAvailableStations();
      setShowCreateStationModal(false);

      // Reset form
      setNewStationFormData({
        tenDiemDung: "",
        moTa: "",
        province: "",
        provinceName: "",
        district: "",
        districtName: "",
        ward: "",
        wardName: "",
        street: "",
        houseNumber: "",
        fullAddress: "",
        viDo: "",
        kinhDo: "",
        trangThai: "Active",
      });
      setGeocodeError("");
      setSelectedLocation(null);
    } catch (err: any) {
      console.error("Lỗi khi tạo trạm:", err);
      showAlert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Lỗi khi tạo trạm mới",
        "danger"
      );
    }
  };

  // Thêm tuyến đường mới
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/routes", formData);
      showAlert("Thêm tuyến đường thành công", "success");
      fetchRoutes();
      setShowAddModal(false);
    } catch (err) {
      console.error("Lỗi khi thêm tuyến đường:", err);
      showAlert("Lỗi khi thêm tuyến đường", "danger");
    }
  };

  // Cập nhật tuyến đường
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;

    try {
      await axios.put(
        `http://localhost:5000/api/routes/${selectedRoute.maTuyenDuong}`,
        formData
      );
      showAlert("Cập nhật tuyến đường thành công", "success");
      fetchRoutes();
      setShowEditModal(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật tuyến đường:", err);
      showAlert("Lỗi khi cập nhật tuyến đường", "danger");
    }
  };

  // Xóa tuyến đường
  const handleDelete = async (routeId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tuyến đường này?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/routes/${routeId}`);
      showAlert("Xóa tuyến đường thành công", "success");
      fetchRoutes();
    } catch (err) {
      console.error("Lỗi khi xóa tuyến đường:", err);
      showAlert("Lỗi khi xóa tuyến đường", "danger");
    }
  };

  // Thêm trạm vào tuyến
  const handleAddStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;

    try {
      await axios.post(
        `http://localhost:5000/api/routes/${selectedRoute.maTuyenDuong}/stations`,
        stationFormData
      );
      showAlert("Thêm trạm vào tuyến thành công", "success");
      await fetchRouteStations(selectedRoute.maTuyenDuong);
      await fetchRoutes();
      setShowStationModal(false);
    } catch (err: any) {
      console.error("Lỗi khi thêm trạm:", err);
      showAlert(
        err.response?.data?.error || "Lỗi khi thêm trạm vào tuyến",
        "danger"
      );
    }
  };

  // Xóa trạm khỏi tuyến
  const handleRemoveStation = async (routeId: number, stationId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa trạm này khỏi tuyến?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/routes/${routeId}/stations/${stationId}`
      );
      showAlert("Xóa trạm khỏi tuyến thành công", "success");
      await fetchRouteStations(routeId);
      await fetchRoutes();
    } catch (err) {
      console.error("Lỗi khi xóa trạm:", err);
      showAlert("Lỗi khi xóa trạm khỏi tuyến", "danger");
    }
  };

  // Lọc tuyến đường
  const filteredRoutes = routes.filter((route) =>
    route.tenTuyenDuong.toLowerCase().includes(search.toLowerCase())
  );

  // Phân trang
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRoutes = filteredRoutes.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStationInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setStationFormData((prev) => ({ ...prev, [name]: value }));
  };

  // NEW: Handle input change cho form tạo trạm
  const handleNewStationInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewStationFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Get stations to display (temp or original)
  const getDisplayStations = () => {
    if (!selectedRoute) return [];
    if (isReordering) return tempStations;
    return selectedRouteStations[selectedRoute.maTuyenDuong] || [];
  };

  return (
    <>
      <Head>
        <title>Quản lý tuyến đường | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <h2 className="my-4">Quản lý tuyến đường</h2>

        {/* Alert */}
        {alert.show && (
          <div
            className="position-fixed bottom-0 end-0 p-3"
            style={{ zIndex: 2000 }}
          >
            <Alert variant={alert.type} className="shadow">
              {alert.message}
            </Alert>
          </div>
        )}

        {/* Search & Add Buttons */}
        <Row className="align-items-center mb-3">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                placeholder="Tìm kiếm tuyến đường..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Button variant="secondary" onClick={() => setSearch("")}>
                Xóa
              </Button>
            </InputGroup>
          </Col>
          <Col md={6} className="text-end">
            <Button
              variant="success"
              onClick={handleShowCreateStation}
              className="me-2"
            >
              <FaMapMarkerAlt className="me-2 d-inline" />
              Thêm trạm mới
            </Button>
            <Button variant="primary" onClick={handleShowAdd}>
              <FaPlus className="me-2 d-inline" />
              Thêm tuyến đường
            </Button>
          </Col>
        </Row>

        {/* Routes Table */}
        <div className="table-container">
          <Table striped bordered hover className="shadow-sm no-border-table">
            <thead>
              <tr style={{ border: "none" }}>
                <th className="text-center">Mã tuyến</th>
                <th className="text-center">Tên tuyến đường</th>
                <th className="text-center">Loại</th>
                <th className="text-center">Số trạm</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentRoutes.length > 0 ? (
                currentRoutes.map((route) => (
                  <tr key={route.maTuyenDuong}>
                    <td className="text-center align-middle">
                      <Badge bg="secondary">#{route.maTuyenDuong}</Badge>
                    </td>
                    <td className="align-middle">
                      <strong>{route.tenTuyenDuong}</strong>
                    </td>
                    <td className="text-center align-middle">
                      <Badge
                        bg={route.loai === "Chính" ? "primary" : "secondary"}
                      >
                        {route.loai}
                      </Badge>
                    </td>
                    <td className="text-center align-middle">
                      <Badge bg="info">{route.soTram} trạm</Badge>
                    </td>
                    <td className="text-center align-middle">
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleShowMapModal(route)}
                          title="Xem trạm trên bản đồ"
                          className="d-flex align-items-center"
                          style={{ border: "none" }}
                        >
                          <FaMapMarkedAlt size={20} />
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleShowAddStation(route)}
                          title="Thêm trạm"
                          className="d-flex align-items-center"
                          style={{ border: "none" }}
                        >
                          <FaPlus size={20} />
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleShowEdit(route)}
                          title="Sửa"
                          className="d-flex align-items-center"
                          style={{ border: "none" }}
                        >
                          <FaEdit size={20} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(route.maTuyenDuong)}
                          title="Xóa"
                          className="d-flex align-items-center"
                          style={{ border: "none" }}
                        >
                          <FaTrash size={20} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              />
              {pageNumbers.map((number) => (
                <Pagination.Item
                  key={number}
                  active={number === currentPage}
                  onClick={() => setCurrentPage(number)}
                >
                  {number}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              />
            </Pagination>
          </div>
        )}

        {/* Modal View Route on Map */}
        <Modal
          show={showMapModal}
          onHide={() => setShowMapModal(false)}
          size="xl"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-center w-100">
              <FaMapMarkedAlt className="me-2" />
              <h3>Bản đồ tuyến đường: {selectedRoute?.tenTuyenDuong}</h3>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedRoute &&
            selectedRouteStations[selectedRoute.maTuyenDuong] ? (
              <>
                {/* Bảng danh sách trạm */}
                <BootstrapCard className="mb-3">
                  <BootstrapCard.Header className="bg-light d-flex justify-content-between align-items-center">
                    <strong>
                      Danh sách trạm ({getDisplayStations().length})
                    </strong>
                    {!isReordering ? (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleStartReorder}
                        className="d-flex align-items-center"
                      >
                        <FaEdit className="me-1" />
                        Sắp xếp lại
                      </Button>
                    ) : (
                      <div className="d-flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={handleSaveOrder}
                          disabled={isSavingOrder}
                          className="d-flex align-items-center"
                        >
                          {isSavingOrder ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                className="me-1"
                              />
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <FaCheck className="me-1" />
                              Xác nhận
                            </>
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCancelReorder}
                          disabled={isSavingOrder}
                          className="d-flex align-items-center"
                        >
                          <FaTimes className="me-1" />
                          Hủy
                        </Button>
                      </div>
                    )}
                  </BootstrapCard.Header>
                  <BootstrapCard.Body
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    <Table size="sm" bordered hover>
                      <thead>
                        <tr>
                          <th className="text-center" style={{ width: "80px" }}>
                            Thứ tự
                          </th>
                          <th className="text-center">Tên trạm</th>
                          <th
                            className="text-center"
                            style={{ width: "150px" }}
                          >
                            Thời gian dự kiến
                          </th>
                          <th
                            className="text-center"
                            style={{ width: isReordering ? "120px" : "80px" }}
                          >
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getDisplayStations().map((station, index) => (
                          <tr key={station.maChiTietTuyenDuong}>
                            <td className="text-center align-middle">
                              <Badge bg="secondary">{station.thuTu}</Badge>
                            </td>
                            <td className="align-middle">
                              <strong>{station.tenDiemDung}</strong>
                              {station.moTa && (
                                <div className="small text-muted">
                                  {station.moTa}
                                </div>
                              )}
                            </td>
                            <td className="text-center align-middle">
                              <div className="d-flex align-items-center justify-content-center">
                                <FaClock className="me-1" />
                                {station.thoiGianDuKien}
                              </div>
                            </td>
                            <td className="text-center align-middle">
                              {isReordering ? (
                                <div className="d-flex gap-1 justify-content-center">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleMoveUp(index)}
                                    disabled={index === 0}
                                    title="Di chuyển lên"
                                    className="d-flex align-items-center"
                                  >
                                    <FaArrowUp />
                                  </Button>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleMoveDown(index)}
                                    disabled={index === tempStations.length - 1}
                                    title="Di chuyển xuống"
                                    className="d-flex align-items-center"
                                  >
                                    <FaArrowDown />
                                  </Button>
                                </div>
                              ) : (
                                <div className="d-flex justify-content-center">
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveStation(
                                        selectedRoute.maTuyenDuong,
                                        station.maDiemDung
                                      )
                                    }
                                    className="d-flex align-items-center"
                                    style={{ border: "none" }}
                                  >
                                    <FaTrash />
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </BootstrapCard.Body>
                </BootstrapCard>

                {/* Bản đồ - chỉ hiển thị khi không đang sắp xếp */}
                {!isReordering && (
                  <RouteMap
                    stations={selectedRouteStations[selectedRoute.maTuyenDuong]}
                    routeName={selectedRoute.tenTuyenDuong}
                  />
                )}

                {isReordering && (
                  <Alert variant="info" className="mb-0">
                    ℹ️ Đang ở chế độ sắp xếp. Sử dụng nút <FaArrowUp /> và{" "}
                    <FaArrowDown /> để thay đổi thứ tự, sau đó nhấn{" "}
                    <strong>Xác nhận</strong> để lưu.
                  </Alert>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải dữ liệu trạm...</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowMapModal(false);
                setIsReordering(false);
                setTempStations([]);
              }}
            >
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Add Route */}
        <Modal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-center w-100">
              <h3>Thêm tuyến đường mới</h3>
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAdd}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Tên tuyến đường *</Form.Label>
                <Form.Control
                  type="text"
                  name="tenTuyenDuong"
                  value={formData.tenTuyenDuong}
                  onChange={handleInputChange}
                  placeholder="Nhập tên tuyến đường"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Loại tuyến *</Form.Label>
                <Form.Select
                  name="loai"
                  value={formData.loai}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Chính">Chính</option>
                  <option value="Phụ">Phụ</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Thêm tuyến đường
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal Edit Route */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Sửa tuyến đường</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEdit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Tên tuyến đường *</Form.Label>
                <Form.Control
                  type="text"
                  name="tenTuyenDuong"
                  value={formData.tenTuyenDuong}
                  onChange={handleInputChange}
                  placeholder="Nhập tên tuyến đường"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Loại tuyến *</Form.Label>
                <Form.Select
                  name="loai"
                  value={formData.loai}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Chính">Chính</option>
                  <option value="Phụ">Phụ</option>
                </Form.Select>
              </Form.Group>

              {selectedRoute && (
                <div className="bg-light p-3 rounded">
                  <small className="text-muted">
                    <strong>Thông tin hệ thống:</strong>
                    <br />
                    Mã tuyến: {selectedRoute.maTuyenDuong}
                    <br />
                    Số trạm hiện tại: {selectedRoute.soTram}
                  </small>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Lưu thay đổi
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal Add Station to Route */}
        <Modal
          show={showStationModal}
          onHide={() => setShowStationModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <h3 className="text-center mb-4 fw-semibold">
                Thêm trạm vào tuyến {selectedRoute?.tenTuyenDuong}
              </h3>
              {/* Thêm trạm vào tuyến {selectedRoute?.tenTuyenDuong} */}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddStation}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Chọn trạm *</Form.Label>
                <Form.Select
                  name="maDiemDung"
                  value={stationFormData.maDiemDung}
                  onChange={handleStationInputChange}
                  required
                >
                  <option value="">-- Chọn trạm --</option>
                  {availableStations
                    .filter((s) => s.trangThai === "Active")
                    .map((station) => (
                      <option
                        key={station.maDiemDung}
                        value={station.maDiemDung}
                      >
                        {station.tenDiemDung}
                        {station.moTa && ` - ${station.moTa}`}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thứ tự *</Form.Label>
                    <Form.Control
                      type="number"
                      name="thuTu"
                      value={stationFormData.thuTu}
                      onChange={handleStationInputChange}
                      min="1"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thời gian dự kiến *</Form.Label>
                    <Form.Control
                      type="time"
                      name="thoiGianDuKien"
                      value={stationFormData.thoiGianDuKien}
                      onChange={handleStationInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Loại điểm *</Form.Label>
                <Form.Select
                  name="loaiDiem"
                  value={stationFormData.loaiDiem}
                  onChange={handleStationInputChange}
                  required
                >
                  <option value="Đón">Đón học sinh</option>
                  <option value="Trả">Trả học sinh</option>
                  <option value="Cả hai">Cả hai (Đón và Trả)</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowStationModal(false)}
              >
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Thêm trạm
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* NEW: Modal Create New Station with Geocoding */}
        <Modal
          show={showCreateStationModal}
          onHide={() => setShowCreateStationModal(false)}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-center w-100">
              <h3>Thêm trạm mới</h3>
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCreateStation}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Tên trạm *</Form.Label>
                <Form.Control
                  type="text"
                  name="tenDiemDung"
                  value={newStationFormData.tenDiemDung}
                  onChange={handleNewStationInputChange}
                  placeholder="Ví dụ: Trạm Lê Văn Việt"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="moTa"
                  value={newStationFormData.moTa}
                  onChange={handleNewStationInputChange}
                  placeholder="Nhập mô tả chi tiết về trạm (tùy chọn)"
                />
              </Form.Group>

              <Alert variant="info" className="mb-3">
                <strong>📍 Thông tin địa chỉ:</strong>
                <br />
                <small>
                  Vui lòng chọn đầy đủ thông tin địa chỉ để tìm tọa độ chính xác
                </small>
              </Alert>

              {/* Tỉnh/Thành phố */}
              <Form.Group className="mb-3">
                <Form.Label>Tỉnh/Thành phố *</Form.Label>
                <Form.Select
                  value={newStationFormData.province}
                  onChange={handleProvinceChange}
                  required
                >
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Quận/Huyện */}
              <Form.Group className="mb-3">
                <Form.Label>Quận/Huyện *</Form.Label>
                <Form.Select
                  value={newStationFormData.district}
                  onChange={handleDistrictChange}
                  disabled={!newStationFormData.province}
                  required
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Phường/Xã */}
              <Form.Group className="mb-3">
                <Form.Label>Phường/Xã *</Form.Label>
                <Form.Select
                  value={newStationFormData.ward}
                  onChange={handleWardChange}
                  disabled={!newStationFormData.district}
                  required
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Đường và Số nhà */}
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tên đường *</Form.Label>
                    <Form.Control
                      type="text"
                      name="street"
                      value={newStationFormData.street}
                      onChange={handleAddressFieldChange}
                      placeholder="Ví dụ: Lê Văn Việt"
                      disabled={!newStationFormData.ward}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Số nhà</Form.Label>
                    <Form.Control
                      type="text"
                      name="houseNumber"
                      value={newStationFormData.houseNumber}
                      onChange={handleAddressFieldChange}
                      placeholder="Ví dụ: 123"
                      disabled={!newStationFormData.ward}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Hiển thị địa chỉ đầy đủ */}
              {newStationFormData.street && (
                <Alert variant="secondary" className="mb-3">
                  <strong>Địa chỉ đầy đủ:</strong>
                  <br />
                  {buildFullAddress()}
                </Alert>
              )}

              {/* Nút tìm kiếm tọa độ */}
              <div className="d-grid mb-3">
                <Button
                  variant="primary"
                  onClick={handleSearchAddress}
                  disabled={
                    isSearching ||
                    !newStationFormData.province ||
                    !newStationFormData.district ||
                    !newStationFormData.ward ||
                    !newStationFormData.street
                  }
                  className="d-inline-flex align-items-center justify-content-center"
                >
                  {isSearching ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Đang tìm kiếm tọa độ...
                    </>
                  ) : (
                    <>
                      <FaSearch className="me-2" />
                      Tìm tọa độ cho địa chỉ này
                    </>
                  )}
                </Button>
              </div>

              {/* Hiển thị lỗi geocoding */}
              {geocodeError && (
                <Alert variant="warning" className="mb-3">
                  {geocodeError}
                </Alert>
              )}

              {/* UPDATED: Hiển thị tọa độ đã tự động chọn */}
              {selectedLocation && (
                <Alert variant="success" className="mb-3">
                  <strong>✓ Đã xác định vị trí:</strong>
                  <br />
                  <div className="small mt-2">
                    <strong>Địa chỉ:</strong> {selectedLocation.display_name}
                  </div>
                  <div className="small mt-1">
                    <strong>Tọa độ:</strong> Lat:{" "}
                    {parseFloat(selectedLocation.lat).toFixed(6)}, Lon:{" "}
                    {parseFloat(selectedLocation.lon).toFixed(6)}
                  </div>
                </Alert>
              )}

              {/* Tọa độ (read-only) */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vĩ độ (Latitude)</Form.Label>
                    <Form.Control
                      type="text"
                      name="viDo"
                      value={newStationFormData.viDo}
                      readOnly
                      disabled
                      placeholder="Tự động điền sau khi tìm kiếm"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Kinh độ (Longitude)</Form.Label>
                    <Form.Control
                      type="text"
                      name="kinhDo"
                      value={newStationFormData.kinhDo}
                      readOnly
                      disabled
                      placeholder="Tự động điền sau khi tìm kiếm"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Trạng thái *</Form.Label>
                <Form.Select
                  name="trangThai"
                  value={newStationFormData.trangThai}
                  onChange={handleNewStationInputChange}
                  required
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Không hoạt động</option>
                </Form.Select>
              </Form.Group>

              <Alert variant="info" className="mb-0">
                <strong>💡 Hướng dẫn:</strong>
                <ol className="mb-0 mt-2">
                  <li>Nhập tên trạm</li>
                  <li>Chọn Tỉnh/Thành phố → Quận/Huyện → Phường/Xã</li>
                  <li>Nhập tên đường và số nhà (nếu có)</li>
                  <li>
                    Nhấn "Tìm tọa độ" - hệ thống sẽ tự động chọn vị trí chính
                    xác nhất
                  </li>
                  <li>Kiểm tra thông tin và nhấn "Tạo trạm"</li>
                </ol>
              </Alert>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowCreateStationModal(false)}
              >
                Hủy
              </Button>
              <Button
                variant="success"
                type="submit"
                disabled={!selectedLocation}
                className="d-inline-flex align-items-center"
              >
                <FaPlus className="me-1" />
                Tạo trạm
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>

      {/* ...existing styles... */}
    </>
  );
};

export default RoutesPage;
