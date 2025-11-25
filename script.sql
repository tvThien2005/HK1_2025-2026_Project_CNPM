
USE quanlixebuyt;

CREATE TABLE viTriThuc (
    maViTriThuc INT PRIMARY KEY AUTO_INCREMENT,
    kinhDo DECIMAL(11, 8),
    viDo DECIMAL(11, 8)
);

CREATE TABLE diaChi (
    maDiaChi INT PRIMARY KEY AUTO_INCREMENT,
    soNha VARCHAR(20),
    duong VARCHAR(255),
    phuongXa VARCHAR(255),
    quanHuyen VARCHAR(255),
    thanhPho VARCHAR(255),
    maViTriThuc INT,
    FOREIGN KEY (maViTriThuc) REFERENCES viTriThuc(maViTriThuc)
);

-- ***************************************************************
-- 2. BẢNG QUẢN LÝ TÀI KHOẢN VÀ NGƯỜI DÙNG
-- ***************************************************************
CREATE TABLE taiKhoan (
    maTaiKhoan INT PRIMARY KEY AUTO_INCREMENT,
    tenDangNhap VARCHAR(255) NOT NULL UNIQUE,
    matKhau VARCHAR(255) NOT NULL,
    ngayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    capDo VARCHAR(50),
    trangThai VARCHAR(50),
    block TINYINT(1) DEFAULT 0
);

CREATE TABLE quanLyXe (
    maQuanLyXe INT PRIMARY KEY AUTO_INCREMENT,
    tenQuanLyXe VARCHAR(255),
    soDienThoai VARCHAR(15),
    ngaySinh DATE,
    trangThai VARCHAR(50),
    maTaiKhoan INT UNIQUE,
    FOREIGN KEY (maTaiKhoan) REFERENCES taiKhoan(maTaiKhoan)
);

CREATE TABLE taiXe (
    maTaiXe INT PRIMARY KEY AUTO_INCREMENT,
    tenTaiXe VARCHAR(255),
    ngaySinh DATE,
    anhTaiXe VARCHAR(255),
    soDienThoai VARCHAR(15),
    soBangLai VARCHAR(50) UNIQUE,
    trangThai VARCHAR(50),
    maTaiKhoan INT UNIQUE,
    FOREIGN KEY (maTaiKhoan) REFERENCES taiKhoan(maTaiKhoan)
);

CREATE TABLE hocSinh (
    maHocSinh INT PRIMARY KEY AUTO_INCREMENT,
    tenHocSinh VARCHAR(255),
    anhHocSinh VARCHAR(255),
    lop VARCHAR(50),
    trangThai VARCHAR(50),
    maDiaChi INT, 
    FOREIGN KEY (maDiaChi) REFERENCES diaChi(maDiaChi)
);

CREATE TABLE phuHuynh (
    maPhuHuynh INT PRIMARY KEY AUTO_INCREMENT,
    tenPhuHuynh VARCHAR(255),
    soDienThoai VARCHAR(15),
    ngaySinh DATE,
    maTaiKhoan INT UNIQUE,
    maHocSinh INT,
    trangThai VARCHAR(50),
    FOREIGN KEY (maTaiKhoan) REFERENCES taiKhoan(maTaiKhoan),
    FOREIGN KEY (maHocSinh) REFERENCES hocSinh(maHocSinh)
);

-- ***************************************************************
-- 3. PHƯƠNG TIỆN & TUYẾN ĐƯỜNG
-- ***************************************************************
CREATE TABLE xeBuyt (
    maXeBuyt INT PRIMARY KEY AUTO_INCREMENT,
    bienSoXe VARCHAR(50) UNIQUE,
    sucChua INT,
    mauXe VARCHAR(50),
    trangThai VARCHAR(50)
);

CREATE TABLE tuyenDuong (
    maTuyenDuong INT PRIMARY KEY AUTO_INCREMENT,
    tenTuyenDuong VARCHAR(255),
    loai VARCHAR(50)
);


