'use client'
import Header from "@/app/header/page";
import Sidebar from "@/app/sidebar/page";
import api from "@/lib/api";
import { useEffect, useState } from "react";

function HandleTime(time: string) {
  return `${time.substring(11, 16)} ,${time.substring(8, 10)}-${time.substring(5, 7)}-${time.substring(0, 4)}`;
}

export function ListNotification() {
  const [noti, setNoti] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get("/api/driver/notification");
        setNoti(res.data.results);
      } catch (err) {
        console.error("Lỗi khi lấy lịch sử:", err);
      } 
    }
    fetchData();
  }, []);

  return (
    <>
      {noti.length === 0 ? (
        <p>Không có thông báo trong danh sách</p>
      ) : (
        noti.map((n, index) => (
          <div key={index} className="border border-stone-500 rounded-lg p-2 mb-3">
            <div className="flex flex-row items-center mb-1">
              <div className="ml-2">Thời gian nhận: {HandleTime(n.thoiGianTao)}</div>
              <div className="border border-stone-500 rounded-lg bg-green-500 ml-auto px-3 py-1 text-white text-sm">
                Thư nhận
              </div>
            </div>
            <div className="ml-2">Nhận từ quản lý: {n.tenQuanLyXe}</div>
            <div className="ml-2">Nội dung: {n.noiDung}</div>
          </div>
        ))
      )}
    </>
  );
  
}
    
export function ListWaring() {
  const [warn, setWarn] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get("/api/driver/warning");
        setWarn(res.data.results);
      } catch (err) {
        console.error("Lỗi khi lấy lịch sử:", err);
      } 
    }
    fetchData();
  }, []);

  return (
    <>
      {warn.length === 0 ? (
        <p>Không có cảnh báo trong danh sách</p>
      ) : (
        warn.map((w, index) => (
          <div key={index} className="border border-stone-500 rounded-lg p-2 mb-3">
            <div className="flex flex-row items-center mb-1">
              <div className="ml-2">Thời gian gửi: {HandleTime(w.thoiGianTao)}</div>
              <div className="border border-stone-500 rounded-lg bg-red-500 ml-auto px-3 py-1 text-white text-sm">
                Thư gửi
              </div>
            </div>
            <div className="ml-2">Gửi đến phụ huynh: {w.tenPhuHuynh}</div>
            <div className="ml-2">Nội dung: {w.noiDung}</div>
          </div>
        ))
      )}
    </>
  );
  
}


export default function history() {
    return (
        <div>
            <Header></Header>
            <div className="flex">
                <Sidebar></Sidebar>
                <div className="flex flex-col m-5 w-full space-y-5">
                  <div>Thông báo</div>
                  <ListNotification />
                  <ListWaring />
                </div>
            </div>
        </div>
    )
}