/**
 * PDF Service - Generates Quote PDFs via Puppeteer (HTML-to-PDF)
 * Uses proper RTL, Hebrew font (Heebo), and correct data mapping from quote.items
 */
const puppeteer = require('puppeteer');

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Build HTML for Quote PDF (RTL, Heebo font)
 * @param {Object} data - Quote data
 * @param {Object} data.businessInfo - { name, logo, address, phone, email, taxId }
 * @param {Object} data.clientInfo - { name, businessName, address, phone, email }
 * @param {string} data.quoteNumber
 * @param {string} data.title
 * @param {Date} data.createdAt
 * @param {Array} data.items - From quote.items: { name, description, quantity, unitPrice, totalPrice }
 * @param {number} data.subtotal
 * @param {number} data.vatAmount
 * @param {number} data.total
 * @param {number} data.vatRate
 * @param {boolean} data.includeVat
 * @param {string} data.notes
 * @param {string} data.terms
 * @param {Date} data.validUntil
 */
function buildQuoteHtml(data) {
  const biz = data.businessInfo || {};
  const client = data.clientInfo || {};

  // Map items from quote.items - ensure unitPrice and totalPrice are used
  const items = (data.items || []).map((item) => ({
    description: escapeHtml(item.name) + (item.description ? ` - ${escapeHtml(item.description)}` : ''),
    name: escapeHtml(item.name),
    quantity: Number(item.quantity) || 1,
    price: Number(item.unitPrice) ?? 0,
    total: Number(item.totalPrice) ?? (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1)
  }));

  const subtotal = Number(data.subtotal) ?? 0;
  const vatAmount = Number(data.vatAmount) ?? 0;
  const total = Number(data.total) ?? subtotal + vatAmount;
  const vatRate = Number(data.vatRate) ?? 17;
  const createdAt = data.createdAt ? new Date(data.createdAt).toLocaleDateString('he-IL') : '';
  const validUntil = data.validUntil ? new Date(data.validUntil).toLocaleDateString('he-IL') : '';

  const logoHtml = biz.logo
    ? `<img src="${escapeHtml(biz.logo)}" alt="Logo" class="logo" onerror="this.style.display='none'"/>`
    : '';

  const itemsRows = items
    .map(
      (item, idx) => `
    <tr class="${idx % 2 === 1 ? 'alt-row' : ''}">
      <td class="td-desc">${item.description}</td>
      <td class="td-name">${item.name}</td>
      <td class="td-qty">${item.quantity}</td>
      <td class="td-price">₪${item.price.toLocaleString()}</td>
      <td class="td-total">₪${item.total.toLocaleString()}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Heebo', sans-serif; direction: rtl; margin: 0; padding: 40px 50px; font-size: 11px; color: #333; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #ddd; }
    .company { text-align: left; }
    .company-name { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    .company-details { font-size: 10px; color: #666; }
    .header-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
    .client-block { text-align: right; }
    .client-header-title { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
    .client-details-inline { font-size: 10px; color: #444; }
    .logo { width: 80px; height: 80px; object-fit: contain; }
    .title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 8px; }
    .meta { display: flex; justify-content: center; gap: 24px; margin-bottom: 24px; font-size: 11px; }
    .items-section h3 { font-size: 12px; text-decoration: underline; margin-bottom: 12px; }
    table.items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    table.items th, table.items td { padding: 10px 12px; text-align: right; border-bottom: 1px solid #ddd; }
    table.items th { background: #2c3e50; color: #fff; font-weight: 600; }
    table.items .alt-row { background: #e8f5e9; }
    .td-desc, .td-name { }
    .td-qty { width: 60px; }
    .td-price, .td-total { width: 100px; }
    .summary { margin-top: 20px; text-align: right; }
    .summary-row { display: flex; justify-content: flex-end; gap: 80px; margin: 8px 0; }
    .summary-label { font-weight: 500; min-width: 120px; text-align: right; }
    .summary-value { min-width: 80px; text-align: right; }
    .total-row { font-size: 14px; font-weight: 700; margin-top: 12px; padding-top: 8px; border-top: 1px solid #333; }
    .notes, .terms { margin-top: 20px; }
    .notes h3, .terms h3 { font-size: 12px; text-decoration: underline; margin-bottom: 6px; }
    .valid-until { margin-top: 16px; font-size: 10px; text-align: center; color: #666; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">
      <div class="company-name">${escapeHtml(biz.name || 'העסק')}</div>
      <div class="company-details">
        ${biz.address ? escapeHtml(biz.address) + '<br>' : ''}
        ${biz.phone ? 'טלפון: ' + escapeHtml(biz.phone) + '<br>' : ''}
        ${biz.email ? 'אימייל: ' + escapeHtml(biz.email) + '<br>' : ''}
        ${biz.taxId ? 'ח.פ/ע.מ: ' + escapeHtml(biz.taxId) : ''}
      </div>
    </div>
    <div class="header-right">
      ${logoHtml}
      <div class="client-block">
        <div class="client-header-title">פרטי הלקוח</div>
        <div class="client-details-inline">
          ${client.name ? escapeHtml(client.name) + '<br>' : ''}
          ${client.businessName ? escapeHtml(client.businessName) + '<br>' : ''}
          ${client.address ? escapeHtml(client.address) + '<br>' : ''}
          ${client.phone ? 'טלפון: ' + escapeHtml(client.phone) + '<br>' : ''}
          ${client.email ? 'אימייל: ' + escapeHtml(client.email) : ''}
        </div>
      </div>
    </div>
  </div>

  <div class="title">${escapeHtml(data.title || 'הצעת מחיר')}</div>
  <div class="meta">
    <span>מספר: ${escapeHtml(data.quoteNumber || '')}</span>
    <span>תאריך: ${escapeHtml(createdAt)}</span>
  </div>

  <div class="items-section">
    <h3>פירוט</h3>
    <table class="items">
      <thead>
        <tr>
          <th class="td-desc">תיאור</th>
          <th class="td-name">מוצר/שירות</th>
          <th class="td-qty">כמות</th>
          <th class="td-price">מחיר יחידה</th>
          <th class="td-total">סה"כ</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <div class="summary">
      <div class="summary-row">
        <span class="summary-label">סה"כ לפני מע"מ</span>
        <span class="summary-value">₪${subtotal.toLocaleString()}</span>
      </div>
      ${data.includeVat !== false ? `
      <div class="summary-row">
        <span class="summary-label">מע"מ (${vatRate}%)</span>
        <span class="summary-value">₪${vatAmount.toLocaleString()}</span>
      </div>
      ` : ''}
      <div class="summary-row total-row">
        <span class="summary-label">סה"כ לתשלום</span>
        <span class="summary-value">₪${total.toLocaleString()}</span>
      </div>
    </div>
  </div>

  ${data.notes ? `
  <div class="notes">
    <h3>הערות</h3>
    <div>${escapeHtml(data.notes).replace(/\n/g, '<br>')}</div>
  </div>
  ` : ''}

  ${data.terms ? `
  <div class="terms">
    <h3>תנאים</h3>
    <div>${escapeHtml(data.terms).replace(/\n/g, '<br>')}</div>
  </div>
  ` : ''}

  ${validUntil ? `<div class="valid-until">הצעה זו בתוקף עד: ${escapeHtml(validUntil)}</div>` : ''}
</body>
</html>`;
}

/**
 * Generate Quote PDF buffer using Puppeteer
 * @param {Object} quoteData - Quote data (from quote.toObject or lean)
 * @returns {Promise<Buffer>}
 */
async function generateQuotePDF(quoteData) {
  const html = buildQuoteHtml(quoteData);
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      timeout: 60000
    });
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000
    });

    await page.emulateMediaType('print');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '40px', right: '50px', bottom: '40px', left: '50px' },
      printBackground: true,
      preferCSSPageSize: false
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Build HTML for Signable Document PDF (RTL, Heebo font, letterhead)
 * @param {Object} data
 * @param {Object} data.businessInfo - { name, address, phone, email, taxId, logoUrl, letterheadHeaderUrl, letterheadFooterUrl }
 * @param {Object} data.clientInfo - { name, email, phone, businessName }
 * @param {string} data.documentNumber
 * @param {string} data.title
 * @param {string} data.content - plain text body
 * @param {Date} data.createdAt
 * @param {string} [data.signerName] - signer's name (for signed version)
 * @param {Date} [data.signedAt] - signing timestamp (for signed version)
 * @param {string} [data.signatureImageBase64] - data:image/png;base64,... (for signed version)
 * @param {string} [data.signerIp] - signer IP (for signed version)
 */
