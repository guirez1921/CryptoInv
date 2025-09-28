// Use Reverb only for broadcasting. Load env if present (so REVERB_* from .env are available).
// try { require('./env').loadEnv(); } catch (e) { /* ignore */ }

const Pusher = require('pusher');
// const log = (lvl, msg, meta = {}) => console.log(JSON.stringify({ lvl, msg, ...meta }));

const REVERB_APP_ID = process.env.REVERB_APP_ID || null;
const REVERB_APP_KEY = process.env.REVERB_APP_KEY || null;
const REVERB_APP_SECRET = process.env.REVERB_APP_SECRET || null;
const REVERB_HOST = process.env.REVERB_HOST || null;
const REVERB_PORT = process.env.REVERB_PORT || null;
const REVERB_SCHEME = (process.env.REVERB_SCHEME || 'https').replace(/"/g, '');

// Fail fast if required Reverb variables are missing
const missing = [];
if (!REVERB_APP_ID) missing.push('REVERB_APP_ID');
if (!REVERB_APP_KEY) missing.push('REVERB_APP_KEY');
if (!REVERB_APP_SECRET) missing.push('REVERB_APP_SECRET');
if (!REVERB_HOST) missing.push('REVERB_HOST');
if (!REVERB_PORT) missing.push('REVERB_PORT');

if (missing.length > 0) {
  // log('error', 'Missing required REVERB environment variables', { missing });
  throw new Error('Missing required REVERB environment variables: ' + missing.join(', '));
}

const useTLS = REVERB_SCHEME === 'https';

const pusherConfig = {
  appId: REVERB_APP_ID,
  key: REVERB_APP_KEY,
  secret: REVERB_APP_SECRET,
  cluster: process.env.PUSHER_CLUSTER || '',
  useTLS: useTLS,
  host: REVERB_HOST,
  port: parseInt(REVERB_PORT, 10),
  wsHost: REVERB_HOST,
  wsPort: parseInt(REVERB_PORT, 10)
};

// log('info', 'Using Reverb broadcaster', { host: REVERB_HOST, port: REVERB_PORT, scheme: REVERB_SCHEME, appId: REVERB_APP_ID });

const pusher = new Pusher(pusherConfig);

async function broadcast(channel, event, data) {
  try {
    const res = await pusher.trigger(channel, event, data);
    // log('debug', 'Broadcast success', { channel, event });
    return res;
  } catch (err) {
    // log('error', 'Broadcast failed', { channel, event, error: err.message });
    throw err;
  }
}

module.exports = { broadcast };
