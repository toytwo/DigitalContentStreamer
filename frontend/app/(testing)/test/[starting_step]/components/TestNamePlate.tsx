"use client";


type barProps = {
    name: string
    background_color: string
}
export function TestNamePlate({name, background_color}:barProps){
    return(
        // `${var}` is basically f string in python. When you include it in classname you also have to wrap {} because its dynamic.
        // Also note the hover. This is very common with buttons. There are other similar tailwind features you should check out.
        <label className={`${background_color} text-xl text-center border border-1
        hover:bg-neutral-100`}>
            {name}
        </label>
    );
};