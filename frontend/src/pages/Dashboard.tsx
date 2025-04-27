import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Project {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = sessionStorage.getItem('access_token');
        const response = await fetch('http://localhost:4000/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        setError('Failed to load projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.email}</span>
          <span className="role-badge">{user?.role}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="projects-header">
          <h2>Your Projects</h2>
          <Link to="/projects/new" className="button">New Project</Link>
        </div>

        {error && <p className="error">{error}</p>}
        
        {loading ? (
          <p>Loading projects...</p>
        ) : (
          <div className="projects-grid">
            {projects.length === 0 ? (
              <p>No projects found. Create your first project!</p>
            ) : (
              projects.map(project => (
                <div key={project.id} className="project-card">
                  <h3>{project.name}</h3>
                  <p>{project.description || 'No description'}</p>
                  <div className="project-meta">
                    {project.is_public && <span className="public-badge">Public</span>}
                    <span className="date">Created: {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="project-actions">
                    <Link to={`/projects/${project.id}`} className="button small">View</Link>
                    {(user?.role === 'admin' || user?.role === 'editor') && (
                      <Link to={`/projects/edit/${project.id}`} className="button small">Edit</Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {user?.role === 'admin' && (
        <div className="admin-actions">
          <Link to="/admin" className="button admin">Admin Panel</Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 