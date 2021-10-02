export const environment = {
  serverTarget: require('../../../package.json').version,
  production: true,
  socket: `/hb/guddi/`,
  api: {
    base: `/hb/guddi/api`,
    socket: `${(window.location.protocol) === 'http:' ? 'ws://' : 'wss://'}${window.location.host}`,
    origin: window.location.origin,
    socketPath: `/hb/guddi/socket.io`,
  },
  jwt: {
    tokenKey: 'access_token',
    allowedDomains: [document.location.host],
    disallowedRoutes: [`${window.location.protocol}//${document.location.host}/hb/guddi/api/auth/login`],
  },
  apiHttpOptions: {},
  owm: {
    appid: 'fec67b55f7f74deaa28df89ba6a60821',
  },
};
