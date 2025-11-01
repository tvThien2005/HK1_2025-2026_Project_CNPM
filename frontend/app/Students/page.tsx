// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Table,
//   Button,
//   Modal,
//   Form,
//   InputGroup,
//   Alert,
//   Pagination,
// } from "react-bootstrap";
// import Head from "next/head";
// import { FaEdit, FaTrash, FaLock, FaUnlock, FaUser } from "react-icons/fa";
// import axios from "axios";

// interface Student {
//   maHocSinh: number;
//   tenHocSinh: string;
//   anhHocSinh: string;
//   lop: string;
//   trangThai: string;
// }

// interface FormData {
//   tenHocSinh: string;
//   lop: string;
//   anhHocSinh: File | string;
//   anhPreview: string;
// }

// const StudentsPage = () => {
//   const [students, setStudents] = useState<Student[]>([]);
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
//   const [alert, setAlert] = useState({ show: false, message: "", type: "" });
//   const itemsPerPage = 5;

//   // Form state
//   const [formData, setFormData] = useState<FormData>({
//     tenHocSinh: "",
//     lop: "",
//     anhHocSinh: "",
//     anhPreview: "",
//   });

//   // Lấy dữ liệu từ backend
//   const fetchStudents = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/students");
//       setStudents(res.data);
//     } catch (error) {
//       console.error("Lỗi khi lấy danh sách học sinh:", error);
//       showAlert("Lỗi khi tải dữ liệu", "danger");
//     }
//   };

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Xóa học sinh
//   const handleDelete = async (id: number) => {
//     if (!confirm("Bạn có chắc muốn xóa học sinh này?")) return;
//     try {
//       await axios.delete(`http://localhost:5000/api/students/${id}`);
//       setStudents(students.filter((student) => student.maHocSinh !== id));
//       showAlert("Xóa học sinh thành công", "success");
//     } catch (error) {
//       console.error("Lỗi khi xóa học sinh:", error);
//       showAlert("Lỗi khi xóa học sinh", "danger");
//     }
//   };

//   // Mở modal thêm
//   const handleShowAddModal = () => {
//     setFormData({
//       tenHocSinh: "",
//       lop: "",
//       anhHocSinh: "",
//       anhPreview: "",
//     });
//     setShowAddModal(true);
//   };

//   // Mở modal sửa
//   const handleShowEditModal = (student: Student) => {
//     setSelectedStudent(student);
//     setFormData({
//       tenHocSinh: student.tenHocSinh,
//       lop: student.lop,
//       anhHocSinh: student.anhHocSinh,
//       anhPreview: student.anhHocSinh || "",
//     });
//     setShowEditModal(true);
//   };

//   // Đóng modal
//   const handleCloseModal = () => {
//     setShowAddModal(false);
//     setShowEditModal(false);
//     setSelectedStudent(null);
//     // Clean up URL object khi đóng modal
//     if (formData.anhPreview && formData.anhPreview.startsWith("blob:")) {
//       URL.revokeObjectURL(formData.anhPreview);
//     }
//   };

//   // Validation form
//   const validateForm = () => {
//     if (!formData.tenHocSinh.trim()) {
//       showAlert("Vui lòng nhập tên học sinh", "warning");
//       return false;
//     }

//     if (!formData.lop.trim()) {
//       showAlert("Vui lòng nhập lớp", "warning");
//       return false;
//     }

//     if (showAddModal && !formData.anhHocSinh) {
//       showAlert("Vui lòng chọn ảnh học sinh", "warning");
//       return false;
//     }

//     return true;
//   };

//   // Hàm xử lý khi chọn ảnh
//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       // Kiểm tra kích thước file (tối đa 5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         showAlert("Kích thước ảnh không được vượt quá 5MB", "warning");
//         return;
//       }

//       // Clean up previous URL object
//       if (formData.anhPreview && formData.anhPreview.startsWith("blob:")) {
//         URL.revokeObjectURL(formData.anhPreview);
//       }

//       // Tạo URL để preview
//       const imageUrl = URL.createObjectURL(file);

//       // Cập nhật state
//       setFormData((prev) => ({
//         ...prev,
//         anhHocSinh: file,
//         anhPreview: imageUrl,
//       }));
//     }
//   };

