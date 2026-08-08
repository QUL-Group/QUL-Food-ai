"use client";

import Link from "next/link";

import {
  usePathname
} from "next/navigation";



export default function BottomNav(){


const pathname =
usePathname();



const menus = [

{
name:"🏠",
label:"ホーム",
path:"/"
},

{
name:"🥬",
label:"食材",
path:"/fridge"
},

{
name:"📷",
label:"レシート",
path:"/receipt"
},

{
name:"🍳",
label:"レシピ",
path:"/recipe"
},

{
name:"👤",
label:"設定",
path:"/settings"
}

];




return (

<nav className="
fixed
bottom-0
left-0
right-0
bg-white
border-t
p-3
z-50
">


<div className="
max-w-xl
mx-auto
flex
justify-around
">


{

menus.map(

menu=>(


<Link

key={menu.path}

href={menu.path}

className={`
flex
flex-col
items-center
text-sm

${
pathname===menu.path

?

"text-[#809CCF] font-bold"

:

"text-gray-500"

}

`}

>


<span className="text-xl">

{menu.name}

</span>


<span>

{menu.label}

</span>


</Link>


)

)


}


</div>


</nav>

);


}