import Sidebar from "@/app/sidebar/page";
import Header from "@/app/header/page";

export default function Schedule() {
    return (
        <div className="w-full">
            <Header></Header>
            <div className="flex">
                <Sidebar></Sidebar>
                Hello
            </div>
        </div>
    )
}