import Sidebar from "@/app/sidebar/page";
import Header from "@/app/header/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faUsers } from "@fortawesome/free-solid-svg-icons";

export default function Schedule() {
    return (
        <div className="w-full">
            <Header></Header>
            <div className="flex">
                <Sidebar></Sidebar>
                <div className="flex flex-col m-5 w-full">
                    <div className="mb-10">Lịch trình hôm nay</div>
                    <div className="flex flex-row border-1 rounded-lg items-center mb-2 h-20">
                        <div className="bg-green-500 rounded-full h-7 w-7 ml-5">
                        </div>
                        <div className="ml-5">
                            <div>Tuyến 01 - Đón</div>
                            <div className="flex flex-row items-center space-x-2">
                                <FontAwesomeIcon icon={faClock}></FontAwesomeIcon>
                                <div>6:30 AM</div>
                                <FontAwesomeIcon icon={faUsers}></FontAwesomeIcon>
                                <div>28 học sinh</div>
                            </div>
                        </div>
                        <div className="flex justify-center items-center ml-auto mr-10 border-3 border-stone-500 bg-stone-700 rounded-xl text-stone-50 px-5 w-40">
                            <p>
                                Đang thực hiện
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-row border-1 rounded-lg items-center mb-2 h-20">
                        <div className="bg-gray-400 rounded-full h-7 w-7 ml-5">
                        </div>
                        <div className="ml-5">
                            <div>Tuyến 02 - Đón</div>
                            <div className="flex flex-row items-center space-x-2">
                                <FontAwesomeIcon icon={faClock}></FontAwesomeIcon>
                                <div>7:30 AM</div>
                                <FontAwesomeIcon icon={faUsers}></FontAwesomeIcon>
                                <div>29 học sinh</div>
                            </div>
                        </div>
                        <div className="flex justify-center items-center ml-auto mr-10 border-3 border-stone-500 rounded-xl px-5 w-40">
                            <p>
                                Đang thực hiện
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-row border-1 rounded-lg items-center mb-2 h-20">
                        <div className="bg-gray-400 rounded-full h-7 w-7 ml-5">
                        </div>
                        <div className="ml-5">
                            <div>Tuyến 01 - Đưa về</div>
                            <div className="flex flex-row items-center space-x-2">
                                <FontAwesomeIcon icon={faClock}></FontAwesomeIcon>
                                <div>4:30 PM</div>
                                <FontAwesomeIcon icon={faUsers}></FontAwesomeIcon>
                                <div>28 học sinh</div>
                            </div>
                        </div>
                        <div className="flex justify-center items-center ml-auto mr-10 border-3 border-zinc-500 rounded-xl px-5 w-40">
                            <p>
                                Sắp tới
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-row border-1 rounded-lg items-center mb-2 h-20">
                        <div className="bg-gray-400 rounded-full h-7 w-7 ml-5">
                        </div>
                        <div className="ml-5">
                            <div>Tuyến 02 - Đưa về</div>
                            <div className="flex flex-row items-center space-x-2">
                                <FontAwesomeIcon icon={faClock}></FontAwesomeIcon>
                                <div>6:30 PM</div>
                                <FontAwesomeIcon icon={faUsers}></FontAwesomeIcon>
                                <div>28 học sinh</div>
                            </div>
                        </div>
                        <div className="flex justify-center items-center ml-auto mr-10 border-3 border-zinc-500 rounded-xl px-5 w-40">
                            <p>
                                Sắp tới
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}