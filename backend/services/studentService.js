// services/studentService.js
const db = require("../config/db");
const { getCoordinatesFromAddress } = require("./geocodingService");

// Lấy tất cả học sinh KÈM địa chỉ
const getAllStudents = (callback) => {
  const query = `
    SELECT 
      hs.*,
      dc.soNha, 
      dc.duong, 
      dc.phuongXa, 
      dc.quanHuyen, 
      dc.thanhPho,
      vt.kinhDo,
      vt.viDo
    FROM hocsinh hs
    LEFT JOIN diachi dc ON hs.maDiaChi = dc.maDiaChi
    LEFT JOIN vitrithuc vt ON dc.maViTriThuc = vt.maViTriThuc
    WHERE hs.trangThai = 'Active'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn SQL:", err);
    }
    callback(err, results);
  });
};

// Lấy học sinh theo ID kèm địa chỉ
const getStudentById = (id, callback) => {
  const query = `
    SELECT 
      hs.*,
      dc.soNha, 
      dc.duong, 
      dc.phuongXa, 
      dc.quanHuyen, 
      dc.thanhPho,
      vt.kinhDo,
      vt.viDo
    FROM hocsinh hs
    LEFT JOIN diachi dc ON hs.maDiaChi = dc.maDiaChi
    LEFT JOIN vitrithuc vt ON dc.maViTriThuc = vt.maViTriThuc
    WHERE hs.maHocSinh = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("❌ Lỗi truy vấn SQL:", err);
    }
    callback(err, results[0]);
  });
};

// Xóa học sinh
const deleteStudent = (id, callback) => {
  db.query("DELETE FROM hocSinh WHERE maHocSinh = ?", [id], (err, results) => {
    callback(err, results);
  });
};

// Thêm học sinh với Geocoding
const addStudent = (Student, callback) => {
  const {
    tenHocSinh,
    anhHocSinh,
    lop,
    soNha,
    duong,
    phuongXa,
    quanHuyen,
    thanhPho,
  } = Student;

  // Hàm xử lý chính
  const processAddStudent = async () => {
    try {
      // 1. Tạo địa chỉ đầy đủ để geocoding
      const addressParts = [soNha, duong, phuongXa].filter(Boolean);
      const fullAddress = addressParts.join(", ") + ", Vietnam";

      console.log("📍 Geocoding address:", fullAddress);

      // 2. Lấy tọa độ từ Geocoding API
      const coordinates = await getCoordinatesFromAddress(fullAddress);
      console.log("✅ Tọa độ nhận được:", coordinates);

      // 3. Bắt đầu transaction
      db.beginTransaction((err) => {
        if (err) {
          console.error("❌ Lỗi bắt đầu transaction:", err);
          return callback(err, null);
        }

        // 4. Tạo vị trí thực với tọa độ từ geocoding
        const createLocationQuery = `
          INSERT INTO vitrithuc (kinhDo, viDo) 
          VALUES (?, ?)
        `;

        db.query(
          createLocationQuery,
          [coordinates.longitude, coordinates.latitude],
          (err, locationResult) => {
            if (err) {
              console.error("❌ Lỗi tạo vị trí thực:", err);
              return db.rollback(() => {
                callback(err, null);
              });
            }

            const maViTriThuc = locationResult.insertId;
            console.log("✅ Đã tạo vị trí thực với mã:", maViTriThuc);

            // 5. Tạo địa chỉ với mã vị trí thực
            const createAddressQuery = `
            INSERT INTO diachi (soNha, duong, phuongXa, quanHuyen, thanhPho, maViTriThuc) 
            VALUES (?, ?, ?, ?, ?, ?)
          `;

            const addressParams = [
              soNha || "",
              duong || "",
              phuongXa || "",
              quanHuyen || "",
              thanhPho || "",
              maViTriThuc,
            ];

            db.query(
              createAddressQuery,
              addressParams,
              (err, addressResult) => {
                if (err) {
                  console.error("❌ Lỗi tạo địa chỉ:", err);
                  return db.rollback(() => {
                    callback(err, null);
                  });
                }

                const maDiaChi = addressResult.insertId;
                const trangThai = "Active";

                // 6. Tạo học sinh
                const createStudentQuery = `
              INSERT INTO hocSinh (tenHocSinh, anhHocSinh, lop, trangThai, maDiaChi) 
              VALUES (?, ?, ?, ?, ?)
            `;

                const studentParams = [
                  tenHocSinh,
                  anhHocSinh,
                  lop,
                  trangThai,
                  maDiaChi,
                ];

                db.query(
                  createStudentQuery,
                  studentParams,
                  (err, studentResult) => {
                    if (err) {
                      console.error("❌ Lỗi tạo học sinh:", err);
                      return db.rollback(() => {
                        callback(err, null);
                      });
                    }

                    // Commit transaction
                    db.commit((err) => {
                      if (err) {
                        console.error("❌ Lỗi commit transaction:", err);
                        return db.rollback(() => {
                          callback(err, null);
                        });
                      }

                      console.log(
                        "🎉 Thêm học sinh thành công với tọa độ thực!"
                      );
                      console.log(
                        "📍 Tọa độ:",
                        coordinates.longitude + ", " + coordinates.latitude
                      );
                      callback(null, studentResult);
                    });
                  }
                );
              }
            );
          }
        );
      });
    } catch (error) {
      console.error("❌ Lỗi trong processAddStudent:", error);
      callback(error, null);
    }
  };

  // Chạy hàm xử lý
  processAddStudent();
};

