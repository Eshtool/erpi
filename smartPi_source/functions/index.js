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

// lista pomieszczeń
var rooms = ['salon', 'sypialnia', 'gabinet', 'kuchnia', 'korytaż', 'toaleta', 'łazienka', 'garaż'];

app.intent('garageDoorAction', (conv, {deviceGarageDoor, room, garageDoorAction}) => {
  const act = garageDoorAction;
  const ro = room;
  // var dev = device;
  return conv.ask('Robi się' + act + ro);
});

app.intent('lightAction', (conv, {actionLight, deviceLight, room}) => {
  const action = actionLight + 'am';
  const params = {'włącz': true, 'wyłącz': false};

  const ref = firebaseRef.child(room).child('światło');
  const state = {OnOff: params[actionLight]};
  ref.update(state)
      .then(() => state);
  return conv.ask(action + ' w pomieszczeniu ' + room);
});

app.intent('lightAllAction', (conv, {actionLight}) => {
  const action = actionLight + 'am';
  const params = {'włącz': true, 'wyłącz': false};

  rooms.forEach((room) => {
    const ref = firebaseRef.child(room).child('światło');
    const state = {OnOff: params[actionLight]};
    ref.update(state)
        .then(() => state);
  });

  return conv.ask(action + ' wszystkie światła');
});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
