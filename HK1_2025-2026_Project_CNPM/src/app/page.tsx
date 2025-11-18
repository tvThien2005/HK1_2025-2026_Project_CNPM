"use client";
import Header from "./header/page";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faClock, faLocationDot, faMapLocationDot, faPerson, faRoute, faWarning } from "@fortawesome/free-solid-svg-icons";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Image from "next/image";

function HandleTime(time: string) {
  let add1day = Number(time.substring(8, 10)) + 1;
  return `${add1day}-${time.substring(5, 7)}-${time.substring(0, 4)}`;
}

export function  ListStudent({ students, tripId, onChangeStatus, }: {students: any[]; tripId: number | null; onChangeStatus: (tripId: number, maHocSinh: number, trangThai: string) => Promise<void> | void; }){
  return(
    <>
      {students.length === 0 ? 
        (<p>không còn học sinh trong danh sách</p>)
        :
        (
          
          <div className="border-3 rounded-lg mx-40 scroll-smooth p-5 overflow-y-scroll h-100">
            {students.map( (s)=>(
              <div key={s.maHocSinh} className="border-3 rounded-xl flex flex-wrap items-center m-5">
                <FontAwesomeIcon icon={faCircleUser} className="fa-4x px-5"></FontAwesomeIcon>
                {/* <Image className="fa-4x px-5" alt="Học sinh" src={"/photo/hs1.png"} width={20} height={20}/> */}
                <div>
                  <p>{s.tenHocSinh}</p>
                  <p>Lớp {s.lop}, Địa chỉ: {s.diaChi}</p>
                </div>
              
                  <select
                    value={s.trangThai}
                    className="ml-auto mr-5 px-5 bg-stone-950 text-stone-50 rounded-lg"
                    onChange={(e)=> { if (tripId) { onChangeStatus(tripId, Number(s.maHocSinh), e.target.value); } }}
                  >
                    <option value="Dropped Off">Dropped Off</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="Assigned">Assigned</option>
                  </select>
              
              </div>
            ))}
          </div>
         
        )
      }
    </>
  );
}

export function LichTrinh(){
  const [LT, setLT] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [tripId, setTripId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`/api/driver/lichtrinh`);
        setLT(res.data);
        setTripId(res.data?.maChuyenXe ?? null);
      } catch (err) {
        console.error('Lỗi khi lấy lịch trình:', err);
      }
    }
    fetchData();
  }, []);

  const fetchStudents = async (tid: number) => {
    try {
      const res = await api.get(`/api/driver/trips/${tid}/students`);
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!tripId) return;
    fetchStudents(tripId);
  }, [tripId]);

  const updateStudentStatus = async (tid: number, maHocSinh: number, trangThai: string) => {
    try {
      await api.post(`/api/driver/trips/${tid}/students/${maHocSinh}/status`, {
        trangThai,
      });
      await fetchStudents(tid);
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái học sinh:', error);
    }
  };
  const daLenXe = students.filter((s) => s.trangThai === "Dropped Off").length;
  const choDon = students.length - daLenXe;
  const percent = students.length ? (daLenXe*100)/students.length : 0;
  return(
    <>
      {LT?.length === 0 ? 
        (<p>không còn còn lịch trình nào trong ngày</p>)
        :
        (
              <><div className="flex items-center justify-center bg-green-300 mx-40 rounded-lg mb-10">
            <div>
              <div>
                <FontAwesomeIcon icon={faRoute}></FontAwesomeIcon>
                <span>Chuyến đi hiện tại</span>
              </div>
              <p>Tuyến ngày: {HandleTime(LT?.ngay)}</p>
              <div>
                <FontAwesomeIcon icon={faClock}></FontAwesomeIcon>
                <span> {LT?.thoiGianDi} AM -  {LT?.thoiGianDen} AM</span>
              </div>
              <div>
                <FontAwesomeIcon icon={faLocationDot}></FontAwesomeIcon>
                <span>Điểm dừng: {daLenXe}/{students.length}</span>
              </div>
            </div>
            <div className="mx-20">
              <div className="">
                <div className="flex flex-warp">
                  <p>Tiến độ: </p>
                  <p className="ml-auto">{percent}%</p>
                </div>
                <Progress value={percent} className="w-65"></Progress>
                <p>Điểm đến tiếp theo: 98/9A, đường Lý <br />Thường Kiệt, phường Mỹ Huề, TPHCM</p>
              </div>
            </div>
            <div>
              <div>
                <FontAwesomeIcon icon={faPerson}></FontAwesomeIcon>
                <span>{daLenXe}/{students.length} học sinh</span>
              </div>
              <div className="flex flex-wrap bg-stone-50 items-center justify-center hover:bg-zinc-300 rounded-lg">
                <Link href="/map">
                  <FontAwesomeIcon icon={faMapLocationDot}></FontAwesomeIcon>
                  <span>Mở bản đồ</span>
                </Link>
              </div>
            </div>
          </div><ListStudent students={students} tripId={tripId} onChangeStatus={updateStudentStatus} /><div className="flex flex-col place-self-center m-5 border-2 border-zinc-500 rounded-lg w-2/5">
              <div className="flex w-full p-2">
                <span className="">Tổng số học sinh </span>
                <span className="ml-auto">{students.length}</span>
              </div>
              <div className="flex w-full p-2">
                <span className="">Đã lên xe </span>
                <span className="ml-auto">{daLenXe}</span>
              </div>
              <div className="flex w-full p-2">
                <span className="">Chờ đón </span>
                <span className="ml-auto">{choDon}</span>
              </div>
            </div></>

        )}
          
    </>
  );
}


export default function Home() {
  return (
    <div>
      <Header></Header>
      <div className="my-10 flex justify-end">
        <div className="flex flex-warp items-center bg-red-400 rounded-xl hover:bg-red-600">
          <Link href='/report'>
            <FontAwesomeIcon icon={faWarning}></FontAwesomeIcon>
            Báo cáo
          </Link>
        </div>
      </div>
      <LichTrinh />
    </div>
  );
}
