const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🔄 Initializing WhatsApp Client for authentication...');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: false, // שונה ל-false כדי לראות מה קורה
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--disable-gpu'
            // הסרתי --no-zygote ו--single-process כי הם יכולים לגרום לבעיות
        ],
        timeout: 120000 // 2 דקות timeout
    }
});

// מאזין לאירוע טעינה - כדי לדעת שהתהליך התחיל
client.on('loading_screen', (percent, message) => {
    console.log('⏳ Loading:', percent + '%', message);
});

client.on('qr', (qr) => {
    console.log('📱 Scan this QR code with your WhatsApp app:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp connected successfully!');
    console.log('🔒 Session saved to ./.wwebjs_auth');
    console.log('You can now stop this script (Ctrl+C) and run your main server.');
});

client.on('authenticated', () => {
    console.log('🔐 Authenticated successfully');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
});

// הוספנו לוג במקרה של ניתוק
client.on('disconnected', (reason) => {
    console.log('❌ Client was logged out', reason);
});

// הוסף event listeners נוספים לזיהוי בעיות
client.on('change_state', (state) => {
    console.log('🔄 WhatsApp state changed:', state);
});

client.on('error', (error) => {
    console.error('❌ WhatsApp client error:', error.message);
    if (error.stack) {
        console.error('❌ Error stack:', error.stack);
    }
});

console.log('🚀 Starting client...');
console.log('⏳ This may take a minute - initializing Puppeteer and Chrome...');

// הוסף timeout כדי לראות אם יש בעיה
const timeout = setTimeout(() => {
    console.log('⏳ Still initializing... (this is normal, can take 30-60 seconds)');
    console.log('⏳ If this takes too long, there might be a Chrome/Puppeteer issue');
}, 10000);

client.initialize()
    .then(() => {
        clearTimeout(timeout);
        console.log('✅ Client initialization promise resolved');
    })
    .catch(err => {
        clearTimeout(timeout);
        console.error('❌ Initialization error:', err.message);
        console.error('❌ Error stack:', err.stack);
        console.error('\n💡 Possible solutions:');
        console.error('   1. Make sure Chrome/Chromium is installed');
        console.error('   2. Try running: npm install puppeteer --save');
        console.error('   3. Check if port 9222 is available');
        console.error('   4. Try deleting .wwebjs_auth and .wwebjs_cache folders');
        process.exit(1);
    });