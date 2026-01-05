import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { publicCMS } from '../utils/publicApi';
import { getImageUrl } from '../utils/imageUtils';

const LandingPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    companyName: '',
    website: ''
  });

  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [testimonials, setTestimonials] = useState([]);

  // Fetch testimonials
  useEffect(() => {
    let mounted = true;
    const fetchTestimonials = async () => {
      try {
        const res = await publicCMS.getTestimonials();
        if (!mounted) return;
        const testimonialsData = res.data?.data || [];
        // Take first 3 testimonials
        setTestimonials(testimonialsData.slice(0, 3));
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        if (!mounted) return;
        setTestimonials([]);
      }
    };
    fetchTestimonials();
    return () => {
      mounted = false;
    };
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
      // POST request to the backend - map form fields to API expected format
      const response = await fetch('/api/public/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          company: formData.companyName,
          message: formData.website ? `אתר/לינקדאין: ${formData.website}\nמקור: דף נחיתה - אבחון חינם` : 'מקור: דף נחיתה - אבחון חינם',
          leadSource: 'landing_page_campaign',
        }),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <div className="landing-page-wrapper">
      {/* Navigation (Simplified for Landing Page) */}
      <nav style={{ padding: '20px 0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="landing-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img 
              src="/logo.png" 
              alt="TailorBiz" 
              style={{ 
                height: '64px', 
                width: 'auto',
                objectFit: 'contain'
              }} 
            />
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="landing-container">
          <div className="hero-grid">
            <div>
              <span className="badge">אבחון טכנולוגי-עסקי</span>
              <h1>העסק גדל, אבל התפעול <span className="text-highlight">נשאר באקסל?</span></h1>
              <p>קבלו מיפוי מלא של "דליפות הכסף" בעסק ותוכנית עבודה פרקטית לאוטומציה ושליטה – בתוך 90 דקות בלבד.</p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <a href="#offer" className="landing-btn">שריינו אבחון חינם (ל-10 הראשונים)</a>
              </div>
              <p style={{ fontSize: '0.875rem', marginTop: '15px', color: 'var(--text-gray)' }}>
                <i className="fa-solid fa-bolt"></i> נשארו מקומות בודדים במבצע.
              </p>
            </div>
            <div>
              <img 
                src="/assets/images/hero-control.png" 
                alt="Dashboard" 
                className="hero-img" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="pain-points-section">
        <div className="landing-container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <h2>האם התרחישים האלה מוכרים לכם?</h2>
            <p>עסקים בצמיחה נתקעים לעיתים קרובות ב"מלכודת הבוטיק" - הרבה עבודה, מעט שליטה.</p>
          </div>
          <div className="cards-grid">
            <div className="feature-card">
              <div className="icon-box"><i className="fa-solid fa-boxes-stacked"></i></div>
              <h3>כאוס במלאי</h3>
              <p>המלאי במחשב לא תואם את המלאי במחסן. הנהגים לא מעדכנים בזמן אמת וסחורה יקרה הולכת לאיבוד ללא מעקב.</p>
            </div>
            <div className="feature-card">
              <div className="icon-box"><i className="fa-brands fa-whatsapp"></i></div>
              <h3>הודעות אבודות</h3>
              <p>אתם מבזבזים שעות על שיבוץ עובדים בוואטסאפ. הזמנות קריטיות נופלות בין הכיסאות בגלל חוסר סנכרון.</p>
            </div>
            <div className="feature-card">
              <div className="icon-box"><i className="fa-solid fa-file-invoice-dollar"></i></div>
              <h3>גבייה ידנית</h3>
              <p>הצעות מחיר מתעכבות, חיובים נשכחים, ואתם מוצאים את עצמכם רודפים אחרי לקוחות במקום שהמערכת תעשה את זה.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section (Timeline) */}
      <section className="solution-section">
        <div className="landing-container">
          <h2 style={{ textAlign: 'center' }}>מפת הדרכים הדיגיטלית של TailorBiz</h2>
          <div className="timeline">
            <div className="timeline-item right">
              <div className="content-box">
                <h3>1. מיפוי תהליכים</h3>
                <p style={{ marginBottom: 0 }}>נצלול לעומק העסק ונבין בדיוק איפה המידע "נתקע" בין המכירות, התפעול והנהלת החשבונות.</p>
              </div>
            </div>
            <div className="timeline-item left">
              <div className="content-box">
                <h3>2. איתור דליפות</h3>
                <p style={{ marginBottom: 0 }}>נזהה איפה אתם שורפים כסף ושעות עבודה יקרות על פעולות ידניות שניתן לבצע באוטומציה.</p>
              </div>
            </div>
            <div className="timeline-item right">
              <div className="content-box">
                <h3>3. תוכנית פעולה</h3>
                <p style={{ marginBottom: 0 }}>תקבלו מסמך המלצות טכנולוגיות (Low-Code או פיתוח) המותאם לתקציב ולצרכים שלכם.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="testimonials-section" style={{ padding: '80px 0', backgroundColor: 'var(--bg-light)' }}>
          <div className="landing-container">
            <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontFamily: "'Heebo', system-ui, -apple-system, sans-serif" }}>מה הלקוחות שלנו אומרים</h2>
            <div className="testimonials-list">
              {testimonials.map((testimonial, index) => {
                const imageUrl = getImageUrl(testimonial.image, null);
                return (
                  <div key={testimonial._id || index} className="testimonial-card-full">
                    <div className="testimonial-content-wrapper">
                      <div className="testimonial-quote-icon">
                        <i className="fa-solid fa-quote-right"></i>
                      </div>
                      <div className="testimonial-stars">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                          <i key={i} className="fa-solid fa-star" style={{ color: '#FFB800' }}></i>
                        ))}
                      </div>
                      <p className="testimonial-text">"{testimonial.content}"</p>
                      <div className="testimonial-author">
                        <img 
                          src={imageUrl || '/assets/placeholder.png'} 
                          alt={testimonial.clientName}
                          className="testimonial-avatar"
                          onError={(e) => {
                            e.target.src = '/assets/placeholder.png';
                          }}
                        />
                        <div>
                          <h4 style={{ margin: 0, marginBottom: '4px', fontFamily: "'Heebo', system-ui, -apple-system, sans-serif" }}>{testimonial.clientName}</h4>
                          <p style={{ margin: 0, color: 'var(--text-gray)', fontSize: '0.9rem', fontFamily: "'Assistant', system-ui, -apple-system, sans-serif" }}>{testimonial.clientRole}</p>
                          {testimonial.companyName && (
                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-gray)', fontSize: '0.85rem', fontWeight: 600, fontFamily: "'Assistant', system-ui, -apple-system, sans-serif" }}>
                              {testimonial.companyName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Offer & Form Section */}
      <section id="offer" className="pricing-section">
        <div className="landing-container">
          <h2 style={{ textAlign: 'center', color: 'var(--white)' }}>השקעה קטנה, שקט נפשי גדול</h2>
          <p style={{ textAlign: 'center', color: 'var(--white)', maxWidth: '600px', margin: '0 auto' }}>אנחנו מחפשים את הלקוחות הרציניים ביותר. לכן אנחנו מציעים את האבחון חינם למספר מצומצם של עסקים שמתאימים לפרופיל.</p>
          
          <div className="pricing-grid">
            {/* Value Description */}
            <div style={{ padding: '20px' }}>
              <h3 style={{ color: 'var(--white)' }}>מה אתם מקבלים?</h3>
              <p style={{ color: 'var(--white)' }}>האבחון מבוצע על ידי יועץ טכנולוגי בכיר ומיועד לתת לכם ערך אמיתי, לא רק שיחת מכירה.</p>
              
              <ul className="check-list white-text" style={{color: 'white'}}>
                <li><strong>פגישת אבחון עומק (90 דק')</strong> - שווי 1,500 ₪</li>
                <li><strong>דו"ח אבחון מקיף (PDF)</strong> - שווי 800 ₪</li>
                <li><strong>בונוס סייבר:</strong> בדיקת חוסן בסיסי והרשאות</li>
                <li><strong>בונוס AI:</strong> סקירת הזדמנויות לשימוש בבינה מלאכותית</li>
              </ul>

              <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                <h4 style={{ marginBottom: '10px', color: 'var(--white)' }}>שווי החבילה הכולל:</h4>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--white)', textDecoration: 'line-through', opacity: 0.8 }}>2,700 ₪</div>
                <div style={{ fontSize: '1.25rem', color: 'var(--white)' }}>היום עבורכם: <span style={{ color: '#4ade80', fontWeight: 700 }}>חינם (0 ₪)</span></div>
              </div>
            </div>

            {/* The Form */}
            <div className="pricing-card">
              <div className="price-old">1,500 ₪</div>
              <div className="price-tag">0 ₪</div>
              <p style={{ fontSize: '0.875rem', marginBottom: '20px' }}>ל-10 הנרשמים הראשונים בלבד</p>
              
              {status === 'success' ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <i className="fa-solid fa-circle-check" style={{ fontSize: '60px', color: '#10b981', marginBottom: '20px' }}></i>
                  <h3>תודה שנרשמתם!</h3>
                  <p>הפרטים נקלטו בהצלחה. נציג הצוות שלנו יצור איתך קשר בשעות הקרובות לתיאום האבחון.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="fullName" className="form-label">שם מלא</label>
                    <input type="text" id="fullName" name="fullName" className="form-input" placeholder="ישראל ישראלי" required value={formData.fullName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">טלפון</label>
                    <input type="tel" id="phone" name="phone" className="form-input" placeholder="050-1234567" required value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">אימייל</label>
                    <input type="email" id="email" name="email" className="form-input" placeholder="your@email.com" required value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="companyName" className="form-label">שם החברה</label>
                    <input type="text" id="companyName" name="companyName" className="form-input" placeholder="TailorBiz בע״מ" required value={formData.companyName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="website" className="form-label">אתר אינטרנט / לינקדאין</label>
                    <input type="url" id="website" name="website" className="form-input" placeholder="https://www.your-site.com" value={formData.website} onChange={handleChange} />
                  </div>
                  
                  <button type="submit" className="landing-btn landing-btn-full" disabled={status === 'submitting'}>
                    {status === 'submitting' ? 'שולח...' : 'שריינו לי מקום בחינם'}
                  </button>
                  
                  {status === 'error' && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '10px', textAlign: 'center' }}>אירעה שגיאה בשליחת הטופס. אנא נסו שנית.</p>}
                </form>
              )}
              
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '15px' }}>
                <i className="fa-solid fa-lock"></i> הפרטים שלכם מאובטחים ולא יועברו לצד ג'.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid #e2e8f0', marginTop: '80px' }}>
        <div className="landing-container">
          <div style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: '24px', marginBottom: '10px' }}>TailorBiz</div>
          <p style={{ fontSize: '0.875rem' }}>הופכים טכנולוגיה לשליטה עסקית.</p>
          <p style={{ fontSize: '0.875rem' }}>© 2026 כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

