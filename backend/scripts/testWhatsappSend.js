const { Client, LocalAuth } = require('whatsapp-web.js');

// מספר הטלפון שלך לבדיקה (החלף במספר האמיתי שלך אם צריך)
// הפורמט חייב להיות: 9725XXXXXXXX@c.us
const TEST_PHONE_NUMBER = '972528553431@c.us'; // <-- שנה למספר שלך!

console.log('🔄 Initializing WhatsApp Client for testing...');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth' // שימוש באותו נתיב שבו שמרנו את הסשן
    }),
    puppeteer: {
        headless: true, // חזרנו למצב שקט - הדפדפן ירוץ ברקע
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
        timeout: 60000
    }
});

// לוגים לדיבוג - לראות התקדמות
client.on('loading_screen', (percent, message) => {
    console.log('⏳ Loading:', percent + '%', message);
});

client.on('change_state', state => {
    console.log('ℹ️ Connection state changed:', state);
});

client.on('ready', async () => {
    console.log('✅ Client is ready!');
    
    try {
        console.log(`🔍 Verifying number: ${TEST_PHONE_NUMBER}...`);
        
        // מנקה את המספר לפורמט נקי (רק ספרות)
        const number = TEST_PHONE_NUMBER.replace('@c.us', '');
        
        // בדיקה האם המספר רשום בוואטסאפ
        const isRegistered = await client.isRegisteredUser(number);
        
        if (isRegistered) {
            console.log('✅ Number is registered on WhatsApp.');
            
            // מנסה להשיג את המזהה הפנימי המלא (Serialized ID)
            let targetId = TEST_PHONE_NUMBER;
            try {
                 const contact = await client.getNumberId(number);
                 if(contact && contact._serialized) {
                     targetId = contact._serialized;
                     console.log(`🎯 Resolved target ID: ${targetId}`);
                 }
            } catch (e) {
                console.log('⚠️ Could not resolve ID via getNumberId, trying direct send...');
            }

            console.log(`📤 Sending test message to ${targetId}...`);
            const response = await client.sendMessage(targetId, '🤖 זוהי הודעת בדיקה במצב שקט (Headless)! אם קיבלת אותה - המערכת מוכנה לייצור.');
            console.log('✅ Message sent successfully:', response.id.id);
        } else {
            console.error('❌ Number is NOT registered on WhatsApp.');
        }
        
        console.log('⏳ Waiting 5 seconds before closing...');
        setTimeout(() => {
            console.log('👋 Closing client.');
            client.destroy();
            process.exit(0);
        }, 5000);
        
    } catch (error) {
        console.error('❌ Failed to send message:', error);
        // client.destroy(); // לא סוגר מיד כדי שתוכל לראות שגיאות
        // process.exit(1);
    }
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed. You might need to re-scan the QR.', msg);
});

client.on('disconnected', (reason) => {
    console.log('❌ Client was logged out', reason);
});

console.log('🚀 Starting client...');
client.initialize().catch(err => {
    console.error('❌ Initialization error:', err.message);
});