CREATE TABLE chiTietTuyenDuong (
    maChiTietTuyenDuong INT PRIMARY KEY AUTO_INCREMENT,
    maTuyenDuong INT NOT NULL,
    maDiemDung INT NOT NULL,
    thuTu INT NOT NULL COMMENT 'Thứ tự điểm dừng trong tuyến',
    thoiGianDuKien TIME DEFAULT NULL COMMENT 'Thời gian dự kiến đến điểm dừng',
    loaiDiem VARCHAR(50) DEFAULT NULL COMMENT 'Đón, trả, hoặc cả hai',
    FOREIGN KEY (maTuyenDuong) REFERENCES tuyenDuong(maTuyenDuong),
    FOREIGN KEY (maDiemDung) REFERENCES diemDung(maDiemDung)
);
-- ***************************************************************
-- 4. LỊCH TRÌNH & CHUYẾN XE
-- ***************************************************************
CREATE TABLE lichTrinh (
    maLichTrinh INT PRIMARY KEY AUTO_INCREMENT,
    ngay DATE,
    thoiGianDi TIME,
    thoiGianDen TIME
);

CREATE TABLE chuyenXe (
    maChuyenXe INT PRIMARY KEY AUTO_INCREMENT,
    maXeBuyt INT NOT NULL,
    maTaiXe INT NOT NULL,
    maLichTrinh INT NOT NULL,
    maTuyenDuong INT NOT NULL,
    trangThai VARCHAR(50),
    FOREIGN KEY (maXeBuyt) REFERENCES xeBuyt(maXeBuyt),
    FOREIGN KEY (maTaiXe) REFERENCES taiXe(maTaiXe),
    FOREIGN KEY (maLichTrinh) REFERENCES lichTrinh(maLichTrinh),
    FOREIGN KEY (maTuyenDuong) REFERENCES tuyenDuong(maTuyenDuong)
);

-- ***************************************************************
-- 5. THEO DÕI VỊ TRÍ
-- ***************************************************************

CREATE TABLE diemDung (
    maDiemDung INT PRIMARY KEY AUTO_INCREMENT,
    tenDiemDung VARCHAR(255) NOT NULL,
    maViTriThuc INT NOT NULL,
    moTa TEXT,
    trangThai VARCHAR(50) DEFAULT 'Active',
    thoiGianTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maViTriThuc) REFERENCES viTriThuc(maViTriThuc)
);

CREATE TABLE viTriChuyenXe (
    maViTriChuyenXe INT PRIMARY KEY AUTO_INCREMENT,
    maChuyenXe INT NOT NULL,
    maViTriThuc INT NOT NULL,
    thoiGianGhiNhan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maChuyenXe) REFERENCES chuyenXe(maChuyenXe),
    FOREIGN KEY (maViTriThuc) REFERENCES viTriThuc(maViTriThuc)
);

CREATE TABLE phanBoHocSinhTram (
    maPhanBoHocSinhTram INT PRIMARY KEY AUTO_INCREMENT,
    maHocSinh INT NOT NULL,
    maDiemDung INT NOT NULL,
    loaiPhanBo VARCHAR(50) DEFAULT 'Sang' COMMENT 'Sang: đi học, Chieu: về nhà',
    thoiGianBatDau DATE DEFAULT NULL,
    thoiGianKetThuc DATE DEFAULT NULL,
    trangThai VARCHAR(50) DEFAULT 'Assigned',
    FOREIGN KEY (maHocSinh) REFERENCES hocSinh(maHocSinh),
    FOREIGN KEY (maDiemDung) REFERENCES diemDung(maDiemDung)
);

CREATE TABLE phanBoTramXe (
    maPhanBoTramXe INT PRIMARY KEY AUTO_INCREMENT,
    maChuyenXe INT NOT NULL,
    maDiemDung INT NOT NULL,
    thuTuDon INT NOT NULL COMMENT 'Thứ tự đón tại trạm trong chuyến xe',
    thoiGianDuKien TIME DEFAULT NULL COMMENT 'Thời gian dự kiến đến trạm',
    soHocSinhDuKien INT DEFAULT 0 COMMENT 'Số học sinh dự kiến đón tại trạm',
    trangThai VARCHAR(50) DEFAULT 'Active',
    FOREIGN KEY (maChuyenXe) REFERENCES chuyenXe(maChuyenXe),
    FOREIGN KEY (maDiemDung) REFERENCES diemDung(maDiemDung)
);
-- ***************************************************************
-- 6. THÔNG BÁO & CẢNH BÁO
-- ***************************************************************
CREATE TABLE canhBao (
    maCanhBao INT PRIMARY KEY AUTO_INCREMENT,
    maTaiXe INT,
    noiDung TEXT,
    thoiGianTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maTaiXe) REFERENCES taiXe(maTaiXe)
);

