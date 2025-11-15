"use client";
import Image from "next/image";
import React, { useState } from 'react';
import axios, { isAxiosError } from 'axios';

export default function Login() {
    const [tenDangNhap, setTenDangNhap] = useState('');
    const [matKhau, setMatKhau] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/Login', {
                tenDangNhap: tenDangNhap,
                matKhau: matKhau
            });

            console.log('Đăng nhập thành công!', response.data);
            const token = response.data.token;
            localStorage.setItem('userToken', token);
            window.location.href ='/';

        } catch (err) { 
            if (isAxiosError(err)) {
                if (err.response) {
                    console.error('Lỗi từ server:', err.response.data.message);
                    setError(err.response.data.message);
                } else {
                    console.error('Lỗi kết nối:', err.message);
                    setError('Không thể kết nối đến server. Vui lòng thử lại.');
                }
            } else {
                console.error('Một lỗi không xác định đã xảy ra:', err);
                setError('Đã có lỗi xảy ra.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <form action="" onSubmit={handleLogin} className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 border-4 border-stone-600" >
                <Image src="/busicon.png" height={50} width={100} alt="bus"></Image>
                <h1 className="font-bold text-2xl">Hệ thống theo dõi xe buýt</h1>
                <p className="font-extralight">Dành cho tài xế</p>
                <input className="bg-gray-300 rounded-xl text-center m-4 h-6" type="text" value={tenDangNhap} placeholder="Tên đăng nhập" id="username" onChange={(e) => setTenDangNhap(e.target.value)}></input>
                <input className="bg-gray-300 rounded-xl text-center mb-4 h-6" type="password" value={matKhau} placeholder="Mật khẩu" id="password" onChange={(e) => setMatKhau(e.target.value)}></input>
                <button id="submit" type="submit" className="bg-blue-500 rounded-2xl text-center h-8 w-32">Đăng nhập</button>
            </form>
        </div>
    );
}