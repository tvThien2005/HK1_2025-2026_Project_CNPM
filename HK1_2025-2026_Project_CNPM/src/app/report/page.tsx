"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from "../header/page";
import { faCaretLeft, faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function report() {
    const date = new Date();
    const [parent, setPerent] = useState<any[]>([]);
    const [loadingParents, setLoadingParents] = useState<boolean>(false);
    const [selectedParentId, setSelectedParentId] = useState<string>("");
    const [noiDung, setNoiDung] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        async function fetchData() {
        try {
            const res = await api.get("/api/driver/allparent");
            setPerent(res.data.results);
        } catch (err) {
            console.error("Lỗi khi lấy lịch sử:", err);
        } 
        }
        fetchData();
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!noiDung.trim()) {
            setError("Vui lòng nhập nội dung cảnh báo");
            return;
        }
        try {
        setSubmitting(true);
        await api.post("/api/driver/postwarning", {
            noiDung: noiDung.trim(),
            parentIds: [Number(selectedParentId)],
        });
        setMessage("Đã gửi cảnh báo tới phụ huynh thành công");
        setSelectedParentId("");
        } catch (e) {
            console.error(e);
            setError("Gửi cảnh báo thất bại, vui lòng thử lại");
        } finally {
            setSubmitting(false);
        }
    };
 

    return (
        <div>
            <Header></Header>
            <div className="flex flex-wrap items-center border-2 border-zinc-600 w-1/15 mt-5 ml-5 mb-5 rounded-xl hover:bg-zinc-300">
                <Link href="/" className="flex flex-wrap items-center">
                    <FontAwesomeIcon icon={faCaretLeft}></FontAwesomeIcon>
                    <p>Trở lại</p>
                </Link>
            </div>
            <form onSubmit={onSubmit}>
            <div className="border-3 border-zinc-300 rounded-lg mx-5">
                
                <div className="flex m-2">
                    <p>Người cần gửi tới: </p>
                    <select className="border-2 border-stone-900 rounded-lg ml-2" onChange={(e) => setSelectedParentId(e.target.value)}>
                        <>
                            {parent.map( (p)=>(
                                <option key={p.maPhuHuynh} value={p.maPhuHuynh}>{p.tenPhuHuynh}</option>
                            ))}
                        
                        </>
                    </select>
                    <div className="ml-auto mr-10 border-2 border-stone-900 rounded-lg px-3">
                        <p>{date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}</p>
                    </div>
                </div>
                <div className="flex flex-wrap m-2">
                    <p className="mr-10">Nội dung:</p>
                    <textarea value={noiDung} className="bg-zinc-300 rounded-lg w-[90%] h-50" onChange={(e) => setNoiDung(e.target.value)}></textarea>
                </div>
            </div>
            <button type="submit" className="flex flex-wrap place-self-end justify-center items-center m-5 bg-blue-500 w-1/20 rounded-xl hover:bg-blue-600" disabled={submitting || loadingParents}>
              <FontAwesomeIcon icon={faPaperPlane}></FontAwesomeIcon>
              {submitting ? "Đang gửi..." : "Gửi"}
            </button>
            </form>
        </div>
    )
}