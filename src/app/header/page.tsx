import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons'
import Image from "next/image";
import Link from 'next/link';

export default function Header() {
    return (
        <div>
            <div className="bg-gray-300 flex w-full items-center">
                <Link href="/">
                    <Image alt="bus" src="/busicon.png" height={50} width={100} className="me-2"></Image>
                </Link>
                <p className="font-bold text-xl">Smart School Bus Tracking System</p>
                <div className='ml-auto mr-4'>
                    <Link href="/user/information">
                        <FontAwesomeIcon icon={faUser} className='fa-2xl' />
                    </Link>
                </div>
            </div>
        </div>
    );
}