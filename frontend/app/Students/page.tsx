"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  Alert,
  Pagination,
  Badge,
} from "react-bootstrap";
import Head from "next/head";
import {
  FaEdit,
  FaTrash,
  FaLock,
  FaUnlock,
  FaUser,
  FaMapMarkedAlt,
  FaBus, // THÊM
  FaSun, // THÊM
  FaMoon, // THÊM
  FaList, // THÊM
  FaCheck, // THÊM
  FaCheckCircle, // THÊM
  FaExclamationTriangle, // THÊM
  FaTimes,
} from "react-icons/fa";
import axios from "axios";

// Dynamic import để tránh lỗi SSR với Leaflet
const StationMap = dynamic(() => import("../../components/StationMap"), {
  ssr: false,
  loading: () => (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "450px" }}
    >
      <div className="text-center">
        <div className="spinner-border text-primary mb-2" role="status"></div>
        <div>Đang tải bản đồ...</div>
      </div>
    </div>
  ),
});

interface Student {
  maHocSinh: number;
  tenHocSinh: string;
  anhHocSinh: string;
  lop: string;
  trangThai: string;
  maDiaChi?: number;
  diaChi?: {
    soNha: string;
    duong: string;
    phuongXa: string;
    quanHuyen: string;
    thanhPho: string;
    viDo: number;
    kinhDo: number;
  };
}

interface StudentStation {
  maPhanBoHocSinhTram: number;
  maHocSinh: number;
  maDiemDung: number;
  loaiPhanBo: "Sang" | "Chieu";
  thoiGianBatDau: string;
  thoiGianKetThuc: string | null;
  trangThai: string;
  tenDiemDung: string;
  moTaDiemDung: string;
  viDo: number;
  kinhDo: number;
}

interface StudentStationData {
  sang: StudentStation[];
  chieu: StudentStation[];
  all: StudentStation[];
}

interface FormData {
  tenHocSinh: string;
  lop: string;
  anhHocSinh: File | string;
  anhPreview: string;
  soNha: string;
  duong: string;
  phuongXa: string;
  quanHuyen: string;
  thanhPho: string;
}

interface AddressData {
  provinces: any[];
  districts: any[];
  wards: any[];
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  // THÊM STATE CHO STATION INFO
  const [studentStations, setStudentStations] =
    useState<StudentStationData | null>(null);
  const [loadingStations, setLoadingStations] = useState(false);
  // THÊM STATE cho loại phân bổ
  const [selectedAssignType, setSelectedAssignType] = useState<
    "Sang" | "Chieu"
  >("Sang");
  const itemsPerPage = 5;

  // Form state
  const [formData, setFormData] = useState<FormData>({
    tenHocSinh: "",
    lop: "",
    anhHocSinh: "",
    anhPreview: "",
    soNha: "",
    duong: "",
    phuongXa: "",
    quanHuyen: "",
    thanhPho: "",
  });

  // Address data state
  const [addressData, setAddressData] = useState<AddressData>({
    provinces: [],
    districts: [],
    wards: [],
  });

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // THÊM STATE CHO MAP MODAL
  const [showMapModal, setShowMapModal] = useState(false);
  const [allStations, setAllStations] = useState<any[]>([]);
  const [selectedStationForStudent, setSelectedStationForStudent] =
    useState<any>(null);
  const [currentStudentForStation, setCurrentStudentForStation] =
    useState<Student | null>(null);

