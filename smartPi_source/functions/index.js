// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const util = require('util');
const admin = require('firebase-admin');
// Initialize Firebase

const {dialogflow, BasicCard, Image} = require('actions-on-google');
const functions = require('firebase-functions');
const app = dialogflow({debug: true});

// database initialization
admin.initializeApp();
const firebaseRef = admin.database().ref('/');


// eslint-disable-next-line max-len
app.intent('garageDoorAction', (conv, {deviceGarageDoor, room, garageDoorAction}) => {
  const act = garageDoorAction;
  const ro = room;
  // var dev = device;
  return conv.ask('Robi się' + act + ro);
});

app.intent('lightAction', (conv, {room, generalAction}) => {
  const act = generalAction;
  const ro = room;
  // var dev = device;
  const params = true;
  const ref = firebaseRef.child(ro).child(act);
  const state = {OnOff: params};
  ref.update(state)
      .then(() => state);

  return conv.ask('Robi się' + act + ro);
});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
