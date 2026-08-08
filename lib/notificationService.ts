import {
  getFoodItems
} from "./foodService";



export async function getNotifications(
  uid:string
){

  const foods =
    await getFoodItems(uid);



  const notifications:any[] = [];



  const today =
    new Date();



  foods.forEach(
    (food:any)=>{


      if(!food.expirationDate)
        return;



      const date =
        new Date(
          food.expirationDate
        );



      const diff =

      (
        date.getTime()
        -
        today.getTime()

      )
      /
      (1000*60*60*24);




      if(diff < 0){


        notifications.push({

          type:"danger",

          message:
          `${food.name}の期限が切れています`

        });


      }

      else if(diff <= 3){


        notifications.push({

          type:"warning",

          message:
          `${food.name}の期限が近いです`

        });


      }


    }

  );



  return notifications;


}