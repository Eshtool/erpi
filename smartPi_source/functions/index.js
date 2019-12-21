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
const rooms = ['salon', 'sypialnia', 'gabinet', 'kuchnia',
  'korytarz', 'toaleta', 'łazienka', 'pokój dziecięcy', 'garaż'];


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

  return conv.ask(action + ' wszystkie światła' );
});

app.intent('lightAllTimerAction', (conv, {actionLight, time}) => {
  const action = actionLight + 'enia';
  const params = {'włącz': true, 'wyłącz': false};
  rooms.forEach((room) => {
    const ref = firebaseRef.child(room).child('światło').child('timer');
    const state = {TimerOnOff: params[actionLight]};
    // eslint-disable-next-line camelcase
    const timerState = {Timer: time};
    ref.update(state)
        .then(() => state);
    ref.update(timerState)
        .then(() => timerState);
  });
  return conv.ask('Odliczam czas do ' + action +
      ' wszystkich świateł. Czy coś jeszcze?' );
});

app.intent('lightTimerAction', (conv, {actionLight, time, room}) => {
  const action = actionLight + 'enia';
  const params = {'włącz': true, 'wyłącz': false};
  const ref = firebaseRef.child(room).child('światło').child('timer');
  const state = {TimerOnOff: params[actionLight]};
  // eslint-disable-next-line camelcase
  const timerState = {Timer: time};
  ref.update(state)
      .then(() => state);
  ref.update(timerState)
      .then(() => timerState);
  return conv.ask('Odliczam czas do ' + action +
      'w pomieszczeniu ' + room );
});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
