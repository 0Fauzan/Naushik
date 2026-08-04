import server from '../dist/server/server.js';

export default async function handler(req, res) {
  // If Vercel passes a Web Request natively
  if (typeof Request !== 'undefined' && req instanceof Request) {
    return server.fetch(req);
  }

  // Adapt Node.js VercelRequest to Web Request
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const url = new URL(req.url, `${protocol}://${host}`);
  
  const init = {
    method: req.method,
    headers: req.headers,
  };
  
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req;
    init.duplex = 'half';
  }
  
  const webRequest = new Request(url, init);
  
  try {
    const webResponse = await server.fetch(webRequest);
    
    res.status(webResponse.status);
    for (const [key, value] of webResponse.headers.entries()) {
      res.setHeader(key, value);
    }
    
    if (webResponse.body) {
      const reader = webResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
