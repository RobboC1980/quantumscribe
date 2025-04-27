import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ForbiddenPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '0 20px'
    }}>
      <h1 style={{ color: '#d9534f', fontSize: '3rem', marginBottom: '20px' }}>
        Access Denied
      </h1>
      
      <div style={{ maxWidth: '600px', marginBottom: '30px' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
          You don't have permission to access this page.
        </p>
        
        {user && (
          <p>
            Your current role is <strong>{user.role}</strong>, but this page requires a higher permission level.
          </p>
        )}
      </div>
      
      <div>
        <Link 
          to="/dashboard" 
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: '#5bc0de',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            marginRight: '10px'
          }}
        >
          Go to Dashboard
        </Link>
        
        <Link 
          to="/"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: '#f0ad4e',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage; 