//   // Hàm xóa ảnh đã chọn
//   const handleRemoveImage = () => {
//     // Clean up URL object
//     if (formData.anhPreview && formData.anhPreview.startsWith("blob:")) {
//       URL.revokeObjectURL(formData.anhPreview);
//     }

//     setFormData((prev) => ({
//       ...prev,
//       anhHocSinh: "",
//       anhPreview: "",
//     }));

//     // Reset input file
//     const fileInput = document.querySelector(
//       'input[name="anhHocSinh"]'
//     ) as HTMLInputElement;
//     if (fileInput) fileInput.value = "";
//   };

//   // Thêm học sinh (sử dụng FormData để upload file)
//   const handleAdd = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append("tenHocSinh", formData.tenHocSinh);
//       formDataToSend.append("lop", formData.lop);
//       if (formData.anhHocSinh instanceof File) {
//         formDataToSend.append("anhHocSinh", formData.anhHocSinh);
//       }
//       formDataToSend.append("trangThai", "Active");

//       await axios.post("http://localhost:5000/api/students", formDataToSend, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       fetchStudents();
//       handleCloseModal();
//       showAlert("Thêm học sinh thành công", "success");
//     } catch (error: any) {
//       console.error("❌ Lỗi chi tiết:", error);
//       console.error("📊 Error response:", error.response?.data);
//       showAlert(
//         error.response?.data?.message || "Lỗi khi thêm học sinh",
//         "danger"
//       );
//     }
//   };

//   // Sửa học sinh
//   // Sửa học sinh - CẬP NHẬT CODE NÀY
//   const handleEdit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm() || !selectedStudent) return;

//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append("tenHocSinh", formData.tenHocSinh);
//       formDataToSend.append("lop", formData.lop);

//       // QUAN TRỌNG: Chỉ append file nếu có file mới
//       if (formData.anhHocSinh instanceof File) {
//         formDataToSend.append("anhHocSinh", formData.anhHocSinh);
//       }

//       formDataToSend.append("trangThai", selectedStudent.trangThai);

//       // DEBUG: Kiểm tra tất cả dữ liệu trong FormData
//       console.log("📤 DEBUG FormData contents:");
//       for (let [key, value] of formDataToSend.entries()) {
//         console.log(`${key}:`, value);
//       }

//       const response = await axios.put(
//         `http://localhost:5000/api/students/${selectedStudent.maHocSinh}`,
//         formDataToSend,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       console.log("✅ Response:", response.data);

//       fetchStudents();
//       handleCloseModal();
//       showAlert("Cập nhật học sinh thành công", "success");
//     } catch (error: any) {
//       console.error("❌ Lỗi chi tiết khi cập nhật:", error);
//       console.error("📊 Error response:", error.response?.data);
//       console.error("🔧 Error config:", error.config);

//       showAlert(
//         error.response?.data?.message || "Lỗi khi cập nhật học sinh",
//         "danger"
//       );
//     }
//   };

//   const handleBlock = async (id: number) => {
//     if (!confirm("Bạn có chắc muốn khóa học sinh này?")) return;
//     try {
//       await axios.patch(`http://localhost:5000/api/students/${id}/block`);
//       fetchStudents();
//       showAlert("Khóa học sinh thành công", "success");
//     } catch (error) {
//       console.error("Lỗi khi khóa học sinh:", error);
//       showAlert("Lỗi khi khóa học sinh", "danger");
//     }
//   };

//   const handleUnblock = async (id: number) => {
//     if (!confirm("Bạn có chắc muốn mở khóa học sinh này?")) return;
//     try {
//       await axios.patch(`http://localhost:5000/api/students/${id}/unblock`);
//       fetchStudents();
//       showAlert("Mở khóa học sinh thành công", "success");
//     } catch (error) {
//       console.error("Lỗi khi mở khóa học sinh:", error);
//       showAlert("Lỗi khi mở khóa học sinh", "danger");
//     }
//   };

//   // Hiển thị alert
//   const showAlert = (message: string, type: string) => {
//     setAlert({ show: true, message, type });
//     setTimeout(() => {
//       setAlert({ show: false, message: "", type: "" });
//     }, 3000);
//   };

//   // Lọc học sinh theo search
//   const filteredStudents = students.filter(
//     (u) =>
//       u.tenHocSinh && u.tenHocSinh.toLowerCase().includes(search.toLowerCase())
//   );

