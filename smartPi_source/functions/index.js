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
  'światło': ['ON', 'OFF'],
  'brama': ['OPEN', 'CLOSE'],
  'telewizor': ['ON', 'OFF', 'volume up', 'volume down',
    'mute', 'channel', 'next channel', 'previous channel'],
  'radio': ['ON', 'OFF', 'volume up', 'volume down', 'mute',
    'channel', 'next channel', 'previous channel'],
};

// lista pomieszczeń
const rooms = {
  'salon': ['światło', 'klimatyzator', 'telewizor', 'radio'],
  'sypialnia': ['światło', 'klimatyzator'],
  'gabinet': ['światło', 'klimatyzator'],
  'kuchnia': ['światło', 'radio'],
  'korytarz': ['światło'],
  'toaleta': ['światło'],
  'łazienka': ['światło'],
  'pokój dziecięcy': ['światło', 'klimatyzator'],
  'garaż': ['światło', 'brama']};


// eslint-disable-next-line require-jsdoc
function changeState(room, device, refToTrait, state) {
  if (room === 'wszystkie') {
    const endRef = '/' + device + '/' + refToTrait + '/';
    for (const room in rooms) {
      if (rooms[room].includes(device)) {
        const ref = '/' + room + endRef;
        const traitRef = admin.database().ref(ref);
        traitRef.update(state)
            .then(() => state);
      }
    }
  } else if (rooms[room].includes(device)) {
    const ref = '/' + room + '/' + device + '/' + refToTrait + '/';
    const traitRef = admin.database().ref(ref);
    traitRef.update(state)
        .then(() => state);
  }
}

app.intent('deviceIntent', (conv, {trait, device, room, time}) => {
  let state;
  let parameter;
  let refToTrait;
  switch (trait) {
    case 'ON':
      if (devices[device].includes(trait)) {
        // zmiana stanu
        if (time === 'false') {
          state = {on: true};
          refToTrait = 'OnOff';
          changeState(room, device, refToTrait, state);
        } else {
          refToTrait = 'Timer';
          state = {on: true};
          parameter = {timer: time};
          changeState(room, device, refToTrait, state);
          changeState(room, device, refToTrait, parameter);
        }
        // zwracana odpowiedź
        if ( time !== 'false') return conv.ask('Włączam odliczanie.');
        if (room === 'wszystkie') {
          return conv.ask('Zrobione');
        } else if (rooms[room].includes(device)) {
          return conv.ask( 'Włączam urządzenie ' +
              device + ' w pomieszczeniu ' + room);
        } else {
          return conv.ask('Brak urządzenia ' + device +
              ' w pomieszczeniu ' + room);
        }
      } else {
        return conv.ask('Urządzenie ' + device + ' nie posiada tej funkcji');
      }
      break;
    case 'OFF':
      if (devices[device].includes(trait)) {
        // zmiana stanu
        if (time === 'false') {
          state = {on: false};
          refToTrait = 'OnOff';
          changeState(room, device, refToTrait, state);
        } else {
          refToTrait = 'Timer';
          state = {on: false};
          parameter = {timer: time};
          changeState(room, device, refToTrait, state);
          changeState(room, device, refToTrait, parameter);
        }
        // zwracana odpowiedź
        if ( time !== 'false') return conv.ask('Włączam odliczanie.');
        if (room === 'wszystkie') {
          return conv.ask('Zrobione');
        } else if (rooms[room].includes(device)) {
          return conv.ask( 'Wyłączam urządzenie ' +
              device + ' w pomieszczeniu ' + room);
        } else {
          return conv.ask('Brak urządzenia ' + device +
              ' w pomieszczeniu ' + room);
        }
      } else {
        return conv.ask('Urządzenie ' + device + ' nie posiada tej funkcji');
      }
      break;
    case 'OPEN':
      if (devices[device].includes(trait)) {
        // zmiana stanu
        if (time === 'false') {
          state = {open: true};
          refToTrait = 'OpenClose';
          changeState(room, device, refToTrait, state);
        } else {
          refToTrait = 'Timer';
          state = {on: true};
          parameter = {timer: time};
          changeState(room, device, refToTrait, state);
          changeState(room, device, refToTrait, parameter);
        }
        // zwracana odpowiedź
        if ( time !== 'false') return conv.ask('Włączam odliczanie.');
        if (room === 'wszystkie') {
          return conv.ask('Zrobione');
        } else if (rooms[room].includes(device)) {
          return conv.ask( 'Otwieram pomieszczenie ' + room);
        } else {
          return conv.ask('Brak urządzenia ' + device +
              ' w pomieszczeniu ' + room);
        }
      } else {
        return conv.ask('Urządzenie ' + device + ' nie posiada tej funkcji');
      }
      break;
    case 'CLOSE':
      if (devices[device].includes(trait)) {
        // zmiana stanu
        if (time === 'false') {
          state = {on: false};
          refToTrait = 'OpenClose';
          changeState(room, device, refToTrait, state);
        } else {
          refToTrait = 'Timer';
          state = {open: false};
          parameter = {timer: time};
          changeState(room, device, refToTrait, state);
          changeState(room, device, refToTrait, parameter);
        }
        // zwracana odpowiedź
        if ( time !== 'false') return conv.ask('Włączam odliczanie.');
        if (room === 'wszystkie') {
          return conv.ask('Zrobione');
        } else if (rooms[room].includes(device)) {
          return conv.ask( 'Zamykam pomieszczenie ' + room);
        } else {
          return conv.ask('Brak urządzenia ' + device +
              ' w pomieszczeniu ' + room);
        }
      } else {
        return conv.ask('Urządzenie ' + device + ' nie posiada tej funkcji');
      }
      break;
    default:
      return conv.ask('Nie rozumiem polecenia.');
  }
});