function buildSignedDocumentHtml(data) {
  const biz = data.businessInfo || {};
  const client = data.clientInfo || {};
  const createdAt = data.createdAt ? new Date(data.createdAt).toLocaleDateString('he-IL') : '';
  const signedAt = data.signedAt ? new Date(data.signedAt).toLocaleString('he-IL') : '';
  const hasSig = !!data.signatureImageBase64;

  const headerImgHtml = biz.letterheadHeaderUrl
    ? `<img src="${escapeHtml(biz.letterheadHeaderUrl)}" class="letterhead-header" onerror="this.style.display='none'" />`
    : '';
  const footerImgHtml = biz.letterheadFooterUrl
    ? `<img src="${escapeHtml(biz.letterheadFooterUrl)}" class="letterhead-footer" onerror="this.style.display='none'" />`
    : '';
  const logoHtml = biz.logoUrl
    ? `<img src="${escapeHtml(biz.logoUrl)}" alt="Logo" class="logo" onerror="this.style.display='none'" />`
    : '';

  const docTypeLabels = {
    contract: 'חוזה',
    agreement: 'הסכם',
    form: 'טופס',
    proposal: 'הצעה',
    other: 'מסמך'
  };
  const typeLabel = docTypeLabels[data.documentType] || 'מסמך';

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Heebo', sans-serif; direction: rtl; margin: 0; padding: 0; font-size: 12px; color: #333; }
    .page-wrap { padding: 30px 50px; min-height: 100vh; display: flex; flex-direction: column; }
    .letterhead-header { width: 100%; max-height: 120px; object-fit: contain; display: block; margin-bottom: 20px; }
    .letterhead-footer { width: 100%; max-height: 80px; object-fit: contain; display: block; margin-top: auto; padding-top: 30px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2c3e50; }
    .company { text-align: left; }
    .company-name { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
    .company-details { font-size: 10px; color: #666; line-height: 1.6; }
    .header-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .logo { width: 70px; height: 70px; object-fit: contain; }
    .client-block { text-align: right; }
    .client-header-title { font-size: 11px; font-weight: 600; margin-bottom: 4px; color: #555; }
    .client-details { font-size: 10px; color: #444; line-height: 1.6; }
    .doc-title { font-size: 20px; font-weight: 700; text-align: center; margin: 16px 0 8px; }
    .doc-meta { display: flex; justify-content: center; gap: 24px; margin-bottom: 24px; font-size: 11px; color: #666; }
    .doc-content { white-space: pre-wrap; line-height: 1.9; font-size: 12px; margin: 16px 0 30px; flex: 1; }
    .signature-block { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; }
    .signature-title { font-size: 13px; font-weight: 600; margin-bottom: 12px; }
    .signature-row { display: flex; align-items: flex-end; gap: 40px; }
    .signature-img { max-width: 280px; max-height: 100px; border: 1px solid #eee; background: #fafafa; padding: 4px; }
    .signature-info { font-size: 10px; color: #555; line-height: 1.8; }
    .stamp { font-size: 9px; color: #999; margin-top: 12px; text-align: center; }
    .unsigned-placeholder { margin-top: 50px; text-align: center; color: #999; font-size: 11px; }
    .unsigned-line { border-bottom: 1px solid #333; width: 250px; margin: 40px auto 8px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="page-wrap">
    ${headerImgHtml}

    <div class="header">
      <div class="company">
        <div class="company-name">${escapeHtml(biz.name || '')}</div>
        <div class="company-details">
          ${biz.address ? escapeHtml(biz.address) + '<br>' : ''}
          ${biz.phone ? 'טלפון: ' + escapeHtml(biz.phone) + '<br>' : ''}
          ${biz.email ? 'אימייל: ' + escapeHtml(biz.email) + '<br>' : ''}
          ${biz.taxId ? 'ח.פ/ע.מ: ' + escapeHtml(biz.taxId) : ''}
        </div>
      </div>
      <div class="header-right">
        ${logoHtml}
        <div class="client-block">
          <div class="client-header-title">פרטי הלקוח</div>
          <div class="client-details">
            ${client.name ? escapeHtml(client.name) + '<br>' : ''}
            ${client.businessName ? escapeHtml(client.businessName) + '<br>' : ''}
            ${client.phone ? 'טלפון: ' + escapeHtml(client.phone) + '<br>' : ''}
            ${client.email ? 'אימייל: ' + escapeHtml(client.email) : ''}
          </div>
        </div>
      </div>
    </div>

    <div class="doc-title">${escapeHtml(data.title || typeLabel)}</div>
    <div class="doc-meta">
      <span>מספר מסמך: ${escapeHtml(data.documentNumber || '')}</span>
      <span>סוג: ${escapeHtml(typeLabel)}</span>
      <span>תאריך: ${escapeHtml(createdAt)}</span>
    </div>

    <div class="doc-content">${escapeHtml(data.content || '').replace(/\n/g, '<br>')}</div>

    ${hasSig ? `
    <div class="signature-block">
      <div class="signature-title">חתימה דיגיטלית</div>
      <div class="signature-row">
        <img src="${data.signatureImageBase64}" class="signature-img" />
        <div class="signature-info">
          שם החותם: ${escapeHtml(data.signerName || '')}<br>
          תאריך חתימה: ${escapeHtml(signedAt)}<br>
          ${data.signerIp ? 'כתובת IP: ' + escapeHtml(data.signerIp) : ''}
        </div>
      </div>
      <div class="stamp">מסמך זה נחתם דיגיטלית באמצעות מערכת BizFlow</div>
    </div>
    ` : `
    <div class="unsigned-placeholder">
      <div class="unsigned-line"></div>
      חתימה
    </div>
    `}

    ${footerImgHtml}
  </div>
</body>
</html>`;
}

/**
 * Generate Signed Document PDF buffer using Puppeteer
 * @param {Object} docData - Signable document data
 * @returns {Promise<Buffer>}
 */
async function generateSignedDocumentPDF(docData) {
  const html = buildSignedDocumentHtml(docData);
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      timeout: 60000
    });
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000
    });

    await page.emulateMediaType('print');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '20px', right: '0', bottom: '20px', left: '0' },
      printBackground: true,
      preferCSSPageSize: false
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = {
  generateQuotePDF,
  buildQuoteHtml,
  generateSignedDocumentPDF,
  buildSignedDocumentHtml
};