//   // Tính toán phân trang
//   const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const currentStudents = filteredStudents.slice(
//     startIndex,
//     startIndex + itemsPerPage
//   );

//   // Tạo mảng số trang cho Pagination
//   const pageNumbers = [];
//   for (let i = 1; i <= totalPages; i++) {
//     pageNumbers.push(i);
//   }

//   // Xử lý chuyển trang
//   const handlePageChange = (pageNumber: number) => {
//     setCurrentPage(pageNumber);
//   };

//   return (
//     <>
//       <Head>
//         <title>Quản lý học sinh | Admin Bus Tracking</title>
//       </Head>
//       <Container fluid>
//         <h2 className="my-4">Quản lý học sinh</h2>

//         {/* Alert */}
//         {alert.show && (
//           <Alert variant={alert.type} className="mb-3">
//             {alert.message}
//           </Alert>
//         )}

//         {/* Thanh tìm kiếm và nút thêm - nằm ngang hàng */}
//         <Row className="align-items-center mb-3">
//           <Col md={6}>
//             <InputGroup>
//               <Form.Control
//                 placeholder="Tìm kiếm theo tên học sinh..."
//                 value={search}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                   setSearch(e.target.value)
//                 }
//               />
//               <Button variant="secondary" onClick={() => setSearch("")}>
//                 Xóa
//               </Button>
//             </InputGroup>
//           </Col>
//           <Col md={6} className="text-end">
//             <Button variant="primary" onClick={handleShowAddModal}>
//               Thêm học sinh mới
//             </Button>
//           </Col>
//         </Row>
//         <div className="table-container">
//           <Table
//             striped
//             bordered
//             hover
//             className="shadow-sm text-center"
//             style={{ verticalAlign: "middle", textAlign: "center" }}
//           >
//             <thead>
//               <tr>
//                 <th>Mã học sinh</th>
//                 <th>Tên học sinh</th>
//                 <th>Ảnh học sinh</th>
//                 <th>Lớp học</th>
//                 <th>Trạng thái</th>
//                 <th>Hành động</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentStudents.length > 0 ? (
//                 currentStudents.map((student) => (
//                   <tr key={student.maHocSinh}>
//                     <td>{student.maHocSinh}</td>
//                     <td>{student.tenHocSinh}</td>
//                     <td align="center">
//                       {student.anhHocSinh ? (
//                         <img
//                           src={`http://localhost:5000${student.anhHocSinh}`} // THÊM BASE URL                          alt={student.tenHocSinh}
//                           style={{
//                             width: "50px",
//                             height: "50px",
//                             objectFit: "cover",
//                             whiteSpace: "nowrap",
//                           }}
//                           className="rounded"
//                         />
//                       ) : (
//                         <FaUser size={20} className="text-muted" />
//                       )}
//                     </td>
//                     <td>{student.lop}</td>
//                     <td>
//                       <span
//                         className={`badge ${
//                           student.trangThai === "Active"
//                             ? "bg-success"
//                             : "bg-danger"
//                         }`}
//                       >
//                         {student.trangThai}
//                       </span>
//                     </td>
//                     <td>
//                       <Button
//                         variant="outline-warning"
//                         size="sm"
//                         className="me-2 mb-1"
//                         style={{ border: "none" }}
//                         onClick={() => handleShowEditModal(student)}
//                         title="Sửa"
//                       >
//                         <FaEdit size={20} />
//                       </Button>
//                       <Button
//                         variant="outline-danger"
//                         size="sm"
//                         className="me-2 mb-1"
//                         style={{ border: "none" }}
//                         onClick={() => handleDelete(student.maHocSinh)}
//                         title="Xóa"
//                       >
//                         <FaTrash size={20} />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={6} className="text-center">
//                     Không có dữ liệu
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </Table>
//         </div>

//         {/* Phân trang */}
//         {totalPages > 1 && (
//           <div className="d-flex justify-content-center">
//             <Pagination>
//               <Pagination.Prev
//                 disabled={currentPage === 1}
//                 onClick={() => handlePageChange(currentPage - 1)}
//               />

//               {pageNumbers.map((number) => (
//                 <Pagination.Item
//                   key={number}
//                   active={number === currentPage}
//                   onClick={() => handlePageChange(number)}
//                 >
//                   {number}
//                 </Pagination.Item>
//               ))}