CREATE TABLE chiTietCanhBao (
    maChiTietCanhBao INT PRIMARY KEY AUTO_INCREMENT,
    maCanhBao INT NOT NULL,
    maPhuHuynh INT NOT NULL,
    FOREIGN KEY (maCanhBao) REFERENCES canhBao(maCanhBao),
    FOREIGN KEY (maPhuHuynh) REFERENCES phuHuynh(maPhuHuynh)
);

CREATE TABLE thongBao (
    maThongBao INT PRIMARY KEY AUTO_INCREMENT,
    maQuanLyXe INT,
    noiDung TEXT,
    thoiGianTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maQuanLyXe) REFERENCES quanLyXe(maQuanLyXe)
);

CREATE TABLE chiTietThongBao (
    maChiTietThongBao INT PRIMARY KEY AUTO_INCREMENT,
    maThongBao INT NOT NULL,
    maTaiKhoan INT NOT NULL,
    FOREIGN KEY (maThongBao) REFERENCES thongBao(maThongBao),
    FOREIGN KEY (maTaiKhoan) REFERENCES taiKhoan(maTaiKhoan)
);

-- ***************************************************************
-- SEED DATA
-- ***************************************************************

-- 1. Vị trí thực và địa chỉ
INSERT INTO viTriThuc (kinhDo, viDo) VALUES
(106.70000000, 10.77600000),
(106.70234000, 10.78012000),
(106.71045000, 10.77555000),
(106.69588000, 10.77043000),
(106.68999000, 10.76822000),
(106.70567000, 10.77234000);

INSERT INTO diaChi (soNha, duong, phuongXa, quanHuyen, thanhPho, maViTriThuc) VALUES
('12A', 'Nguyen Hue', 'Ben Nghe', 'District 1', 'Ho Chi Minh City', 1),
('45', 'Le Loi', 'Ben Thanh', 'District 1', 'Ho Chi Minh City', 2),
('89', 'Pasteur', 'Ward 6', 'District 3', 'Ho Chi Minh City', 3),
('102', 'Hai Ba Trung', 'Tan Dinh', 'District 1', 'Ho Chi Minh City', 4),
('17', 'Tran Hung Dao', 'Co Giang', 'District 1', 'Ho Chi Minh City', 5),
('256', 'Dien Bien Phu', 'Ward 17', 'Binh Thanh', 'Ho Chi Minh City', 6);

-- 2. Người dùng và tài khoản
INSERT INTO taiKhoan (tenDangNhap, matKhau, capDo, trangThai, block) VALUES
('manager_a', 'pass123', 'Manager', 'Active', 0),
('manager_b', 'pass123', 'Manager', 'Active', 0),
('driver_c', 'pass123', 'Driver', 'Active', 0),
('driver_d', 'pass123', 'Driver', 'Active', 0),
('driver_e', 'pass123', 'Driver', 'Inactive', 0),
('koko', 'pass123', 'Parent', 'Active', 0),
('parent_ngoc', 'pass123', 'Parent', 'Active', 0),
('parent_khang', 'pass123', 'Parent', 'Active', 0),
('parent_linh', 'pass123', 'Parent', 'Active', 0),
('parent_minh', 'pass123', 'Parent', 'Active', 0),
('parent_duy', 'pass123', 'Parent', 'Active', 0);

INSERT INTO quanLyXe (tenQuanLyXe, soDienThoai, ngaySinh, trangThai, maTaiKhoan) VALUES
('Nguyen Van Quan', '0901111111', '1980-05-15', 'Active', 1),
('Tran Thi Ly', '0902222222', '1982-08-20', 'Active', 2);