  // THÊM FUNCTION fetchAllStations
  const fetchAllStations = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/routes/stations/all"
      );
      setAllStations(res.data);
      console.log("✅ Fetched all stations:", res.data.length);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách trạm:", error);
      showAlert("Lỗi khi tải danh sách trạm", "danger");
    }
  };

  // FUNCTION FETCH THÔNG TIN TRẠM CỦA HỌC SINH
  const fetchStudentStations = async (studentId: number) => {
    setLoadingStations(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/students/${studentId}/stations`
      );

      if (response.data.success) {
        setStudentStations(response.data.data);
      } else {
        console.error("Lỗi khi lấy thông tin trạm:", response.data.error);
        setStudentStations(null);
      }
    } catch (error) {
      console.error("Lỗi khi fetch station data:", error);
      setStudentStations(null);
      showAlert("Lỗi khi tải thông tin trạm", "danger");
    } finally {
      setLoadingStations(false);
    }
  };

  // FUNCTION RENDER STATION INFO
  // SỬA phần hiển thị thông tin trạm đã gán - THÊM màu sắc phân biệt
  const renderStationInfo = (
    stations: StudentStation[],
    type: "Sang" | "Chieu"
  ) => {
    if (!stations || stations.length === 0) {
      return (
        <div className="text-muted text-center py-3">
          <small>
            Chưa có trạm {type === "Sang" ? "đón (sáng)" : "trả (chiều)"}
          </small>
        </div>
      );
    }

    return stations.map((station) => (
      <div
        key={station.maPhanBoHocSinhTram}
        className={`border rounded p-2 mb-2 ${
          type === "Sang"
            ? "border-warning bg-warning bg-opacity-10"
            : "border-info bg-info bg-opacity-10"
        }`}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <strong className={type === "Sang" ? "text-warning" : "text-info"}>
              {station.tenDiemDung}
            </strong>
            {station.moTaDiemDung && (
              <div className="small text-muted">{station.moTaDiemDung}</div>
            )}
            <div className="small">
              <strong>Tọa độ:</strong> {Number(station.viDo).toFixed(6)},{" "}
              {Number(station.kinhDo).toFixed(6)}
            </div>
            {station.thoiGianBatDau && (
              <div className="small">
                <strong>Từ ngày:</strong>{" "}
                {new Date(station.thoiGianBatDau).toLocaleDateString("vi-VN")}
              </div>
            )}
            {station.thoiGianKetThuc && (
              <div className="small">
                <strong>Đến ngày:</strong>{" "}
                {new Date(station.thoiGianKetThuc).toLocaleDateString("vi-VN")}
              </div>
            )}
          </div>
          <Badge bg={type === "Sang" ? "warning" : "info"}>
            {type === "Sang" ? "🌅 Đón sáng" : "🌆 Trả chiều"}
          </Badge>
        </div>
      </div>
    ));
  };

  // FUNCTION TÍNH KHOẢNG CÁCH GIỮA 2 ĐIỂM
  // SỬA FUNCTION calculateDistance - Tính khoảng cách chính xác
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    // Kiểm tra tọa độ hợp lệ
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return null;
    }

    const R = 6371; // Bán kính Trái Đất (km)

    // Chuyển đổi độ sang radian
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);

    // Công thức Haversine
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Khoảng cách tính bằng km

    return distance;
  };

  // FUNCTION TÌM TRẠM GẦN NHẤT
  const findNearestStation = (studentAddress: any, stations: any[]) => {
    if (
      !studentAddress ||
      !studentAddress.viDo ||
      !studentAddress.kinhDo ||
      stations.length === 0
    ) {
      return null;
    }

    let nearestStation = null;
    let minDistance = Infinity;

    stations.forEach((station) => {
      if (station.viDo && station.kinhDo) {
        const distance = calculateDistance(
          parseFloat(studentAddress.viDo),
          parseFloat(studentAddress.kinhDo),
          parseFloat(station.viDo),
          parseFloat(station.kinhDo)
        );

        if (distance !== null && distance < minDistance) {
          minDistance = distance;
          nearestStation = { ...station, distance };
        }
      }
    });

    return nearestStation;
  };

  // FUNCTION MỞ MAP MODAL
  // SỬA FUNCTION handleShowMapModal - RESET selectedAssignType
  const handleShowMapModal = async (student: Student) => {
    setCurrentStudentForStation(student);
    setSelectedAssignType("Sang"); // ✅ RESET VỀ MẶC ĐỊNH

    // Fetch thông tin trạm của học sinh này
    await fetchStudentStations(student.maHocSinh);

    // Fetch all stations nếu chưa có
    if (allStations.length === 0) {
      await fetchAllStations();
    }

    // Tìm trạm gần nhất (nếu chưa có trạm được phân bổ)
    if (student.diaChi && allStations.length > 0) {
      const nearestStation = findNearestStation(student.diaChi, allStations);
      setSelectedStationForStudent(nearestStation);
    }

    setShowMapModal(true);
  };

  // FUNCTION CHỌN TRẠM
  const handleSelectStation = (station: any) => {
    setSelectedStationForStudent(station);
  };

  // FUNCTION LƯU TRẠM CHO HỌC SINH
  // SỬA FUNCTION handleSaveStationForStudent - Sử dụng selectedAssignType
  const handleSaveStationForStudent = async () => {
    if (!currentStudentForStation || !selectedStationForStudent) {
      showAlert("Vui lòng chọn học sinh và trạm", "warning");
      return;
    }

    try {
      console.log("📤 Sending assign station request:", {
        maHocSinh: currentStudentForStation.maHocSinh,
        maDiemDung: selectedStationForStudent.maDiemDung,
        loaiPhanBo: selectedAssignType, // ✅ SỬ DỤNG STATE selectedAssignType
      });

      const response = await axios.post(
        "http://localhost:5000/api/students/assign-station",
        {
          maHocSinh: currentStudentForStation.maHocSinh,
          maDiemDung: selectedStationForStudent.maDiemDung,
          loaiPhanBo: selectedAssignType, // ✅ SỬ DỤNG STATE selectedAssignType
        }
      );

      console.log("✅ Assign response:", response.data);

      if (response.data.success) {
        const typeText =
          selectedAssignType === "Sang" ? "đón sáng" : "trả chiều";
        showAlert(
          `Gán trạm "${selectedStationForStudent.tenDiemDung}" ${typeText} cho học sinh "${currentStudentForStation.tenHocSinh}" thành công!`,
          "success"
        );

        // Refresh station data
        await fetchStudentStations(currentStudentForStation.maHocSinh);

        // Reset selection
        setSelectedStationForStudent(null);
        setSelectedAssignType("Sang"); // ✅ RESET VỀ MẶC ĐỊNH
      } else {
        showAlert(response.data.message || "Có lỗi xảy ra", "danger");
      }
    } catch (error: any) {
      console.error("❌ Assign station error:", error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi gán trạm cho học sinh";

      showAlert(errorMessage, "danger");
    }
  };

  // Lấy dữ liệu từ backend
  // SỬA PHẦN DEBUG trong fetchStudents
  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      console.log("📊 API Response:", res.data);

      // ✅ THÊM DEBUG CHI TIẾT
      res.data.forEach(
        (
          student: {
            maHocSinh: any;
            tenHocSinh: any;
            maDiaChi: any;
            diaChi: { viDo: any; kinhDo: any };
          },
          index: number
        ) => {
          console.log(`🔍 Student ${index + 1}:`, {
            maHocSinh: student.maHocSinh,
            tenHocSinh: student.tenHocSinh,
            maDiaChi: student.maDiaChi,
            diaChi: student.diaChi,
            hasCoordinates: !!(student.diaChi?.viDo && student.diaChi?.kinhDo),
          });
        }
      );

      setStudents(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách học sinh:", error);
      showAlert("Lỗi khi tải dữ liệu", "danger");
    }
  };

  // Lấy danh sách tỉnh/thành phố
  const fetchProvinces = async () => {
    try {
      const res = await axios.get("https://provinces.open-api.vn/api/p/");
      setAddressData((prev) => ({ ...prev, provinces: res.data }));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tỉnh/thành:", error);
    }
  };

  // Lấy danh sách quận/huyện
  const fetchDistricts = async (provinceCode: string) => {
    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      setAddressData((prev) => ({
        ...prev,
        districts: res.data.districts || [],
        wards: [], // Reset phường/xã khi chọn tỉnh mới
      }));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quận/huyện:", error);
    }
  };

  // Lấy danh sách phường/xã
  const fetchWards = async (districtCode: string) => {
    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      setAddressData((prev) => ({ ...prev, wards: res.data.wards || [] }));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phường/xã:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchProvinces();
  }, []);

  // Xử lý khi chọn tỉnh/thành phố
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedDistrict("");
    setSelectedWard("");
    setFormData((prev) => ({
      ...prev,
      quanHuyen: "",
      phuongXa: "",
      thanhPho: e.target.options[e.target.selectedIndex].text,
    }));

    if (provinceCode) {
      fetchDistricts(provinceCode);
    }
  };

  // Xử lý khi chọn quận/huyện
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    setSelectedWard("");
    setFormData((prev) => ({
      ...prev,
      phuongXa: "",
      quanHuyen: e.target.options[e.target.selectedIndex].text,
    }));

    if (districtCode) {
      fetchWards(districtCode);
    }
  };

  // Xử lý khi chọn phường/xã
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWard(e.target.value);
    setFormData((prev) => ({
      ...prev,
      phuongXa: e.target.options[e.target.selectedIndex].text,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xóa học sinh
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa học sinh này?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      setStudents(students.filter((student) => student.maHocSinh !== id));
      showAlert("Xóa học sinh thành công", "success");
    } catch (error) {
      console.error("Lỗi khi xóa học sinh:", error);
      showAlert("Lỗi khi xóa học sinh", "danger");
    }
  };

  // Mở modal thêm
  const handleShowAddModal = () => {
    setFormData({
      tenHocSinh: "",
      lop: "",
      anhHocSinh: "",
      anhPreview: "",
      soNha: "",
      duong: "",
      phuongXa: "",
      quanHuyen: "",
      thanhPho: "",
    });
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setShowAddModal(true);
  };

  // Thêm hàm helper để tìm code từ tên (đặt trước handleShowEditModal)
  const findProvinceCode = (name: string) => {
    const province = addressData.provinces.find((p) => p.name === name);
    return province?.code || "";
  };

  const findDistrictCode = async (
    provinceName: string,
    districtName: string
  ) => {
    const provinceCode = findProvinceCode(provinceName);
    if (!provinceCode) return "";

    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const district = res.data.districts?.find(
        (d: any) => d.name === districtName
      );
      return district?.code || "";
    } catch (error) {
      console.error("Lỗi khi tìm quận/huyện:", error);
      return "";
    }
  };

  const findWardCode = async (
    districtName: string,
    wardName: string,
    provinceCode: string
  ) => {
    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const district = res.data.districts?.find(
        (d: any) => d.name === districtName
      );
      if (!district) return "";

      const resWards = await axios.get(
        `https://provinces.open-api.vn/api/d/${district.code}?depth=2`
      );
      const ward = resWards.data.wards?.find((w: any) => w.name === wardName);
      return ward?.code || "";
    } catch (error) {
      console.error("Lỗi khi tìm phường/xã:", error);
      return "";
    }
  };

  // Mở modal sửa
  const handleShowEditModal = async (student: Student) => {
    setSelectedStudent(student);

    const diaChi = student.diaChi || {
      soNha: "",
      duong: "",
      phuongXa: "",
      quanHuyen: "",
      thanhPho: "",
    };

    setFormData({
      tenHocSinh: student.tenHocSinh,
      lop: student.lop,
      anhHocSinh: student.anhHocSinh,
      anhPreview: student.anhHocSinh || "",
      soNha: diaChi.soNha || "",
      duong: diaChi.duong || "",
      phuongXa: diaChi.phuongXa || "",
      quanHuyen: diaChi.quanHuyen || "",
      thanhPho: diaChi.thanhPho || "",
    });

    // Reset trước khi load
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");

    if (!diaChi.thanhPho) {
      setShowEditModal(true);
      return;
    }

    try {
      // Bước 1: Tìm province code
      const provinceCode = findProvinceCode(diaChi.thanhPho);
      if (!provinceCode) {
        console.warn("Không tìm thấy province code cho:", diaChi.thanhPho);
        setShowEditModal(true);
        return;
      }

      // Set province ngay
      setSelectedProvince(provinceCode);

      // Bước 2: Load districts và đợi hoàn thành
      await fetchDistricts(provinceCode);

      if (!diaChi.quanHuyen) {
        setShowEditModal(true);
        return;
      }

      // Bước 3: Tìm district code (sau khi districts đã load)
      const districtCode = await findDistrictCode(
        diaChi.thanhPho,
        diaChi.quanHuyen
      );
      if (!districtCode) {
        console.warn("Không tìm thấy district code cho:", diaChi.quanHuyen);
        setShowEditModal(true);
        return;
      }

      // Set district
      setSelectedDistrict(districtCode);

      // Bước 4: Load wards và đợi hoàn thành
      await fetchWards(districtCode);

      if (!diaChi.phuongXa) {
        setShowEditModal(true);
        return;
      }

      // Bước 5: Tìm ward code (sau khi wards đã load)
      const wardCode = await findWardCode(
        diaChi.quanHuyen,
        diaChi.phuongXa,
        provinceCode
      );
      if (!wardCode) {
        console.warn("Không tìm thấy ward code cho:", diaChi.phuongXa);
      } else {
        setSelectedWard(wardCode);
      }
    } catch (error) {
      console.error("Lỗi khi load địa chỉ:", error);
    }

    setShowEditModal(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedStudent(null);
    // Clean up URL object khi đóng modal
    if (formData.anhPreview && formData.anhPreview.startsWith("blob:")) {
      URL.revokeObjectURL(formData.anhPreview);
    }
  };

  // Validation form
  const validateForm = () => {
    if (!formData.tenHocSinh.trim()) {
      showAlert("Vui lòng nhập tên học sinh", "warning");
      return false;
    }

    if (!formData.lop.trim()) {
      showAlert("Vui lòng nhập lớp", "warning");
      return false;
    }

    if (showAddModal && !formData.anhHocSinh) {
      showAlert("Vui lòng chọn ảnh học sinh", "warning");
      return false;
    }

    return true;
  };

  // Hàm xử lý khi chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert("Kích thước ảnh không được vượt quá 5MB", "warning");
        return;
      }

      // Clean up previous URL object
      if (formData.anhPreview && formData.anhPreview.startsWith("blob:")) {
        URL.revokeObjectURL(formData.anhPreview);
      }

      // Tạo URL để preview
      const imageUrl = URL.createObjectURL(file);

      // Cập nhật state
      setFormData((prev) => ({
        ...prev,
        anhHocSinh: file,
        anhPreview: imageUrl,
      }));
    }
  };

  // Hàm xóa ảnh đã chọn
  const handleRemoveImage = () => {
    // Clean up URL object
    if (formData.anhPreview && formData.anhPreview.startsWith("blob:")) {
      URL.revokeObjectURL(formData.anhPreview);
    }

    setFormData((prev) => ({
      ...prev,
      anhHocSinh: "",
      anhPreview: "",
    }));

    // Reset input file
    const fileInput = document.querySelector(
      'input[name="anhHocSinh"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Thêm học sinh (sử dụng FormData để upload file)
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("tenHocSinh", formData.tenHocSinh);
      formDataToSend.append("lop", formData.lop);
      formDataToSend.append("soNha", formData.soNha);
      formDataToSend.append("duong", formData.duong);
      formDataToSend.append("phuongXa", formData.phuongXa);
      formDataToSend.append("quanHuyen", formData.quanHuyen);
      formDataToSend.append("thanhPho", formData.thanhPho);

      if (formData.anhHocSinh instanceof File) {
        formDataToSend.append("anhHocSinh", formData.anhHocSinh);
      }
      formDataToSend.append("trangThai", "Active");

      await axios.post("http://localhost:5000/api/students", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      fetchStudents();
      handleCloseModal();
      showAlert("Thêm học sinh thành công", "success");
    } catch (error: any) {
      console.error("❌ Lỗi chi tiết:", error);
      console.error("📊 Error response:", error.response?.data);
      showAlert(
        error.response?.data?.message || "Lỗi khi thêm học sinh",
        "danger"
      );
    }
  };

  // Sửa học sinh
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !selectedStudent) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("tenHocSinh", formData.tenHocSinh);
      formDataToSend.append("lop", formData.lop);
      formDataToSend.append("soNha", formData.soNha);
      formDataToSend.append("duong", formData.duong);
      formDataToSend.append("phuongXa", formData.phuongXa);
      formDataToSend.append("quanHuyen", formData.quanHuyen);
      formDataToSend.append("thanhPho", formData.thanhPho);

      // QUAN TRỌNG: Chỉ append file nếu có file mới
      if (formData.anhHocSinh instanceof File) {
        formDataToSend.append("anhHocSinh", formData.anhHocSinh);
      }

      formDataToSend.append("trangThai", selectedStudent.trangThai);

      // DEBUG: Kiểm tra tất cả dữ liệu trong FormData
      console.log("📤 DEBUG FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.put(
        `http://localhost:5000/api/students/${selectedStudent.maHocSinh}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Response:", response.data);

      fetchStudents();
      handleCloseModal();
      showAlert("Cập nhật học sinh thành công", "success");
    } catch (error: any) {
      console.error("❌ Lỗi chi tiết khi cập nhật:", error);
      console.error("📊 Error response:", error.response?.data);
      console.error("🔧 Error config:", error.config);

      showAlert(
        error.response?.data?.message || "Lỗi khi cập nhật học sinh",
        "danger"
      );
    }
  };

  const handleBlock = async (id: number) => {
    if (!confirm("Bạn có chắc muốn khóa học sinh này?")) return;
    try {
      await axios.patch(`http://localhost:5000/api/students/${id}/block`);
      fetchStudents();
      showAlert("Khóa học sinh thành công", "success");
    } catch (error) {
      console.error("Lỗi khi khóa học sinh:", error);
      showAlert("Lỗi khi khóa học sinh", "danger");
    }
  };

  const handleUnblock = async (id: number) => {
    if (!confirm("Bạn có chắc muốn mở khóa học sinh này?")) return;
    try {
      await axios.patch(`http://localhost:5000/api/students/${id}/unblock`);
      fetchStudents();
      showAlert("Mở khóa học sinh thành công", "success");
    } catch (error) {
      console.error("Lỗi khi mở khóa học sinh:", error);
      showAlert("Lỗi khi mở khóa học sinh", "danger");
    }
  };

  // Hiển thị alert
  const showAlert = (message: string, type: string) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Lọc học sinh theo search
  const filteredStudents = students.filter(
    (u) =>
      u.tenHocSinh && u.tenHocSinh.toLowerCase().includes(search.toLowerCase())
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = filteredStudents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Tạo mảng số trang cho Pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Xử lý chuyển trang
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Hàm hiển thị địa chỉ đầy đủ
  const renderFullAddress = (student: Student) => {
    if (!student.diaChi) return "Chưa có địa chỉ";

    const { soNha, duong, phuongXa, quanHuyen, thanhPho } = student.diaChi;
    const parts = [soNha, duong, phuongXa, quanHuyen, thanhPho].filter(Boolean);
    return parts.join(", ") || "Chưa có địa chỉ";
  };

  return (
    <>
      <Head>
        <title>Quản lý học sinh | Admin Bus Tracking</title>
      </Head>
      <Container fluid>
        <h2 className="my-4">Quản lý học sinh</h2>
        {/* Alert */}
        {alert.show && (
          <Alert variant={alert.type} className="mb-3">
            {alert.message}
          </Alert>
        )}
        {/* Thanh tìm kiếm và nút thêm - nằm ngang hàng */}
        <Row className="align-items-center mb-3">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                placeholder="Tìm kiếm theo tên học sinh..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
              <Button variant="secondary" onClick={() => setSearch("")}>
                Xóa
              </Button>
            </InputGroup>
          </Col>
          <Col md={6} className="text-end">
            <Button variant="primary" onClick={handleShowAddModal}>
              Thêm học sinh mới
            </Button>
          </Col>
        </Row>
        <div className="table-container">
          <Table
            striped
            bordered
            hover
            className="shadow-sm text-center no-border-table"
            style={{ verticalAlign: "middle", textAlign: "center" }}
          >
            <thead>
              <tr style={{ border: "none" }}>
                <th>Mã học sinh</th>
                <th>Tên học sinh</th>
                <th>Ảnh học sinh</th>
                <th>Lớp học</th>
                <th>Địa chỉ</th>
                {/* <th>Trạng thái</th> */}
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <tr key={student.maHocSinh}>
                    <td>
                      <Badge bg="secondary">#{student.maHocSinh}</Badge>
                    </td>
                    <td>{student.tenHocSinh}</td>
                    <td align="center">
                      {student.anhHocSinh ? (
                        <img
                          src={`http://localhost:5000${student.anhHocSinh}`}
                          alt={student.tenHocSinh}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            whiteSpace: "nowrap",
                          }}
                          className="rounded"
                        />
                      ) : (
                        <FaUser size={20} className="text-muted" />
                      )}
                    </td>
                    <td>{student.lop}</td>
                    <td style={{ maxWidth: "200px" }}>
                      <small>{renderFullAddress(student)}</small>
                    </td>
                    {/* <td>
                      <span
                        className={`badge ${
                          student.trangThai === "Active"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {student.trangThai}
                      </span>
                    </td> */}
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        title="Xem trạm trên bản đồ"
                        className="me-2 mb-1"
                        onClick={() => handleShowMapModal(student)}
                        style={{ border: "none" }}
                      >
                        <FaMapMarkedAlt size={20} />
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2 mb-1"
                        style={{ border: "none" }}
                        onClick={() => handleShowEditModal(student)}
                        title="Sửa"
                      >
                        <FaEdit size={20} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="me-2 mb-1"
                        style={{ border: "none" }}
                        onClick={() => handleDelete(student.maHocSinh)}
                        title="Xóa"
                      >
                        <FaTrash size={20} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              />

              {pageNumbers.map((number) => (
                <Pagination.Item
                  key={number}
                  active={number === currentPage}
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </Pagination.Item>
              ))}

              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </Pagination>
          </div>
        )}
        {/* Modal Thêm học sinh */}
        <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Thêm học sinh mới</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAdd}>
            <Modal.Body>
              <Row>
                {/* Cột thông tin học sinh */}
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tên học sinh *</Form.Label>
                    <Form.Control
                      type="text"
                      name="tenHocSinh"
                      value={formData.tenHocSinh}
                      onChange={handleInputChange}
                      placeholder="Nhập tên học sinh"
                      required
                    />
                    <Form.Text className="text-muted">
                      Ví dụ: Trần Văn A
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Lớp *</Form.Label>
                    <Form.Control
                      type="text"
                      name="lop"
                      value={formData.lop}
                      onChange={handleInputChange}
                      placeholder="Nhập tên lớp"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Ảnh học sinh *</Form.Label>
                    <Form.Control
                      type="file"
                      name="anhHocSinh"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      Chọn ảnh có định dạng JPG, PNG (tối đa 5MB)
                    </Form.Text>
                  </Form.Group>

                  {/* Phần địa chỉ */}
                  <h6 className="mt-4 mb-3">Thông tin địa chỉ</h6>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Số nhà</Form.Label>
                        <Form.Control
                          type="text"
                          name="soNha"
                          value={formData.soNha}
                          onChange={handleInputChange}
                          placeholder="Số nhà"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Đường</Form.Label>
                        <Form.Control
                          type="text"
                          name="duong"
                          value={formData.duong}
                          onChange={handleInputChange}
                          placeholder="Tên đường"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tỉnh/Thành phố *</Form.Label>
                        <Form.Select
                          value={selectedProvince}
                          onChange={handleProvinceChange}
                          required
                        >
                          <option value="">Chọn tỉnh/thành phố</option>
                          {addressData.provinces.map((province) => (
                            <option key={province.code} value={province.code}>
                              {province.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Quận/Huyện *</Form.Label>
                        <Form.Select
                          value={selectedDistrict}
                          onChange={handleDistrictChange}
                          required
                          disabled={!selectedProvince}
                        >
                          <option value="">Chọn quận/huyện</option>
                          {addressData.districts.map((district) => (
                            <option key={district.code} value={district.code}>
                              {district.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phường/Xã *</Form.Label>
                        <Form.Select
                          value={selectedWard}
                          onChange={handleWardChange}
                          required
                          disabled={!selectedDistrict}
                        >
                          <option value="">Chọn phường/xã</option>
                          {addressData.wards.map((ward) => (
                            <option key={ward.code} value={ward.code}>
                              {ward.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>

                {/* Cột preview ảnh */}
                <Col md={4}>
                  <div className="text-center">
                    <Form.Label>Preview Ảnh</Form.Label>
                    <div
                      className="border rounded p-3 mb-3 d-flex align-items-center justify-content-center"
                      style={{ height: "200px", backgroundColor: "#f8f9fa" }}
                    >
                      {formData.anhPreview ? (
                        <img
                          src={formData.anhPreview}
                          alt="Preview"
                          style={{ maxHeight: "180px", objectFit: "contain" }}
                        />
                      ) : (
                        <div className="text-muted text-center">
                          <div className="d-flex justify-content-center">
                            <FaUser size={40} className="mb-2" />
                          </div>
                          <div>Chưa có ảnh</div>
                        </div>
                      )}
                    </div>
                    {formData.anhPreview && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="d-flex align-items-center justify-content-center mx-auto"
                        onClick={handleRemoveImage}
                      >
                        <FaTrash className="me-1" />
                        Xóa ảnh
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Thêm học sinh
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        {/* Modal Sửa học sinh */}
        <Modal show={showEditModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Sửa thông tin học sinh</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEdit}>
            <Modal.Body>
              <Row>
                {/* Cột thông tin học sinh */}
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tên học sinh *</Form.Label>
                    <Form.Control
                      type="text"
                      name="tenHocSinh"
                      value={formData.tenHocSinh}
                      onChange={handleInputChange}
                      placeholder="Nhập tên học sinh"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Lớp *</Form.Label>
                    <Form.Control
                      type="text"
                      name="lop"
                      value={formData.lop}
                      onChange={handleInputChange}
                      placeholder="Nhập tên lớp"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Ảnh học sinh</Form.Label>
                    <Form.Control
                      type="file"
                      name="anhHocSinh"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <Form.Text className="text-muted">
                      Chọn ảnh có định dạng JPG, PNG (tối đa 5MB)
                    </Form.Text>
                  </Form.Group>

                  {/* Phần địa chỉ */}
                  <h6 className="mt-4 mb-3">Thông tin địa chỉ</h6>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Số nhà</Form.Label>
                        <Form.Control
                          type="text"
                          name="soNha"
                          value={formData.soNha}
                          onChange={handleInputChange}
                          placeholder="Số nhà"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Đường</Form.Label>
                        <Form.Control
                          type="text"
                          name="duong"
                          value={formData.duong}
                          onChange={handleInputChange}
                          placeholder="Tên đường"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tỉnh/Thành phố *</Form.Label>
                        <Form.Select
                          value={selectedProvince}
                          onChange={handleProvinceChange}
                          required
                        >
                          <option value="">Chọn tỉnh/thành phố</option>
                          {addressData.provinces.map((province) => (
                            <option key={province.code} value={province.code}>
                              {province.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Quận/Huyện *</Form.Label>
                        <Form.Select
                          value={selectedDistrict}
                          onChange={handleDistrictChange}
                          required
                          disabled={!selectedProvince}
                        >
                          <option value="">Chọn quận/huyện</option>
                          {addressData.districts.map((district) => (
                            <option key={district.code} value={district.code}>
                              {district.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phường/Xã *</Form.Label>
                        <Form.Select
                          value={selectedWard}
                          onChange={handleWardChange}
                          required
                          disabled={!selectedDistrict}
                        >
                          <option value="">Chọn phường/xã</option>
                          {addressData.wards.map((ward) => (
                            <option key={ward.code} value={ward.code}>
                              {ward.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>

                {/* Cột preview ảnh */}
                <Col md={4}>
                  <div className="text-center">
                    <Form.Label>Preview Ảnh</Form.Label>
                    <div
                      className="border rounded p-3 mb-3 d-flex align-items-center justify-content-center"
                      style={{ height: "200px", backgroundColor: "#f8f9fa" }}
                    >
                      {formData.anhPreview ? (
                        <img
                          src={formData.anhPreview}
                          alt="Preview"
                          className="img-fluid rounded"
                          style={{ maxHeight: "180px", objectFit: "contain" }}
                        />
                      ) : (
                        <div className="text-muted text-center">
                          <div className="d-flex justify-content-center">
                            <FaUser size={40} className="mb-2" />
                          </div>
                          <div>Chưa có ảnh</div>
                        </div>
                      )}
                    </div>
                    {formData.anhPreview && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="d-flex align-items-center justify-content-center mx-auto"
                        onClick={handleRemoveImage}
                      >
                        <FaTrash className="me-1" />
                        Xóa ảnh
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>

              {selectedStudent && (
                <div className="bg-light p-3 rounded">
                  <small className="text-muted">
                    <strong>Thông tin hệ thống:</strong>
                    <br />
                    Mã học sinh: {selectedStudent.maHocSinh}
                    <br />
                    Trạng thái: {selectedStudent.trangThai}
                  </small>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Cập nhật
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        {/* // SỬA PHẦN MODAL - THAY THẾ DIV MAP BẰNG STATIONMAP */}
        <Modal
          show={showMapModal}
          onHide={() => {
            setShowMapModal(false);
            setStudentStations(null);
          }}
          size="xl"
          centered
          backdrop="static"
        >
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title className="d-inline-flex align-items-center">
              <FaMapMarkedAlt className="me-2" />
              Quản lý trạm cho học sinh
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "85vh", overflowY: "auto" }}>
            {/* Header thông tin học sinh */}
            {currentStudentForStation && (
              <div className="alert alert-info mb-4">
                <Row>
                  <Col md={6}>
                    <strong>👨‍🎓 Học sinh:</strong>{" "}
                    {currentStudentForStation.tenHocSinh}
                    <br />
                    <strong>📚 Lớp:</strong> {currentStudentForStation.lop}
                  </Col>
                  <Col md={6}>
                    <strong>📍 Địa chỉ:</strong>{" "}
                    {renderFullAddress(currentStudentForStation)}
                    <br />
                    <strong>📍 Tọa độ:</strong>{" "}
                    {currentStudentForStation.diaChi?.viDo &&
                    currentStudentForStation.diaChi?.kinhDo
                      ? `${Number(currentStudentForStation.diaChi.viDo).toFixed(
                          6
                        )}, ${Number(
                          currentStudentForStation.diaChi.kinhDo
                        ).toFixed(6)}`
                      : "Chưa có tọa độ"}
                  </Col>
                </Row>
              </div>
            )}

            <Row className="g-4">
              {/* Cột bản đồ - Rộng hơn */}
              <Col lg={7}>
                <div className="card h-100">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 d-inline-flex align-items-center">
                      <FaMapMarkedAlt className="me-2" />
                      Bản đồ tuyến đường
                    </h6>
                  </div>
                  <div className="card-body p-3">
                    {/* ✅ THAY THẾ DIV CŨ BẰNG STATIONMAP */}
                    {currentStudentForStation && (
                      <StationMap
                        student={{
                          maHocSinh: currentStudentForStation.maHocSinh,
                          tenHocSinh: currentStudentForStation.tenHocSinh,
                          lop: currentStudentForStation.lop,
                          viDo: currentStudentForStation.diaChi?.viDo,
                          kinhDo: currentStudentForStation.diaChi?.kinhDo,
                          soNha: currentStudentForStation.diaChi?.soNha,
                          duong: currentStudentForStation.diaChi?.duong,
                          phuongXa: currentStudentForStation.diaChi?.phuongXa,
                          quanHuyen: currentStudentForStation.diaChi?.quanHuyen,
                          thanhPho: currentStudentForStation.diaChi?.thanhPho,
                        }}
                        allStations={allStations}
                        selectedStation={selectedStationForStudent}
                        assignedStations={studentStations?.all || []}
                        onStationClick={(station) => {
                          setSelectedStationForStudent(station);
                          console.log("🎯 Station selected from map:", station);
                        }}
                      />
                    )}
                  </div>
                </div>
              </Col>

              {/* Cột thông tin trạm - Hẹp hơn nhưng có scroll */}
              <Col lg={5}>
                <div className="card h-100">
                  <div className="card-header bg-success text-white">
                    <h6 className="mb-0 d-inline-flex align-items-center">
                      <FaBus className="me-2" />
                      Thông tin trạm xe buýt
                    </h6>
                  </div>
                  <div
                    className="card-body"
                    style={{ maxHeight: "450px", overflowY: "auto" }}
                  >
                    {/* Trạm hiện tại */}
                    {loadingStations ? (
                      <div className="text-center py-4">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <div className="mt-2 small">
                          Đang tải thông tin trạm...
                        </div>
                      </div>
                    ) : studentStations ? (
                      <div className="mb-4">
                        <h6 className="border-bottom pb-2 mb-3 d-flex align-items-center">
                          <FaBus className="me-2 text-primary" />
                          Trạm hiện tại
                        </h6>

                        {/* Trạm đón sáng */}
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <FaSun className="me-2 text-warning" />
                            <strong className="text-success">
                              Trạm đón (Sáng)
                            </strong>
                          </div>
                          <div className="ps-4">
                            {renderStationInfo(studentStations.sang, "Sang")}
                          </div>
                        </div>

                        {/* Trạm trả chiều */}
                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <FaMoon className="me-2 text-info" />
                            <strong className="text-primary">
                              Trạm trả (Chiều)
                            </strong>
                          </div>
                          <div className="ps-4">
                            {renderStationInfo(studentStations.chieu, "Chieu")}
                          </div>
                        </div>

                        {studentStations.all.length === 0 && (
                          <div className="alert alert-warning py-2">
                            <small>
                              <FaExclamationTriangle className="me-1" />
                              Chưa có trạm nào được phân bổ
                            </small>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="alert alert-info py-2">
                        <small>Không thể tải thông tin trạm</small>
                      </div>
                    )}
                    <hr />
                    {/* Danh sách tất cả trạm */}
                    <h6 className="border-bottom pb-2 mb-3 d-flex align-items-center">
                      <FaList className="me-2 text-info" />
                      Chọn trạm mới
                    </h6>
                    <div className="mb-2">
                      <small className="text-muted">
                        💡 Click vào trạm để chọn, khoảng cách được tính từ địa
                        chỉ học sinh
                      </small>
                    </div>

                    {allStations.length === 0 ? (
                      <div className="text-center py-3">
                        <div
                          className="spinner-border spinner-border-sm text-secondary"
                          role="status"
                        ></div>
                        <div className="mt-2 small text-muted">
                          Đang tải trạm...
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* ✅ THÊM: Thông báo loại phân bổ đang chọn */}
                        <div className="alert alert-light py-2 mb-3">
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              {selectedAssignType === "Sang" ? "🌅" : "🌆"}
                            </div>
                            <small>
                              <strong>
                                Đang chọn trạm{" "}
                                {selectedAssignType === "Sang"
                                  ? "đón sáng"
                                  : "trả chiều"}
                              </strong>
                              <br />
                              <span className="text-muted">
                                {selectedAssignType === "Sang"
                                  ? "Trạm này sẽ đón học sinh vào buổi sáng đi học"
                                  : "Trạm này sẽ trả học sinh vào buổi chiều về nhà"}
                              </span>
                            </small>
                          </div>
                        </div>

                        {allStations.map((station) => {
                          const distance = currentStudentForStation?.diaChi
                            ? calculateDistance(
                                currentStudentForStation.diaChi.viDo || 0,
                                currentStudentForStation.diaChi.kinhDo || 0,
                                station.viDo || 0,
                                station.kinhDo || 0
                              )
                            : null;

                          const isSelected =
                            selectedStationForStudent?.maDiemDung ===
                            station.maDiemDung;

                          // ✅ KIỂM TRA XEM TRẠM ĐÃ ĐƯỢC GÁN CHO LOẠI PHÂN BỔ NÀY CHƯA
                          const isAssignedForThisType =
                            studentStations?.all.some(
                              (s) =>
                                s.maDiemDung === station.maDiemDung &&
                                s.loaiPhanBo === selectedAssignType
                            );
                          const isAssignedForOtherType =
                            studentStations?.all.some(
                              (s) =>
                                s.maDiemDung === station.maDiemDung &&
                                s.loaiPhanBo !== selectedAssignType
                            );

                          return (
                            <div
                              key={station.maDiemDung}
                              className={`card mb-2 cursor-pointer transition-all ${
                                isSelected
                                  ? "border-primary shadow-sm bg-primary bg-opacity-10"
                                  : isAssignedForThisType
                                  ? "border-success bg-success bg-opacity-10"
                                  : isAssignedForOtherType
                                  ? "border-warning bg-warning bg-opacity-10"
                                  : "border-light hover-shadow"
                              }`}
                              onClick={() => handleSelectStation(station)}
                              style={{
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <div className="card-body p-2">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-1">
                                      <strong
                                        className={`${
                                          isAssignedForThisType
                                            ? "text-success"
                                            : "text-dark"
                                        } me-2`}
                                      >
                                        {station.tenDiemDung}
                                      </strong>
                                      {isAssignedForThisType && (
                                        <FaCheck
                                          className="text-success"
                                          size={12}
                                        />
                                      )}
                                    </div>

                                    {station.moTa && (
                                      <div className="small text-muted mb-1">
                                        {station.moTa}
                                      </div>
                                    )}

                                    <div className="small text-secondary">
                                      📍 {Number(station.viDo).toFixed(4)},{" "}
                                      {Number(station.kinhDo).toFixed(4)}
                                    </div>

                                    {distance !== null && (
                                      <div className="small mt-1">
                                        <Badge
                                          bg={
                                            distance < 1
                                              ? "success"
                                              : distance < 3
                                              ? "warning"
                                              : "secondary"
                                          }
                                          className="me-1"
                                        >
                                          🚶 {distance.toFixed(2)} km
                                        </Badge>
                                        <span className="text-muted">
                                          {distance < 1
                                            ? "Rất gần"
                                            : distance < 3
                                            ? "Gần"
                                            : "Xa"}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="text-end">
                                    {isSelected && (
                                      <FaCheckCircle
                                        className="text-primary"
                                        size={18}
                                      />
                                    )}
                                    {/* ✅ CẬP NHẬT: Hiển thị trạng thái phân bổ chi tiết */}
                                    {isAssignedForThisType && (
                                      <Badge
                                        bg="success"
                                        className="ms-1 small"
                                      >
                                        {selectedAssignType === "Sang"
                                          ? "Đã gán sáng"
                                          : "Đã gán chiều"}
                                      </Badge>
                                    )}
                                    {isAssignedForOtherType && (
                                      <Badge
                                        bg="warning"
                                        className="ms-1 small"
                                      >
                                        {selectedAssignType === "Sang"
                                          ? "Đã gán chiều"
                                          : "Đã gán sáng"}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Modal.Body>
          {/* // SỬA Modal Footer - THÊM DROPDOWN CHỌN LOẠI PHÂN BỔ */}
          <Modal.Footer className="bg-light">
            <div className="d-flex justify-content-between align-items-center w-100">
              {/* Thông tin trạm đã chọn */}
              <div className="text-muted small">
                {selectedStationForStudent ? (
                  <span>
                    ✅ Đã chọn: &nbsp;
                    <strong>{selectedStationForStudent.tenDiemDung}</strong>
                  </span>
                ) : (
                  <span>⚠️ Vui lòng chọn một trạm</span>
                )}
              </div>

              {/* ✅ THÊM: Dropdown chọn loại phân bổ */}
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <Form.Label className="mb-0 me-2 small">
                    <strong>Loại phân bổ:</strong>
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    value={selectedAssignType}
                    onChange={(e) =>
                      setSelectedAssignType(e.target.value as "Sang" | "Chieu")
                    }
                    style={{ width: "130px", display: "inline-block" }}
                  >
                    <option value="Sang">🌅 Đón sáng</option>
                    <option value="Chieu">🌆 Trả chiều</option>
                  </Form.Select>
                </div>

                {/* Buttons */}
                <div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowMapModal(false);
                      setStudentStations(null);
                      setSelectedAssignType("Sang"); // Reset về mặc định
                    }}
                    className="me-2"
                  >
                    <FaTimes className="me-1 d-inline-flex align-items-center" />
                    Đóng
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveStationForStudent}
                    disabled={!selectedStationForStudent}
                  >
                    <FaCheck className="me-1 d-inline-flex align-items-center" />
                    {selectedStationForStudent
                      ? `Gán trạm ${
                          selectedAssignType === "Sang"
                            ? "đón sáng"
                            : "trả chiều"
                        }`
                      : "Chọn trạm trước"}
                  </Button>
                </div>
              </div>
            </div>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default StudentsPage;
