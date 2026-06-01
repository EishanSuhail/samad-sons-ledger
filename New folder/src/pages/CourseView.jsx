import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, FileText, ArrowLeft, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Helper function to extract YouTube ID
const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const CourseView = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the currently playing video
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseDoc = await getDoc(doc(db, "courses", courseId));
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() });
        }

        const modulesSnapshot = await getDocs(collection(db, `courses/${courseId}/modules`));
        const moduleList = modulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by creation date if needed
        moduleList.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
        setModules(moduleList);
      } catch (error) {
        console.error("Error fetching course: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleModuleClick = (mod) => {
    if (mod.type === 'pdf') {
      // For PDFs, it's usually better to open them in a new tab or browser
      window.open(mod.url, '_blank', 'noopener,noreferrer');
    } else {
      // For videos, play them inside the app
      setActiveModule(mod);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!course) {
    return <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>Course not found.</div>;
  }

  return (
    <div className="container" style={{ padding: '20px 20px 60px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to Courses
      </Link>
      
      <h1 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>{course.title}</h1>

      {/* Video Player Section */}
      {activeModule && (
        <div className="glass-panel" style={{ marginBottom: '32px', overflow: 'hidden', padding: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Now Playing: {activeModule.title}</h3>
            <button 
              onClick={() => setActiveModule(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
            >
              <X size={20} />
            </button>
          </div>
          
          <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
            {getYouTubeId(activeModule.url) ? (
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src={`https://www.youtube.com/embed/${getYouTubeId(activeModule.url)}?autoplay=1&rel=0`}
                title={activeModule.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src={activeModule.url} 
                controls 
                autoPlay
                controlsList="nodownload"
              ></video>
            )}
          </div>
        </div>
      )}

      {/* Course Content List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Course Content</h3>
        
        {modules.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No content available for this course yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {modules.map(mod => {
              const isPlaying = activeModule && activeModule.id === mod.id;
              
              return (
                <div 
                  key={mod.id} 
                  onClick={() => handleModuleClick(mod)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '16px', 
                    background: isPlaying ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.05)', 
                    border: isPlaying ? '1px solid var(--primary)' : '1px solid transparent',
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    transition: 'all 0.2s',
                  }} 
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {mod.type === 'video' ? <PlayCircle style={{ color: isPlaying ? 'var(--primary)' : 'var(--text-main)' }} /> : <FileText style={{ color: 'var(--secondary)' }} />}
                    <span style={{ fontWeight: '500', color: isPlaying ? 'var(--primary)' : 'var(--text-main)' }}>
                      {mod.title}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '4px 8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                    {mod.type === 'video' ? (isPlaying ? 'Playing' : 'Play Video') : 'View PDF'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseView;
