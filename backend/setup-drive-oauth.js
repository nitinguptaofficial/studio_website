/**
 * ONE-TIME SETUP SCRIPT — Google Drive OAuth2 Token Generator
 *
 * Run this once to authorize your personal Google account:
 *   node setup-drive-oauth.js
 *
 * Prerequisites:
 *   1. Go to https://console.cloud.google.com/apis/credentials
 *   2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
 *   3. Application type: "Desktop app"
 *   4. Download or copy the Client ID and Client Secret
 *   5. Add them to your .env file as GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
 *   6. Run this script
 */

require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env');
  console.error('\nSteps to get them:');
  console.error('  1. Go to https://console.cloud.google.com/apis/credentials');
  console.error('  2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"');
  console.error('  3. Application type: "Desktop app" (name it anything)');
  console.error('  4. Copy Client ID and Client Secret into your .env file:');
  console.error('     GOOGLE_CLIENT_ID=your_client_id_here');
  console.error('     GOOGLE_CLIENT_SECRET=your_client_secret_here');
  console.error('  5. Run this script again.\n');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob' // Desktop redirect
);

// Use a localhost redirect for token exchange
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/drive'],
  redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
});

console.log('\n🔗 Open this URL in your browser and authorize your Google account:\n');
console.log(authUrl);
console.log('\nAfter authorizing, Google will show you an authorization code.');
console.log('Copy that code and paste it below.\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('📋 Paste the authorization code here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken({
      code: code.trim(),
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
    });

    console.log('\n✅ Authorization successful!\n');
    console.log('Add this to your .env file:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\n📝 Your complete Google Drive .env config should look like:');
    console.log('─'.repeat(50));
    console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GOOGLE_DRIVE_ROOT_FOLDER_ID=${process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || 'your_folder_id'}`);
    console.log('─'.repeat(50));
    console.log('\nThen restart your backend server. 🚀\n');
  } catch (err) {
    console.error('\n❌ Error exchanging code for token:', err.message);
    console.error('Make sure you copied the full authorization code.\n');
  } finally {
    rl.close();
  }
});
