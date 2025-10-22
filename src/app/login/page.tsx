import Image from "next/image";

export default function login() {
    return (
        <div className="flex items-center justify-center h-screen ">
            <form action="" className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 border-4 border-stone-600">
                <Image src="/busicon.png" height={50} width={100} alt="bus"></Image>
                <h1 className="font-bold text-2xl">Hệ thống theo dõi xe buýt</h1>
                <p className="font-extralight">Dành cho tài xế</p>
                <input className="bg-gray-300 rounded-xl text-center m-4 h-6" type="text" placeholder="Tên đăng nhập" id="username"></input>
                <input className="bg-gray-300 rounded-xl text-center mb-4 h-6" type="password" placeholder="Mật khẩu" id="password"></input>
                <button id="submit" type="submit" className="bg-blue-500 rounded-2xl text-center h-8 w-32">Đăng nhập</button>
            </form>
        </div>
    );
}