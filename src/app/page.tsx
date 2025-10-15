import Header from "./header/page";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faClock, faClockFour, faLocation, faLocationDot, faLocationPin, faLocationPinLock, faMapLocationDot, faPerson, faRoad, faRoute, faWarning } from "@fortawesome/free-solid-svg-icons";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Header></Header>
      <div className="my-10 flex justify-end">
        <div className="flex flex-warp items-center bg-red-400 rounded-xl hover:bg-red-600">
          <FontAwesomeIcon icon={faWarning}></FontAwesomeIcon>
          <Link href='/report'>Báo cáo</Link>
        </div>
      </div>
      <div className="flex items-center justify-center bg-green-300 mx-40 rounded-lg mb-10">
        <div>
          <div>
            <FontAwesomeIcon icon={faRoute}></FontAwesomeIcon>
            <span>Chuyến đi hiện tại</span>
          </div>
          <p>Tuyến 01 - Sáng</p>
          <div>
            <FontAwesomeIcon icon={faClock}></FontAwesomeIcon>
            <span>6:30 AM - 7:30 AM</span>
          </div>
          <div>
            <FontAwesomeIcon icon={faLocationDot}></FontAwesomeIcon>
            <span>Điểm dừng: 9/28</span>
          </div>
        </div>
        <div className="mx-20">
          <div className="">
            <div className="flex flex-warp">
              <p>Tiến độ: </p>
              <p className="ml-auto">5%</p>
            </div>
            <Progress value={35} className="w-65"></Progress>
            <p>Điểm đến tiếp theo: 98/9A, đường Lý <br />Thường Kiệt, phường Mỹ Huề, TPHCM</p>
          </div>
        </div>
        <div>
          <div>
            <FontAwesomeIcon icon={faPerson}></FontAwesomeIcon>
            <span>9/28 học sinh</span>
          </div>
          <div className="flex flex-wrap bg-stone-50 items-center justify-center hover:bg-zinc-300 rounded-lg">
            <FontAwesomeIcon icon={faMapLocationDot}></FontAwesomeIcon>
            <span>Mở bản đồ</span>
          </div>
        </div>
      </div>
      <div className="border-3 rounded-lg mx-40 scroll-smooth p-5 overflow-y-scroll h-100">
        <div className="border-3 rounded-xl flex flex-wrap items-center m-5">
          <input type="checkbox" className="w-10 h-8"></input>
          <FontAwesomeIcon icon={faCircleUser} className="fa-4x px-5"></FontAwesomeIcon>
          <div>
            <p>Nguyễn Văn B</p>
            <p>Lớp 6A6 - Địa điểm 8</p>
          </div>
          <div className="ml-auto mr-5 px-5 bg-stone-950 text-stone-50 rounded-lg">
            <p>Đã lên xe</p>
          </div>
        </div>
        <div className="border-3 rounded-xl flex flex-wrap items-center m-5">
          <input type="checkbox" className="w-10 h-8"></input>
          <FontAwesomeIcon icon={faCircleUser} className="fa-4x px-5"></FontAwesomeIcon>
          <div>
            <p>Nguyễn Văn B</p>
            <p>Lớp 6A6 - Địa điểm 8</p>
          </div>
          <div className="ml-auto mr-5 px-5 bg-stone-950 text-stone-50 rounded-lg">
            <p>Đã lên xe</p>
          </div>
        </div>
        <div className="border-3 rounded-xl flex flex-wrap items-center m-5">
          <input type="checkbox" className="w-10 h-8"></input>
          <FontAwesomeIcon icon={faCircleUser} className="fa-4x px-5"></FontAwesomeIcon>
          <div>
            <p>Nguyễn Văn B</p>
            <p>Lớp 6A6 - Địa điểm 8</p>
          </div>
          <div className="ml-auto mr-5 px-5 bg-stone-950 text-stone-50 rounded-lg">
            <p>Đã lên xe</p>
          </div>
        </div>
        <div className="border-3 rounded-xl flex flex-wrap items-center m-5">
          <input type="checkbox" className="w-10 h-8"></input>
          <FontAwesomeIcon icon={faCircleUser} className="fa-4x px-5"></FontAwesomeIcon>
          <div>
            <p>Nguyễn Văn B</p>
            <p>Lớp 6A6 - Địa điểm 8</p>
          </div>
          <div className="ml-auto mr-5 px-5 bg-stone-950 text-stone-50 rounded-lg">
            <p>Đã lên xe</p>
          </div>
        </div>
        <div className="border-3 rounded-xl flex flex-wrap items-center m-5">
          <input type="checkbox" className="w-10 h-8"></input>
          <FontAwesomeIcon icon={faCircleUser} className="fa-4x px-5"></FontAwesomeIcon>
          <div>
            <p>Nguyễn Văn B</p>
            <p>Lớp 6A6 - Địa điểm 8</p>
          </div>
          <div className="ml-auto mr-5 px-5 bg-stone-950 text-stone-50 rounded-lg">
            <p>Đã lên xe</p>
          </div>
        </div>
        <div className="border-3 rounded-xl flex flex-wrap items-center m-5">
          <input type="checkbox" className="w-10 h-8"></input>
          <FontAwesomeIcon icon={faCircleUser} className="fa-4x px-5"></FontAwesomeIcon>
          <div>
            <p>Nguyễn Văn B</p>
            <p>Lớp 6A6 - Địa điểm 8</p>
          </div>
          <div className="ml-auto mr-5 px-5 bg-stone-950 text-stone-50 rounded-lg">
            <p>Đã lên xe</p>
          </div>
        </div>
        <div className="border-3 rounded-xl flex flex-wrap items-center m-5">
          <input type="checkbox" className="w-10 h-8"></input>
          <FontAwesomeIcon icon={faCircleUser} className="fa-4x px-5"></FontAwesomeIcon>
          <div>
            <p>Nguyễn Văn B</p>
            <p>Lớp 6A6 - Địa điểm 8</p>
          </div>
          <div className="ml-auto mr-5 px-5 bg-zinc-400 text-stone-950 rounded-lg">
            <p>Chờ đón</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col place-self-center m-5 border-2 border-zinc-500 rounded-lg w-2/5">
        <div className="flex w-full p-2">
          <span className="">Tổng số học sinh </span>
          <span className="ml-auto">28</span>
        </div>
        <div className="flex w-full p-2">
          <span className="">Đã lên xe </span>
          <span className="ml-auto">8</span>
        </div>
        <div className="flex w-full p-2">
          <span className="">Chờ đón </span>
          <span className="ml-auto">20</span>
        </div>
      </div>
    </div>
  );
}
