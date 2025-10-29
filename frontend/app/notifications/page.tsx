// React notification management page
"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

interface Notification {
  tenTaiKhoan: string | undefined;
  maThongBao: number;
  noiDung: string;
  thoiGianTao: string;
  tenQuanLyXe?: string;
  recipientType: "driver" | "parent";
  maTaiKhoan?: number;
  tenTaiXe?: string;
  tenPhuHuynh?: string;
  ten?: string;
}

interface Person {
  maTaiKhoan: number;
  tenTaiXe?: string;
  tenPhuHuynh?: string;
  ten?: string;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [drivers, setDrivers] = useState<Person[]>([]);
  const [parents, setParents] = useState<Person[]>([]);

  // Filters / form state
  const [qDateFrom, setQDateFrom] = useState("");
  const [qDateTo, setQDateTo] = useState("");
  const [qRecipient, setQRecipient] = useState("all"); // all | driver | parent

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // Form to create
  const [content, setContent] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]); // array of maTaiKhoan
  const [selectDrivers, setSelectDrivers] = useState(false);
  const [selectParents, setSelectParents] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
    fetchPeopleLists();
  }, []);

  const fetchAll = async () => {
    try {
      const [dRes, pRes] = await Promise.all([
        axios.get(`${API_BASE}/notifications/drivers`),
        axios.get(`${API_BASE}/notifications/parents`),
      ]);
      // backend returns arrays; we will normalize and mark recipientType
      const driversWithType: Notification[] = (dRes.data || []).map(
        (it: any) => ({
          ...it,
          recipientType: "driver" as const,
        })
      );
      const parentsWithType: Notification[] = (pRes.data || []).map(
        (it: any) => ({
          ...it,
          recipientType: "parent" as const,
        })
      );
      const merged = [...driversWithType, ...parentsWithType];
      // sort by time desc if thoiGianTao available
      merged.sort(
        (a, b) =>
          new Date(b.thoiGianTao).getTime() - new Date(a.thoiGianTao).getTime()
      );
      setNotifications(merged);
    } catch (err) {
      console.error("Lỗi khi fetch notifications", err);
    }
  };

  const fetchPeopleLists = async () => {
    try {
      const [dRes, pRes] = await Promise.all([
        axios.get(`${API_BASE}/drivers`),
        axios.get(`${API_BASE}/parents`),
      ]);
      setDrivers(dRes.data || []);
      setParents(pRes.data || []);
    } catch (err) {
      // If these endpoints don't exist on your backend, you can still send by choosing all and the UI will try best-effort
      console.warn(
        "Không thể load danh sách người nhận (drivers/parents) — kiểm tra API /drivers và /parents",
        err
      );
    }
  };

  // Filters applied list
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (qRecipient !== "all") {
        if (qRecipient === "driver" && n.recipientType !== "driver")
          return false;
        if (qRecipient === "parent" && n.recipientType !== "parent")
          return false;
      }
      if (qDateFrom) {
        if (new Date(n.thoiGianTao) < new Date(qDateFrom)) return false;
      }
      if (qDateTo) {
        // include whole day
        const end = new Date(qDateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(n.thoiGianTao) > end) return false;
      }
      return true;
    });
  }, [notifications, qRecipient, qDateFrom, qDateTo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelectRecipient = (id: number) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return alert("Nội dung không được để trống");

    // build recipient list based on checkboxes if user didn't pick specific
    let recipients = [...selectedRecipients];
    if (recipients.length === 0) {
      if (selectDrivers)
        recipients = recipients.concat(drivers.map((d) => d.maTaiKhoan));
      if (selectParents)
        recipients = recipients.concat(parents.map((p) => p.maTaiKhoan));
    }
    // dedupe
    recipients = Array.from(new Set(recipients));
    if (recipients.length === 0)
      return alert(
        "Vui lòng chọn đối tượng nhận (chọn cụ thể hoặc tích chọn tài xế/phụ huynh)"
      );

    const payload = {
      maTaiKhoan: recipients, // per bạn: backend expects array
      maQuanLyXe: 1, // placeholder — thay nếu có thông tin người quản lý
      noiDung: content,
    };

    setLoading(true);
    try {
      // try sending in one request (best-case if backend supports array)
      await axios.post(`${API_BASE}/notifications`, payload);
      setContent("");
      setSelectedRecipients([]);
      setSelectDrivers(false);
      setSelectParents(false);
      await fetchAll();
      alert("Gửi thông báo thành công");
    } catch (err) {
      console.warn(
        "Gửi 1 lần thất bại — thử gửi từng request riêng (fallback)",
        err
      );
      // fallback: if backend expects single maTaiKhoan per request
      try {
        await Promise.all(
          recipients.map((id) =>
            axios.post(`${API_BASE}/notifications`, {
              maTaiKhoan: id,
              maQuanLyXe: 1,
              noiDung: content,
            })
          )
        );
        setContent("");
        setSelectedRecipients([]);
        setSelectDrivers(false);
        setSelectParents(false);
        await fetchAll();
        alert("Gửi thông báo thành công (qua nhiều request)");
      } catch (err2) {
        console.error("Gửi từng request cũng thất bại", err2);
        alert("Không thể gửi thông báo. Kiểm tra console để biết chi tiết.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (maThongBao: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;
    try {
      await axios.delete(`${API_BASE}/notifications/${maThongBao}`);
      // backend may return results object — we simply refresh
      await fetchAll();
      alert("Xóa thành công");
    } catch (err) {
      console.error("Xóa thất bại", err);
      alert("Xóa thất bại — kiểm tra console");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Quản lý thông báo</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <form
          onSubmit={handleCreate}
          className="p-4 border rounded-lg shadow-sm"
        >
          <h2 className="font-semibold mb-2">Tạo thông báo mới</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung thông báo"
            className="w-full p-2 border rounded mb-2"
            rows={4}
          />

          <div className="mb-2">
            <label className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={selectDrivers}
                onChange={(e) => setSelectDrivers(e.target.checked)}
                className="mr-2"
              />{" "}
              Gửi cho tài xế
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selectParents}
                onChange={(e) => setSelectParents(e.target.checked)}
                className="mr-2"
              />{" "}
              Gửi cho phụ huynh
            </label>
          </div>

          <div className="mb-2">
            <small className="block mb-1">Hoặc chọn cụ thể:</small>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto border p-2 rounded">
              <div>
                <div className="font-medium">Tài xế</div>
                {drivers.length === 0 && (
                  <div className="text-sm">
                    (Không có dữ liệu hoặc API /drivers chưa có)
                  </div>
                )}
                {drivers.map((d) => (
                  <label key={d.maTaiKhoan} className="block text-sm">
                    <input
                      checked={selectedRecipients.includes(d.maTaiKhoan)}
                      onChange={() => toggleSelectRecipient(d.maTaiKhoan)}
                      className="mr-2"
                      type="checkbox"
                    />{" "}
                    {d.tenTaiXe || d.ten}
                  </label>
                ))}
              </div>
              <div>
                <div className="font-medium">Phụ huynh</div>
                {parents.length === 0 && (
                  <div className="text-sm">
                    (Không có dữ liệu hoặc API /parents chưa có)
                  </div>
                )}
                {parents.map((p) => (
                  <label key={p.maTaiKhoan} className="block text-sm">
                    <input
                      checked={selectedRecipients.includes(p.maTaiKhoan)}
                      onChange={() => toggleSelectRecipient(p.maTaiKhoan)}
                      className="mr-2"
                      type="checkbox"
                    />{" "}
                    {p.tenPhuHuynh || p.ten}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "Đang gửi..." : "Gửi"}
            </button>
            <button
              type="button"
              onClick={() => {
                setContent("");
                setSelectedRecipients([]);
                setSelectDrivers(false);
                setSelectParents(false);
              }}
              className="px-3 py-2 border rounded"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="font-semibold mb-2">Bộ lọc / Tìm kiếm</h2>
          <div className="mb-2">
            <label className="block text-sm">Đối tượng nhận</label>
            <select
              value={qRecipient}
              onChange={(e) => {
                setQRecipient(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 border rounded"
            >
              <option value="all">Tất cả</option>
              <option value="driver">Tài xế</option>
              <option value="parent">Phụ huynh</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm">Từ ngày</label>
            <input
              type="date"
              value={qDateFrom}
              onChange={(e) => {
                setQDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Đến ngày</label>
            <input
              type="date"
              value={qDateTo}
              onChange={(e) => {
                setQDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="text-sm text-gray-600">
            Tổng: {filtered.length} thông báo
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Mã TB</th>
              <th className="p-3 text-left">Người gửi</th>
              <th className="p-3 text-left">Nội dung</th>
              <th className="p-3 text-left">Ngày tạo</th>
              <th className="p-3 text-left">Đối tượng nhận</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((n) => (
              <tr
                key={`${n.maThongBao}-${n.maTaiKhoan}-${Math.random()}`}
                className="border-t"
              >
                <td className="p-3">{n.maThongBao}</td>
                <td className="p-3">
                  {n.tenQuanLyXe || n.tenTaiKhoan || n.ten}
                </td>
                <td className="p-3">{n.noiDung}</td>
                <td className="p-3">
                  {new Date(n.thoiGianTao).toLocaleString()}
                </td>
                <td className="p-3">
                  {n.recipientType === "driver" ? "Tài xế" : "Phụ huynh"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(n.maThongBao)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td className="p-4" colSpan={6}>
                  Không có thông báo phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div>
          Trang {page} / {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-3 py-1 border rounded"
          >
            Đầu
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded"
          >
            Cuối
          </button>
        </div>
      </div>
    </div>
  );
}
