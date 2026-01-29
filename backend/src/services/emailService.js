const nodemailer = require('nodemailer');
const { templates } = require('../utils/messageTemplates');

/**
 * שירות שליחת מיילים
 * תומך בספקי Email שונים (Gmail, SendGrid, SMTP כללי)
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@bizflow.co.il';
    this.fromName = process.env.EMAIL_FROM_NAME || 'BizFlow';
  }

  /**
   * אתחול שירות Email
   * תומך במספר providers:
   * - Gmail (EMAIL_PROVIDER=gmail)
   * - SendGrid (EMAIL_PROVIDER=sendgrid)
   * - SMTP כללי (EMAIL_PROVIDER=smtp)
   */
  initialize() {
    const provider = process.env.EMAIL_PROVIDER || 'smtp';

    try {
      if (provider === 'gmail') {
        // Gmail configuration
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
          console.warn('⚠️ Email service not configured: Missing EMAIL_USER or EMAIL_PASSWORD');
          return;
        }

        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD // App-specific password for Gmail
          }
        });

      } else if (provider === 'sendgrid') {
        // SendGrid configuration
        if (!process.env.SENDGRID_API_KEY) {
          console.warn('⚠️ Email service not configured: Missing SENDGRID_API_KEY');
          return;
        }

        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });

      } else if (provider === 'smtp') {
        // Generic SMTP configuration
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
          console.warn('⚠️ Email service not configured: Missing SMTP credentials');
          return;
        }

        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
          }
        });

      } else {
        console.warn(`⚠️ Unknown email provider: ${provider}`);
        return;
      }

      this.isConfigured = true;
      console.log(`✅ Email Service initialized with provider: ${provider}`);

      // Test connection (אופציונלי - רק בפיתוח)
      if (process.env.NODE_ENV === 'development') {
        this.transporter.verify((error, success) => {
          if (error) {
            console.error('❌ Email service verification failed:', error.message);
            this.isConfigured = false;
          } else {
            console.log('✅ Email service ready to send messages');
          }
        });
      }

    } catch (error) {
      console.error('❌ Error initializing email service:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * שליחת מייל פשוט
   * @param {string} to - כתובת מייל של הנמען
   * @param {string} subject - נושא המייל
   * @param {string} html - תוכן HTML
   * @param {string} text - תוכן טקסט רגיל (fallback)
   * @param {Array} attachments - קבצים מצורפים (אופציונלי)
   */
  async sendEmail(to, subject, html, text = '', attachments = []) {
    try {
      if (!this.isConfigured) {
        console.warn('⚠️ Email service not configured. Email not sent:', { to, subject });
        return {
          success: false,
          error: 'Email service not configured'
        };
      }

      // Validation
      if (!to || !subject || !html) {
        throw new Error('Missing required email fields: to, subject, or html');
      }

      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html), // Fallback to stripped HTML
        attachments
      };

      console.log(`📧 Sending email to ${to}: "${subject}"`);

      const info = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Email sent successfully to ${to}. Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };

    } catch (error) {
      console.error('❌ Error sending email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * שליחת מייל בעזרת תבנית
   * @param {string} to - כתובת מייל
   * @param {string} templateName - שם התבנית (welcomeEmail, proposalEmail, invoiceEmail)
   * @param {Object} data - נתונים למילוי בתבנית
   */
  async sendTemplate(to, templateName, data) {
    try {
      const template = templates.email[templateName];

      if (!template) {
        throw new Error(`Template not found: ${templateName}`);
      }

      const subject = typeof template.subject === 'function'
        ? template.subject(...Object.values(data))
        : template.subject;

      const html = typeof template.body === 'function'
        ? template.body(...Object.values(data))
        : template.body;

      return await this.sendEmail(to, subject, html);

    } catch (error) {
      console.error('❌ Error sending template email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * שליחת חשבונית במייל
   * @param {string} to - כתובת מייל
   * @param {Object} invoiceData - נתוני החשבונית
   * @param {Buffer} pdfBuffer - קובץ PDF של החשבונית (אופציונלי)
   */
  async sendInvoice(to, invoiceData, pdfBuffer = null) {
    try {
      const { invoiceNumber, clientName, amount, dueDate, pdfUrl } = invoiceData;

      const template = templates.email.invoiceEmail;
      const subject = template.subject(invoiceNumber);
      const html = template.body(clientName, invoiceNumber, amount, dueDate, pdfUrl || '#');

      const attachments = [];

      // אם יש PDF buffer, צרף אותו
      if (pdfBuffer) {
        attachments.push({
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        });
      }

      return await this.sendEmail(to, subject, html, '', attachments);

    } catch (error) {
      console.error('❌ Error sending invoice email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * שליחת הצעת מחיר
   */
  async sendProposal(to, clientName, proposalLink) {
    try {
      const template = templates.email.proposalEmail;
      const subject = template.subject(clientName);
      const html = template.body(clientName, proposalLink);

      return await this.sendEmail(to, subject, html);

    } catch (error) {
      console.error('❌ Error sending proposal email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * שליחת מייל ברוכים הבאים
   */
  async sendWelcomeEmail(to, clientName) {
    try {
      const template = templates.email.welcomeEmail;
      const subject = template.subject(clientName);
      const html = template.body(clientName);

      return await this.sendEmail(to, subject, html);

    } catch (error) {
      console.error('❌ Error sending welcome email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * פונקציה עזר להסרת HTML tags
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  /**
   * בדיקת סטטוס השירות
   */
  getStatus() {
    return {
      configured: this.isConfigured,
      provider: process.env.EMAIL_PROVIDER || 'smtp',
      fromEmail: this.fromEmail
    };
  }

  /**
   * גישה לתבניות Email
   */
  get templates() {
    return templates.email;
  }
}

// ייצוא מופע יחיד (Singleton)
const service = new EmailService();

// אתחול אוטומטי (אם לא ב-tests)
if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
  service.initialize();
}

module.exports = service;
