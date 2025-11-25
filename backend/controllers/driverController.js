const db = require('../config/db');

const getStudentsByTrip = (req, res) => {
  const { tripId } = req.params;
  const driverId = req.user.maTaiXe;

  const verifyTripSql = `
    SELECT maChuyenXe
    FROM chuyenXe
    WHERE maChuyenXe = ? AND maTaiXe = ?
  `;

  db.query(verifyTripSql, [tripId, driverId], (err, tripRows) => {
    if (err) {
      console.error('Lỗi kiểm tra chuyến xe:', err);
      return res.status(500).json({ message: 'Lỗi hệ thống khi kiểm tra quyền.' });
    }

    if (tripRows.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền xem thông tin chuyến xe này.' });
    }

    const studentsSql = `
  SELECT DISTINCT
    hs.maHocSinh,
    hs.tenHocSinh,
    hs.anhHocSinh,
    hs.lop,
    COALESCE(pbhst.trangThai, 'Assigned') AS trangThai,
    dc.soNha,
    dc.duong,
    dc.phuongXa,
    dc.quanHuyen,
    dc.thanhPho,
    CONCAT_WS(', ', dc.soNha, dc.duong, dc.phuongXa, dc.quanHuyen, dc.thanhPho) AS diaChi,
    vt.kinhDo,
    vt.viDo,
    dd.tenDiemDung,
    pbtx.thoiGianDuKien,
    pbtx.maPhanBoTramXe,
    pbtx.thuTuDon -- THÊM CỘT NÀY VÀO ĐÂY
  FROM phanBoTramXe pbtx
  JOIN phanBoHocSinhTram pbhst ON pbtx.maDiemDung = pbhst.maDiemDung
  JOIN hocSinh hs ON pbhst.maHocSinh = hs.maHocSinh
  LEFT JOIN diaChi dc ON hs.maDiaChi = dc.maDiaChi
  LEFT JOIN viTriThuc vt ON dc.maViTriThuc = vt.maViTriThuc
  LEFT JOIN diemDung dd ON pbtx.maDiemDung = dd.maDiemDung
  WHERE pbtx.maChuyenXe = ?
  ORDER BY pbtx.thuTuDon ASC, hs.tenHocSinh ASC
`;

    db.query(studentsSql, [tripId], (err2, rows) => {
      if (err2) {
        console.error('Lỗi lấy danh sách học sinh:', err2);
        return res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách học sinh.' });
      }
      return res.status(200).json(rows);
    });
  });
};

