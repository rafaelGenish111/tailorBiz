// frontend/src/pages/SignDocumentPage.jsx
// Public signing page - standalone, no header/footer, mobile-friendly
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

const typeLabels = {
  contract: 'חוזה',
  agreement: 'הסכם',
  form: 'טופס',
  proposal: 'הצעה',
  other: 'מסמך'
};

export default function SignDocumentPage() {
  const { token } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState('view'); // 'view' | 'sign' | 'submitting' | 'done'
  const [signerName, setSignerName] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Canvas refs
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Fetch document
  useEffect(() => {
    api.get(`/signable-documents/public/view/${token}`)
      .then(res => {
        setDoc(res.data.data);
        if (res.data.data.status === 'signed') {
          setPhase('already-signed');
        }
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'שגיאה בטעינת המסמך';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Setup canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    if (phase === 'sign') {
      // Small delay to ensure canvas is rendered
      const t = setTimeout(setupCanvas, 100);
      return () => clearTimeout(t);
    }
  }, [phase, setupCanvas]);

  // Canvas drawing handlers
  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getPos(e);
    lastPosRef.current = pos;
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPosRef.current = pos;
  };

  const stopDraw = (e) => {
    if (e) e.preventDefault();
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const isCanvasBlank = () => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return !imageData.data.some((v, i) => i % 4 === 3 && v !== 0); // Check alpha channel
  };

  const handleSubmit = async () => {
    setSubmitError('');

    if (!signerName.trim()) {
      setSubmitError('נא להזין שם מלא');
      return;
    }

    if (isCanvasBlank()) {
      setSubmitError('נא לחתום על המסמך');
      return;
    }

    const canvas = canvasRef.current;
    const signatureImageBase64 = canvas.toDataURL('image/png');

    setPhase('submitting');

    try {
      await api.post(`/signable-documents/public/sign/${token}`, {
        signerName: signerName.trim(),
        signatureImageBase64
      });
      setPhase('done');
    } catch (err) {
      const msg = err.response?.data?.message || 'שגיאה בשמירת החתימה';
      setSubmitError(msg);
      setPhase('sign');
    }
  };

  // ==================== Render ====================

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={{ color: '#666', marginTop: 16 }}>טוען מסמך...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centered}>
        <div style={styles.errorCard}>
          <h2 style={{ margin: '0 0 12px', color: '#d32f2f' }}>שגיאה</h2>
          <p style={{ margin: 0, color: '#555' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (phase === 'already-signed') {
    return (
      <div style={styles.centered}>
        <div style={styles.successCard}>
          <div style={styles.checkmark}>&#10003;</div>
          <h2 style={{ margin: '12px 0 8px', color: '#2e7d32' }}>מסמך נחתם</h2>
          <p style={{ color: '#555', margin: 0 }}>מסמך זה כבר נחתם. תודה!</p>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div style={styles.centered}>
        <div style={styles.successCard}>
          <div style={styles.checkmark}>&#10003;</div>
          <h2 style={{ margin: '12px 0 8px', color: '#2e7d32' }}>תודה רבה!</h2>
          <p style={{ color: '#555', margin: 0 }}>המסמך נחתם בהצלחה. העתק נשמר במערכת.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Letterhead Header */}
        {doc?.businessInfo?.letterheadHeaderUrl && (
          <img
            src={doc.businessInfo.letterheadHeaderUrl}
            alt=""
            style={styles.letterheadHeader}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        {/* Business + Client Header */}
        <div style={styles.header}>
          <div style={styles.businessSide}>
            {doc?.businessInfo?.logoUrl && (
              <img src={doc.businessInfo.logoUrl} alt="" style={styles.logo} onError={(e) => { e.target.style.display = 'none'; }} />
            )}
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>{doc?.businessInfo?.name || ''}</h3>
              <p style={styles.smallText}>
                {doc?.businessInfo?.address && <>{doc.businessInfo.address}<br /></>}
                {doc?.businessInfo?.phone && <>טלפון: {doc.businessInfo.phone}<br /></>}
                {doc?.businessInfo?.email && <>אימייל: {doc.businessInfo.email}</>}
              </p>
            </div>
          </div>
          <div style={styles.clientSide}>
            <p style={{ ...styles.smallText, fontWeight: 600, marginBottom: 4 }}>פרטי הלקוח</p>
            <p style={styles.smallText}>
              {doc?.clientInfo?.name && <>{doc.clientInfo.name}<br /></>}
              {doc?.clientInfo?.businessName && <>{doc.clientInfo.businessName}<br /></>}
              {doc?.clientInfo?.phone && <>טלפון: {doc.clientInfo.phone}</>}
            </p>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* Document Title + Meta */}
        <h1 style={styles.docTitle}>{doc?.title || 'מסמך'}</h1>
        <p style={styles.docMeta}>
          מספר מסמך: {doc?.documentNumber} | סוג: {typeLabels[doc?.documentType] || 'מסמך'} | תאריך: {doc?.createdAt ? new Date(doc.createdAt).toLocaleDateString('he-IL') : ''}
        </p>

        {/* Content */}
        <div style={styles.docContent}>
          {doc?.content || ''}
        </div>

        {/* Sign Section */}
        {phase === 'view' && (
          <div style={styles.signSection}>
            <button
              onClick={() => setPhase('sign')}
              style={styles.primaryBtn}
            >
              אני מסכים/ה - חתום על המסמך
            </button>
          </div>
        )}

        {(phase === 'sign' || phase === 'submitting') && (
          <div style={styles.signSection}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>חתימה דיגיטלית</h3>

            {submitError && (
              <div style={styles.errorAlert}>{submitError}</div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>שם מלא</label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="הזן את שמך המלא"
                style={styles.input}
                disabled={phase === 'submitting'}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>חתום כאן</label>
              <canvas
                ref={canvasRef}
                style={styles.canvas}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              <button
                onClick={clearCanvas}
                style={styles.clearBtn}
                disabled={phase === 'submitting'}
              >
                נקה חתימה
              </button>
            </div>

            <button
              onClick={handleSubmit}
              style={{
                ...styles.primaryBtn,
                opacity: phase === 'submitting' ? 0.6 : 1,
                cursor: phase === 'submitting' ? 'not-allowed' : 'pointer'
              }}
              disabled={phase === 'submitting'}
            >
              {phase === 'submitting' ? 'שולח...' : 'שלח חתימה'}
            </button>

            <button
              onClick={() => setPhase('view')}
              style={styles.secondaryBtn}
              disabled={phase === 'submitting'}
            >
              חזור למסמך
            </button>
          </div>
        )}

        {/* Letterhead Footer */}
        {doc?.businessInfo?.letterheadFooterUrl && (
          <img
            src={doc.businessInfo.letterheadFooterUrl}
            alt=""
            style={styles.letterheadFooter}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
      </div>
    </div>
  );
}

// ==================== Styles ====================

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
    direction: 'rtl',
    fontFamily: "'Heebo', 'Segoe UI', sans-serif",
    padding: '16px'
  },
  container: {
    maxWidth: 800,
    margin: '0 auto',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    padding: '24px 32px',
    overflow: 'hidden'
  },
  centered: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    direction: 'rtl',
    fontFamily: "'Heebo', 'Segoe UI', sans-serif",
    background: '#f5f5f5',
    padding: 16
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid #ddd',
    borderTop: '3px solid #1a237e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '32px 40px',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    maxWidth: 400
  },
  successCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    maxWidth: 400
  },
  checkmark: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: '#e8f5e9',
    color: '#2e7d32',
    fontSize: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto'
  },
  letterheadHeader: {
    width: '100%',
    maxHeight: 120,
    objectFit: 'contain',
    display: 'block',
    marginBottom: 16
  },
  letterheadFooter: {
    width: '100%',
    maxHeight: 80,
    objectFit: 'contain',
    display: 'block',
    marginTop: 32
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap'
  },
  businessSide: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start'
  },
  clientSide: {
    textAlign: 'left'
  },
  logo: {
    width: 56,
    height: 56,
    objectFit: 'contain',
    borderRadius: 6
  },
  smallText: {
    margin: 0,
    fontSize: 12,
    color: '#666',
    lineHeight: 1.6
  },
  divider: {
    border: 'none',
    borderTop: '2px solid #1a237e',
    margin: '16px 0'
  },
  docTitle: {
    fontSize: 22,
    fontWeight: 700,
    textAlign: 'center',
    margin: '16px 0 8px',
    color: '#222'
  },
  docMeta: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    marginBottom: 24
  },
  docContent: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.9,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    marginBottom: 32
  },
  signSection: {
    borderTop: '1px solid #eee',
    paddingTop: 24,
    marginTop: 24,
    textAlign: 'center'
  },
  primaryBtn: {
    display: 'block',
    width: '100%',
    padding: '14px 24px',
    background: '#1a237e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginBottom: 8
  },
  secondaryBtn: {
    display: 'block',
    width: '100%',
    padding: '12px 24px',
    background: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 6,
    color: '#333',
    textAlign: 'right'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 15,
    fontFamily: 'inherit',
    direction: 'rtl',
    boxSizing: 'border-box',
    outline: 'none'
  },
  canvas: {
    width: '100%',
    height: 160,
    border: '2px dashed #ccc',
    borderRadius: 8,
    background: '#fafafa',
    cursor: 'crosshair',
    touchAction: 'none',
    display: 'block'
  },
  clearBtn: {
    marginTop: 8,
    padding: '6px 16px',
    background: '#fff',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  errorAlert: {
    background: '#fef2f2',
    color: '#d32f2f',
    padding: '10px 16px',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'right'
  }
};
