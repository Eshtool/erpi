// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const admin = require('firebase-admin');
// Initialize Firebase

const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');
const app = dialogflow({debug: true});

// database initialization
admin.initializeApp();
const firebaseRef = admin.database().ref('/');

// zbiory  do rejestracji urzdzeń
// const bathroom = new set('światło'); // setOfWords.has("zythum") => true/false
// const livingroom = new set('światło');
// const hall = new set('światło');
// const bedroom = new set('światło');
// const garage = new set('światło');
// const kitchen = new set('światło');
// const toilet = new set('światło');


app.intent('garageDoorAction', (conv, {deviceGarageDoor, room, garageDoorAction}) => {
  const act = garageDoorAction;
  const ro = room;
  // var dev = device;
  return conv.ask('Robi się' + act + ro);
});

app.intent('lightAction', (conv, {actionLight, deviceLight, room}) => {
  var action = actionLight + 'am';
  var params = {'włącz': true, 'wyłącz': false};

  const ref = firebaseRef.child(room).child('światło');
  const state = {OnOff: params[actionLight]};
  ref.update(state)
      .then(() => state);
  return conv.ask(action + ' w pomieszczeniu ' + room);
});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
