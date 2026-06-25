import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth';
import UsersManagement from '../components/UsersManagement';
import ClassesSchedule from '../components/ClassesSchedule';
import NoticesList from '../components/NoticesList';
import CreateUserForm from '../components/CreateUserForm';
import CreateClassForm from '../components/CreateClassForm';
import CreateScheduleForm from '../components/CreateScheduleForm';
import EnrollStudentForm from '../components/EnrollStudentForm';

function AdminDashboard() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [usersRefreshKey, setUsersRefreshKey] = useState(0);
  const [classesRefreshKey, setClassesRefreshKey] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page">
      <h1>Admin Portal</h1>
      <p>Welcome, {user?.name}</p>
      <nav>
        <button onClick={() => {}}>
          Manage Students & Faculty
        </button>
        <button onClick={() => {}}>
          Create / Manage Classes
        </button>
      </nav>

      <CreateUserForm onCreated={() => setUsersRefreshKey((prev) => prev + 1)} />
      <CreateClassForm onCreated={() => setClassesRefreshKey((prev) => prev + 1)} />
      <CreateScheduleForm onCreated={() => setClassesRefreshKey((prev) => prev + 1)} />
      <EnrollStudentForm onEnrollSuccess={() => setClassesRefreshKey((prev) => prev + 1)} />
      <UsersManagement refreshKey={usersRefreshKey} />
      <ClassesSchedule path="/api/admin/classes" refreshKey={classesRefreshKey} />
      <NoticesList path="/api/admin/notices" refreshKey={classesRefreshKey} />

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default AdminDashboard;
