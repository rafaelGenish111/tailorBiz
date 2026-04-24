#!/usr/bin/env node
/**
 * After `vite build`, clones dist/index.html into dist/<route>/index.html for
 * each public route, rewriting <title>, <meta name="description">, OG and
 * Twitter tags so crawlers that don't execute JS (Facebook, LinkedIn, most SEO
 * audit tools) see the correct meta for each page. Client-side PageSEO still
 * updates tags for in-app navigation.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');
const SITE_URL = 'https://tailorbiz-software.com';
const DEFAULT_IMAGE = `${SITE_URL}/assets/images/og-banner.jpg`;

const ROUTES = [
  {
    path: '/about',
    title: 'אודות TailorBiz | הסיפור שלנו ומה מניע אותנו',
    description: 'TailorBiz נוסדה מתוך השטח - הסיפור שלנו, הפילוסופיה שלנו, ולמה אנחנו מאמינים שטכנולוגיה צריכה לעבוד בשבילך, לא להפך.',
  },
  {
    path: '/services',
    title: 'שירותים | TailorBiz - פתרונות טכנולוגיים חכמים',
    description: 'מערכות CRM, סוכני AI ואוטומציות עסקיות - בחרו את הפתרון המתאים לעסק שלכם ותנו לנו לעשות את השאר.',
  },
  {
    path: '/services/saas-creators',
    title: 'SaaS למאמנים ויוצרי תוכן | TailorBiz',
    description: 'פלטפורמת SaaS מלאה למאמנים ויוצרי תוכן - ניהול לקוחות, אוטומציות, תוכניות ליווי ותשלומים במקום אחד.',
  },
  {
    path: '/services/ai-institutions',
    title: 'סוכני AI למוסדות הכשרה | TailorBiz',
    description: 'סוכן AI למרכזי הכשרה ומוסדות חינוך - מענה אוטומטי לסטודנטים, ניהול הרשמות ודוחות בזמן אמת.',
  },
  {
    path: '/contact',
    title: 'צור קשר | TailorBiz',
    description: 'צרו קשר עם TailorBiz - 055-9935044 | ווצאפ | מייל. פתח תקווה, ישראל. נשמח לשמוע על האתגרים שלכם.',
  },
  {
    path: '/pricing',
    title: 'תמחור | TailorBiz - פתרון מותאם אישית',
    description: 'מסלולי תמחור שקופים למערכות ניהול ואוטומציה עסקית של TailorBiz. Basic, Professional ו-Enterprise - בחרו את המסלול המתאים לעסק שלכם.',
  },
  {
    path: '/blog',
    title: 'בלוג | TailorBiz - טיפים לאוטומציה עסקית',
    description: 'תכנים על תהליכים עסקיים, אוטומציות, מערכות CRM וניהול עסק - בצורה נקייה ומעשית מהצוות של TailorBiz.',
  },
  {
    path: '/clients',
    title: 'הלקוחות שלנו | TailorBiz',
    description: 'הכירו את הלקוחות שבחרו ב-TailorBiz להתייעלות ואוטומציה בעסק. סטארטאפים, מאמנים, מרכזי הכשרה ועסקים קטנים - כל אחד עם פתרון מותאם אישית.',
  },
  {
    path: '/privacy',
    title: 'מדיניות פרטיות | TailorBiz',
    description: 'מדיניות הפרטיות של TailorBiz בהתאם לחוק הגנת הפרטיות הישראלי ותיקון 13.',
  },
  {
    path: '/roi-calculator',
    title: 'מחשבון ROI | TailorBiz',
    description: 'חשבו כמה תחסכו עם מערכת ניהול ואוטומציה של TailorBiz. מחשבון אונליין שמראה בדיוק את ההחזר על ההשקעה.',
  },
];

function htmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildMetaHtml(indexHtml, { path, title, description }) {
  const url = `${SITE_URL}${path}`;
  const escTitle = htmlEscape(title);
  const escDesc = htmlEscape(description);

  let html = indexHtml;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escTitle}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/,
    `<meta name="description" content="${escDesc}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?\s*>/,
    `<meta property="og:title" content="${escTitle}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?\s*>/,
    `<meta property="og:description" content="${escDesc}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?\s*>/,
    `<meta property="og:url" content="${url}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?\s*>/,
    `<meta name="twitter:title" content="${escTitle}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?\s*>/,
    `<meta name="twitter:description" content="${escDesc}" />`
  );

  const canonicalTag = `<link rel="canonical" href="${url}" />`;
  if (/<link\s+rel="canonical"[^>]*>/.test(html)) {
    html = html.replace(/<link\s+rel="canonical"[^>]*>/, canonicalTag);
  } else {
    html = html.replace('</head>', `    ${canonicalTag}\n  </head>`);
  }

  return html;
}

function main() {
  const indexPath = resolve(DIST, 'index.html');
  const indexHtml = readFileSync(indexPath, 'utf8');

  let count = 0;
  for (const route of ROUTES) {
    const dir = resolve(DIST, route.path.replace(/^\//, ''));
    mkdirSync(dir, { recursive: true });
    const outPath = resolve(dir, 'index.html');
    const html = buildMetaHtml(indexHtml, route);
    writeFileSync(outPath, html);
    count++;
  }

  console.log(`[prerender] Generated ${count} pre-rendered HTML files`);
}

main();
