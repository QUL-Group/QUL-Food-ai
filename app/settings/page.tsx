"use client";

import { useEffect, useState } from "react";

import BottomNav from "@/components/BottomNav";

import { auth } from "@/lib/firebase";

import {
  saveUserSettings,
  getUserSettings,
  saveNotificationToken
} from "@/lib/userService";

import {
  requestNotificationPermission
} from "@/lib/notificationClient";




export default function SettingsPage(){


const [capacity,setCapacity] =
useState("");


const [family,setFamily] =
useState("1");



const [notice,setNotice] =
useState(true);

useEffect(()=>{


  const load =
  async()=>{


    const user =
    auth.currentUser;


    if(!user)
      return;



    const data =
    await getUserSettings(
      user.uid
    );



    if(data){


      setCapacity(
        data.capacity || ""
      );


      setFamily(
        data.family || "1"
      );


      setNotice(
        data.notice ?? true
      );


    }


  };


  load();


},[]);


return (

<>


<main className="
min-h-screen
bg-[#F5F8FC]
p-6
pb-28
">


<div className="
max-w-xl
mx-auto
">



<h1 className="
text-3xl
font-bold
text-[#809CCF]
">

⚙️ 設定

</h1>






<section className="
mt-6
bg-white
rounded-3xl
p-6
">


<h2 className="font-bold">

👤 ユーザー設定

</h2>



<p className="
mt-3
text-gray-600
">

QUL Food AI

</p>


</section>

<button

onClick={async()=>{


const user =
auth.currentUser;


if(!user)
return;



await saveUserSettings(

user.uid,

{

capacity,

family,

notice

}

);



alert(
"設定を保存しました"
);


}}

className="
mt-6
w-full
bg-[#809CCF]
text-white
py-3
rounded-xl
font-bold
"

>

💾 設定を保存

</button>





<section className="
mt-6
bg-white
rounded-3xl
p-6
">


<h2 className="font-bold">

🧊 冷蔵庫設定

</h2>



<input

value={capacity}

onChange={
e=>setCapacity(
e.target.value
)
}

placeholder="冷蔵庫容量（L）"

className="
mt-4
w-full
border
rounded-xl
p-3
"

/>



<select

value={family}

onChange={
e=>setFamily(
e.target.value
)
}

className="
mt-3
w-full
border
rounded-xl
p-3
"

>


<option value="1">
1人
</option>


<option value="2">
2人
</option>


<option value="3">
3人
</option>


<option value="4">
4人以上
</option>


</select>



</section>








<section className="
mt-6
bg-white
rounded-3xl
p-6
">


<h2 className="font-bold">

🔔 通知

</h2>

<button

onClick={async()=>{


const token =
await requestNotificationPermission();



console.log(
"通知TOKEN",
token
);



const user =
auth.currentUser;



if(
user &&
token
){


await saveNotificationToken(

user.uid,

token

);


}



alert(
"通知を有効化しました"
);


}}

className="
mt-4
bg-[#809CCF]
text-white
px-4
py-3
rounded-xl
font-bold
"

>

🔔 通知を有効化

</button>



<label className="
flex
justify-between
mt-4
">


<span>

期限通知

</span>


<input

type="checkbox"

checked={notice}

onChange={
e=>setNotice(
e.target.checked
)
}

/>


</label>


</section>





</div>

</main>


<BottomNav/>


</>

);


}