INSERT INTO taiXe (tenTaiXe, ngaySinh, anhTaiXe, soDienThoai, soBangLai, trangThai, maTaiKhoan) VALUES
('Le Van C', '1985-03-10', '/img/driverC.jpg', '0903333333', 'B2-00123', 'Active', 3),
('Pham Thi D', '1988-07-25', '/img/driverD.jpg', '0904444444', 'B2-00234', 'Active', 4),
('Hoang Van E', '1990-12-05', '/img/driverE.jpg', '0905555555', 'B2-00345', 'Inactive', 5);

INSERT INTO hocSinh (tenHocSinh, anhHocSinh, lop, trangThai, maDiaChi) VALUES
('Nguyen Minh An', '/img/an.jpg', '1A', 'Active', 1),
('Tran Bao Ngoc', '/img/ngoc.jpg', '2B', 'Active', 2),
('Le Gia Khang', '/img/khang.jpg', '3C', 'Active', 3),
('Pham Thu Linh', '/img/linh.jpg', '1A', 'Active', 4),
('Vu Duc Minh', '/img/minh.jpg', '4D', 'Active', 5),
('Ly Chi Duy', '/img/duy.jpg', '5A', 'Active', 6);

INSERT INTO phuHuynh (tenPhuHuynh, soDienThoai, ngaySinh, maTaiKhoan, maHocSinh, trangThai) VALUES
('Nguyen Van Bo', '0906666666', '1978-01-15', 6, 1, 'Active'),
('Tran Thi Me', '0907777777', '1980-03-20', 7, 2, 'Active'),
('Le Van Cha', '0908888888', '1975-06-10', 8, 3, 'Active'),
('Pham Thi Me', '0909999999', '1982-09-05', 9, 4, 'Active'),
('Vu Van Bo', '0901234567', '1979-11-11', 10, 5, 'Active'),
('Ly Thi Me', '0907654321', '1981-12-12', 11, 6, 'Active');

-- 3. Phương tiện, tuyến đường, điểm dừng
INSERT INTO xeBuyt (bienSoXe, sucChua, mauXe, trangThai) VALUES
('51A-12345', 40, 'Yellow', 'Active'),
('51B-67890', 35, 'Blue', 'Active'),
('51C-54321', 45, 'White', 'Maintenance');

INSERT INTO tuyenDuong (tenTuyenDuong, loai) VALUES
('Route 1: District 1 - Binh Thanh (Morning)', 'Main'),
('Route 2: District 3 - District 1 (Morning)', 'Main'),
('Route 3: Binh Thanh - District 1 (Afternoon)', 'Secondary');

INSERT INTO diemDung (tenDiemDung, maViTriThuc, moTa, trangThai) VALUES
('Ben Thanh Market', 1, 'Central pickup point', 'Active'),
('Notre Dame Cathedral', 2, 'Cathedral stop', 'Active'),
('Hang Xanh Intersection', 6, 'Gateway to Binh Thanh', 'Active'),
('War Remnants Museum', 3, 'District 3 stop', 'Active'),
('Turtle Lake', 4, 'Roundabout stop', 'Active'),
('Landmark 81', 5, 'New urban area', 'Active');

INSERT INTO chiTietTuyenDuong (maTuyenDuong, maDiemDung, thuTu, thoiGianDuKien, loaiDiem) VALUES
(1, 1, 1, '06:40:00', 'Don'),
(1, 2, 2, '06:50:00', 'Don'),
(2, 4, 1, '06:45:00', 'Don'),
(2, 5, 2, '06:55:00', 'Don'),
(3, 3, 1, '16:05:00', 'Tra'),
(3, 6, 2, '16:20:00', 'Tra');

-- 4. Lịch trình và chuyến xe
INSERT INTO lichTrinh (ngay, thoiGianDi, thoiGianDen) VALUES
('2025-11-18', '06:30:00', '07:15:00'),
('2025-11-18', '06:45:00', '07:30:00'),
('2025-11-18', '16:00:00', '16:45:00');

update lichTrinh set ngay = '2025-11-19' ;

INSERT INTO chuyenXe (maXeBuyt, maTaiXe, maLichTrinh, maTuyenDuong, trangThai) VALUES
(1, 1, 1, 1, 'InProgress'),
(2, 2, 2, 2, 'InProgress'),
(1, 1, 3, 3, 'InProgress');

