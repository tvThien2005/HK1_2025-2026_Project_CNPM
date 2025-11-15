"use client";
import Sidebar from "@/app/sidebar/page";
import Header from "@/app/header/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faUsers } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import api from "@/lib/api";

type Trip = {
    maChuyenXe: number;
    maLichTrinh: number;
    tenTuyenDuong: string;
    thoiGianDi: string; 
    thoiGianDen: string; 
    trangThai: 'InProgress' | 'Scheduled' | 'Completed' | string;
    soLuongHocSinh: number;
};

function formatTimeTo12h(time: string) {
    if (!time) return '';
    const [hStr, mStr] = time.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10) || 0;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const mm = String(m).padStart(2, '0');
    return `${h}:${mm} ${ampm}`;
}

function mapStatusLabel(st: string) {
    switch (st) {
        case 'InProgress':
            return 'Đang thực hiện';
        case 'Scheduled':
            return 'Sắp tới';
        case 'Completed':
            return 'Hoàn thành';
        default:
            return st;
    }
}

function statusDotClass(st: string) {
    switch (st) {
        case 'InProgress':
            return 'bg-green-500';
        case 'Scheduled':
            return 'bg-gray-400';
        case 'Completed':
            return 'bg-gray-400';
        default:
            return 'bg-gray-400';
    }
}

function statusBadgeClass(st: string) {
    switch (st) {
        case 'InProgress':
            return 'border-3 border-stone-500 bg-stone-700 text-stone-50';
        case 'Scheduled':
            return 'border-3 border-stone-500';
        case 'Completed':
            return 'border-3 border-stone-500';
        default:
            return 'border-3 border-stone-500';
    }
}

export function ItemSchedule() {
    const [data, setData] = useState<{ ngay: string; lichTrinh: Trip[] } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
            async function fetchData() {
            try {
                const res = await api.get(`/api/driver/trips/today`);
                setData(res.data);
            } catch (err) {
                console.error('Lỗi khi lấy lịch trình:', err);
                setError('Không thể tải lịch trình');
            }
        }
        fetchData();
    }, []);

    const trips = data?.lichTrinh ?? [];

    return (
        <div className="flex flex-col m-5 w-full">
            <div className="mb-10">Lịch trình hôm nay</div>

            {error && <p className="text-red-600">{error}</p>}
            {trips.length === 0 && !error && (
                <p>Không có lịch trình trong hôm nay</p>
            )}

            {trips.map((t, index) => (
                <div key={t.maChuyenXe} className="flex flex-row border-1 rounded-lg items-center mb-2 h-20">
                    <div className={`${statusDotClass(t.trangThai)} rounded-full h-7 w-7 ml-5`} />
                    <div className="ml-5">
                        <div>chuyến số {index+1}: {t.tenTuyenDuong}</div>
                        <div className="flex flex-row items-center space-x-2">
                            <FontAwesomeIcon icon={faClock} />
                            <div>{formatTimeTo12h(t.thoiGianDi)}</div>
                            <FontAwesomeIcon icon={faUsers} />
                            <div>{t.soLuongHocSinh} học sinh</div>
                        </div>
                    </div>
                    <div className={`flex justify-center items-center ml-auto mr-10 rounded-xl px-5 w-40 ${statusBadgeClass(t.trangThai)}`}>
                        <p>{mapStatusLabel(t.trangThai)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}


export default function Schedule() {
    return (
        <div className="w-full">
            <Header />
            <div className="flex">
                <Sidebar />
                <ItemSchedule />
            </div>
        </div>
    )
}