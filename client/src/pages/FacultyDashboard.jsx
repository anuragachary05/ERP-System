import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth';
import WeeklyScheduleView from '../components/WeeklyScheduleView';
import AssignmentsList from '../components/AssignmentsList';
import MarkAttendanceForm from '../components/MarkAttendanceForm';
import PostResultForm from '../components/PostResultForm';
import CreateAssignmentForm from '../components/CreateAssignmentForm';
import ProfileView from '../components/ProfileView';

function FacultyDashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');
  const [assignmentRefreshKey, setAssignmentRefreshKey] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page">
      <h1>Faculty Portal</h1>
      <p>Welcome, {user?.name}</p>
      <nav>
        <button
          className={activeTab === 'schedule' ? 'active' : ''}
          onClick={() => setActiveTab('schedule')}
        >
          View Schedule
        </button>
        <button
          className={activeTab === 'attendance' ? 'active' : ''}
          onClick={() => setActiveTab('attendance')}
        >
          Mark Attendance
        </button>
        <button
          className={activeTab === 'assignments' ? 'active' : ''}
          onClick={() => setActiveTab('assignments')}
        >
          Evaluate Assignments
        </button>
        <button
          className={activeTab === 'results' ? 'active' : ''}
          onClick={() => setActiveTab('results')}
        >
          Post Exam Results
        </button>
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
      </nav>

      <div className="tab-content">
        {activeTab === 'schedule' && <WeeklyScheduleView path="/api/faculty/schedule" />}
        {activeTab === 'attendance' && <MarkAttendanceForm />}
        {activeTab === 'assignments' && (
          <div>
            <CreateAssignmentForm onCreated={() => setAssignmentRefreshKey(prev => prev + 1)} />
            <AssignmentsList path="/api/faculty/assignments" key={assignmentRefreshKey} />
          </div>
        )}
        {activeTab === 'results' && <PostResultForm />}
        {activeTab === 'profile' && <ProfileView />}
      </div>

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default FacultyDashboard;
