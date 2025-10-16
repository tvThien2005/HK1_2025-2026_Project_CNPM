import Header from "@/app/header/page";
import Sidebar from "@/app/sidebar/page";


export default function history() {
    return (
        <div>
            <Header></Header>
            <div className="flex">
                <Sidebar></Sidebar>
                <div className="flex flex-col m-5 w-full space-y-5">
                    <div>Thông báo</div>
                    <div className="border-1 border-stone-500 rounded-lg">
                        <div className="flex flex-row ml-2">
                            <div>Ngày: 24/12/2015</div>
                            <div className="border-1 border-stone-500 rounded-lg bg-green-400 ml-auto w-25 flex justify-center">
                                <div>Thư nhận</div>
                            </div>
                        </div>
                        <div className="ml-2">Nhận từ: Quản lý</div>
                        <div className="ml-2">Nội dung: Với tình trạng sự cố kể trên thì xe phải dợi khách lên...</div>
                    </div>
                    <div className="border-1 border-stone-500 rounded-lg">
                        <div className="flex flex-row">
                            <div className="ml-2">Ngày: 24/12/2015</div>
                            <div className="border-1 border-stone-500 rounded-lg bg-red-500 ml-auto w-25 flex justify-center">
                                <div>Thư gửi</div>
                            </div>
                        </div>
                        <div className="ml-2">Gửi từ: Quản lý</div>
                        <div className="ml-2">Nội dung: Đường kẹt dẫn đến việc xe không thể đến điểm đón đúng giờ</div>
                    </div>
                    <div className="border-1 border-stone-500 rounded-lg">
                        <div className="flex flex-row">
                            <div className="ml-2">Ngày: 24/12/2015</div>
                            <div className="border-1 border-stone-500 rounded-lg bg-red-500 ml-auto w-25 flex justify-center">
                                <div>Thư gửi</div>
                            </div>
                        </div>
                        <div className="ml-2">Gửi từ: Quản lý</div>
                        <div className="ml-2">Nội dung: Xe đã tới điểm đón được 5 phút nhưng không thấy học sinh,...</div>
                    </div>
                </div>
            </div>
        </div>
    )
}