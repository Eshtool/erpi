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
  'światło': ['włącz', 'wyłącz'],
  'brama': ['otwórz', 'zamknij'],
  'telewizor': ['włącz', 'wyłącz'],
  'radio': ['włącz', 'wyłącz'],
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

// function changeAllDevicesState(device, trait, refToTrait, state) {
//   const endRef = '/' + device + refToTrait + '/';
//   if (devices[device].includes(trait)) {
//     for (const room in rooms) {
//       if (rooms[room].includes(device)) {
//         const ref = '/' + room + endRef;
//         const traitRef = admin.database().ref(ref);
//         traitRef.update(state)
//             .then(() => state);
//       }
//     }
//   }
// }

app.intent('deviceIntent', (conv, {trait, device, room, time}) => {
  let state;
  let parameter;
  let refToTrait;
  switch (trait) {
    case 'włącz':
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
          changeState(room, device, trait, refToTrait, parameter);
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
    case 'wyłącz':
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
          changeState(room, device, trait, refToTrait, parameter);
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
    case 'otwórz':
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
          changeState(room, device, trait, refToTrait, parameter);
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
    case 'zamknij':
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
          changeState(room, device, trait, refToTrait, parameter);
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

app.intent('resetTimerIntent', (conv, {device, room}) => {
  const refToTrait = 'Timer';
  const state = {on: null};
  const parameter = {timer: null};
  changeState(room, refToTrait, state);
  changeState(room, refToTrait, parameter);
  return conv.ask('Wyłączam odliczanie');
});
// app.intent('deviceAllOnOffIntent', (conv, {trait, allThings, device}) => {
//   // eslint-disable-next-line max-len
//   if (devices[device].includes(trait)) {
//     // eslint-disable-next-line guard-for-in
//     for (const room in rooms) {
//       if (rooms[room].includes(device)) {
//         const ref = firebaseRef.child(room).child(device).child('OnOff');
//         const state = {On: params[trait]};
//         ref.update(state)
//             .then(() => state);
//       }
//     }
//     return conv.ask('Zrobione!');
//   } else {
//     return conv.ask('Urządzenie ' + device +
//          ' nie posiada tej funkcji');
//   }
// });


// app.intent('deviceAllTimerIntent', (conv, {time, trait, device}) => {
//   if (devices[device].includes('timer') && devices[device].includes(trait)) {
//     for (const room in rooms) {
//       if (rooms[room].includes(device)) {
//         const ref = firebaseRef.child(room).child(device).child('timer');
//         const state = {TimerOnOff: params[trait]};
//         // eslint-disable-next-line camelcase
//         const timerState = {Timer: time};
//         ref.update(state)
//             .then(() => state);
//         ref.update(timerState)
//             .then(() => timerState);
//       }
//     }
//     return conv.ask('Dobrze. Zaczynam odliczać czas.');
//   } else return conv.ask('Nie potrafię tego zrobić.');
// });
//
// app.intent('deviceTimerIntent', (conv, {trait, time, room, device}) => {
//   if (rooms[room].includes(device) &&
//       devices[device].includes(trait) &&
//       devices[device].includes('timer')) {
//     const ref = firebaseRef.child(room).child(device).child('timer');
//     const state = {TimerOnOff: params[trait]};
//     const timerState = {Timer: time};
//     ref.update(state)
//         .then(() => state);
//     ref.update(timerState)
//         .then(() => timerState);
//     return conv.ask('Zaczynam odliczanie czasu' );
//   } else {
//     return conv.ask('Nie mogę tego zrobić. \n' +
//       ' Czy mogę dla ciebie zrobić coś innego?');
//   }
// });
//
// app.intent('resetTimerIntent', (conv, {room, device}) => {
//   if (rooms[room].includes(device) &&
//       devices[device].includes('timer')) {
//     const ref = firebaseRef.child(room).child(device).child('timer');
//     const state = {TimerOnOff: null};
//     const timerState = {Timer: null};
//     ref.update(state)
//         .then(() => state);
//     ref.update(timerState)
//         .then(() => timerState);
//     return conv.ask('Zresetowano timer' );
//   } else {
//     return conv.ask('Nie mogę tego zrobić. \n' +
//         ' Czy mogę dla ciebie zrobić coś innego?');
//   }
// });
//
// app.intent('resetAllTimerIntent', (conv, {device}) => {
//   // eslint-disable-next-line guard-for-in
//   if (devices[device].includes('timer')) {
//     for (const room in rooms) {
//       if (rooms[room].includes(device)) {
//         const ref = firebaseRef.child(room).child(device).child('timer');
//         const state = {TimerOnOff: null};
//         const timerState = {Timer: null};
//         ref.update(state)
//             .then(() => state);
//         ref.update(timerState)
//             .then(() => timerState);
//       }
//     }
//     return conv.ask('Zresetowano timery' );
//   } else return conv.ask(device + 'nie ma funkcji timer.');
// });


exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

