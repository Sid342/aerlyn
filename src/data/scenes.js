export const SCENES = [
  {
    id: 'good-morning',
    name: 'Good Morning',
    deviceStates: {
      'cct-light': true,
      'usb-charger': true,
      'curtain': true,
      'geyser': true,
      'bldc-fan': false,
      'rgbw-strip': false,
      'smart-speaker': false,
    },
  },
  {
    id: 'movie-night',
    name: 'Movie Night',
    deviceStates: {
      'cct-light': false,
      'power-socket': false,
      'rgbw-strip': true,
      'curtain': false,
      'bldc-fan': true,
      'ac-ir': true,
      'smart-speaker': true,
    },
  },
  {
    id: 'good-night',
    name: 'Good Night',
    deviceStates: {
      'cct-light': false,
      'usb-charger': false,
      'rgbw-strip': false,
      'curtain': false,
      'bldc-fan': true,
      'door-lock': true,
      'camera': true,
      'gas-sensor': true,
      'smart-speaker': false,
    },
  },
];
