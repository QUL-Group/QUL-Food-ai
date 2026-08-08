"use client";

import { useEffect, useState } from "react";

import BottomNav from "@/components/BottomNav";

import { auth } from "@/lib/firebase";

import { getFoodItems } from "@/lib/foodService";



export default function RecipePage(){


const [foods,setFoods] =
useState<any[]>([]);


const [recipe,setRecipe] =
useState("");


const [loading,setLoading] =
useState(false);




const loadFoods =
async()=>{


const user =
auth.currentUser;


if(!user)
return;



const data =
await getFoodItems(
user.uid
);


setFoods(data);


};



useEffect(()=>{

loadFoods();

},[]);







const generateRecipe =
async()=>{


setLoading(true);



try{


const response =
await fetch(

"/api/recipe-ai",

{

method:"POST",

headers:{

"Content-Type":
"application/json"

},


body: JSON.stringify

foods:
foods.map(
food=>food.name
)

})


}

);



const data =
await response.json();



setRecipe(
data.recipe
);



}catch(error){


setRecipe(
"生成に失敗しました"
);


}finally{


setLoading(false);


}



};








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

🍳 AI献立

</h1>





<section className="
mt-6
bg-white
rounded-3xl
p-6
">


<h2 className="font-bold">

🥬 使用できる食材

</h2>



<div className="
mt-4
flex
flex-wrap
gap-2
">


{

foods.map(

food=>(

<span

key={food.id}

className="
bg-[#F5F8FC]
px-3
py-2
rounded-xl
"

>

{food.name}

</span>


)

)

}


</div>




<button

onClick={generateRecipe}

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


{

loading

?

"🤖 考え中..."

:

"🍳 献立を作る"

}


</button>



</section>








{

recipe &&

<section className="
mt-6
bg-white
rounded-3xl
p-6
">


<h2 className="font-bold">

おすすめ献立

</h2>


<pre className="
mt-4
whitespace-pre-wrap
">

{recipe}

</pre>


</section>


}





</div>


</main>



<BottomNav/>


</>

);


}