"use client";

import Link from "next/link";

export function NavBar(){
    
    return(
        <div className="sticky top-0 z-20 w-full border-b border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur">
        <nav className="flex flex-row h-16 items-center px-4
            text-sm uppercase text-sky-300/80
            bg-[linear-gradient(135deg,rgba(56,189,248,0.16),transparent_35%,rgba(15,23,42,0.35))]"
        >
            <div>
                <Link 
                    className="hover:text-sky-300"
                    href={"/"}
                >
                    DigitalContentStreamer
                </Link>
            </div>
        </nav>
        </div>
    );
}