INSERT INTO phanBoTramXe (maChuyenXe, maDiemDung, thuTuDon, thoiGianDuKien, soHocSinhDuKien, trangThai) VALUES
(1, 1, 1, '06:35:00', 3, 'Active'),
(1, 2, 2, '06:50:00', 3, 'Active'),
(2, 4, 1, '06:50:00', 2, 'Active'),
(2, 5, 2, '07:05:00', 2, 'Active'),
(3, 3, 1, '16:05:00', 2, 'Active'),
(3, 6, 2, '16:20:00', 2, 'Active');

-- 5. Phân bổ học sinh theo trạm
INSERT INTO phanBoHocSinhTram (maHocSinh, maDiemDung, loaiPhanBo, thoiGianBatDau, thoiGianKetThuc, trangThai) VALUES
(1, 1, 'Sang', '2025-11-01', NULL, 'Assigned'),
(2, 1, 'Sang', '2025-11-01', NULL, 'Assigned'),
(3, 2, 'Sang', '2025-11-01', NULL, 'Assigned'),
(4, 4, 'Sang', '2025-11-01', NULL, 'Assigned'),
(5, 5, 'Sang', '2025-11-01', NULL, 'Assigned'),
(6, 3, 'Chieu', '2025-11-01', NULL, 'Assigned');

-- Thêm thêm học sinh để mỗi chuyến có 10 học sinh
INSERT INTO hocSinh (tenHocSinh, anhHocSinh, lop, trangThai, maDiaChi) VALUES
('Pham Gia Huy', '/img/huy.jpg', '2A', 'Active', 1),
('Nguyen Thu Trang', '/img/trang.jpg', '3B', 'Active', 2),
('Le Minh Tuan', '/img/tuan.jpg', '4C', 'Active', 3),
('Tran Quynh Anh', '/img/quynhanh.jpg', '5A', 'Active', 4),
('Do Hoang Long', '/img/long.jpg', '1B', 'Active', 5),
('Bui Thanh Nhan', '/img/nhan.jpg', '2C', 'Active', 6),
('Vo Bao Khanh', '/img/baokhanh.jpg', '3A', 'Active', 1),
('Phan Thu Ha', '/img/ha.jpg', '4B', 'Active', 2),
('Nguyen Nhat Nam', '/img/nam.jpg', '5C', 'Active', 3),
('Tran My Duyen', '/img/duyen.jpg', '1C', 'Active', 4),
('Ly Bao An', '/img/baoan.jpg', '2A', 'Active', 5),
('Vo Khanh Linh', '/img/khanhlinh.jpg', '3B', 'Active', 6),
('Dang Quoc Viet', '/img/viet.jpg', '4C', 'Active', 1),
('Nguyen Thanh Phat', '/img/phat.jpg', '5A', 'Active', 2),
('Tran Bao Chau', '/img/bao-chau.jpg', '1B', 'Active', 3),
('Pham Thi Han', '/img/han.jpg', '2C', 'Active', 4),
('Le Tuan Kiet', '/img/kiet.jpg', '3A', 'Active', 5),
('Do Ngoc Mai', '/img/mai.jpg', '4B', 'Active', 6),
('Bui Hoang Minh', '/img/hoangminh.jpg', '5C', 'Active', 1),
('Vo Thu Uyen', '/img/uyen.jpg', '1C', 'Active', 2),
('Phan Duc Thinh', '/img/thinh.jpg', '2A', 'Active', 3),
('Nguyen Bao Han', '/img/baohan.jpg', '3B', 'Active', 4),
('Tran Ngoc Anh', '/img/ngocanh.jpg', '4C', 'Active', 5),
('Ly Khanh Huy', '/img/khanhhuy.jpg', '5A', 'Active', 6);

