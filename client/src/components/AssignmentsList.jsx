import { useEffect, useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';
import { getCurrentUser } from '../utils/auth';
import { API_URL } from '../config';

export default function AssignmentsList({ path = '/api/faculty/assignments' }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const user = getCurrentUser();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchJson(path, { headers: { ...authHeaders() } });
        if (mounted) setItems(data);
      } catch (err) {
        if (mounted) setError(err.message);
      }
    };
    load();
    return () => (mounted = false);
  }, [path, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="assignments-container">
      <h3>Assignments</h3>
      {items.length === 0 ? (
        <p className="no-data">No assignments posted yet.</p>
      ) : (
        <div className="assignments-list-grid">
          {items.map(a => (
            <AssignmentItem 
              key={a._id} 
              assignment={a} 
              user={user} 
              onUpdate={handleRefresh} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AssignmentItem({ assignment, user, onUpdate }) {
  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty';

  // Submissions state
  const [showSubmissions, setShowSubmissions] = useState(false);

  // Student upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  // Find student's submission
  const mySubmission = isStudent 
    ? assignment.submissions?.find(s => {
        const sId = s.student?._id || s.student;
        return sId?.toString() === user?.id?.toString();
      })
    : null;

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadMsg('Please choose a file to upload first.');
      return;
    }
    setUploading(true);
    setUploadMsg('');
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      await fetchJson(`/api/student/assignments/${assignment._id}/submit`, {
        method: 'POST',
        headers: authHeaders(), // NO Content-Type so boundary gets generated
        body: formData
      });

      setUploadMsg('Assignment submitted successfully!');
      setUploadFile(null);
      onUpdate();
    } catch (err) {
      setUploadMsg(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card assignment-item-card" style={{ marginBottom: '16px', padding: '16px' }}>
      <div className="assignment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4>{assignment.title}</h4>
          <p className="subtitle" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            Class: {assignment.class?.name || 'Unknown'} | Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No limit'}
          </p>
        </div>
        {isStudent && (
          <span className={`badge ${mySubmission ? 'badge-success' : 'badge-danger'}`} style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor: mySubmission ? '#e6f4ea' : '#fce8e6',
            color: mySubmission ? '#137333' : '#c5221f'
          }}>
            {mySubmission ? 'Submitted' : 'Pending'}
          </span>
        )}
      </div>

      <p className="description" style={{ margin: '12px 0', fontSize: '0.95rem' }}>{assignment.description || 'No description provided.'}</p>

      {/* STUDENT WORKFLOW */}
      {isStudent && (
        <div className="student-submission-section" style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '12px' }}>
          {mySubmission ? (
            <div className="submission-details">
              <p style={{ margin: '4px 0' }}>
                <strong>Submitted on:</strong> {new Date(mySubmission.submittedAt).toLocaleString()}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>File:</strong>{' '}
                <a href={`${API_URL}${mySubmission.fileUrl}`} target="_blank" rel="noreferrer" className="btn-link">
                  Download Submission
                </a>
              </p>
              
              <div className="grading-box" style={{ 
                marginTop: '12px', 
                padding: '12px', 
                borderRadius: '6px', 
                backgroundColor: mySubmission.grade !== undefined ? '#f1f3f4' : '#fff8e1',
                border: mySubmission.grade !== undefined ? '1px solid #dadce0' : '1px solid #ffe082'
              }}>
                {mySubmission.grade !== undefined ? (
                  <>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Grade: {mySubmission.grade} / 100</p>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#5f6368' }}>
                      <strong>Feedback:</strong> {mySubmission.feedback || 'No comments provided.'}
                    </p>
                  </>
                ) : (
                  <p style={{ margin: '0', color: '#b06000', fontSize: '0.9rem' }}>
                    ⌛ Pending faculty review and grading.
                  </p>
                )}
              </div>

              {/* Allow re-submission if not graded yet */}
              {mySubmission.grade === undefined && (
                <div style={{ marginTop: '12px' }}>
                  <details>
                    <summary style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: '0.85rem' }}>Re-submit Work</summary>
                    <form onSubmit={handleUploadSubmit} style={{ marginTop: '8px' }}>
                      <input type="file" onChange={handleFileChange} required />
                      <button type="submit" disabled={uploading} style={{ padding: '6px 12px', fontSize: '0.85rem', marginTop: '6px' }}>
                        {uploading ? 'Uploading...' : 'Upload New File'}
                      </button>
                    </form>
                  </details>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleUploadSubmit} className="upload-form">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                Upload Submission (PDF, DOCX, ZIP, or Image - max 10MB)
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="file" onChange={handleFileChange} required />
                <button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
          {uploadMsg && <p style={{ fontSize: '0.85rem', color: uploadMsg.includes('failed') || uploadMsg.includes('Choose') ? 'var(--danger)' : 'var(--success)', marginTop: '8px' }}>{uploadMsg}</p>}
        </div>
      )}

      {/* FACULTY WORKFLOW */}
      {isFaculty && (
        <div className="faculty-submission-section" style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginTop: '12px' }}>
          <button 
            onClick={() => setShowSubmissions(!showSubmissions)}
            style={{ padding: '6px 12px', fontSize: '0.85rem', backgroundColor: '#e8f0fe', color: '#1a73e8', border: 'none' }}
          >
            {showSubmissions ? 'Hide Submissions' : `Evaluate Submissions (${assignment.submissions?.length || 0})`}
          </button>

          {showSubmissions && (
            <div className="submissions-list" style={{ marginTop: '12px' }}>
              {(assignment.submissions || []).length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>No student submissions yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {assignment.submissions.map(s => (
                    <SubmissionRow 
                      key={s.student?._id || s.student}
                      submission={s}
                      assignmentId={assignment._id}
                      onUpdate={onUpdate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ submission, assignmentId, onUpdate }) {
  const student = submission.student;
  const [grade, setGrade] = useState(submission.grade !== undefined ? submission.grade : '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [isEditing, setIsEditing] = useState(submission.grade === undefined);

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (grade === '') {
      setMsg('Please specify a grade.');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      await fetchJson(`/api/faculty/assignments/${assignmentId}/submissions/${student._id || student}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ grade: Number(grade), feedback })
      });
      setMsg('Grade saved successfully.');
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="submission-row" style={{ 
      padding: '12px', 
      border: '1px solid #dadce0', 
      borderRadius: '6px', 
      backgroundColor: '#f8f9fa' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={{ fontWeight: '600' }}>{student?.name || 'Unknown Student'}</span>
          <span style={{ fontSize: '0.8rem', color: '#5f6368', marginLeft: '8px' }}>
            Roll: {student?.studentRoll || 'N/A'}
          </span>
          <div style={{ fontSize: '0.8rem', color: '#70757a', marginTop: '4px' }}>
            Submitted: {new Date(submission.submittedAt).toLocaleString()}
          </div>
        </div>
        <a 
          href={`${API_URL}${submission.fileUrl}`} 
          target="_blank" 
          rel="noreferrer"
          className="btn-download"
          style={{
            padding: '4px 8px',
            fontSize: '0.8rem',
            backgroundColor: '#1a73e8',
            color: '#fff',
            borderRadius: '4px',
            textDecoration: 'none'
          }}
        >
          Download File
        </a>
      </div>

      <div style={{ marginTop: '12px', borderTop: '1px dashed #dadce0', paddingTop: '8px' }}>
        {!isEditing ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><strong>Grade:</strong> {submission.grade} / 100</span>
              <button 
                onClick={() => setIsEditing(true)}
                style={{ padding: '2px 8px', fontSize: '0.75rem', backgroundColor: '#f1f3f4', color: '#3c4043' }}
              >
                Change Grade
              </button>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#5f6368' }}>
              <strong>Feedback:</strong> {submission.feedback || 'None'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleGradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Grade (0-100):</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)} 
                required 
                style={{ width: '80px', padding: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Feedback:</label>
              <textarea 
                placeholder="Good effort! Add more details next time." 
                value={feedback} 
                onChange={(e) => setFeedback(e.target.value)}
                style={{ width: '100%', minHeight: '50px', boxSizing: 'border-box', padding: '6px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={saving} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                {saving ? 'Saving...' : 'Save Grade'}
              </button>
              {submission.grade !== undefined && (
                <button 
                  type="button" 
                  onClick={() => {
                    setGrade(submission.grade);
                    setFeedback(submission.feedback || '');
                    setIsEditing(false);
                  }}
                  style={{ padding: '4px 12px', fontSize: '0.8rem', backgroundColor: '#f1f3f4', color: '#3c4043' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
        {msg && <p style={{ fontSize: '0.8rem', color: msg.includes('Error') ? 'var(--danger)' : 'var(--success)', marginTop: '6px', margin: '0' }}>{msg}</p>}
      </div>
    </div>
  );
}
