
const baseHref = window.location.pathname.split('/')[1] === 'hb' ?
  '/hb/' + window.location.pathname.split('/')[2]
  : '';

console.log('baseHrf: ' + baseHref);

export const environment = {
  serverTarget: require('../../../package.json').version,
  production: true,
  socket: `${baseHref}`,
  api: {
    base: `${baseHref}/api`,
    socket: `${(window.location.protocol) === 'http:' ? 'ws://' : 'wss://'}${window.location.host}`,
    origin: window.location.origin,
    socketPath: `${baseHref}/socket.io`,
  },
  jwt: {
    tokenKey: 'access_token',
    allowedDomains: [document.location.host],
    disallowedRoutes: [`${window.location.protocol}//${document.location.host}${baseHref}/api/auth/login`],
  },
  apiHttpOptions: {},
  owm: {
    appid: 'fec67b55f7f74deaa28df89ba6a60821',
  },
};
