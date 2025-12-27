'use client';
import { useState } from 'react';
import { FiSend, FiTrash2, FiLock, FiUser, FiMessageSquare } from 'react-icons/fi';
import styles from './ApplicationNotes.module.css';

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function ApplicationNotes({ 
  applicationId,
  notes = [], 
  currentAdminId,
  isSuperAdmin = false,
  onAddNote,
  onDeleteNote 
}) {
  const [newNote, setNewNote] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    setSubmitting(true);
    try {
      await onAddNote(newNote.trim(), isPrivate);
      setNewNote('');
      setIsPrivate(false);
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await onDeleteNote(noteId);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const canDelete = (note) => {
    return note.adminId === currentAdminId || isSuperAdmin;
  };

  const visibleNotes = notes.filter(note => {
    if (!note.isPrivate) return true;
    return isSuperAdmin || note.adminId === currentAdminId;
  });

  return (
    <div className={styles.container}>
      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrapper}>
          <FiMessageSquare className={styles.inputIcon} />
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add an internal note about this application..."
            className={styles.textarea}
            rows={2}
          />
        </div>
        
        <div className={styles.formActions}>
          <label className={styles.privateToggle}>
            <input 
              type="checkbox" 
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <FiLock />
            <span>Private (only visible to you and super admins)</span>
          </label>
          
          <button 
            type="submit" 
            disabled={submitting || !newNote.trim()}
            className={styles.submitBtn}
          >
            <FiSend />
            {submitting ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className={styles.notesList}>
        {visibleNotes.length === 0 ? (
          <div className={styles.empty}>
            <FiMessageSquare />
            <p>No notes yet. Add the first note above.</p>
          </div>
        ) : (
          visibleNotes.map((note) => (
            <div key={note.id} className={`${styles.note} ${note.isPrivate ? styles.privateNote : ''}`}>
              <div className={styles.noteHeader}>
                <div className={styles.author}>
                  <div className={styles.avatar}>
                    {note.adminFirstName?.[0]}{note.adminLastName?.[0]}
                  </div>
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>
                      {note.adminFirstName} {note.adminLastName}
                    </span>
                    <span className={styles.noteDate}>{formatDate(note.createdAt)}</span>
                  </div>
                </div>
                
                <div className={styles.noteActions}>
                  {note.isPrivate && (
                    <span className={styles.privateBadge}>
                      <FiLock /> Private
                    </span>
                  )}
                  {canDelete(note) && (
                    <button 
                      onClick={() => handleDelete(note.id)}
                      className={styles.deleteBtn}
                      title="Delete note"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
              
              <div className={styles.noteContent}>
                {note.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
