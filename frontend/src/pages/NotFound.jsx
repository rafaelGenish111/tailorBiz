import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '5rem', margin: 0, color: '#1976d2' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>הדף לא נמצא</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>הדף שחיפשת לא קיים או שהוסר.</p>
      <Link
        to="/"
        style={{ padding: '0.75rem 2rem', fontSize: '1rem', borderRadius: '8px', border: 'none', background: '#1976d2', color: '#fff', textDecoration: 'none' }}
      >
        חזרה לדף הבית
      </Link>
    </div>
  );
}
