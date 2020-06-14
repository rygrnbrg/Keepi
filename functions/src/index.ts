import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

admin.initializeApp();
const db = admin.firestore();

exports.statistics = functions.firestore.document("users/{email}/leads_buyer/{leadId}").onCreate( 
    (snapshot, context) => {
        db.doc(`users/${context.params.email}/statistics`).create({ "hello": "world" }).catch(err=> console.log(err));
    });
