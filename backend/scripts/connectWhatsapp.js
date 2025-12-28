const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🔄 Initializing WhatsApp Client for authentication...');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true, // שנה ל-false אם אתה רוצה לראות את הדפדפן נפתח (לצורך דיבוג)
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- זה יכול לעזור בבעיות זיכרון
            '--disable-gpu'
        ],
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

console.log('🚀 Starting client...');
client.initialize().catch(err => {
    console.error('❌ Initialization error:', err.message);
});