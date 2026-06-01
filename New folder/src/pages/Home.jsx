import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const courseList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(courseList);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px', marginTop: '40px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Crack Your Dream Exam
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Premium video lectures, comprehensive notes, and structured courses for Indian Competitive Exams.
        </p>
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link to="/login" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>
            Start Learning Free
          </Link>
        </div>
      </div>

      <h2 style={{ marginBottom: '24px' }}>Explore Categories</h2>
      
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading courses...</p>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No courses available yet. Login as Admin to add courses!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {categories.map(cat => (
            <Link to={`/course/${cat.id}`} key={cat.id} className="glass-panel" style={{ padding: '24px', display: 'block', transition: 'transform 0.3s' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>{cat.title}</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Click to view content</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
