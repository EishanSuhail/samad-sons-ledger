import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, LogOut } from 'lucide-react';

const Navbar = () => {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: '70px',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem',
      justifyContent: 'space-between',
      zIndex: 1000
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}>
        <BookOpen className="text-primary" />
        <span>LMS<span style={{color: 'var(--primary)'}}>Pro</span></span>
      </Link>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
          Dashboard
        </Link>
        <Link to="/login" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
          <User size={18} />
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
