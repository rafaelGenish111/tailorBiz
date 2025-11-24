const axios = require('axios');
const { templates } = require('../utils/messageTemplates');

class WhatsAppService {
  constructor() {
    // אפשרויות:
    // 1. WhatsApp Business API (רשמי)
    // 2. Twilio API for WhatsApp
    // 3. whatsapp-web.js (לא רשמי אבל חינמי)
    
    this.apiUrl = process.env.WHATSAPP_API_URL;
    this.apiToken = process.env.WHATSAPP_API_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    this.isConnected = false;
  }

  // שליחת הודעה פשוטה
  async sendMessage(to, message) {
    try {
      // דוגמה לשימוש ב-WhatsApp Business API
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''), // רק ספרות
          type: 'text',
          text: {
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id
      };

    } catch (error) {
      console.error('Error sending WhatsApp message:', error.response?.data || error.message);
      throw new Error('שגיאה בשליחת הודעת WhatsApp');
    }
  }

  // שליחת תבנית (Template Message)
  async sendTemplate(to, templateName, parameters = []) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'he' // עברית
            },
            components: parameters.length > 0 ? [
              {
                type: 'body',
                parameters: parameters.map(param => ({
                  type: 'text',
                  text: param
                }))
              }
            ] : []
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id
      };

    } catch (error) {
      console.error('Error sending WhatsApp template:', error.response?.data || error.message);
      throw new Error('שגיאה בשליחת תבנית WhatsApp');
    }
  }

  // שליחת הודעה עם כפתורים
  async sendInteractiveButtons(to, bodyText, buttons) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: bodyText
            },
            action: {
              buttons: buttons.map((btn, index) => ({
                type: 'reply',
                reply: {
                  id: `btn_${index}`,
                  title: btn
                }
              }))
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id
      };

    } catch (error) {
      console.error('Error sending interactive message:', error.response?.data || error.message);
      throw new Error('שגיאה בשליחת הודעה אינטראקטיבית');
    }
  }

  // בדיקת סטטוס חיבור
  async getStatus() {
    try {
      // בדיקה פשוטה של החיבור
      const response = await axios.get(
        `${this.apiUrl}/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      this.isConnected = true;

      return {
        connected: true,
        phoneNumber: response.data.display_phone_number
      };

    } catch (error) {
      this.isConnected = false;
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // תבניות הודעות מוכנות - משתמש בתבניות מה-utils
  get templates() {
    return templates.whatsapp;
  }
}

module.exports = new WhatsAppService();

