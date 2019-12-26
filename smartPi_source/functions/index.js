// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const admin = require('firebase-admin');
//  const util = require('util');

// Initialize Firebase
const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');

const app = dialogflow({debug: true});

// database initialization
admin.initializeApp();

const firebaseRef = admin.database().ref('/');

// const defaultDatabaseRef= firebase.database().ref('/');

// fynkcje urządzeń
const devices= {
  'światło': ['włącz', 'wyłącz', 'timer'],
  'brama': ['otwórz', 'zamknij', 'timer'],
};

// lista pomieszczeń
const rooms = {
  'salon': ['światło'],
  'sypialnia': ['światło'],
  'gabinet': ['światło'],
  'kuchnia': ['światło'],
  'korytarz': ['światło'],
  'toaleta': ['światło'],
  'łazienka': ['światło'],
  'pokój dziecięcy': ['światło'],
  'garaż': ['światło', 'brama']};

// wartości parametrów stanu urządzeń
const params = {
  'włącz': true,
  'wyłącz': false,
  'otwórz': true,
  'zamknij': false};

// stringi do dialogflow
const conversationRequest = {
  'włącz': 'włączam urządzenie',
  'wyłącz': 'wyłączam urządzenie',
  'otwórz': 'otwieram urządzenie',
  'zamknij': 'zamykam urządzenie',
};

const conversationQuery = {
  'włączone': 'włączone',
  'wyłączone': 'włączone',
  'otwarte': 'otwarte',
  'zamknięte': 'zamknięte',
};

app.intent('deviceOnOffIntent', (conv, {trait, device, room}) => {
  // eslint-disable-next-line max-len
  if (rooms[room].includes(device) && devices[device].includes(trait)) {
    const ref = firebaseRef.child(room).child(device).child('OnOff');
    const state = {On: params[trait]};
    ref.update(state)
        .then(() => state);
    return conv.ask(conversationRequest[trait] + ' ' + device +
        ' w pomieszczeniu ' + room);
  } else if (rooms[room].includes(device)) {
    return conv.ask('Urządzenie ' + device +
        ' nie posiada tej funkcji');
  } else {
    return conv.ask('Urządzenie ' + device +
        ' nie znajduje się w pomieszczeniu ' + room);
  }
});

app.intent('deviceAllOnOffIntent', (conv, {trait, allThings, device}) => {
  // eslint-disable-next-line max-len
  if (devices[device].includes(trait)) {
    // eslint-disable-next-line guard-for-in
    for (const room in rooms) {
      if (rooms[room].includes(device)) {
        const ref = firebaseRef.child(room).child(device).child('OnOff');
        const state = {On: params[trait]};
        ref.update(state)
            .then(() => state);
      }
    }
    return conv.ask('Zrobione!');
  } else {
    return conv.ask('Urządzenie ' + device +
         ' nie posiada tej funkcji');
  }
});


app.intent('deviceAllTimerIntent', (conv, {time, trait, device}) => {
  if (devices[device].includes('timer') && devices[device].includes(trait)) {
    for (const room in rooms) {
      if (rooms[room].includes(device)) {
        const ref = firebaseRef.child(room).child(device).child('timer');
        const state = {TimerOnOff: params[trait]};
        // eslint-disable-next-line camelcase
        const timerState = {Timer: time};
        ref.update(state)
            .then(() => state);
        ref.update(timerState)
            .then(() => timerState);
      }
    }
    return conv.ask('Dobrze. Zaczynam odliczać czas.');
  } else return conv.ask('Nie potrafię tego zrobić.');
});

app.intent('deviceTimerIntent', (conv, {trait, time, room, device}) => {
  if (rooms[room].includes(device) &&
      devices[device].includes(trait) &&
      devices[device].includes('timer')) {
    const ref = firebaseRef.child(room).child(device).child('timer');
    const state = {TimerOnOff: params[trait]};
    const timerState = {Timer: time};
    ref.update(state)
        .then(() => state);
    ref.update(timerState)
        .then(() => timerState);
    return conv.ask('Zaczynam odliczanie czasu' );
  } else {
    return conv.ask('Nie mogę tego zrobić. \n' +
      ' Czy mogę dla ciebie zrobić coś innego?');
  }
});

app.intent('resetTimerIntent', (conv, {room, device}) => {
  if (rooms[room].includes(device) &&
      devices[device].includes('timer')) {
    const ref = firebaseRef.child(room).child(device).child('timer');
    const state = {TimerOnOff: null};
    const timerState = {Timer: null};
    ref.update(state)
        .then(() => state);
    ref.update(timerState)
        .then(() => timerState);
    return conv.ask('Zresetowano timer' );
  } else {
    return conv.ask('Nie mogę tego zrobić. \n' +
        ' Czy mogę dla ciebie zrobić coś innego?');
  }
});

app.intent('resetAllTimerIntent', (conv, {device}) => {
  // eslint-disable-next-line guard-for-in
  if (devices[device].includes('timer')) {
    for (const room in rooms) {
      if (rooms[room].includes(device)) {
        const ref = firebaseRef.child(room).child(device).child('timer');
        const state = {TimerOnOff: null};
        const timerState = {Timer: null};
        ref.update(state)
            .then(() => state);
        ref.update(timerState)
            .then(() => timerState);
      }
    }
    return conv.ask('Zresetowano timery' );
  } else return conv.ask(device + 'nie ma funkcji timer.');
});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