// Cập nhật học sinh với Geocoding - THÊM DEBUG
const updateStudent = (id, Student, callback) => {
  const {
    tenHocSinh,
    anhHocSinh,
    lop,
    trangThai,
    soNha,
    duong,
    phuongXa,
    quanHuyen,
    thanhPho,
  } = Student;

  console.log("🔄 Bắt đầu cập nhật học sinh ID:", id);
  console.log("📝 Dữ liệu địa chỉ mới:", {
    soNha,
    duong,
    phuongXa,
    quanHuyen,
    thanhPho,
  });

  const processUpdateStudent = async () => {
    try {
      // 1. Tạo địa chỉ đơn giản hóa: chỉ số nhà + đường + phường/xã
      const addressParts = [soNha, duong, phuongXa].filter(Boolean);
      const simplifiedAddress = addressParts.join(", ") + ", Vietnam";

      console.log("📍 Geocoding simplified address:", simplifiedAddress);

      // 2. Lấy tọa độ từ Geocoding API với địa chỉ đơn giản
      const coordinates = await getCoordinatesFromAddress(simplifiedAddress);
      console.log("✅ Tọa độ cập nhật:", coordinates);

      // 3. Bắt đầu transaction
      db.beginTransaction((err) => {
        if (err) {
          console.error("❌ Lỗi bắt đầu transaction:", err);
          return callback(err, null);
        }

        // 4. Lấy mã địa chỉ hiện tại của học sinh
        const getAddressQuery = `SELECT maDiaChi FROM hocsinh WHERE maHocSinh = ?`;

        db.query(getAddressQuery, [id], (err, results) => {
          if (err) {
            console.error("❌ Lỗi lấy mã địa chỉ:", err);
            return db.rollback(() => {
              callback(err, null);
            });
          }

          const currentAddressId = results[0]?.maDiaChi;
          console.log("🔍 Mã địa chỉ hiện tại:", currentAddressId);

          if (currentAddressId) {
            // 5a. Lấy mã vị trí thực hiện tại
            const getLocationQuery = `SELECT maViTriThuc FROM diachi WHERE maDiaChi = ?`;

            db.query(
              getLocationQuery,
              [currentAddressId],
              (err, locationResults) => {
                if (err) {
                  console.error("❌ Lỗi lấy mã vị trí thực:", err);
                  return db.rollback(() => {
                    callback(err, null);
                  });
                }

                const currentLocationId = locationResults[0]?.maViTriThuc;
                console.log("🔍 Mã vị trí thực hiện tại:", currentLocationId);

                if (currentLocationId) {
                  // Cập nhật vị trí thực hiện có
                  const updateLocationQuery = `
                  UPDATE vitrithuc 
                  SET kinhDo = ?, viDo = ?
                  WHERE maViTriThuc = ?
                `;

                  console.log(
                    "🔄 Đang cập nhật vị trí thực với mã:",
                    currentLocationId
                  );
                  console.log(
                    "📍 Tọa độ mới:",
                    coordinates.longitude,
                    coordinates.latitude
                  );

                  db.query(
                    updateLocationQuery,
                    [
                      coordinates.longitude,
                      coordinates.latitude,
                      currentLocationId,
                    ],
                    (err, locationResult) => {
                      if (err) {
                        console.error("❌ Lỗi cập nhật vị trí thực:", err);
                        return db.rollback(() => {
                          callback(err, null);
                        });
                      }

                      console.log("✅ ĐÃ CẬP NHẬT VỊ TRÍ THỰC THÀNH CÔNG!");
                      console.log(
                        "📍 Tọa độ mới đã được lưu:",
                        coordinates.longitude + ", " + coordinates.latitude
                      );

                      // Cập nhật địa chỉ
                      updateAddressAndStudent();
                    }
                  );
                } else {
                  console.log("📌 Chưa có vị trí thực, tạo mới...");
                  // Tạo vị trí thực mới nếu chưa có
                  createNewLocationAndUpdate();
                }
              }
            );
          } else {
            console.log("📌 Chưa có địa chỉ, tạo mới hoàn toàn...");
            // Tạo mới hoàn toàn nếu học sinh chưa có địa chỉ
            createNewLocationAndUpdate();
          }

          // ĐỊNH NGHĨA HÀM updateAddressAndStudent
          const updateAddressAndStudent = () => {
            // Cập nhật địa chỉ
            const updateAddressQuery = `
            UPDATE diachi 
            SET soNha = ?, duong = ?, phuongXa = ?, quanHuyen = ?, thanhPho = ?
            WHERE maDiaChi = ?
          `;

            const addressParams = [
              soNha || "",
              duong || "",
              phuongXa || "",
              quanHuyen || "",
              thanhPho || "",
              currentAddressId,
            ];

            console.log("🔄 Đang cập nhật địa chỉ...");

            db.query(
              updateAddressQuery,
              addressParams,
              (err, addressResult) => {
                if (err) {
                  console.error("❌ Lỗi cập nhật địa chỉ:", err);
                  return db.rollback(() => {
                    callback(err, null);
                  });
                }

                console.log("✅ Đã cập nhật địa chỉ");

                // Cập nhật học sinh
                updateStudentFinal();
              }
            );
          };

          // ĐỊNH NGHĨA HÀM createNewLocationAndUpdate
          const createNewLocationAndUpdate = () => {
            console.log("🔄 Đang tạo vị trí thực mới...");

            // Tạo vị trí thực mới
            const createLocationQuery = `INSERT INTO vitrithuc (kinhDo, viDo) VALUES (?, ?)`;

            db.query(
              createLocationQuery,
              [coordinates.longitude, coordinates.latitude],
              (err, locationResult) => {
                if (err) {
                  console.error("❌ Lỗi tạo vị trí thực mới:", err);
                  return db.rollback(() => {
                    callback(err, null);
                  });
                }

                const newLocationId = locationResult.insertId;
                console.log("✅ Đã tạo vị trí thực mới với mã:", newLocationId);

                // Tạo địa chỉ mới với vị trí thực mới
                const createAddressQuery = `
                INSERT INTO diachi (soNha, duong, phuongXa, quanHuyen, thanhPho, maViTriThuc) 
                VALUES (?, ?, ?, ?, ?, ?)
              `;

                const addressParams = [
                  soNha || "",
                  duong || "",
                  phuongXa || "",
                  quanHuyen || "",
                  thanhPho || "",
                  newLocationId,
                ];

                db.query(
                  createAddressQuery,
                  addressParams,
                  (err, addressResult) => {
                    if (err) {
                      console.error("❌ Lỗi tạo địa chỉ mới:", err);
                      return db.rollback(() => {
                        callback(err, null);
                      });
                    }

                    const newAddressId = addressResult.insertId;
                    console.log("✅ Đã tạo địa chỉ mới với mã:", newAddressId);

                    // Cập nhật học sinh với địa chỉ mới
                    updateStudentFinal(newAddressId);
                  }
                );
              }
            );
          };

          // ĐỊNH NGHĨA HÀM updateStudentFinal
          const updateStudentFinal = (newAddressId = null) => {
            const updateStudentQuery = `
            UPDATE hocsinh 
            SET tenHocSinh = ?, anhHocSinh = ?, lop = ?, trangThai = ?, maDiaChi = ?
            WHERE maHocSinh = ?
          `;

            const finalAddressId = newAddressId || currentAddressId;
            const studentParams = [
              tenHocSinh,
              anhHocSinh,
              lop,
              trangThai,
              finalAddressId,
              id,
            ];

            console.log("🔄 Đang cập nhật thông tin học sinh...");

            db.query(
              updateStudentQuery,
              studentParams,
              (err, studentResult) => {
                if (err) {
                  console.error("❌ Lỗi cập nhật học sinh:", err);
                  return db.rollback(() => {
                    callback(err, null);
                  });
                }

                // Commit transaction
                db.commit((err) => {
                  if (err) {
                    console.error("❌ Lỗi commit transaction:", err);
                    return db.rollback(() => {
                      callback(err, null);
                    });
                  }

                  console.log("🎉 Cập nhật học sinh thành công!");
                  callback(null, studentResult);
                });
              }
            );
          };
        });
      });
    } catch (error) {
      console.error("❌ Lỗi trong processUpdateStudent:", error);
      callback(error, null);
    }
  };

  // Chạy hàm xử lý
  processUpdateStudent();
};

// Các hàm khác giữ nguyên...
const blockStudent = (id, callback) => {
  db.query(
    "UPDATE hocSinh SET trangThai = 'Inactive' WHERE maHocSinh = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("💥 Lỗi SQL khi xóa:");
        console.error("- Code:", err.code);
        console.error("- Message:", err.sqlMessage);
      } else {
        console.log("✅ Xóa thành công từ database:");
        console.log("- Affected rows:", results.affectedRows);
      }
      callback(err, results);
    }
  );
};

const unblockStudent = (id, callback) => {
  db.query(
    "UPDATE hocSinh SET trangThai = 'Active' WHERE maHocSinh = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("❌ Lỗi truy vấn SQL:", err);
      }
      callback(err, results);
    }
  );
};

module.exports = {
  getAllStudents,
  getStudentById,
  deleteStudent,
  addStudent,
  updateStudent,
  blockStudent,
  unblockStudent,
};