//               <Pagination.Next
//                 disabled={currentPage === totalPages}
//                 onClick={() => handlePageChange(currentPage + 1)}
//               />
//             </Pagination>
//           </div>
//         )}

//         {/* Modal Thêm học sinh */}
//         <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
//           <Modal.Header closeButton>
//             <Modal.Title>Thêm học sinh mới</Modal.Title>
//           </Modal.Header>
//           <Form onSubmit={handleAdd}>
//             <Modal.Body>
//               <Row>
//                 {/* Cột thông tin học sinh */}
//                 <Col md={8}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Tên học sinh *</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="tenHocSinh"
//                       value={formData.tenHocSinh}
//                       onChange={handleInputChange}
//                       placeholder="Nhập tên học sinh"
//                       required
//                     />
//                     <Form.Text className="text-muted">
//                       Ví dụ: Trần Văn A
//                     </Form.Text>
//                   </Form.Group>

//                   <Form.Group className="mb-3">
//                     <Form.Label>Lớp *</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="lop"
//                       value={formData.lop}
//                       onChange={handleInputChange}
//                       placeholder="Nhập tên lớp"
//                       required
//                     />
//                   </Form.Group>

//                   <Form.Group className="mb-3">
//                     <Form.Label>Ảnh học sinh *</Form.Label>
//                     <Form.Control
//                       type="file"
//                       name="anhHocSinh"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                       required
//                     />
//                     <Form.Text className="text-muted">
//                       Chọn ảnh có định dạng JPG, PNG (tối đa 5MB)
//                     </Form.Text>
//                   </Form.Group>
//                 </Col>

//                 {/* Cột preview ảnh */}
//                 <Col md={4}>
//                   <div className="text-center">
//                     <Form.Label>Preview Ảnh</Form.Label>
//                     <div
//                       className="border rounded p-3 mb-3 d-flex align-items-center justify-content-center"
//                       style={{ height: "200px", backgroundColor: "#f8f9fa" }}
//                     >
//                       {formData.anhPreview ? (
//                         <img
//                           src={formData.anhPreview} // THÊM BASE URL                          alt="Preview"
//                           // className="img-fluid rounded"
//                           style={{ maxHeight: "180px", objectFit: "contain" }}
//                         />
//                       ) : (
//                         <div className="text-muted text-center">
//                           {/* FaUser cần một khối bao bọc nếu nó là icon component */}
//                           <div className="d-flex justify-content-center">
//                             <FaUser size={40} className="mb-2" />
//                           </div>
//                           <div>Chưa có ảnh</div>
//                         </div>
//                       )}
//                     </div>
//                     {formData.anhPreview && (
//                       <Button
//                         variant="outline-danger"
//                         size="sm"
//                         // THÊM CÁC LỚP FLEXBOX VÀO ĐÂY ĐỂ ICON VÀ TEXT CÙNG HÀNG
//                         className="d-flex align-items-center justify-content-center mx-auto"
//                         onClick={handleRemoveImage}
//                       >
//                         <FaTrash className="me-1" /> {/* Icon thùng rác */}
//                         Xóa ảnh {/* Chữ "Xóa ảnh" */}
//                       </Button>
//                     )}
//                   </div>
//                 </Col>
//               </Row>
//             </Modal.Body>
//             <Modal.Footer>
//               <Button variant="secondary" onClick={handleCloseModal}>
//                 Hủy
//               </Button>
//               <Button variant="primary" type="submit">
//                 Thêm học sinh
//               </Button>
//             </Modal.Footer>
//           </Form>
//         </Modal>

//         {/* Modal Sửa học sinh */}
//         <Modal show={showEditModal} onHide={handleCloseModal} size="lg">
//           <Modal.Header closeButton>
//             <Modal.Title>Sửa thông tin học sinh</Modal.Title>
//           </Modal.Header>
//           <Form onSubmit={handleEdit}>
//             <Modal.Body>
//               <Row>
//                 {/* Cột thông tin học sinh */}
//                 <Col md={8}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Tên học sinh *</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="tenHocSinh"
//                       value={formData.tenHocSinh}
//                       onChange={handleInputChange}
//                       placeholder="Nhập tên học sinh"
//                       required
//                     />
//                   </Form.Group>

