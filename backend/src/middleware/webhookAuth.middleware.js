/**
 * Webhook authentication middleware.
 * Validates a static Bearer token from the Authorization header
 * against WEBHOOK_SECRET (or CLAUDE_WEBHOOK_SECRET) environment variable.
 */
const verifyWebhookToken = (req, res, next) => {
  const secret = process.env.WEBHOOK_SECRET || process.env.CLAUDE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Webhook] WEBHOOK_SECRET is not configured');
    return res.status(500).json({ success: false, message: 'Webhook secret not configured on server' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.slice(7).trim();
  if (!token || token !== secret) {
    return res.status(403).json({ success: false, message: 'Invalid webhook token' });
  }

  next();
};

module.exports = { verifyWebhookToken };
