import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';

interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('reader');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem('access_token');
        const response = await fetch('http://localhost:4000/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string) => {
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingUserId(null);
    } catch (err) {
      setError('Failed to update user role');
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('access_token');
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove user from local state
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <Link to="/dashboard" className="button">Back to Dashboard</Link>
      </header>

      <div className="admin-content">
        <h2>User Management</h2>
        {error && <p className="error">{error}</p>}
        
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4}>No users found</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>
                      {editingUserId === u.id ? (
                        <select 
                          value={newRole} 
                          onChange={(e) => setNewRole(e.target.value as UserRole)}
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="reader">Reader</option>
                        </select>
                      ) : (
                        <span className={`role-badge ${u.role}`}>{u.role}</span>
                      )}
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {editingUserId === u.id ? (
                        <>
                          <button 
                            onClick={() => handleRoleChange(u.id)}
                            className="button small success"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingUserId(null)}
                            className="button small"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => {
                              setEditingUserId(u.id);
                              setNewRole(u.role);
                            }}
                            className="button small"
                            disabled={u.id === user?.id}
                          >
                            Edit Role
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="button small danger"
                            disabled={u.id === user?.id}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 