app.intent('resetIntent', (conv, {device, room}) => {
  const refToTrait = 'Timer';
  const parameter = {timer: false};
  changeState(room, device, refToTrait, parameter);
  return conv.ask('Wyłączam odliczanie');
});

app.intent('mediaIntent', (conv, {mediaTrait, device, room, number}) => {
  let state;
  let parameter;
  let refToTrait;

  switch (mediaTrait) {
    case 'volume up':
      if (devices[device].includes(mediaTrait)) {
        parameter = '+' + number;
        refToTrait = 'Volume';
        state = {volume: parameter};
        changeState(room, device, refToTrait, state);

        // zwracana odpowiedź
        if (room === 'wszystkie') {
          return conv.ask('Zrobione');
        } else if (rooms[room].includes(device)) {
          return conv.ask( 'Podgłaśniam  o ' +
              number);
        } else {
          return conv.ask('Brak urządzenia ' + device +
              ' w pomieszczeniu ' + room);
        }
      } else {
        return conv.ask('Urządzenie ' + device + ' nie posiada tej funkcji');
      }

    case 'volume down':
      if (devices[device].includes(mediaTrait)) {
        parameter = '-' + number;
        refToTrait = 'Volume';
        state = {volume: parameter};
        changeState(room, device, refToTrait, state);

        // zwracana odpowiedź
        if (room === 'wszystkie') {
          return conv.ask('Zrobione');
        } else if (rooms[room].includes(device)) {
          return conv.ask( 'Ściszam  o ' +
              number );
        } else {
          return conv.ask('Brak urządzenia ' + device +
              ' w pomieszczeniu ' + room);
        }
      } else {
        return conv.ask('Urządzenie ' + device + ' nie posiada tej funkcji');
      }
    case 'mute':
      if (devices[device].includes(mediaTrait)) {
        parameter = '0';
        refToTrait = 'Volume';
        state = {volume: parameter};
        changeState(room, device, refToTrait, state);

        // zwracana odpowiedź
        if (room === 'wszystkie') {
          return conv.ask('Zrobione');
        } else if (rooms[room].includes(device)) {
          return conv.ask( 'Wyciszono ' + device + ' w pomieszczeniu ' + room);
        } else {
          return conv.ask('Brak urządzenia ' + device +
              ' w pomieszczeniu ' + room);
        }
      } else {
        return conv.ask('Urządzenie ' + device + ' nie posiada tej funkcji');
      }

    case 'channel':
      if (devices[device].includes(mediaTrait)) {
        parameter = number;
        refToTrait = 'Channel';
        state = {channel: parameter};
        changeState(room, device, refToTrait, state);

        // zwracana odpowiedź
        if (room === 'wszystkie') {
          return conv.ask('Zrobione');
        } else if (rooms[room].includes(device)) {
          return conv.ask('Włączam kanał numer ' + number);
        } else {
          return conv.ask('Brak urządzenia ' + device +
              ' w pomieszczeniu ' + room);
        }
      } else {
        return conv.ask('Urządzenie ' + device + ' nie posiada tej funkcji');
      }

    case 'next channel':
      if (devices[device].includes(mediaTrait)) {
        parameter = '+1';
        refToTrait = 'Channel';
        state = {channel: parameter};
        changeState(room, device, refToTrait, state);

        // zwracana odpowiedź
        if (room === 'wszystkie') {
          return conv.ask('Zrobione');
        } else if (rooms[room].includes(device)) {
          return conv.ask( 'Następny kanał');
        } else {
          return conv.ask('Brak urządzenia ' + device +
              ' w pomieszczeniu ' + room);
        }
      } else {
        return conv.ask('Urządzenie ' + device + ' nie posiada tej funkcji');
      }

    case 'previous channel':
      if (devices[device].includes(mediaTrait)) {
        parameter = '-1';
        refToTrait = 'Channel';
        state = {channel: parameter};
        changeState(room, device, refToTrait, state);

        // zwracana odpowiedź
        if (room === 'wszystkie') {
          return conv.ask('Zrobione');
        } else if (rooms[room].includes(device)) {
          return conv.ask( 'Poprzedni kanał');
        } else {
          return conv.ask('Brak urządzenia ' + device +
              ' w pomieszczeniu ' + room);
        }
      } else {
        return conv.ask('Urządzenie ' + device + ' nie posiada tej funkcji');
      }

    default: return conv.ask('Nie rozumiem polecenia.');
  }
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

