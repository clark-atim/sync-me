import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const NoteEditor = ({ note, onUpdate, editorRef }) => {
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = note.content;
    }
  }, [note.id, editorRef]);

  return (
    <div
      ref={editorRef}
      className="editor-text rich-editor"
      contentEditable={true}
      onInput={(e) => onUpdate('content', e.currentTarget.innerHTML)}
    />
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('syncme-users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('syncme-notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const [activeNoteId, setActiveNoteId] = useState(null);
  const editorRef = useRef(null);

  const userNotes = notes.filter(n => n.userId === currentUser && !n.isDeleted);
  const activeNote = notes.find(n => n.id === activeNoteId && n.userId === currentUser);

  useEffect(() => {
    localStorage.setItem('syncme-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('syncme-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (!isLoggedIn || userNotes.length === 0) return;
    const autosaveTimer = setTimeout(() => {
      handleSync();
    }, 2000);
    return () => clearTimeout(autosaveTimer);
  }, [notes, isLoggedIn, currentUser]);

  const handleSync = async () => {
    setIsSyncing(true);
    console.log("Autosaving notes...", userNotes);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const handleAuth = () => {
    setAuthError("");
    const email = document.querySelector('.auth-input[type="email"]').value;
    const password = document.querySelector('.auth-input[type="password"]').value;

    if (!email || !password) {
      setAuthError("Please fill in all fields.");
      return;
    }

    if (showRegister) {
      const userExists = users.find(u => u.email === email);
      if (userExists) {
        setAuthError("Email already registered.");
        return;
      }
      setUsers([...users, { email, password }]);
      setShowRegister(false);
      setAuthError("");
      alert("Registration successful! Please login.");
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        setAuthError("Invalid email or password.");
        return;
      }
      setCurrentUser(email);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveNoteId(null);
  };

  const createNote = () => {
    const newNote = {
      id: crypto.randomUUID(),
      userId: currentUser,
      title: "",
      content: "",
      updatedAt: new Date().toISOString(),
      isDeleted: false
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (field, value) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === activeNoteId 
        ? { ...note, [field]: value, updatedAt: new Date().toISOString() } 
        : note
    ));
  };

  const deleteNote = (id) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === id 
        ? { ...note, isDeleted: true, updatedAt: new Date().toISOString() } 
        : note
    ));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const applyStyle = (command) => {
    document.execCommand(command, false, null);
    if (editorRef.current) {
      updateNote('content', editorRef.current.innerHTML);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="logo-container">
            <div className="icon-wrapper">
              <svg className="logo-login" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 1.5V13a1 1 0 0 0 1 1V1.5a.5.5 0 0 1 .5-.5H14a1 1 0 0 0-1-1H1.5A1.5 1.5 0 0 0 0 1.5"/>
                <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v11A1.5 1.5 0 0 0 3.5 16h6.086a1.5 1.5 0 0 0 1.06-.44l4.915-4.914A1.5 1.5 0 0 0 16 9.586V3.5A1.5 1.5 0 0 0 14.5 2zm6 8.5a1 1 0 0 1 1-1h4.396a.25.25 0 0 1 .177.427l-5.146 5.146a.25.25 0 0 1-.427-.177z"/>
              </svg>
            </div>
            <h1 className="logo-text">SyncMe</h1>
          </div>
          {authError && <div className="auth-error-message">{authError}</div>}
          <h2 style={{ color: 'white' }}>{showRegister ? "Create Account" : "Welcome Back"}</h2>
          <input type="email" placeholder="Email Address" className="auth-input" />
          <input type="password" placeholder="Password" className="auth-input" />
          <button className="login-btn" onClick={handleAuth}> 
            {showRegister ? "Sign Up" : "Login"}
          </button>
          <p className="auth-toggle" onClick={() => { setShowRegister(!showRegister); setAuthError(""); }}>
            {showRegister ? "Already have an account? Login" : "New to SyncMe? Register here"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="syncme-layout">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo-container">
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 1.5V13a1 1 0 0 0 1 1V1.5a.5.5 0 0 1 .5-.5H14a1 1 0 0 0-1-1H1.5A1.5 1.5 0 0 0 0 1.5"/>
                <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v11A1.5 1.5 0 0 0 3.5 16h6.086a1.5 1.5 0 0 0 1.06-.44l4.915-4.914A1.5 1.5 0 0 0 16 9.586V3.5A1.5 1.5 0 0 0 14.5 2zm6 8.5a1 1 0 0 1 1-1h4.396a.25.25 0 0 1 .177.427l-5.146 5.146a.25.25 0 0 1-.427-.177z"/>
              </svg>
            </div>
            <h1 className="logo-text">SyncMe</h1>
          </div>
          <div style={{ color: '#8b949e', fontSize: '11px', textAlign: 'center', marginBottom: '10px' }}>
            {isSyncing ? "Saving..." : "Saved locally"}
          </div>
          <button className="new-note-btn" onClick={createNote}>+ New Note</button>
          <nav className="note-list">
            {userNotes.map(note => (
              <div 
                key={note.id} 
                className={`note-item ${note.id === activeNoteId ? 'active' : ''}`}
                onClick={() => setActiveNoteId(note.id)}
              >
                <div className="note-item-header">
                  <h3>{note.title || "Untitled Note"}</h3>
                  <button 
                    className="delete-btn" 
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  >✕</button>
                </div>
                <p>{note.content.replace(/<[^>]*>/g, '').substring(0, 35) || "No content..."}</p>
              </div>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="editor-area">
        <header className="toolbar">
          <button className="tool-btn" onClick={() => applyStyle('bold')}>B</button>
          <button className="tool-btn" onClick={() => applyStyle('italic')}>I</button>
          <button className="tool-btn" onClick={() => applyStyle('underline')}>U</button>
        </header>
        <section className="content">
          {activeNote ? (
            <>
              <input 
                className="editor-title"
                value={activeNote.title}
                onChange={(e) => updateNote('title', e.target.value)}
                placeholder="Note Title"
              />
              <NoteEditor 
                note={activeNote} 
                onUpdate={updateNote} 
                editorRef={editorRef} 
              />
            </>
          ) : (
            <div className="no-active">Select or create a note to start typing.</div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
