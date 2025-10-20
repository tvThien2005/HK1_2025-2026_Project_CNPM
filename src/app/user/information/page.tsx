import Sidebar from "@/app/sidebar/page"
import Header from "@/app/header/page"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDownload, faPenToSquare } from "@fortawesome/free-solid-svg-icons"

export default function Information() {
    const date = new Date();
    return (
        <div>
            <Header></Header>
            <div className="flex">
                <Sidebar></Sidebar>
                <div className="flex flex-col w-full space-y-5 m-5">
                    <form className="container flex">
                        <div className="flex flex-col w-4/5 space-y-2">
                            <h1 className="text-2xl">Thông tin tài khoản</h1>
                            <div className="text-xl">Thông tin cá nhân:</div>
                            <div className="flex flex-row">
                                <label className="text-lg">Họ tên: </label>
                                <input type="text" className="bg-zinc-300 rounded-lg w-80 ml-auto" value="Nguyễn Văn A" readOnly={true}></input>
                            </div>
                            <div className="flex flex-row">
                                <label className="text-lg">Số điện thoại: </label>
                                <input type="text" className="bg-zinc-300 rounded-lg w-80 ml-auto" value="0123456789" readOnly={true}></input>
                            </div>
                            <div className="flex flex-row">
                                <div className="text-lg">Ngày sinh: </div>
                                <input type="date" className="bg-zinc-300 rounded-lg w-80 ml-auto" readOnly={true}></input>
                            </div>
                            <div className="flex flex-row">
                                <div className="text-lg">Mã số bằng lái: </div>
                                <input type="text" className="bg-zinc-300 rounded-lg w-80 ml-auto" value="06553423478" readOnly={true}></input>
                            </div>
                            <div className="text-xl">Tài khoản:</div>
                            <div className="flex flex-row">
                                <div className="text-lg">Tên đăng nhập: </div>
                                <input type="text" className="bg-zinc-300 rounded-lg w-80 ml-auto" value="Hello" readOnly={true}></input>
                            </div>
                            <div className="flex flex-row">
                                <div className="text-lg">Mật khẩu: </div>
                                <input type="password" className="bg-zinc-300 rounded-lg w-80 ml-auto" value="123456" readOnly={true}></input>
                            </div>
                            <div className="flex flex-row">
                                <div className="text-lg">Ngày tạo tài khoản: </div>
                                <input type="date" className="bg-zinc-300 rounded-lg w-80 ml-auto" readOnly={false}></input>
                            </div>
                            <div className="flex flex-row">
                                <div className="text-lg">Trạng thái</div>
                                <select className="ml-auto">
                                    <option value={"Đang hoạt động"}>Đang hoạt động</option>
                                    <option value={"Không hoạt động"}>Không hoạt động</option>
                                </select>
                            </div>
                            <button type="button" className="bg-blue-300 w-20 rounded-lg ml-auto hover:bg-blue-500">
                                <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon>
                                <span>Lưu</span>
                            </button>
                        </div>
                        <div className="flex flex-col items-center w-1/5 space-y-5">
                            <button type="button" className="flex items-center bg-blue-300 h-8 rounded-xl hover:bg-blue-500">
                                <FontAwesomeIcon icon={faPenToSquare}></FontAwesomeIcon>
                                <span>Chỉnh sửa</span>
                            </button>
                            <img className="h-30 w-30 flex"></img>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}