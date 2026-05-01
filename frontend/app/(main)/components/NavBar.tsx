"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentSession, type SessionUser } from "../../../lib/auth";

export function NavBar(){
    const [profileImageUrl, setProfileImageUrl] = useState<string>("profiles/DefaultProfileImage.png");
    const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
    
    useEffect(() => {
        getCurrentSession()
          .then((currentUser) => {
                setSessionUser(currentUser);
          });
    }, []);
    
    useEffect(() => {
        if (!sessionUser) return;
        
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/user_profile/image`, {
                    credentials: "include"
                });
                const data = await response.json();
                setProfileImageUrl(data.payload.profile_image_filepath); 
            } catch (error) {
                console.error("Failed to fetch profile image:", error);
            }
        };

        fetchData();
    }, [sessionUser]);
    
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
            <div className="ml-auto">
                <Link 
                    className="rounded-full border border-white/10 bg-white/3 hover:bg-white/5 hover:text-sky-300 px-3 py-1 gap-2 flex flex-row items-center"
                    href={"/profile"}
                >
                    Profile
                    <img 
                        src={`http://localhost:8000/api/images/${profileImageUrl}`} 
                        alt="Profile"
                        className="border border-white/10 w-10 h-10 rounded-full"
                    />
                </Link>
            </div>
        </nav>
        </div>
    );
}