-- Gán học sinh mới vào các trạm tương ứng để mỗi chuyến xe có 10 học sinh
-- Chuyến 1 (maChuyenXe=1) sử dụng các trạm 1 và 2: hiện có 3 -> thêm 7
INSERT INTO phanBoHocSinhTram (maHocSinh, maDiemDung, loaiPhanBo, thoiGianBatDau, thoiGianKetThuc, trangThai) VALUES
-- Trip 1 additions (students 7..13)
(7, 1, 'Sang', '2025-11-01', NULL, 'Assigned'),
(8, 2, 'Sang', '2025-11-01', NULL, 'Assigned'),
(9, 1, 'Sang', '2025-11-01', NULL, 'Assigned'),
(10, 2, 'Sang', '2025-11-01', NULL, 'Assigned'),
(11, 1, 'Sang', '2025-11-01', NULL, 'Assigned'),
(12, 2, 'Sang', '2025-11-01', NULL, 'Assigned'),
(13, 1, 'Sang', '2025-11-01', NULL, 'Assigned');

-- Chuyến 2 (maChuyenXe=2) sử dụng các trạm 4 và 5: hiện có 2 -> thêm 8
INSERT INTO phanBoHocSinhTram (maHocSinh, maDiemDung, loaiPhanBo, thoiGianBatDau, thoiGianKetThuc, trangThai) VALUES
-- Trip 2 additions (students 14..21)
(14, 4, 'Sang', '2025-11-01', NULL, 'Assigned'),
(15, 5, 'Sang', '2025-11-01', NULL, 'Assigned'),
(16, 4, 'Sang', '2025-11-01', NULL, 'Assigned'),
(17, 5, 'Sang', '2025-11-01', NULL, 'Assigned'),
(18, 4, 'Sang', '2025-11-01', NULL, 'Assigned'),
(19, 5, 'Sang', '2025-11-01', NULL, 'Assigned'),
(20, 4, 'Sang', '2025-11-01', NULL, 'Assigned'),
(21, 5, 'Sang', '2025-11-01', NULL, 'Assigned');

-- Chuyến 3 (maChuyenXe=3) sử dụng các trạm 3 và 6: hiện có 1 -> thêm 9
INSERT INTO phanBoHocSinhTram (maHocSinh, maDiemDung, loaiPhanBo, thoiGianBatDau, thoiGianKetThuc, trangThai) VALUES
-- Trip 3 additions (students 22..30)
(22, 3, 'Chieu', '2025-11-01', NULL, 'Assigned'),
(23, 6, 'Chieu', '2025-11-01', NULL, 'Assigned'),
(24, 3, 'Chieu', '2025-11-01', NULL, 'Assigned'),
(25, 6, 'Chieu', '2025-11-01', NULL, 'Assigned'),
(26, 3, 'Chieu', '2025-11-01', NULL, 'Assigned'),
(27, 6, 'Chieu', '2025-11-01', NULL, 'Assigned'),
(28, 3, 'Chieu', '2025-11-01', NULL, 'Assigned'),
(29, 6, 'Chieu', '2025-11-01', NULL, 'Assigned'),
(30, 3, 'Chieu', '2025-11-01', NULL, 'Assigned');

-- 6. Theo dõi vị trí, cảnh báo & thông báo mẫu
INSERT INTO viTriChuyenXe (maChuyenXe, maViTriThuc, thoiGianGhiNhan) VALUES
(1, 1, '2025-11-18 06:32:00'),
(1, 2, '2025-11-18 06:45:00'),
(3, 6, '2025-11-18 16:05:10');

INSERT INTO canhBao (maTaiXe, noiDung, thoiGianTao) VALUES
(1, 'Kẹt xe tại Nguyen Hue, dự kiến trễ 10 phút.', '2025-11-18 06:40:00'),
(2, 'Hoc sinh Le Gia Khang (ID 3) báo vắng.', '2025-11-18 06:55:00');

INSERT INTO chiTietCanhBao (maCanhBao, maPhuHuynh) VALUES
(1, 1),
(1, 6),
(2, 3);

INSERT INTO thongBao (maQuanLyXe, noiDung, thoiGianTao) VALUES
(1, 'Tat ca tai xe vui long hoan tat bao cao xe truoc 17h thu 6.', '2025-11-18 09:00:00'),
(2, 'Phu huynh luu y: Truong nghi ngay 20/11.', '2025-11-18 11:30:00');

INSERT INTO chiTietThongBao (maThongBao, maTaiKhoan) VALUES
(1, 3),
(1, 4),
(1, 5),
(2, 6),
(2, 7),
(2, 8),
(2, 9),
(2, 10),
(2, 11);
