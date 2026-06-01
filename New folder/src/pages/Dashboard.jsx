import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, FileText, Plus, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' or 'files'
  const [uploadMethod, setUploadMethod] = useState('link'); // 'link' or 'upload'
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [title, setTitle] = useState('');
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch courses to populate dropdown
    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const courseList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(courseList);
      if(courseList.length > 0) setSelectedCourse(courseList[0].id);
    };
    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    const courseName = prompt("Enter new course name (e.g. UPSC Prelims):");
    if (!courseName) return;
    try {
      const docRef = await addDoc(collection(db, "courses"), { title: courseName, createdAt: new Date() });
      setCourses([...courses, { id: docRef.id, title: courseName }]);
      setSelectedCourse(docRef.id);
      setMessage(`Course '${courseName}' created successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error adding course: ", error);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !selectedCourse) {
      alert("Please fill all fields.");
      return;
    }

    if (uploadMethod === 'link') {
      if (!linkUrl) {
        alert("Please provide a valid link.");
        return;
      }
      setIsUploading(true);
      try {
        await addDoc(collection(db, `courses/${selectedCourse}/modules`), {
          title: title,
          type: activeTab === 'videos' ? 'video' : 'pdf',
          url: linkUrl,
          uploadMethod: 'link',
          createdAt: new Date()
        });
        setMessage("Link added successfully!");
        setTitle('');
        setLinkUrl('');
      } catch (error) {
        console.error("Error saving link:", error);
        alert("Failed to save link.");
      } finally {
        setIsUploading(false);
        setTimeout(() => setMessage(''), 3000);
      }

    } else if (uploadMethod === 'upload') {
      if (!file) {
        alert("Please select a file to upload.");
        return;
      }

      setIsUploading(true);
      const storageRef = ref(storage, `content/${selectedCourse}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          console.error("Upload error: ", error);
          alert("Upload failed! Please check if your Firebase Storage allows writing or if you need to upgrade to Blaze Plan.");
          setIsUploading(false);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, `courses/${selectedCourse}/modules`), {
            title: title,
            type: activeTab === 'videos' ? 'video' : 'pdf',
            url: downloadURL,
            fileName: file.name,
            uploadMethod: 'direct',
            createdAt: new Date()
          });

          setIsUploading(false);
          setFile(null);
          setTitle('');
          setUploadProgress(0);
          setMessage("File uploaded successfully!");
          if (fileInputRef.current) fileInputRef.current.value = "";
          setTimeout(() => setMessage(''), 3000);
        }
      );
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h2>Admin Dashboard</h2>
        <button className="btn btn-primary" onClick={handleCreateCourse}>
          <Plus size={18} />
          Create Course
        </button>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#6ee7b7', padding: '12px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'videos' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('videos')}
        >
          <Video size={18} /> Manage Videos
        </button>
        <button 
          className={`btn ${activeTab === 'files' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('files')}
        >
          <FileText size={18} /> Manage Files & PDFs
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        
        {/* Method Toggle */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px', width: 'fit-content' }}>
          <button 
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: uploadMethod === 'link' ? 'var(--primary)' : 'transparent', color: uploadMethod === 'link' ? 'white' : 'var(--text-muted)', fontWeight: 'bold' }}
            onClick={() => setUploadMethod('link')}
          >
            Paste Link (Free)
          </button>
          <button 
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: uploadMethod === 'upload' ? 'var(--primary)' : 'transparent', color: uploadMethod === 'upload' ? 'white' : 'var(--text-muted)', fontWeight: 'bold' }}
            onClick={() => setUploadMethod('upload')}
          >
            Direct Upload (Firebase Storage)
          </button>
        </div>

        <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label">Select Course</label>
            <select className="form-input" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              {courses.length === 0 ? <option value="">No courses available</option> : null}
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: '2', minWidth: '200px' }}>
            <label className="form-label">Content Title</label>
            <input type="text" className="form-input" placeholder="e.g. Chapter 1: Introduction" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
        </div>

        {uploadMethod === 'link' ? (
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">{activeTab === 'videos' ? 'YouTube / Video Link' : 'Google Drive / PDF Link'}</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 16px' }}>
              <LinkIcon size={18} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="url" 
                className="form-input" 
                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', boxShadow: 'none' }} 
                placeholder="https://..." 
                value={linkUrl} 
                onChange={(e) => setLinkUrl(e.target.value)} 
              />
            </div>
            <small style={{ color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
              Note: Make sure the link is accessible (e.g. YouTube is Unlisted, or Google Drive is 'Anyone with link can view').
            </small>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', border: '2px dashed var(--border-color)', borderRadius: '12px', marginBottom: '24px', position: 'relative' }}>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect} 
              accept={activeTab === 'videos' ? "video/*" : "application/pdf"} 
              style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
            />
            <Upload size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3>{file ? file.name : `Upload ${activeTab === 'videos' ? 'Video Lecture' : 'Study Material'}`}</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Click or drag & drop to select a {activeTab === 'videos' ? 'Video' : 'PDF'} file.
            </p>
          </div>
        )}

        {isUploading && uploadMethod === 'upload' && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-card-hover)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }}></div>
            </div>
          </div>
        )}

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '14px' }} 
          onClick={handleSubmit}
          disabled={isUploading}
        >
          {isUploading ? 'Processing...' : (uploadMethod === 'link' ? 'Add Content Link' : 'Start Upload')}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
