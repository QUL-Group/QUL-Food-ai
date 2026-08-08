const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();


exports.testNotification =
functions.https.onRequest(
  async (req,res)=>{


    res.send(
      "QUL Food AI Functions OK"
    );


  }
);