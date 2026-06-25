import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth';
import AttendanceOverview from '../components/AttendanceOverview';
import WeeklyScheduleView from '../components/WeeklyScheduleView';
import AssignmentsList from '../components/AssignmentsList';
import NoticesList from '../components/NoticesList';
import ResultsOverview from '../components/ResultsOverview';
import ProfileView from '../components/ProfileView';

function StudentDashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('attendance');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page">
      <h1>Student Portal</h1>
      <p>Welcome, {user?.name}</p>
      <nav>
        <button
          className={activeTab === 'attendance' ? 'active' : ''}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance Overview
        </button>
        <button
          className={activeTab === 'schedule' ? 'active' : ''}
          onClick={() => setActiveTab('schedule')}
        >
          Daily Schedule
        </button>
        <button
          className={activeTab === 'results' ? 'active' : ''}
          onClick={() => setActiveTab('results')}
        >
          Exam Results
        </button>
        <button
          className={activeTab === 'assignments' ? 'active' : ''}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
        <button
          className={activeTab === 'notices' ? 'active' : ''}
          onClick={() => setActiveTab('notices')}
        >
          Notices & Announcements
        </button>
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
      </nav>

      <div className="tab-content">
        {activeTab === 'attendance' && <AttendanceOverview path="/api/student/attendance" />}
        {activeTab === 'schedule' && <WeeklyScheduleView path="/api/student/schedule" />}
        {activeTab === 'results' && <ResultsOverview path="/api/student/results" />}
        {activeTab === 'assignments' && <AssignmentsList path="/api/student/assignments" />}
        {activeTab === 'notices' && <NoticesList path="/api/student/notices" />}
        {activeTab === 'profile' && <ProfileView />}
      </div>

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default StudentDashboard;
