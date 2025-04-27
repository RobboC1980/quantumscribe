import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Project {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
}

const ProjectsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for creating/editing
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const isEditing = window.location.pathname.includes('/edit/');

  useEffect(() => {
    // If we're viewing/editing a specific project, fetch it
    if (id) {
      fetchProject(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  // Prefill form when in edit mode and we have the project data
  useEffect(() => {
    if (project && isEditing) {
      setName(project.name);
      setDescription(project.description || '');
      setIsPublic(project.is_public);
    }
  }, [project, isEditing]);

  const fetchProject = async (projectId: string) => {
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await fetch(`http://localhost:4000/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      setProject(data.project);
    } catch (err) {
      setError('Failed to load project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('access_token');
      const url = id 
        ? `http://localhost:4000/api/projects/${id}` 
        : 'http://localhost:4000/api/projects';
      
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          is_public: isPublic
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${id ? 'update' : 'create'} project`);
      }

      const data = await response.json();
      navigate(`/projects/${data.project.id}`);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('access_token');
      const response = await fetch(`http://localhost:4000/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete project');
      console.error(err);
    }
  };

  // Determine what to render based on the URL
  if (window.location.pathname === '/projects/new') {
    return (
      <div className="project-container">
        <header>
          <h1>Create New Project</h1>
          <Link to="/dashboard" className="button">Back to Dashboard</Link>
        </header>

        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label htmlFor="name">Project Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>
          
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <label htmlFor="isPublic">Make project public</label>
          </div>
          
          <button type="submit" disabled={loading} className="button primary">
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="project-container">
        <header>
          <h1>Edit Project</h1>
          <Link to={`/projects/${id}`} className="button">Cancel</Link>
        </header>

        {loading ? (
          <p>Loading project...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className="project-form">
            <div className="form-group">
              <label htmlFor="name">Project Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <label htmlFor="isPublic">Make project public</label>
            </div>
            
            <div className="form-actions">
              <button type="submit" disabled={loading} className="button primary">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={handleDelete} className="button danger">
                Delete Project
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // Default: viewing a project
  return (
    <div className="project-container">
      <header>
        <Link to="/dashboard" className="button">Back to Dashboard</Link>
      </header>

      {loading ? (
        <p>Loading project...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : project ? (
        <div className="project-view">
          <div className="project-header">
            <h1>{project.name}</h1>
            {(user?.role === 'admin' || user?.role === 'editor') && (
              <Link to={`/projects/edit/${project.id}`} className="button">Edit Project</Link>
            )}
          </div>
          
          <div className="project-meta">
            {project.is_public && <span className="public-badge">Public</span>}
            <span className="date">Created: {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
          
          <div className="project-description">
            <h3>Description</h3>
            <p>{project.description || 'No description provided.'}</p>
          </div>
          
          {/* Additional project content (tasks, members, etc.) would go here */}
        </div>
      ) : (
        <p>Project not found</p>
      )}
    </div>
  );
};

export default ProjectsPage; 