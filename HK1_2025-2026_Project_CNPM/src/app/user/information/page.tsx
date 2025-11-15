'use client'

import Sidebar from "@/app/sidebar/page"
import Header from "@/app/header/page"
import api from '@/lib/api';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDownload, faPenToSquare } from "@fortawesome/free-solid-svg-icons"
import { ChangeEvent, useEffect, useState } from "react"

function checkNumber(number:string) {
    for(let i=0; i<number.length; i+=1)
        if( number[i]<'0' || number[i]>'9')
            return false;
        
    return true;
}

export default function Information() {
    const [lock, setLock] = useState(true);
    const [selectImg, setSelectImg] = useState(null);
    const [createAccountDay, setCreateAccountDay] = useState("2025-01-01");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [accountStatus, setAccountStatus] = useState("Active");
    const [dayOfBirth, setDayOfBirth] = useState("2015-01-01");
    const [nameDri, setnameDri] = useState("");
    const [number, setnumber] = useState("");
    const [idLicense, setidLicense] = useState("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        async function fetchData() {
        try {
            const res = await api.get(`/api/driver/info`);
            const dob = new Date(res.data.ngaySinh);
            const dobLocal = new Date(dob.getTime() - dob.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
            setDayOfBirth(dobLocal);
            setnameDri(res.data.tenTaiXe);
            setnumber(res.data.soDienThoai);
            setidLicense(res.data.soBangLai);

            if (res.data.maTaiKhoan) {
                const acc = await api.get(`/api/driver/infoAccount/${res.data.maTaiKhoan}`);
                setUsername(acc.data.tenDangNhap || "");
                setPassword(acc.data.matKhau || "");
                const created = acc.data.ngayTao ? new Date(acc.data.ngayTao) : null;
                if (created) {
                    const createdLocal = new Date(created.getTime() - created.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                    setCreateAccountDay(createdLocal);
                }
                setAccountStatus(acc.data.trangThai === 'Active' ? 'Active' : 'Inactive');
            }
        } catch (err) {
            console.error('Lỗi khi lấy thông tin tài xế:', err);
        }
        }
        fetchData();
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!username.trim() || !password.trim() || !nameDri.trim() || !number.trim() || !idLicense.trim()) {
            setError("Vui lòng nhập đầy đủ thông tin");
            alert(error);
            return;
        }

        if (!checkNumber(number)) {
            setError("Số điện thoại không hợp lệ");
            alert(error);
            return;
        }

        try {
        setSubmitting(true);
        await api.post("/api/driver/changeinfodriver", {
            tenTaiXe: nameDri,
            soDienThoai: number,
            soBangLai: idLicense,
            ngaySinh: dayOfBirth,
            anhTaiXe: selectImg,       
            tenDangNhap: username,
            matKhau: password,
            ngayTao: createAccountDay,
            trangThai: accountStatus
        });
        setMessage("Đã thay đổi thông tin thành công thành công");
        alert(message);
        } catch (e) {
            console.error(e);
            setError("Thay đổi thông tin thất bại, vui lòng thử lại");
        } finally {
            setSubmitting(false);
        }
    };

    const onChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectImg(URL.createObjectURL(event.target.files[0]));
        }
    }

    function handleLock() {
        setLock(false);
    }

    function handleSave() {
        setLock(true);
    }

    const showImg = (event: ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.files);
    }

    const date = new Date();
    return (
        <div>
            <Header></Header>
            <div className="flex">
                <Sidebar></Sidebar>
                <div className="flex flex-col w-full space-y-5 m-5">
                    <form onSubmit={onSubmit} className="container flex">
                        <div className="flex flex-col w-4/5 space-y-2">
                            <h1 className="text-2xl">Thông tin tài khoản</h1>
                            <div className="text-xl">Thông tin cá nhân:</div>
                            <div className="flex flex-row">
                                <label className="text-lg">Họ tên: </label>
                                <input
                                    type="text"
                                    className="bg-zinc-300 rounded-lg w-80 ml-auto"
                                    value={nameDri}
                                    onChange={(e) => setnameDri(e.target.value)}
                                    readOnly={lock}
                                />
                            </div>
                            <div className="flex flex-row">
                                <label className="text-lg">Số điện thoại: </label>
                                <input type="text" className="bg-zinc-300 rounded-lg w-80 ml-auto" value={number} onChange={(e) => setnumber(e.target.value)} readOnly={lock}/>
                            </div>
                            <div className="flex flex-row">
                                <div className="text-lg">Ngày sinh: </div>
                                <input type="date" className="bg-zinc-300 rounded-lg w-80 ml-auto" value={dayOfBirth} onChange={(e) => setDayOfBirth(e.target.value)} readOnly={lock}/>
                            </div>
                            <div className="flex flex-row">
                                <div className="text-lg">Mã số bằng lái: </div>
                                <input type="text" className="bg-zinc-300 rounded-lg w-80 ml-auto" value={idLicense} onChange={(e) => setidLicense(e.target.value)} readOnly={lock}/>
                            </div>
                            <div className="text-xl">Tài khoản:</div>
                            <div className="flex flex-row">
                                <div className="text-lg">Tên đăng nhập: </div>
                                <input type="text" className="bg-zinc-300 rounded-lg w-80 ml-auto" value={username} onChange={(e) => setUsername(e.target.value)} readOnly={lock}/>
                            </div>
                            <div className="flex flex-row">
                                <div className="text-lg">Mật khẩu: </div>
                                <input type="password" className="bg-zinc-300 rounded-lg w-80 ml-auto" value={password} onChange={(e) => setPassword(e.target.value)} readOnly={lock} />
                            </div>
                            <div className="flex flex-row">
                                <div className="text-lg">Ngày tạo tài khoản: </div>
                                <input type="date" className="bg-zinc-300 rounded-lg w-80 ml-auto" value={createAccountDay} onChange={(e) => setCreateAccountDay(e.target.value)} readOnly={lock} />
                            </div>
                            <div className="flex flex-row">
                                <div className="text-lg">Trạng thái</div>
                                <select className="ml-auto" disabled={lock} value={accountStatus} onChange={(e)=> setAccountStatus(e.target.value)}>
                                    <option value={"Active"}>Đang hoạt động</option>
                                    <option value={"Inactive"}>Không hoạt động</option>
                                </select>
                            </div>
                            <button type="submit" className="bg-blue-300 w-20 rounded-lg ml-auto hover:bg-blue-500" onClick={handleSave}>
                                <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon>
                                <span>Lưu</span>
                            </button>
                        </div>
                        <div className="flex flex-col items-center w-1/5 space-y-5">
                            <button type="button" className="flex items-center bg-blue-300 h-8 rounded-xl hover:bg-blue-500" onClick={handleLock}>
                                <FontAwesomeIcon icon={faPenToSquare}></FontAwesomeIcon>
                                <span>Chỉnh sửa</span>
                            </button>
                            <img className="h-30 w-30 flex" src={selectImg ?? ""}></img>
                            {!lock && <div className="bg-red-200 w-30 hover:bg-red-300 active:bg-red-500">
                                <label>Choose your image to upload
                                    <input type="file" accept="image/*" className="filetype" hidden onChange={onChangeImage} />
                                </label>
                            </div>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}