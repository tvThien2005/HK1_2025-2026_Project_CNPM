
USE quanlyxebus;

-- ***************************************************************
-- 1. BẢNG QUẢN LÝ ĐỊA CHỈ (ĐÃ THÊM)
-- ***************************************************************

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

CREATE TABLE diemDung (
    maDiemDung INT PRIMARY KEY AUTO_INCREMENT,
    tenDiemDung VARCHAR(255),
    maTuyenDuong INT,
    FOREIGN KEY (maTuyenDuong) REFERENCES tuyenDuong(maTuyenDuong)
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

CREATE TABLE phanBoHocSinh (
    maPhanBoHocSinh INT PRIMARY KEY AUTO_INCREMENT,
    maChuyenXe INT NOT NULL,
    maHocSinh INT NOT NULL,
    trangThai VARCHAR(50),
    FOREIGN KEY (maChuyenXe) REFERENCES chuyenXe(maChuyenXe),
    FOREIGN KEY (maHocSinh) REFERENCES hocSinh(maHocSinh)
);

-- ***************************************************************
-- 5. THEO DÕI VỊ TRÍ
-- ***************************************************************

CREATE TABLE viTriChuyenXe (
    maViTriChuyenXe INT PRIMARY KEY AUTO_INCREMENT,
    maChuyenXe INT NOT NULL,
    maViTriThuc INT NOT NULL,
    thoiGianGhiNhan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maChuyenXe) REFERENCES chuyenXe(maChuyenXe),
    FOREIGN KEY (maViTriThuc) REFERENCES viTriThuc(maViTriThuc)
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
-- 1. BẢNG QUẢN LÝ ĐỊA CHỈ
-- ***************************************************************

-- Thêm vị trí thực (Tọa độ)
INSERT INTO viTriThuc (kinhDo, viDo) VALUES
(106.70000000, 10.77600000), -- Vị trí 1: Quận 1
(106.70234000, 10.78012000), -- Vị trí 2: Quận 1
(106.71045000, 10.77555000), -- Vị trí 3: Quận 3
(106.69588000, 10.77043000), -- Vị trí 4: Quận 1
(106.68999000, 10.76822000), -- Vị trí 5: Quận 1
(106.70567000, 10.77234000), -- Vị trí 6: Bình Thạnh
(106.71222000, 10.78111000); -- Vị trí 7: Bình Thạnh

-- Thêm địa chỉ chi tiết (Liên kết với vị trí thực)
-- (Dùng cho học sinh)
INSERT INTO diaChi (soNha, duong, phuongXa, quanHuyen, thanhPho, maViTriThuc) VALUES
('12A','Nguyen Hue','Ben Nghe','District 1','Ho Chi Minh City',1),
('45','Le Loi','Ben Thanh','District 1','Ho Chi Minh City',2),
('89','Pasteur','Ward 6','District 3','Ho Chi Minh City',3),
('102','Hai Ba Trung','Tan Dinh','District 1','Ho Chi Minh City',4),
('17','Tran Hung Dao','Co Giang','District 1','Ho Chi Minh City',5),
('256','Dien Bien Phu','Ward 17','Binh Thanh','Ho Chi Minh City',6);

-- ***************************************************************
-- 2. BẢNG QUẢN LÝ TÀI KHOẢN VÀ NGƯỜI DÙNG
-- ***************************************************************

-- Thêm tài khoản
INSERT INTO taiKhoan (tenDangNhap, matKhau, capDo, trangThai, block) VALUES
-- Quản lý (ID: 1, 2)
('manager_A', 'pass123', 'Manager', 'Active', 0),
('manager_B', 'pass123', 'Manager', 'Active', 0),
-- Tài xế (ID: 3, 4, 5)
('driver_C', 'pass123', 'Driver', 'Active', 0),
('driver_D', 'pass123', 'Driver', 'Active', 0),
('driver_E', 'pass123', 'Driver', 'Inactive', 0),
-- Phụ huynh (ID: 6, 7, 8, 9, 10, 11)
('parent_An', 'pass123', 'Parent', 'Active', 0),
('parent_Ngoc', 'pass123', 'Parent', 'Active', 0),
('parent_Khang', 'pass123', 'Parent', 'Active', 0),
('parent_Linh', 'pass123', 'Parent', 'Active', 0),
('parent_Minh', 'pass123', 'Parent', 'Active', 0),
('parent_Duy', 'pass123', 'Parent', 'Active', 0);


-- Thêm Quản lý xe (Liên kết với tài khoản)
INSERT INTO quanLyXe (tenQuanLyXe, soDienThoai, ngaySinh, trangThai, maTaiKhoan) VALUES
('Nguyen Van Quan', '0901111111', '1980-05-15', 'Active', 1),
('Tran Thi Ly', '0902222222', '1982-08-20', 'Active', 2);

-- Thêm Tài xế (Liên kết với tài khoản)
INSERT INTO taiXe (tenTaiXe, ngaySinh, anhTaiXe, soDienThoai, soBangLai, trangThai, maTaiKhoan) VALUES
('Le Van C', '1985-03-10', '/img/driverC.jpg', '0903333333', 'B2-00123', 'Active', 3),
('Pham Thi D', '1988-07-25', '/img/driverD.jpg', '0904444444', 'B2-00234', 'Active', 4),
('Hoang Van E', '1990-12-05', '/img/driverE.jpg', '0905555555', 'B2-00345', 'Inactive', 5);

-- Thêm Học sinh (Liên kết với địa chỉ)
INSERT INTO hocSinh (tenHocSinh, anhHocSinh, lop, trangThai, maDiaChi) VALUES
('Nguyen Minh An', '/img/an.jpg', '1A', 'Active', 1),
('Tran Bao Ngoc', '/img/ngoc.jpg', '2B', 'Active', 2),
('Le Gia Khang', '/img/khang.jpg', '3C', 'Active', 3),
('Pham Thu Linh', '/img/linh.jpg', '1A', 'Active', 4),
('Vu Duc Minh', '/img/minh.jpg', '4D', 'Active', 5),
('Ly Chi Duy', '/img/duy.jpg', '5A', 'Active', 6);

-- Thêm Phụ huynh (Liên kết với tài khoản và học sinh)
INSERT INTO phuHuynh (tenPhuHuynh, soDienThoai, ngaySinh, maTaiKhoan, maHocSinh, trangThai) VALUES
('Nguyen Van Bo', '0906666666', '1978-01-15', 6, 1, 'Active'),
('Tran Thi Me', '0907777777', '1980-03-20', 7, 2, 'Active'),
('Le Van Cha', '0908888888', '1975-06-10', 8, 3, 'Active'),
('Pham Thi Me', '0909999999', '1982-09-05', 9, 4, 'Active'),
('Vu Van Bo', '0901234567', '1979-11-11', 10, 5, 'Active'),
('Ly Thi Me', '0907654321', '1981-12-12', 11, 6, 'Active');

-- ***************************************************************
-- 3. PHƯƠNG TIỆN & TUYẾN ĐƯỜNG
-- ***************************************************************

-- Thêm Xe buýt
INSERT INTO xeBuyt (bienSoXe, sucChua, mauXe, trangThai) VALUES
('51A-12345', 40, 'Yellow', 'Active'),
('51B-67890', 35, 'Blue', 'Active'),
('51C-54321', 45, 'White', 'Maintenance'),
('51D-98765', 40, 'Red', 'Active');

-- Thêm Tuyến đường
INSERT INTO tuyenDuong (tenTuyenDuong, loai) VALUES
('Route 1: District 1 - Binh Thanh (Morning)', 'Main'),
('Route 2: District 3 - District 1 (Morning)', 'Main'),
('Route 3: Binh Thanh - District 1 (Afternoon)', 'Secondary');

-- Thêm Điểm dừng
INSERT INTO diemDung (tenDiemDung, maTuyenDuong) VALUES
('Ben Thanh Market', 1),
('Notre Dame Cathedral', 1),
('Hang Xanh Intersection', 1),
('War Remnants Museum', 2),
('Turtle Lake', 2),
('Landmark 81', 3),
('City Zoo', 3);

-- ***************************************************************
-- 4. LỊCH TRÌNH & CHUYẾN XE
-- ***************************************************************

-- Thêm Lịch trình
INSERT INTO lichTrinh (ngay, thoiGianDi, thoiGianDen) VALUES
('2025-11-10', '06:30:00', '07:15:00'), -- Lịch 1 (Sáng T2)
('2025-11-10', '06:45:00', '07:30:00'), -- Lịch 2 (Sáng T2)
('2025-11-10', '16:00:00', '16:45:00'), -- Lịch 3 (Chiều T2)
('2025-11-11', '06:30:00', '07:15:00'); -- Lịch 4 (Sáng T3)

-- Thêm Chuyến xe (Kết nối Xe, Tài xế, Lịch trình, Tuyến đường)
INSERT INTO chuyenXe (maXeBuyt, maTaiXe, maLichTrinh, maTuyenDuong, trangThai) VALUES
(1, 1, 1, 1, 'Completed'), -- Xe 1, Tài xế 1, Lịch 1, Tuyến 1
(2, 2, 2, 2, 'Completed'), -- Xe 2, Tài xế 2, Lịch 2, Tuyến 2
(1, 1, 3, 3, 'InProgress'), -- Xe 1, Tài xế 1, Lịch 3, Tuyến 3
(4, 2, 4, 1, 'Scheduled'); -- Xe 4, Tài xế 2, Lịch 4, Tuyến 1

-- Thêm Phân bổ học sinh (Kết nối Chuyến xe và Học sinh)
INSERT INTO phanBoHocSinh (maChuyenXe, maHocSinh, trangThai) VALUES
(1, 1, 'Dropped Off'), -- Chuyến 1, Học sinh 1
(1, 6, 'Dropped Off'), -- Chuyến 1, Học sinh 6
(2, 2, 'Dropped Off'), -- Chuyến 2, Học sinh 2
(2, 3, 'Dropped Off'), -- Chuyến 2, Học sinh 3
(3, 1, 'Picked Up'), -- Chuyến 3, Học sinh 1 (Đang trên xe)
(3, 6, 'Picked Up'), -- Chuyến 3, Học sinh 6 (Đang trên xe)
(4, 2, 'Assigned'), -- Chuyến 4, Học sinh 2 (Chưa tới giờ)
(4, 3, 'Assigned'), -- Chuyến 4, Học sinh 3 (Chưa tới giờ)
(4, 4, 'Assigned'), -- Chuyến 4, Học sinh 4 (Chưa tới giờ)
(4, 5, 'Assigned'); -- Chuyến 4, Học sinh 5 (Chưa tới giờ)

-- ***************************************************************
-- 5. THEO DÕI VỊ TRÍ
-- ***************************************************************

-- Thêm Vị trí chuyến xe (Chuyến 3 đang InProgress)
INSERT INTO viTriChuyenXe (maChuyenXe, maViTriThuc, thoiGianGhiNhan) VALUES
(3, 6, '2025-11-10 16:05:10'), -- Chuyến 3 tại Vị trí 6
(3, 7, '2025-11-10 16:15:30'), -- Chuyến 3 tại Vị trí 7
(1, 1, '2025-11-10 06:32:00'), -- Vị trí cũ của chuyến 1
(1, 2, '2025-11-10 06:40:00'); -- Vị trí cũ của chuyến 1

-- ***************************************************************
-- 6. THÔNG BÁO & CẢNH BÁO
-- ***************************************************************

-- Thêm Cảnh báo (Từ tài xế)
INSERT INTO canhBao (maTaiXe, noiDung, thoiGianTao) VALUES
(1, 'Heavy traffic on Dien Bien Phu street, estimated 10 minutes delay.', '2025-11-10 16:10:00'),
(2, 'Student Le Gia Khang (ID 3) is absent today.', '2025-11-10 06:50:00');

-- Thêm Chi tiết cảnh báo (Gửi tới phụ huynh nào?)
INSERT INTO chiTietCanhBao (maCanhBao, maPhuHuynh) VALUES
(1, 1), -- Gửi cảnh báo 1 (trễ xe) cho Phụ huynh 1 (của HS 1)
(1, 6), -- Gửi cảnh báo 1 (trễ xe) cho Phụ huynh 6 (của HS 6)
(2, 3); -- Gửi cảnh báo 2 (vắng) cho Phụ huynh 3 (của HS 3)

-- Thêm Thông báo (Từ quản lý)
INSERT INTO thongBao (maQuanLyXe, noiDung, thoiGianTao) VALUES
(1, 'All drivers: Please complete the weekly vehicle check report by EOD Friday.', '2025-11-10 09:00:00'),
(2, 'Parents: School will be closed on Nov 20th for Teachers'' Day.', '2025-11-10 11:30:00');

-- Thêm Chi tiết thông báo (Gửi tới tài khoản nào?)
INSERT INTO chiTietThongBao (maThongBao, maTaiKhoan) VALUES
(1, 3), -- Gửi thông báo 1 cho Tài xế C (ID 3)
(1, 4), -- Gửi thông báo 1 cho Tài xế D (ID 4)
(1, 5), -- Gửi thông báo 1 cho Tài xế E (ID 5)
(2, 6), -- Gửi thông báo 2 cho Phụ huynh 1 (ID 6)
(2, 7), -- Gửi thông báo 2 cho Phụ huynh 2 (ID 7)
(2, 8), -- Gửi thông báo 2 cho Phụ huynh 3 (ID 8)
(2, 9), -- Gửi thông báo 2 cho Phụ huynh 4 (ID 9)
(2, 10), -- Gửi thông báo 2 cho Phụ huynh 5 (ID 10)
(2, 11); -- Gửi thông báo 2 cho Phụ huynh 6 (ID 11)

-- ***************************************************************
-- 7. BỔ SUNG NHIỀU CHUYẾN ĐI VÀ HỌC SINH (~10 HS/CHUYẾN)
-- ***************************************************************

-- Thêm thêm Học sinh (sử dụng lại các địa chỉ hiện có 1..6)
INSERT INTO hocSinh (tenHocSinh, anhHocSinh, lop, trangThai, maDiaChi) VALUES
('Nguyen Hoai Phong', '/img/hs07.jpg', '2A', 'Active', 1),
('Tran Gia Huy', '/img/hs08.jpg', '3B', 'Active', 2),
('Le Minh Chau', '/img/hs09.jpg', '4A', 'Active', 3),
('Pham Gia Han', '/img/hs10.jpg', '5C', 'Active', 4),
('Vo Bao Long', '/img/hs11.jpg', '2C', 'Active', 5),
('Do Bao Anh', '/img/hs12.jpg', '1B', 'Active', 6),
('Bui Hoang Khang', '/img/hs13.jpg', '3A', 'Active', 1),
('Phan Bao Tran', '/img/hs14.jpg', '4B', 'Active', 2),
('Dang Nhat Minh', '/img/hs15.jpg', '2D', 'Active', 3),
('Ngo Khanh Linh', '/img/hs16.jpg', '1C', 'Active', 4),
('Hoang Thi An', '/img/hs17.jpg', '4D', 'Active', 5),
('Truong Bao Han', '/img/hs18.jpg', '5B', 'Active', 6),
('Vu Hai Dang', '/img/hs19.jpg', '3C', 'Active', 1),
('Ly My Duyen', '/img/hs20.jpg', '2B', 'Active', 2),
('Nguyen Bao Chau', '/img/hs21.jpg', '1A', 'Active', 3),
('Tran Gia Phuc', '/img/hs22.jpg', '5A', 'Active', 4),
('Le Kieu My', '/img/hs23.jpg', '4C', 'Active', 5),
('Pham Thanh Tam', '/img/hs24.jpg', '3D', 'Active', 6),
('Vo Duc Huy', '/img/hs25.jpg', '2A', 'Active', 1),
('Do Thi Kim', '/img/hs26.jpg', '1D', 'Active', 2),
('Bui Ngoc Ha', '/img/hs27.jpg', '5C', 'Active', 3),
('Phan Quoc Viet', '/img/hs28.jpg', '4B', 'Active', 4),
('Dang Bao Thy', '/img/hs29.jpg', '3A', 'Active', 5),
('Ngo Anh Khoa', '/img/hs30.jpg', '2C', 'Active', 6);

-- Thêm thêm Lịch trình cho các chuyến mới
INSERT INTO lichTrinh (ngay, thoiGianDi, thoiGianDen) VALUES
('2025-11-10', '07:00:00', '07:45:00'), -- ID 5
('2025-11-10', '07:15:00', '08:00:00'), -- ID 6
('2025-11-10', '07:30:00', '08:15:00'); -- ID 7

-- Thêm Chuyến xe mới (giả định ID chuyenXe: 5,6,7 tương ứng lichTrinh 5..7)
INSERT INTO chuyenXe (maXeBuyt, maTaiXe, maLichTrinh, maTuyenDuong, trangThai) VALUES
(1, 1, 5, 1, 'Scheduled'),
(2, 2, 6, 2, 'Scheduled'),
(3, 1, 7, 3, 'Scheduled');

-- Gán khoảng 10 học sinh cho mỗi chuyến mới
-- Chuyến 5: maChuyenXe = 5 -> học sinh 1..10 (nếu DB mới, các HS này tồn tại)
INSERT INTO phanBoHocSinh (maChuyenXe, maHocSinh, trangThai) VALUES
(5, 1, 'Assigned'),
(5, 2, 'Assigned'),
(5, 3, 'Assigned'),
(5, 4, 'Assigned'),
(5, 5, 'Assigned'),
(5, 6, 'Assigned'),
(5, 7, 'Assigned'),
(5, 8, 'Assigned'),
(5, 9, 'Assigned'),
(5, 10, 'Assigned');

-- Chuyến 6: maChuyenXe = 6 -> học sinh 11..20
INSERT INTO phanBoHocSinh (maChuyenXe, maHocSinh, trangThai) VALUES
(6, 11, 'Assigned'),
(6, 12, 'Assigned'),
(6, 13, 'Assigned'),
(6, 14, 'Assigned'),
(6, 15, 'Assigned'),
(6, 16, 'Assigned'),
(6, 17, 'Assigned'),
(6, 18, 'Assigned'),
(6, 19, 'Assigned'),
(6, 20, 'Assigned');

-- Chuyến 7: maChuyenXe = 7 -> học sinh 21..30
INSERT INTO phanBoHocSinh (maChuyenXe, maHocSinh, trangThai) VALUES
(7, 21, 'Assigned'),
(7, 22, 'Assigned'),
(7, 23, 'Assigned'),
(7, 24, 'Assigned'),
(7, 25, 'Assigned'),
(7, 26, 'Assigned'),
(7, 27, 'Assigned'),
(7, 28, 'Assigned'),
(7, 29, 'Assigned'),
(7, 30, 'Assigned');

-- ***************************************************************
-- 8. ĐỒNG BỘ TRẠNG THÁI: TẤT CẢ CHUYẾN = InProgress, TẤT CẢ HS = Assigned
-- ***************************************************************
-- Tắt safe updates trong phiên hiện tại để cho phép UPDATE hàng loạt
SET SQL_SAFE_UPDATES = 0;

-- Dùng điều kiện theo khóa chính để thỏa Workbench Safe Update Mode
UPDATE chuyenXe
SET trangThai = 'InProgress'
WHERE maChuyenXe > 0;

UPDATE phanBoHocSinh
SET trangThai = 'Assigned'
WHERE maPhanBoHocSinh > 0;

-- Bật lại safe updates nếu bạn muốn
SET SQL_SAFE_UPDATES = 1;

-- ***************************************************************
-- 9. CHUYỂN TẤT CẢ NGÀY LỊCH TRÌNH SANG HÔM NAY
-- ***************************************************************
SET SQL_SAFE_UPDATES = 0;
UPDATE lichTrinh
SET ngay = CURDATE()
WHERE maLichTrinh > 0;
SET SQL_SAFE_UPDATES = 1;