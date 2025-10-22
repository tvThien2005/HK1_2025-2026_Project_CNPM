'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons'
import Image from "next/image";
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
    const [show, setShow] = useState(false);

    function handleShow() {
        setShow(!show);
    }

    return (
        <div>
            <div className="bg-gray-300 flex w-full items-center">
                <Link href="/">
                    <Image alt="bus" src="/busicon.png" height={50} width={100} className="me-2"></Image>
                </Link>
                <p className="font-bold text-xl">Smart School Bus Tracking System</p>
                <div className='flex flex-col ml-auto mr-4 items-center'>
                    <FontAwesomeIcon icon={faUser} className='fa-2xl' onClick={handleShow} />
                    {show && <div className='bg-stone-50 flex flex-col'>
                        <Link href="/user/information" className='hover:bg-stone-200'>
                            Thông tin tài xế
                        </Link>
                        <div className='hover:bg-stone-200'>Log out</div>
                    </div>}
                </div>
            </div>
        </div >
    );
}