//                   <Form.Group className="mb-3">
//                     <Form.Label>Lớp *</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="lop"
//                       value={formData.lop}
//                       onChange={handleInputChange}
//                       placeholder="Nhập tên lớp"
//                       required
//                     />
//                   </Form.Group>

//                   <Form.Group className="mb-3">
//                     <Form.Label>Ảnh học sinh</Form.Label>
//                     <Form.Control
//                       type="file"
//                       name="anhHocSinh"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                     />
//                     <Form.Text className="text-muted">
//                       Chọn ảnh có định dạng JPG, PNG (tối đa 5MB)
//                     </Form.Text>
//                   </Form.Group>
//                 </Col>

//                 {/* Cột preview ảnh */}
//                 <Col md={4}>
//                   <div className="text-center">
//                     <Form.Label>Preview Ảnh</Form.Label>
//                     <div
//                       className="border rounded p-3 mb-3 d-flex align-items-center justify-content-center"
//                       style={{ height: "200px", backgroundColor: "#f8f9fa" }}
//                     >
//                       {formData.anhPreview ? (
//                         <img
//                           src={formData.anhPreview} // THÊM BASE URL                          alt={student.tenHocSinh}
//                           alt="Preview"
//                           className="img-fluid rounded"
//                           style={{ maxHeight: "180px", objectFit: "contain" }}
//                         />
//                       ) : (
//                         <div className="text-muted text-center">
//                           {/* FaUser cần một khối bao bọc nếu nó là icon component */}
//                           <div className="d-flex justify-content-center">
//                             <FaUser size={40} className="mb-2" />
//                           </div>
//                           <div>Chưa có ảnh</div>
//                         </div>
//                       )}
//                     </div>
//                     {formData.anhPreview && (
//                       <Button
//                         variant="outline-danger"
//                         size="sm"
//                         // THÊM CÁC LỚP FLEXBOX VÀO ĐÂY ĐỂ ICON VÀ TEXT CÙNG HÀNG
//                         className="d-flex align-items-center justify-content-center mx-auto"
//                         onClick={handleRemoveImage}
//                       >
//                         <FaTrash className="me-1" /> {/* Icon thùng rác */}
//                         Xóa ảnh {/* Chữ "Xóa ảnh" */}
//                       </Button>
//                     )}
//                   </div>
//                 </Col>
//               </Row>

//               {selectedStudent && (
//                 <div className="bg-light p-3 rounded">
//                   <small className="text-muted">
//                     <strong>Thông tin hệ thống:</strong>
//                     <br />
//                     Mã học sinh: {selectedStudent.maHocSinh}
//                     <br />
//                     Trạng thái: {selectedStudent.trangThai}
//                   </small>
//                 </div>
//               )}
//             </Modal.Body>
//             <Modal.Footer>
//               <Button variant="secondary" onClick={handleCloseModal}>
//                 Hủy
//               </Button>
//               <Button variant="primary" type="submit">
//                 Cập nhật
//               </Button>
//             </Modal.Footer>
//           </Form>
//         </Modal>
//       </Container>
//     </>
//   );
// };

// export default StudentsPage;

"use client";

import React, { useState, useEffect } from "react";
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
} from "react-bootstrap";
import Head from "next/head";
import { FaEdit, FaTrash, FaLock, FaUnlock, FaUser } from "react-icons/fa";
import axios from "axios";

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
  };
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

  // Lấy dữ liệu từ backend
  // Trong fetchStudents function
  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      console.log("📊 API Response:", res.data); // THÊM DÒNG NÀY
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

  // Mở modal sửa
  const handleShowEditModal = (student: Student) => {
    setSelectedStudent(student);

    // Nếu học sinh có địa chỉ, điền vào form
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

    // Reset các select box (trong thực tế bạn cần tìm code tương ứng)
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");

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
            className="shadow-sm text-center"
            style={{ verticalAlign: "middle", textAlign: "center" }}
          >
            <thead>
              <tr>
                <th>Mã học sinh</th>
                <th>Tên học sinh</th>
                <th>Ảnh học sinh</th>
                <th>Lớp học</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <tr key={student.maHocSinh}>
                    <td>{student.maHocSinh}</td>
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
                    <td>
                      <span
                        className={`badge ${
                          student.trangThai === "Active"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {student.trangThai}
                      </span>
                    </td>
                    <td>
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
      </Container>
    </>
  );
};

export default StudentsPage;
