const path = require('path');
const fs = require('fs');

// Load the Laravel project .env so blockchain code uses the same env variables.
// This is safe for development; in production you should provide env vars through the environment
// (this loader will not overwrite existing process.env values).
function loadEnv() {
  try {
    const projectRoot = path.resolve(__dirname, '..');
    const dotenvPath = path.join(projectRoot, '.env');
    if (fs.existsSync(dotenvPath)) {
      // require dotenv lazily; if missing, fail silently
      try {
        require('dotenv').config({ path: dotenvPath });
      } catch (e) {
        // If dotenv isn't installed, do nothing; process.env may already be set
      }
    }
  } catch (e) {
    // swallow errors — not fatal
  }
}

module.exports = { loadEnv };
