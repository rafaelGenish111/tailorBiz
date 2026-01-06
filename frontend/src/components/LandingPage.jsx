import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { publicLeads } from '../utils/publicApi';

const LandingPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    companyName: '',
    employeeCount: ''
  });

  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  // Show sticky CTA after scrolling
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load FontAwesome for icons
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await publicLeads.submit({
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        company: formData.companyName,
        message: `מספר עובדים: ${formData.employeeCount}\nמקור: דף נחיתה - אבחון חינם`,
        leadSource: 'landing_page_campaign',
      });

      if (response.status === 200 || response.status === 201) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  const scrollToForm = () => {
    document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page-wrapper">
      {/* Sticky CTA Button */}
      {showStickyCTA && (
        <div className="sticky-cta">
          <button onClick={scrollToForm} className="sticky-cta-btn">
            <i className="fa-solid fa-calendar-check"></i>
            שריינו אבחון חינם
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="landing-container">
          <div className="hero-content">
            <h1 className="hero-headline">
              תפסיק לשקר לעצמך. העסק גדל, אבל אתה הפכת ל'פקידה' היקרה ביותר במזרח התיכון
            </h1>
            <h2 className="hero-subheadline">
              איך ייתכן שמחזור המכירות שלך נושק ל-5 מיליון ש"ח, אבל אתה עדיין מוצא את עצמך ב-22:00 בלילה מתקן טעויות של נהגים וסוגר פינות באקסל?
            </h2>
            <button onClick={scrollToForm} className="cta-button primary">
              אני רוצה לעצור את הכאוס – שריינו לי אבחון חינם
            </button>
          </div>
        </div>
      </section>

      {/* The Story & Agitation Section */}
      <section className="story-section">
        <div className="landing-container">
          <div className="story-content">
            <div className="letter-format">
              <p className="letter-opening">
                <strong>היי, כאן רפאל מ-TailorBiz.</strong> אם הגעת לדף הזה, כנראה שהעסק שלך נמצא בנקודה הכי מסוכנת שלו. מצד אחד יש עבודה... מצד שני? יש כאוס.
              </p>
              
              <p>
                אתה קם בבוקר וכבר יש 30 הודעות וואטסאפ שלא נענו. המחסנאי לא יודע מה הנהג לקח. הלקוח שואל "איפה ההזמנה שלי?" ואתה צריך לבדוק בשלושה מקומות שונים. זה לא 'ניהול'. זאת הישרדות.
              </p>

              <p>
                <strong className="hard-truth">אי אפשר לפתור בעיות של 2026 עם כלים של 1990.</strong> כל עוד המידע בעסק עובר בטלפון שבור, בוואטסאפ אבוד ובאקסלים מפוזרים – אתה מפסיד כסף. כל יום. כל שעה.
              </p>

              <p>
                אבל הנה החדשות הטובות: זה לא חייב להיות ככה. יש דרך אחרת.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Epiphany/Solution Section */}
      <section className="solution-epiphany-section">
        <div className="landing-container">
          <h2 className="section-headline">המהפך: TailorBiz Roadmap</h2>
          <p className="section-intro">
            הבעיה היא ה'דבק' בין העובדים לתוכנה. דמיין עולם שבו הנהג מדווח באפליקציה והמלאי מתעדכן לבד. דמיין עולם שבו הלקוח מקבל עדכון אוטומטי על ההזמנה שלו, בלי שאתה צריך לזכור לשלוח SMS.
          </p>
          
          <div className="solution-features">
            <div className="solution-feature">
              <div className="feature-icon">
                <i className="fa-solid fa-sync-alt"></i>
              </div>
              <h3>סנכרון מלא</h3>
              <p>כל המידע מתעדכן בזמן אמת. השטח והמשרד – גוף אחד.</p>
            </div>
            <div className="solution-feature">
              <div className="feature-icon">
                <i className="fa-solid fa-robot"></i>
              </div>
              <h3>אוטומציה חכמה</h3>
              <p>המערכת עובדת בשבילך גם כשאתה ישן. תזכורות, עדכונים, חשבוניות – הכל אוטומטי.</p>
            </div>
            <div className="solution-feature">
              <div className="feature-icon">
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <h3>דשבורד ניהולי</h3>
              <p>תמונת מצב מלאה של העסק, מכל מקום ובכל זמן. קבלת החלטות מבוססת נתונים, לא ניחושים.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Offer: Audit Meeting Section */}
      <section className="offer-section">
        <div className="landing-container">
          <h2 className="section-headline">פגישת אבחון ומיפוי פערים (Audit) - לא סתם 'הצעת מחיר'</h2>
          <p className="section-intro">
            אנחנו לא באים 'לדחוף' לכם תוכנה. אנחנו באים לעשות סדר. פגישת האבחון של TailorBiz היא תהליך מובנה של 90 דקות שנועד למפות את צווארי הבקבוק בעסק.
          </p>

          <div className="offer-benefits">
            <div className="benefit-item">
              <i className="fa-solid fa-check-circle"></i>
              <div>
                <h3>מיפוי צווארי בקבוק</h3>
                <p>איפה הכסף נוזל? איפה הזמן מתבזבז? נזהה את נקודות הכשל המדויקות.</p>
              </div>
            </div>
            <div className="benefit-item">
              <i className="fa-solid fa-check-circle"></i>
              <div>
                <h3>תמונת מצב אמתית של העסק</h3>
                <p>נבין בדיוק איך המידע זורם (או לא זורם) בין המכירות, התפעול והנהלת החשבונות.</p>
              </div>
            </div>
            <div className="benefit-item">
              <i className="fa-solid fa-check-circle"></i>
              <div>
                <h3>תוכנית פעולה אסטרטגית</h3>
                <p>המלצות טכנולוגיות (Low-Code או פיתוח) המותאמות לתקציב ולצרכים שלכם, עם סדר עדיפויות ברור.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="testimonials-section">
        <div className="landing-container">
          <h2 className="section-headline">מה הלקוחות שלנו אומרים</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fa-solid fa-star"></i>
                ))}
              </div>
              <p className="testimonial-text">
                "היינו טובעים בניירת. תוך חודשיים המערכת הורידה לנו 30% מהפחת."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar-generic">ר</div>
                <div>
                  <h4>רוני איתן</h4>
                  <p>מנכ"ל מפעל אלומיניום</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fa-solid fa-star"></i>
                ))}
              </div>
              <p className="testimonial-text">
                "הפער בין המחשב למחסן עלה לנו הון. המיפוי סגר את הברז הזה בשעה. עכשיו המלאי מסונכרן בזמן אמת, ואנחנו לא מפסידים מכירות."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar-generic">ד</div>
                <div>
                  <h4>דוד לוי</h4>
                  <p>סמנכ"ל תפעול ולוגיסטיקה</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fa-solid fa-star"></i>
                ))}
              </div>
              <p className="testimonial-text">
                "חשבתי שזה יעלה מיליונים כמו SAP. קיבלנו פתרון מדויק בשבריר מחיר. המערכת עובדת, והעסק גדל בלי להוסיף עובדים למשרד."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar-generic">ש</div>
                <div>
                  <h4>שרית כהן</h4>
                  <p>בעלים מרכז סיטונאי</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Value Stack Section */}
      <section className="value-stack-section">
        <div className="landing-container">
          <h2 className="section-headline">מה בדיוק כוללת חבילת האבחון?</h2>
          <p className="section-intro">בנינו חבילה שסוגרת לכם את כל הפינות הקריטיות בעסק:</p>

          <div className="value-stack-list">
            <div className="value-item">
              <div className="value-icon">
                <i className="fa-solid fa-bullseye"></i>
              </div>
              <div className="value-content">
                <div className="value-header">
                  <h3>שיחת אפיון ממוקדת (90 דק')</h3>
                  <span className="value-label">שווי: 1,500 ₪</span>
                </div>
                <p>צלילה לעומק התהליכים העסקיים, זיהוי צווארי בקבוק ומיפוי זרימת המידע בעסק.</p>
              </div>
            </div>

            <div className="value-item">
              <div className="value-icon">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div className="value-content">
                <div className="value-header">
                  <h3>בונוס סייבר: בדיקת חוסן והרשאות</h3>
                  <span className="value-label bonus">כלול בחבילה</span>
                </div>
                <p>בדיקה קריטית של מערך האבטחה, ניהול סיסמאות וגישות עובדים (כדי לוודא שהדאטה שלכם לא חשוף).</p>
              </div>
            </div>

            <div className="value-item">
              <div className="value-icon">
                <i className="fa-solid fa-robot"></i>
              </div>
              <div className="value-content">
                <div className="value-header">
                  <h3>בונוס AI: סקירת הזדמנויות בינה מלאכותית</h3>
                  <span className="value-label bonus">כלול בחבילה</span>
                </div>
                <p>איתור נקודות ספציפיות שבהן ניתן להכניס כלי AI שיחליפו עבודה ידנית יקרה.</p>
              </div>
            </div>
          </div>

          <div className="value-summary">
            <div className="value-summary-item">
              <span className="value-summary-label">שווי החבילה הכולל:</span>
              <span className="value-summary-price-old">1,500 ₪</span>
            </div>
            <div className="value-summary-item highlight">
              <span className="value-summary-label">היום עבור 10 הראשונים:</span>
              <span className="value-summary-price-new">0 ₪</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Form Section */}
      <section id="final-cta" className="final-cta-section">
        <div className="landing-container">
          <h2 className="section-headline">עד סוף החודש בלבד: 10 אבחונים בחינם (במקום 1,500 ₪)</h2>
          <p className="urgency-text">
            <i className="fa-solid fa-clock"></i> ברגע שהיומן מתמלא, ההטבה יורדת
          </p>

          {status === 'success' ? (
            <div className="success-message">
              <i className="fa-solid fa-circle-check"></i>
              <h3>תודה שנרשמתם!</h3>
              <p>הפרטים נקלטו בהצלחה. נציג הצוות שלנו יצור איתך קשר בשעות הקרובות לתיאום האבחון.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="cta-form">
              <div className="form-group">
                <label htmlFor="fullName">שם מלא *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="ישראל ישראלי"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">טלפון *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="050-1234567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">אימייל *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="companyName">שם החברה *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="TailorBiz בע״מ"
                />
              </div>

              <div className="form-group">
                <label htmlFor="employeeCount">מספר עובדים בחברה *</label>
                <select
                  id="employeeCount"
                  name="employeeCount"
                  required
                  value={formData.employeeCount}
                  onChange={handleChange}
                >
                  <option value="">בחר מספר עובדים</option>
                  <option value="1-5">1-5 (לא רלוונטי כרגע)</option>
                  <option value="6-20">6-20 (מתאים לצמיחה)</option>
                  <option value="21-50">21-50 (מתאים לאוטומציה מלאה)</option>
                  <option value="50+">50+ (Enterprise)</option>
                </select>
              </div>

              <button
                type="submit"
                className="cta-button primary large"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'שולח...' : 'שריינו את ההטבה לפני גמר המלאי'}
              </button>

              <p className="security-note">
                <i className="fa-solid fa-lock"></i> הפרטים חסויים ב-100%. חתימה על NDA לפני הפגישה.
              </p>

              {status === 'error' && (
                <p className="error-message">
                  אירעה שגיאה בשליחת הטופס. אנא נסו שנית.
                </p>
              )}
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
