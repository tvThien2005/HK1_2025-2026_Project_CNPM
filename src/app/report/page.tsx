import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from "../header/page";
import { faCaretLeft, faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react";
import Link from "next/link";

export default function report() {
    const date = new Date();

    return (
        <div>
            <Header></Header>
            <div className="flex flex-wrap items-center border-2 border-zinc-600 w-1/15 mt-5 ml-5 mb-5 rounded-xl">
                <Link href="/" className="flex flex-wrap items-center">
                    <FontAwesomeIcon icon={faCaretLeft}></FontAwesomeIcon>
                    <p>Trở lại</p>
                </Link>
            </div>
            <div className="border-3 border-zinc-300 rounded-lg mx-5">
                <div className="flex m-2">
                    <p>Người cần gửi tới: </p>
                    <select className="border-2 border-stone-900 rounded-lg ml-2">
                        <option>Quản lý A</option>
                        <option>Quản lý B</option>
                        <option>Quản lý C</option>
                    </select>
                    <div className="ml-auto mr-10 border-2 border-stone-900 rounded-lg px-3">
                        <p>{date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}</p>
                    </div>
                </div>
                <div className="flex flex-wrap m-2">
                    <p className="mr-10">Nội dung:</p>
                    <textarea className="bg-zinc-300 rounded-lg w-[90%] h-50"></textarea>
                </div>
            </div>
            <div className="flex flex-wrap place-self-end justify-center items-center m-5 bg-blue-500 w-1/20 rounded-xl hover:bg-blue-600">
                <FontAwesomeIcon icon={faPaperPlane}></FontAwesomeIcon>
                <p>Gửi</p>
            </div>
        </div>
    )
}