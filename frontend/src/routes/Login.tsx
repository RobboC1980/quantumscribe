import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Tabs, message, Divider } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { signIn, signUp, supabase } from '../lib/supabase';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  async function handleLogin(values: { email: string; password: string }) {
    try {
      setLoading(true);
      const { data, error } = await signIn(values.email, values.password);
      
      if (error) {
        throw error;
      }
      
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(values: { email: string; password: string }) {
    try {
      setLoading(true);
      const { data, error } = await signUp(values.email, values.password);
      
      if (error) {
        throw error;
      }
      
      message.success('Registration successful! Please check your email for confirmation.');
      // Stay on login tab for the user to login after confirming their email
      setActiveTab('login');
    } catch (error: any) {
      message.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      message.error(error.message || 'Google login failed. Please try again.');
      setLoading(false);
    }
  }

  const items = [
    {
      key: 'login',
      label: 'Login',
      children: (
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
          
          <Divider>Or</Divider>
          
          <Button 
            icon={<GoogleOutlined />} 
            onClick={handleGoogleLogin} 
            loading={loading} 
            block
          >
            Continue with Google
          </Button>
        </Form>
      )
    },
    {
      key: 'register',
      label: 'Register',
      children: (
        <Form layout="vertical" onFinish={handleRegister}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters' }
            ]}
          >
            <Input.Password placeholder="Create a password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                }
              })
            ]}
          >
            <Input.Password placeholder="Confirm your password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>
          
          <Divider>Or</Divider>
          
          <Button 
            icon={<GoogleOutlined />} 
            onClick={handleGoogleLogin} 
            loading={loading} 
            block
          >
            Continue with Google
          </Button>
        </Form>
      )
    }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card 
        title={<h1 style={{ textAlign: 'center' }}>QuantumScribe</h1>}
        style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          centered
          items={items}
        />
      </Card>
    </div>
  );
}
