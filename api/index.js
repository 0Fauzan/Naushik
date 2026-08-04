export const config = {
  runtime: 'edge',
};

import server from '../dist/server/server.js';

export default function(req) {
  return server.default.fetch(req);
}
