const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { templates } = require('../utils/messageTemplates');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.isConnected = false;
    this.isAuthenticated = false;
    this.client = null;
    this.readyPromise = null;
    this.initializing = false;
    this.lastQr = null;
    this.lastQrAt = null;

    // Provider selection:
    // - cloud: WhatsApp Cloud API (no QR)
    // - webjs: whatsapp-web.js (requires QR)
    const cloudConfigured = Boolean(process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
    this.provider = process.env.WHATSAPP_PROVIDER || (cloudConfigured ? 'cloud' : 'webjs');
  }

  // אתחול השירות
  initialize(retryCount = 0) {
    // Cloud API לא דורש אתחול/QR
    if (this.provider === 'cloud') {
      this.isConnected = Boolean(process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
      this.isAuthenticated = this.isConnected;
      this.initializing = false;
      if (!this.isConnected) {
        console.warn('⚠️ WhatsApp Cloud API selected but missing env vars (WHATSAPP_CLOUD_TOKEN / WHATSAPP_PHONE_NUMBER_ID)');
      } else {
        console.log('✅ WhatsApp Cloud API enabled (no QR required)');
      }
      return;
    }

    const MAX_RETRIES = 5;
    const RETRY_DELAY = 30000; // 30 seconds

    if (this.client && this.isConnected) {
      console.log('✅ WhatsApp Service already initialized and connected');
      return;
    }

    // מניעת כפל אתחול (המערכת קוראת initialize גם מ-server.js וגם מטעינת המודול)
    if (this.initializing) {
      console.log('⏳ WhatsApp Service is already initializing - skipping');
      return;
    }

    if (this.client) {
      console.log('⚠️ WhatsApp client already exists, skipping initialization');
      return;
    }

    console.log('🔄 Initializing WhatsApp Service...');
    this.initializing = true;

    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: './.wwebjs_auth'
        }),
        puppeteer: {
          headless: true, // במצב פרודקשן נרצה שזה ירוץ ברקע
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

      this.setupEventListeners();

      // יצירת Promise שיושלם כשהלקוח מוכן
      let timeoutHandle = null;
      this.readyPromise = new Promise((resolve, reject) => {
        timeoutHandle = setTimeout(() => {
          if (!this.isConnected) {
            console.warn('⚠️ WhatsApp initialization timeout - service will continue but may not be ready');
            // לא נדחה את ה-Promise, רק נדפיס אזהרה
            // השרת ימשיך לעבוד גם בלי WhatsApp
          }
        }, 120000); // 2 minutes timeout

        this.client.on('ready', () => {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          this.isConnected = true;
          this.isAuthenticated = true;
          // אחרי חיבור - אין צורך ב-QR
          this.lastQr = null;
          this.lastQrAt = null;
          this.initializing = false;
          console.log('✅ WhatsApp Service is ready!');
          resolve();
        });

        this.client.on('auth_failure', (msg) => {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          console.error('❌ WhatsApp auth failure:', msg);
          this.isAuthenticated = false;
          this.isConnected = false;
          this.initializing = false;
          // לא נדחה את ה-Promise כדי לא לקרוס את השרת
          // השרת ימשיך לעבוד גם בלי WhatsApp
        });
      }).catch(err => {
        // Catch any errors in the promise to prevent uncaught exceptions
        console.error('❌ WhatsApp readyPromise error (non-fatal):', err.message);
        this.initializing = false;
        return null; // Return null so the promise resolves instead of rejecting
      });

      console.log('🚀 Starting WhatsApp client initialization...');
      this.client.initialize()
        .then(() => {
          console.log('✅ WhatsApp client.initialize() completed successfully');
        })
        .catch(err => {
          console.error('❌ WhatsApp Service initialization error:', err.message);
          this.initializing = false;

          // אם זו שגיאת אינטרנט, ננסה שוב אחרי זמן
          if (err.message.includes('ERR_INTERNET_DISCONNECTED') ||
            err.message.includes('ECONNREFUSED') ||
            err.message.includes('ENOTFOUND')) {
            if (retryCount < MAX_RETRIES) {
              console.log(`⏳ Retrying WhatsApp initialization in ${RETRY_DELAY / 1000} seconds... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
              setTimeout(() => {
                this.client = null;
                this.initialize(retryCount + 1);
              }, RETRY_DELAY);
            } else {
              console.error('❌ WhatsApp Service failed after', MAX_RETRIES, 'retries');
              console.error('⚠️ Server will continue running without WhatsApp functionality');
              console.error('❌ Please check your internet connection and try again');
            }
          } else {
            console.error('❌ Error stack:', err.stack);
            console.error('⚠️ Server will continue running without WhatsApp functionality');
            console.error('❌ This usually means:');
            console.error('   1. WhatsApp needs QR code scan (check for QR code in logs)');
            console.error('   2. Authentication failed (check .wwebjs_auth folder)');
            console.error('   3. Puppeteer/Chrome issue (check if Chrome is installed)');
          }
        });
    } catch (err) {
      console.error('❌ Error creating WhatsApp client:', err.message);
      this.initializing = false;
      if (retryCount < MAX_RETRIES) {
        console.log(`⏳ Retrying WhatsApp initialization in ${RETRY_DELAY / 1000} seconds... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          this.initialize(retryCount + 1);
        }, RETRY_DELAY);
      }
    }
  }

  setupEventListeners() {
    this.client.on('loading_screen', (percent, message) => {
      console.log('⏳ WhatsApp Loading:', percent + '%', message);
    });

    this.client.on('qr', (qr) => {
      console.log('📱 WhatsApp QR Code generated - Please scan with your phone!');
      console.log('📱 QR Code (scan this with WhatsApp on your phone):');
      // שמירה כדי לאפשר צפייה דרך API (מוגן)
      this.lastQr = qr;
      this.lastQrAt = new Date();
      this.isAuthenticated = false;
      // בסביבת שרת אולי נרצה לשמור את ה-QR כתמונה או לשלוח אותו למקום אחר
      // כרגע נדפיס ללוג למקרה הצורך (למשל בהרצה ידנית)
      qrcode.generate(qr, { small: true });
    });

    this.client.on('authenticated', () => {
      console.log('🔐 WhatsApp Authenticated successfully');
      this.isAuthenticated = true;
    });

    this.client.on('auth_failure', (msg) => {
      console.error('❌ WhatsApp Authentication failed:', msg);
      this.isConnected = false;
      this.isAuthenticated = false;
      this.initializing = false;
      // נדחה את ה-readyPromise כדי שהקוד לא יחכה לנצח
      if (this.readyPromise) {
        console.error('❌ WhatsApp auth failure - rejecting readyPromise');
      }
    });

    this.client.on('disconnected', (reason) => {
      console.log('❌ WhatsApp Client was logged out:', reason);
      this.isConnected = false;
      this.isAuthenticated = false;
      this.initializing = false;
      this.client = null;

      // ניסיון חיבור מחדש אוטומטי אחרי 10 שניות
      console.log('⏳ Attempting to reconnect WhatsApp in 10 seconds...');
      setTimeout(() => {
        if (!this.isConnected) {
          console.log('🔄 Reconnecting WhatsApp Service...');
          this.initialize(0);
        }
      }, 10000);
    });

    // הוסף event listeners נוספים לזיהוי בעיות
    this.client.on('change_state', (state) => {
      console.log('🔄 WhatsApp state changed:', state);
      if (state === 'CONNECTING') {
        console.log('   → Connecting to WhatsApp...');
      } else if (state === 'OPENING') {
        console.log('   → Opening WhatsApp Web...');
      } else if (state === 'PAIRING') {
        console.log('   → Pairing with phone...');
      } else if (state === 'UNPAIRED') {
        console.log('   ⚠️ Unpaired - QR code needed!');
      } else if (state === 'CONFLICT') {
        console.log('   ⚠️ Conflict - Another session is active!');
      }
    });

    this.client.on('remote_session_saved', () => {
      console.log('💾 WhatsApp remote session saved');
    });

    // הוסף error handler כללי
    this.client.on('error', (error) => {
      console.error('❌ WhatsApp client error:', error.message);
      if (error.stack) {
        console.error('❌ Error stack:', error.stack);
      }
    });

    // האזנה להודעות נכנסות
    this.client.on('message', async msg => {
      try {
        await this.handleIncomingMessage(msg);
      } catch (error) {
        console.error('Error handling incoming message:', error);
      }
    });
  }

  // שליחת הודעה פשוטה
  async sendMessage(to, message) {
    try {
      // Cloud API path (no QR required)
      if (this.provider === 'cloud') {
        const token = process.env.WHATSAPP_CLOUD_TOKEN;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        if (!token || !phoneNumberId) {
          throw new Error('WhatsApp Cloud API is not configured (missing WHATSAPP_CLOUD_TOKEN / WHATSAPP_PHONE_NUMBER_ID)');
        }

        // normalize to digits and convert IL local to 972 format
        const clean = String(to || '').replace(/\D/g, '');
        if (!clean) throw new Error('Missing destination phone number');
        const e164 = clean.startsWith('972') ? clean : (clean.startsWith('0') ? `972${clean.slice(1)}` : `972${clean}`);

        const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
        const payload = {
          messaging_product: 'whatsapp',
          to: e164,
          type: 'text',
          text: { body: message }
        };

        const resp = await axios.post(url, payload, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000
        });

        return {
          success: true,
          messageId: resp.data?.messages?.[0]?.id
        };
      }

      if (!this.isConnected) {
        // נסה לחכות לחיבור אם אנחנו בתהליך אתחול
        if (this.readyPromise) {
          console.log('⏳ Waiting for WhatsApp connection...');
          // הוסף timeout של 30 שניות
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('WhatsApp connection timeout after 30 seconds')), 30000);
          });
          await Promise.race([this.readyPromise, timeoutPromise]);
        } else {
          throw new Error('WhatsApp client is not connected and not initializing');
        }
      }

      // נרמול מספר הטלפון
      let targetId = to;
      if (!to.includes('@c.us')) {
        // מנקה תווים לא רצויים
        const cleanNumber = to.replace(/\D/g, '');
        // אם אין קידומת מדינה (972), נוסיף (הנחה: מספר ישראלי)
        const finalNumber = cleanNumber.startsWith('972') ? cleanNumber :
          (cleanNumber.startsWith('0') ? '972' + cleanNumber.substring(1) : '972' + cleanNumber);

        targetId = `${finalNumber}@c.us`;
      }

      console.log(`📤 Sending WhatsApp to ${targetId}...`);

      // ניסיון איתור מזהה מדויק לפני שליחה (מונע שגיאות No LID)
      const number = targetId.replace('@c.us', '');
      const isRegistered = await this.client.isRegisteredUser(number);

      if (!isRegistered) {
        throw new Error(`Number ${number} is not registered on WhatsApp`);
      }

      // נסה להשיג את ה-ID המלא
      try {
        const contact = await this.client.getNumberId(number);
        if (contact && contact._serialized) {
          targetId = contact._serialized;
        }
      } catch (e) {
        console.warn('⚠️ Could not resolve full contact ID, trying direct send');
      }

      const response = await this.client.sendMessage(targetId, message);

      return {
        success: true,
        messageId: response.id.id
      };

    } catch (error) {
      console.error('Error sending WhatsApp message:', error.message);
      throw error;
    }
  }

  // שליחת תבנית (כרגע מיושם כשליחת טקסט רגיל כי זו ספרייה לא רשמית)
  async sendTemplate(to, templateName, parameters = []) {
    try {
      // מציאת תוכן התבנית מה-utils או ממקור אחר
      // לצורך הפשטות, נניח שהפרמטר templateName הוא כבר הטקסט או שיש לוגיקת המרה
      // במימוש המקורי היה שימוש ב-templates מ-utils/messageTemplates

      // כאן נצטרך לוגיקה שתמיר שם תבנית לטקסט מלא עם הפרמטרים
      // כרגע נשלח את שם התבנית והפרמטרים כטקסט משורשר (Placeholder)
      const message = `Template: ${templateName}\nParams: ${parameters.join(', ')}`;

      return await this.sendMessage(to, message);
    } catch (error) {
      console.error('Error sending WhatsApp template:', error.message);
      throw error;
    }
  }

  // שליחת הודעה עם כפתורים (לא נתמך מלא ב-MultiDevice בגרסאות מסוימות, fallback לטקסט)
  async sendInteractiveButtons(to, bodyText, buttons) {
    try {
      // המרה לטקסט עם רשימת אפשרויות מכיוון שכפתורים לעיתים בעייתיים בגרסאות ה-Web החדשות
      const optionsText = buttons.map((btn, index) => `${index + 1}. ${btn}`).join('\n');
      const fullMessage = `${bodyText}\n\n${optionsText}\n(השב עם המספר המתאים)`;

      return await this.sendMessage(to, fullMessage);
    } catch (error) {
      console.error('Error sending interactive message:', error.message);
      throw error;
    }
  }

  // טיפול בהודעות נכנסות
  async handleIncomingMessage(msg) {
    // דילוג על הודעות קבוצה או סטטוסים
    if (msg.isGroupMsg || msg.isStatus) return;

    const fromNumber = msg.from.replace('@c.us', '').replace(/^972/, '0');
    console.log(`📩 Received message from ${fromNumber}: ${msg.body}`);

    try {
      // Lazy loading למניעת circular dependencies
      const Client = require('../models/Client');
      const ConversationContext = require('../models/ConversationContext');
      const triggerHandler = require('./triggerHandler');

      // מציאת הלקוח לפי מספר טלפון
      const phoneNumber = fromNumber;
      const cleanPhone = fromNumber.startsWith('0') ? fromNumber.substring(1) : fromNumber;

      const client = await Client.findOne({
        $or: [
          { 'personalInfo.phone': { $regex: cleanPhone } },
          { 'personalInfo.whatsappPhone': { $regex: cleanPhone } }
        ]
      });

      if (!client) {
        console.log(`⚠️ Message from unknown number: ${fromNumber}`);
        return;
      }

      // ✅ NEW: בדיקה אם יש שיחת AI bot פעילה
      const activeConversation = await ConversationContext.findOne({
        client: client._id,
        channel: 'whatsapp',
        status: 'active'
      });

      if (activeConversation) {
        // מנתב ל-AI Bot
        console.log(`🤖 Routing to active AI bot conversation: ${activeConversation.sessionId}`);
        await triggerHandler.handleNewMessage(client._id, msg.body, 'whatsapp');
        return;
      }

      // יצירת אובייקט אינטראקציה
      const interaction = {
        type: 'whatsapp',
        direction: 'inbound',
        subject: 'הודעה נכנסת',
        content: msg.body,
        timestamp: new Date(),
        completed: true
      };

      // הוספה ללקוח ושמירה
      client.interactions.push(interaction);
      await client.save();

      const savedInteraction = client.interactions[client.interactions.length - 1];

      // ✅ NEW: טריגר של הודעה חדשה (יכול להפעיל AI bot)
      await triggerHandler.handleNewMessage(client._id, msg.body, 'whatsapp');

      // Existing flow: leadNurturingService
      const leadNurturingService = require('./leadServiceV2');

      // בדיקה אם הלקוח הגיב - עצירת רצפים אוטומטיים
      await leadNurturingService.checkInteractionForActiveNurturing(client._id, savedInteraction);

      // בדיקת טריגרים חדשים המבוססים על התגובה
      await leadNurturingService.checkTriggersForInteraction(client._id, savedInteraction);

    } catch (error) {
      console.error('Error processing incoming message logic:', error);
    }
  }

  // בדיקת סטטוס חיבור
  async getStatus() {
    if (this.provider === 'cloud') {
      const cloudConfigured = Boolean(process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
      return {
        provider: 'cloud',
        connected: cloudConfigured,
        authenticated: cloudConfigured,
        needsQr: false,
        hasQr: false,
        lastQrAt: null,
        initializing: false
      };
    }

    return {
      provider: 'webjs',
      connected: this.isConnected,
      authenticated: this.isAuthenticated,
      phoneNumber: this.client?.info?.wid?.user,
      // אם לא מחובר - כנראה שנדרש QR; האם יש QR זמין כרגע?
      needsQr: !this.isConnected,
      hasQr: Boolean(this.lastQr),
      lastQrAt: this.lastQrAt,
      initializing: this.initializing
    };
  }

  async getQr({ waitMs = 8000 } = {}) {
    // אם לא מחובר ועדיין אין client, ננסה לאתחל (DEV נוח)
    if (!this.isConnected && !this.client) {
      this.initialize(0);
    }

    // נחכה קצת להיווצרות QR (האירוע מגיע אסינכרונית)
    const start = Date.now();
    while (!this.isConnected && !this.lastQr && Date.now() - start < waitMs) {
      await new Promise((r) => setTimeout(r, 250));
    }

    return {
      connected: this.isConnected,
      qr: this.lastQr,
      lastQrAt: this.lastQrAt
    };
  }

  async restart({ resetSession = false } = {}) {
    try {
      // עצירה/ניקוי instance קיים
      this.isConnected = false;
      this.lastQr = null;
      this.lastQrAt = null;
      this.readyPromise = null;

      if (this.client) {
        try {
          await this.client.destroy();
        } catch (_) {
          // ignore
        }
        this.client = null;
      }

      if (resetSession) {
        const authDir = path.join(process.cwd(), '.wwebjs_auth');
        try {
          fs.rmSync(authDir, { recursive: true, force: true });
          console.log('🧹 WhatsApp auth folder removed (.wwebjs_auth)');
        } catch (e) {
          console.warn('⚠️ Could not remove .wwebjs_auth:', e.message);
        }
      }

      console.log(`🔄 Restarting WhatsApp Service (resetSession=${resetSession})...`);
      this.initialize(0);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to restart WhatsApp Service:', error.message);
      return { success: false, error: error.message };
    }
  }

  get templates() {
    return templates.whatsapp;
  }
}

// ייצוא מופע יחיד (Singleton)
const service = new WhatsAppService();
// אתחול אוטומטי בטעינת הקובץ - אבל רק אם לא ב-Vercel ולא ב-tests
// ב-Vercel נאתחל מ-server.js כדי לשלוט על התזמון
// ב-tests לא נרצה לאתחל כדי לא להפריע ל-tests
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
  // נאתחל אחרי זמן קצר כדי לא להפריע לאתחול השרת
  setTimeout(() => {
    service.initialize();
  }, 2000);
}

module.exports = service;