const getLichTrinh = (req, res) => {
  const state = 'InProgress';
  const driverId = req.user.maTaiXe;
  const day = new Date().toISOString().split('T')[0];
  
  const query = `
    SELECT cx.maChuyenXe, lt.maLichTrinh, lt.ngay, lt.thoiGianDi, lt.thoiGianDen
    FROM chuyenXe cx
    JOIN lichTrinh lt ON cx.maLichTrinh = lt.maLichTrinh
    WHERE cx.trangThai = ?
      AND lt.ngay = ?
      AND cx.maTaiXe = ?
    ORDER BY lt.thoiGianDi
    LIMIT 1;
  `;

  
  db.query(query, [state, day, driverId], (err, results) => {
    if (err) {
      console.log('Lỗi khi truy vấn lịch trình:', err);
      return res.status(500).json({ error: 'Lỗi server khi truy vấn lịch trình' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch trình phù hợp' });
    }

    const row = results[0];
    return res.status(200).json({
      ngay: row.ngay,
      maChuyenXe: row.maChuyenXe,
      maLichTrinh: row.maLichTrinh,
      thoiGianDi: row.thoiGianDi,
      thoiGianDen: row.thoiGianDen,
    });
    
  });
};

const getTaixeById = (req, res) =>{
  const driverId = req.user.maTaiXe;
  const query = `
    SELECT * FROM taiXe
    WHERE taiXe.maTaiXe = ?;
  `;
  
  db.query(query, [driverId], (err, results) =>{
    if (err) {
      console.log('Lỗi khi truy vấn lịch trình:', err);
      return res.status(500).json({ error: 'Lỗi server khi truy vấn tài xế' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài xế phù hợp' });
    }

    const row = results[0];
    return res.status(200).json({
      maTaiXe: row.maTaiXe,
      tenTaiXe: row.tenTaiXe,
      ngaySinh: row.ngaySinh,
      anhTaiXe: row.anhTaiXe,
      soDienThoai: row.soDienThoai,
      soBangLai: row.soBangLai,
      trangThai: row.trangThai,
      maTaiKhoan: row.maTaiKhoan,
    });

  });
}

const getTaiKhoanById = (req,res) =>{
  const { accountId } = req.params;

  const query = `
    SELECT tenDangNhap, matKhau, ngayTao, trangThai  FROM taiKhoan
    WHERE taiKhoan.mataiKhoan = ?;
  `;
  
  db.query(query, [accountId], (err, results) =>{
    if (err) {
      console.log('Lỗi khi truy vấn tài khoản:', err);
      return res.status(500).json({ error: 'Lỗi server khi truy vấn tài khoản' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản phù hợp' });
    }

    const row = results[0];
    return res.status(200).json({
      tenDangNhap: row.tenDangNhap, 
      matKhau: row.matKhau, 
      ngayTao: row.ngayTao, 
      trangThai: row.trangThai,
    });

  });
}

const getLichTrinhTrongNgay = (req, res) => {
  // Assuming req.user contains authenticated user's info, including their driver ID
  const driverId =  req.user.maTaiXe; 
  // Get the current date in YYYY-MM-DD format, adjusted for local timezone if necessary
  const day = new Date().toISOString().split('T')[0];

  const query = `
    SELECT 
      cx.maChuyenXe,
      lt.maLichTrinh,
      td.tenTuyenDuong,
      lt.thoiGianDi,
      lt.thoiGianDen,
      cx.trangThai,
      -- Use a subquery to accurately count unique students for this specific trip
      (
        SELECT COUNT(DISTINCT pbhst.maHocSinh)
        FROM phanBoTramXe pbtx
        JOIN phanBoHocSinhTram pbhst ON pbtx.maDiemDung = pbhst.maDiemDung
        WHERE pbtx.maChuyenXe = cx.maChuyenXe
          
          -- Ensure student's assignment is active for the trip's date
          AND (pbhst.thoiGianBatDau IS NULL OR pbhst.thoiGianBatDau <= lt.ngay)
          AND (pbhst.thoiGianKetThuc IS NULL OR pbhst.thoiGianKetThuc >= lt.ngay)
      ) AS soLuongHocSinh
    FROM chuyenXe cx
    JOIN lichTrinh lt ON cx.maLichTrinh = lt.maLichTrinh
    JOIN tuyenDuong td ON cx.maTuyenDuong = td.maTuyenDuong
    WHERE 
      lt.ngay = ? AND cx.maTaiXe = ?
    GROUP BY 
      cx.maChuyenXe, lt.maLichTrinh, td.tenTuyenDuong, lt.thoiGianDi, lt.thoiGianDen, cx.trangThai
    ORDER BY 
      lt.thoiGianDi ASC;
  `;

  db.query(query, [day, driverId], (err, results) => {
    if (err) {
      console.error('Lỗi khi truy vấn danh sách lịch trình:', err);
      return res.status(500).json({ error: 'Lỗi server khi truy vấn lịch trình trong ngày' });
    }
    return res.status(200).json({ ngay: day, lichTrinh: results });
  });
};

const getAllNotificationByIdAccount = (req, res) => {
  const accountId = req.user?.maTaiKhoan;

  if (!accountId) {
    return res.status(401).json({ error: 'Thiếu thông tin tài khoản trong token' });
  }

  const query = `
    select qlx.tenQuanLyXe, tb.thoiGianTao, tb.noiDung
    from chiTietThongBao cttb
    join thongBao tb on cttb.maThongBao = tb.maThongBao
    join quanLyXe qlx on qlx.maQuanLyXe = tb.maQuanLyXe
    where cttb.maTaiKhoan = ?
    order by tb.thoiGianTao DESC;
  `;

  db.query(query, [accountId], (err, results) => {
      console.log(query);
    if (err) {
      console.log('Lỗi khi truy vấn danh sách lịch trình:', err);
      return res.status(500).json({ error: 'Lỗi server khi truy vấn lịch trình trong ngày' });
    }
    return res.status(200).json({results});
  });
};

const getAllWarningByIdDriver = (req, res) => {
  const driverId =  req.user.maTaiXe;

  if (!driverId) {
    return res.status(401).json({ error: 'Không phải tài xế. không được xem' });
  }

  const query = `
      select cb.thoiGianTao, cb.noiDung, ph.tenPhuHuynh
      from canhBao cb
      join chiTietCanhBao ctcb on ctcb.maCanhBao = cb.maCanhBao
      join phuHuynh ph on ph.maPhuHuynh = ctcb.maPhuHuynh
      where cb.maTaiXe = ?
      order by cb.thoiGianTao DESC;
  `;

  db.query(query, [driverId], (err, results) => {
    if (err) {
      console.log('Lỗi khi truy vấn danh sách lịch trình:', err);
      return res.status(500).json({ error: 'Lỗi server khi truy vấn lịch trình trong ngày' });
    }
    return res.status(200).json({results});
  });
};

const getAllParent = (req, res) => {
  query =  `
    select * from phuHuynh
    order by tenPhuHuynh;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.log('Lỗi khi truy vấn danh sách lịch trình:', err);
      return res.status(500).json({ error: 'Lỗi server khi truy vấn lịch trình trong ngày' });
    }
    return res.status(200).json({results});
  });  
};

const sendWarning = async (req, res) => {
  try {
    const { noiDung, parentIds } = req.body;
    const driverId = req.user?.maTaiXe ;

    if (!noiDung || !noiDung.trim()) {
      return res.status(400).json({ message: "Nội dung không được để trống" });
    }

    if (!parentIds || parentIds.length === 0) {
      return res.status(400).json({ message: "Danh sách phụ huynh rỗng" });
    }

    const warningQuery = `
      INSERT INTO canhBao (maTaiXe, noiDung)
      VALUES (?, ?);
    `;

    db.query(warningQuery, [driverId, noiDung.trim()], (err, result) => {
      if (err) {
        console.error("Lỗi khi tạo cảnh báo:", err);
        return res.status(500).json({ message: "Lỗi server khi tạo cảnh báo" });
      }

      const maCanhBao = result.insertId;

      const detailValues = parentIds.map(id => [maCanhBao, id]);

      const detailQuery = `
        INSERT INTO chiTietCanhBao (maCanhBao, maPhuHuynh)
        VALUES ?;
      `;

      db.query(detailQuery, [detailValues], (err2) => {
        if (err2) {
          console.error("Lỗi khi chèn chi tiết cảnh báo:", err2);
          return res.status(500).json({ message: "Lỗi server khi gửi cảnh báo" });
        }

        return res.status(201).json({
          message: "Gửi cảnh báo thành công",
          maCanhBao,
        });
      });
    });

  } catch (error) {
    console.error("Lỗi gửi cảnh báo:", error);
    res.status(500).json({ message: "Lỗi server khi gửi cảnh báo" });
  }
};

const sendInfoDriver = async (req, res) =>{
  const { tenTaiXe, ngaySinh, soDienThoai, soBangLai, tenDangNhap, matKhau, ngayTao, trangThai } = req.body;
  driverId = req.user?.maTaiXe ;
  accountId = req.user?.maTaiKhoan ;

  const query1 = `
    UPDATE taiXe
    SET tenTaiXe = ?, ngaySinh = ?, soDienThoai = ?, soBangLai = ?
    WHERE maTaiXe = ?;
  `;

  const query2 = `
    UPDATE taiKhoan
    SET tenDangNhap = ?, matKhau = ?, ngayTao = ?, trangThai = ?
    WHERE maTaiKhoan = ?;
  `;

  db.query(query1, [tenTaiXe, ngaySinh, soDienThoai, soBangLai, driverId], (err) =>{
    if (err) {
      console.log('Lỗi khi cập nhật thông tin tài xế:', err);
      return res.status(500).json({ error: 'Lỗi server khi cập nhật thông tin tài xế' });
    }})

  db.query(query2, [tenDangNhap, matKhau, ngayTao, trangThai, accountId], (err2) =>{
    if (err2) {
      console.log('Lỗi khi cập nhật thông tin tài khoản:', err2);
      return res.status(500).json({ error: 'Lỗi server khi cập nhật thông tin tài khoản' });
    }})

}

const getStudentStatsForActiveTrip = (req, res) => {
  const driverId = req.user?.maTaiXe;
  if (!driverId) {
    return res.status(401).json({ message: 'Thiếu mã tài xế trong token' });
  }

  // Lấy chuyến xe đang InProgress của tài xế (giả sử 1 chuyến đang chạy)
  const activeTripQuery = `
    SELECT maChuyenXe
    FROM chuyenXe
    WHERE maTaiXe = ? AND trangThai = 'InProgress'
    LIMIT 1;
  `;

  db.query(activeTripQuery, [driverId], (err, tripResults) => {
    if (err) {
      console.error('Lỗi truy vấn chuyến xe đang chạy:', err);
      return res.status(500).json({ message: 'Lỗi server khi lấy chuyến xe đang chạy' });
    }
    if (!tripResults || tripResults.length === 0) {
      return res.status(200).json({
        total: 0,
        pickedUp: 0,
        droppedOff: 0,
        assigned: 0,
        other: 0,
        maChuyenXe: null,
      });
    }

    const maChuyenXe = tripResults[0].maChuyenXe;

    // Thống kê theo trạng thái dựa trên bảng phân bổ học sinh - trạm
    const statsQuery = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN pbhst.trangThai = 'Picked Up' THEN 1 ELSE 0 END) AS pickedUp,
        SUM(CASE WHEN pbhst.trangThai = 'Dropped Off' THEN 1 ELSE 0 END) AS droppedOff,
        SUM(CASE WHEN pbhst.trangThai IN ('Assigned','Active') THEN 1 ELSE 0 END) AS assigned,
        SUM(CASE WHEN pbhst.trangThai NOT IN ('Picked Up','Dropped Off','Assigned','Active') THEN 1 ELSE 0 END) AS other
      FROM phanBoTramXe pbtx
      JOIN phanBoHocSinhTram pbhst ON pbtx.maDiemDung = pbhst.maDiemDung
      WHERE pbtx.maChuyenXe = ?;
    `;

    db.query(statsQuery, [maChuyenXe], (err2, statsResults) => {
      if (err2) {
        console.error('Lỗi truy vấn thống kê học sinh:', err2);
        return res.status(500).json({ message: 'Lỗi server khi lấy thống kê học sinh' });
      }

      const row = statsResults[0] || {};
      return res.status(200).json({
        maChuyenXe,
        total: row.total || 0,
        pickedUp: row.pickedUp || 0,
        droppedOff: row.droppedOff || 0,
        assigned: row.assigned || 0,
        other: row.other || 0,
      });
    });
  });
};

const updateStudentStatus = (req, res) => {
  try {
    // Cho phép nhận từ params hoặc body
    const tripId = req.params.tripId || req.body.tripId;
    const maHocSinh = req.params.maHocSinh || req.body.maHocSinh;
    const trangThai = req.body.trangThai;
    const driverId = req.user?.maTaiXe;

    if (!driverId) {
      return res.status(401).json({ message: 'Thiếu thông tin tài xế trong token' });
    }
    if (!tripId || !maHocSinh || !trangThai) {
      return res.status(400).json({ message: 'Thiếu tham số tripId, maHocSinh hoặc trangThai' });
    }

    // Xác thực chuyến xe thuộc về tài xế hiện tại
    const authQuery = `
      SELECT 1 FROM chuyenXe WHERE maChuyenXe = ? AND maTaiXe = ? LIMIT 1;
    `;

    db.query(authQuery, [tripId, driverId], (authErr, authRows) => {
      if (authErr) {
        console.error('Lỗi kiểm tra quyền chuyến xe:', authErr);
        return res.status(500).json({ message: 'Lỗi server khi kiểm tra quyền chuyến xe' });
      }
      if (!authRows || authRows.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật chuyến xe này' });
      }

      // Cập nhật trạng thái học sinh trong chuyến xe theo schema mới
      const updateStudentQuery = `
        UPDATE phanBoHocSinhTram pbhst
        JOIN phanBoTramXe pbtx ON pbtx.maDiemDung = pbhst.maDiemDung
        SET pbhst.trangThai = ?
        WHERE pbtx.maChuyenXe = ? AND pbhst.maHocSinh = ?;
      `;

      db.query(updateStudentQuery, [trangThai, tripId, maHocSinh], (updErr, updResult) => {
        if (updErr) {
          console.error('Lỗi cập nhật trạng thái học sinh:', updErr);
          return res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái học sinh' });
        }
        if (updResult.affectedRows === 0) {
          return res.status(404).json({ message: 'Không tìm thấy phân bổ học sinh cho chuyến xe' });
        }

        // Kiểm tra tất cả học sinh đã "Dropped Off" chưa theo schema mới
        const checkAllDroppedQuery = `
          SELECT 
            SUM(CASE WHEN pbhst.trangThai = 'Dropped Off' THEN 1 ELSE 0 END) AS doneStudent,
            COUNT(*) AS total
          FROM phanBoTramXe pbtx
          JOIN phanBoHocSinhTram pbhst ON pbtx.maDiemDung = pbhst.maDiemDung
          WHERE pbtx.maChuyenXe = ?;
        `;

        db.query(checkAllDroppedQuery, [tripId], (chkErr, chkRows) => {
          if (chkErr) {
            console.error('Lỗi kiểm tra trạng thái học sinh:', chkErr);
            return res.status(500).json({ message: 'Lỗi server khi kiểm tra trạng thái học sinh' });
          }

          const row = chkRows && chkRows[0] ? chkRows[0] : { doneStudent: 0, total: 0 };
          const allDropped = Number(row.total) > 0 && Number(row.doneStudent) === Number(row.total);

          if (!allDropped) {
            return res.status(200).json({
              message: 'Cập nhật trạng thái học sinh thành công',
              completed: false,
              progress: { droppedOff: Number(row.doneStudent) || 0, total: Number(row.total) || 0 },
            });
          }

          // Tất cả đã xuống xe -> cập nhật trạng thái chuyến xe thành Completed
          const completeTripQuery = `
            UPDATE chuyenXe
            SET trangThai = 'Completed'
            WHERE maChuyenXe = ?;
          `;

          db.query(completeTripQuery, [tripId], (compErr) => {
            if (compErr) {
              console.error('Lỗi cập nhật trạng thái chuyến xe:', compErr);
              return res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái chuyến xe' });
            }

            return res.status(200).json({
              message: 'Cập nhật trạng thái học sinh thành công. Chuyến xe đã hoàn tất.',
              completed: true,
              progress: { droppedOff: Number(row.doneStudent) || 0, total: Number(row.total) || 0 },
            });
          });
        });
      });
    });
  } catch (e) {
    console.error('Lỗi không xác định khi cập nhật trạng thái học sinh:', e);
    return res.status(500).json({ message: 'Lỗi server' });
  }
}

const startScheduledTrips = (req, res) => {
  const driverId = req.user.maTaiXe;
  const day = new Date().toISOString().split('T')[0];

  const query = `
    UPDATE chuyenXe cx
    JOIN lichTrinh lt ON cx.maLichTrinh = lt.maLichTrinh
    SET cx.trangThai = 'InProgress'
    WHERE cx.trangThai = 'Scheduled'
      AND lt.ngay = ?
      AND cx.maTaiXe = ?;
  `;

  db.query(query, [day, driverId], (err, result) => {
    if (err) {
      console.error('Lỗi khi cập nhật trạng thái chuyến xe:', err);
      return res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái chuyến xe' });
    }

    return res.status(200).json({
      message: 'Đã cập nhật các chuyến xe Scheduled sang InProgress',
      affectedRows: result.affectedRows
    });
  });
};

module.exports = {
  getStudentsByTrip,
  getLichTrinh,
  getTaixeById,
  getTaiKhoanById,
  getLichTrinhTrongNgay,
  getAllNotificationByIdAccount,
  getAllWarningByIdDriver,
  getAllParent,
  sendWarning,
  sendInfoDriver,
  getStudentStatsForActiveTrip,
  updateStudentStatus,
  startScheduledTrips,
};









