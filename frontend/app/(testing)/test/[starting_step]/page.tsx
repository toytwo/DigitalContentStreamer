"use client";

import { useEffect, useState } from "react";
import { TestNamePlate } from "./components/TestNamePlate";
import { useParams } from "next/navigation";

export default function Page(){
    // Here is how you get the path variables
    const params = useParams();
    const step = Array.isArray(params.starting_step)
        ? params.starting_step[0]
        : params.starting_step;
    // use a usestate when you want a change to be reflected in the page. React forces a refresh.
    const [allUsers, setAllUsers] = useState<string[]>();
    // otherwise just use a const
    const colorPalette = [
        "bg-orange-400",
        "bg-yellow-400",
        "bg-green-400",
        "bg-blue-400",
        "bg-indigo-400",
        "bg-violet-400",
    ];
    // Runs on mount because nothing in []
    useEffect(() => {
        fetch(
            // Note: this is different than what is defined in test_routes because of the prefix in main
            `http://localhost:8000/test/test_get_all_users`,
            {
                credentials: "include",
            }
        )
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                if (data?.success) {
                    setAllUsers(data.users);
                } else {
                    console.log(data?.error ?? "Network Error");
                }
            });
    }, [])

    // You can return alternate html depending on state.
    if(!allUsers){
        return(
            <div>
                Loading...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 items-center text-4xl">
            <header>
                Page {step} From URL params
            </header>
            <div className="grid grid-cols-10 gap-2 justify-center">
                {/* You can dynamically create a variable number of components*/}
                {Array.from({ length: allUsers.length }).map(
                    (_, i) => (
                        <TestNamePlate
                            name={allUsers[i]}
                            background_color={colorPalette[i%colorPalette.length]}
                            // React requires a key for generation like this. You cant access it. 
                            // If you need the index, you have to pass it as a prop in the same way as name.
                            key={i}
                        />
                    ),
                )}
            </div>
        </div>
    );
}