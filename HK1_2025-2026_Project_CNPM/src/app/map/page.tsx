'use client'

import dynamic from 'next/dynamic'
import Header from '../header/page'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBusSide, faLocationDot, faMagnifyingGlassPlus, faPaperPlane, faRotateLeft, faUpRightAndDownLeftFromCenter, faUsers } from '@fortawesome/free-solid-svg-icons'

const MyMapComponent = dynamic(() => import('@/components/map'), {
    ssr: false, // 👈 Quan trọng: tắt server-side rendering
})

export default function Page() {
    return (
        <div className='flex flex-col bg-slate-400 h-full'>
            <Header></Header>
            <div className='m-5'>
                <div className='bg-gray-200 w-20 rounded-lg flex justify-center hover:bg-gray-300 mb-2'>
                    <Link href="/">
                        <FontAwesomeIcon icon={faRotateLeft}></FontAwesomeIcon>
                        <span>Trở lại</span>
                    </Link>
                </div>
                <div className='bg-stone-50 w-full h-full rounded-lg p-5'>
                    <div className='flex items-center space-x-2 mb-2'>
                        <FontAwesomeIcon icon={faPaperPlane}></FontAwesomeIcon>
                        <span>Bản đồ</span>
                    </div>
                    <div className='mb-2'>
                        <MyMapComponent />
                    </div>
                    <div className='flex flex-row justify-center space-x-4'>
                        <div className='border-2 border-stone-800 p-2 rounded-lg'>
                            <div>Hướng dẫn sử dụng</div>
                            <div className='space-x-2'>
                                <FontAwesomeIcon icon={faBusSide}></FontAwesomeIcon>
                                <span>Nhấp vào xe buýt để xem thông tin chi tiết</span>
                            </div>
                            <div className='space-x-2'>
                                <FontAwesomeIcon icon={faLocationDot}></FontAwesomeIcon>
                                <span>Nhấp vào điểm dừng để xem danh sách học sinh</span>
                            </div>
                            <div className='space-x-2'>
                                <FontAwesomeIcon icon={faMagnifyingGlassPlus}></FontAwesomeIcon>
                                <span>Sử dụng cá nút điều khiển để phóng to/thu nhỏ </span>
                            </div>
                            <div className='space-x-2'>
                                <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter}></FontAwesomeIcon>
                                <span>Nhấp vào nút mở rộng để xem toàn màn hình</span>
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <div className='flex flex-row justify-center items-center space-x-2 border-2 border-stone-800 rounded-lg p-2'>
                                <div>
                                    <FontAwesomeIcon icon={faUsers} className='fa-3x'></FontAwesomeIcon>

                                </div>
                                <div className='flex flex-col'>
                                    <span>40</span>
                                    <span>Học sinh trên xe</span>
                                </div>
                            </div>
                            <div className='flex flex-row justify-center items-center space-x-2 border-2 border-stone-800 rounded-lg p-2'>
                                <div>
                                    <FontAwesomeIcon icon={faLocationDot} className='fa-3x'></FontAwesomeIcon>
                                </div>
                                <div className='flex flex-col'>
                                    <span>4</span>
                                    <span>Điểm dừng</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
