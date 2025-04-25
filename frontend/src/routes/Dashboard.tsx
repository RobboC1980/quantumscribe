import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Card, Row, Col, Statistic, Button, Typography, Spin } from 'antd';
import {
  ProjectOutlined,
  DashboardOutlined,
  CreditCardOutlined,
  RobotOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  aiInteractions: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    aiInteractions: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch dashboard stats
    async function fetchStats() {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // Simulate API call for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dummy data for demonstration
        setStats({
          totalProjects: 5,
          totalTasks: 24,
          completedTasks: 16,
          aiInteractions: 8
        });
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px', background: '#001529' }}>
        <Title level={3} style={{ margin: 0, color: 'white' }}>QuantumScribe</Title>
      </Header>
      
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['dashboard']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
              <Link to="/dashboard">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="projects" icon={<ProjectOutlined />}>
              <Link to="/projects">Projects</Link>
            </Menu.Item>
            <Menu.Item key="billing" icon={<CreditCardOutlined />}>
              <Link to="/billing">Billing</Link>
            </Menu.Item>
            <Menu.Item key="ai" icon={<RobotOutlined />}>
              <Link to="/ai">AI Assistant</Link>
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Menu.Item>
          </Menu>
        </Sider>
        
        <Content style={{ padding: '24px', minHeight: 280 }}>
          <Title level={2}>Dashboard</Title>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                  <Card>
                    <Statistic title="Total Projects" value={stats.totalProjects} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic title="Total Tasks" value={stats.totalTasks} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic 
                      title="Completed Tasks" 
                      value={stats.completedTasks} 
                      suffix={`/ ${stats.totalTasks}`} 
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic title="AI Interactions" value={stats.aiInteractions} />
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Quick Actions" style={{ marginBottom: '24px' }}>
                    <Button type="primary" style={{ marginRight: '10px' }}>
                      <Link to="/projects">New Project</Link>
                    </Button>
                    <Button>
                      <Link to="/ai">Ask AI</Link>
                    </Button>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Recent Activity">
                    <p>Project "Marketing Campaign" updated</p>
                    <p>3 tasks completed in "Website Redesign"</p>
                    <p>New project "Mobile App" created</p>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
