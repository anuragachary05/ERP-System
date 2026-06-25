import { getCurrentUser } from '../utils/auth';

export default function ProfileView() {
  const user = getCurrentUser();

  if (!user) return <div className="error-message">Not authenticated</div>;

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="card profile-container">
      <h3>My Profile</h3>
      <div className="profile-grid">
        <div className="profile-header-card">
          <div className="profile-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-title-block">
            <h4>{user.name}</h4>
            <span className="role-tag">{user.role}</span>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="detail-item">
            <span className="detail-label">Roll Number</span>
            <span className="detail-value">{user.studentRoll || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email Address</span>
            <span className="detail-value">{user.email || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Class</span>
            <span className="detail-value">{user.className || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Department</span>
            <span className="detail-value">{user.department || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Mobile Number</span>
            <span className="detail-value">{user.mobile || '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date of Birth</span>
            <span className="detail-value">{formatDate(user.dob)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
