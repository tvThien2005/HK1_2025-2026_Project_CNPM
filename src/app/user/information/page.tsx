import Sidebar from "@/app/sidebar/page"
import Header from "@/app/header/page"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons"

export default function Information() {
    return (
        <div>
            <Header></Header>
            <div className="flex">
                <Sidebar></Sidebar>
                <div className="flex flex-col w-full space-y-5 m-5">
                    <div className="container flex">
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
                                <input type="text" className="bg-zinc-300 rounded-lg w-80 ml-auto"></input>
                            </div>
                            <div className="flex flex-row">
                                <div className="text-lg">Mã số bằng lái: </div>
                                <input type="text" className="bg-zinc-300 rounded-lg w-80 ml-auto"></input>
                            </div>
                            <div className="text-xl">Tài khoản:</div>
                        </div>
                        <div className="flex flex-col items-center w-1/5 space-y-5">
                            <button type="button" className="flex items-center bg-blue-300 h-8 rounded-xl hover:bg-blue-500">
                                <FontAwesomeIcon icon={faPenToSquare}></FontAwesomeIcon>
                                <span>Chỉnh sửa</span>
                            </button>
                            <img className="h-30 w-30 flex"></img>
                        </div>
                    </div>
                    <div className="container flex">
                    </div>
                    <div className="container flex w-4/5">
                    </div>
                    <div className="container flex w-4/5">
                    </div>
                    <div className="container flex w-4/5">
                    </div>
                    <div className="container flex w-4/5">
                    </div>
                    <div className="container flex">
                    </div>
                </div>
            </div>
        </div>
    )
}