import { faClipboardList, faMessage, faUserGear } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { Fragment } from "react"

const items = [
    {
        title: "Thông tin người dùng",
        url: "../user/information",
        icon: faUserGear,
    },
    {
        title: "Lịch trình",
        url: "../user/schedule",
        icon: faClipboardList,
    },
    {
        title: "Lịch sử thông báo",
        url: "../user/history",
        icon: faMessage
    },
]

const listItems = items.map(({ url, title, icon }) => (
    <li className="rounded-sm" key={url}>
        <Link href={url}>
            <FontAwesomeIcon icon={icon}></FontAwesomeIcon>
            <span>{title}</span>
        </Link>
    </li>
))

export default function Sidebar() {
    return (
        <div className="flex">
            <div className="flex flex-col h-screen p-3 bg-white shadow w-60 bg-zinc-100">
                <div className="space-y-3">
                    <div className="flex items-center">
                        <h2 className="text-xl font-bold">Dashboard</h2>
                    </div>
                    <div className="flex-1">
                        <ul className="pt-2 pb-4 space-y-1 text-sm">
                            {listItems}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}