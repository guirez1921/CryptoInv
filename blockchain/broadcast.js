const Pusher = require('pusher');
const dotenv = require('dotenv');
dotenv.config();

const {
  REVERB_APP_ID,
  REVERB_APP_KEY,
  REVERB_APP_SECRET,
  REVERB_HOST,
  REVERB_PORT,
  REVERB_SCHEME = 'http'
} = process.env;

const missing = [];
if (!REVERB_APP_ID) missing.push('REVERB_APP_ID');
if (!REVERB_APP_KEY) missing.push('REVERB_APP_KEY');
if (!REVERB_APP_SECRET) missing.push('REVERB_APP_SECRET');
if (!REVERB_HOST) missing.push('REVERB_HOST');
if (!REVERB_PORT) missing.push('REVERB_PORT');

if (missing.length > 0) {
  throw new Error('Missing required REVERB environment variables: ' + missing.join(', '));
}

const useTLS = REVERB_SCHEME === 'https';

const pusher = new Pusher({
  appId: REVERB_APP_ID,
  key: REVERB_APP_KEY,
  secret: REVERB_APP_SECRET,
  host: REVERB_HOST,
  port: parseInt(REVERB_PORT, 10),
  useTLS: useTLS,
});

async function broadcast(channel, event, data) {
  try {
    const res = await pusher.trigger(channel, event, data);
    console.log(`Broadcast success: ${channel} -> ${event}`);
    return res;
  } catch (err) {
    console.error(`Broadcast failed: ${channel} -> ${event}`, err);
    throw err;
  }
}

module.exports = { broadcast };