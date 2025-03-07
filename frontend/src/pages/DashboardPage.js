import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { getLeadStats } from '../features/leads/leadSlice';
import { selectCurrentUser, selectIsAuthenticated, selectIsCheckingAuth, selectLeadStats } from '../features/selectors';
import Loader from '../components/Loader';
import Message from '../components/Message';

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Use memoized selectors for better performance
  const userInfo = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isCheckingAuth = useSelector(selectIsCheckingAuth);
  const leadStats = useSelector(selectLeadStats);
  const { isLoading, isError, message } = useSelector(state => state.leads);
  
  // Memoize status counts for better rendering performance
  const statusCounts = useMemo(() => leadStats?.statusCounts || [], [leadStats]);
  // We'll use sourceCounts in the Lead Sources section
  const sourceCounts = useMemo(() => leadStats?.sourceCounts || [], [leadStats]);
  
  // Calculate total leads once instead of multiple times
  const totalLeads = useMemo(() => {
    return statusCounts.reduce((acc, stat) => acc + stat.count, 0) || 0;
  }, [statusCounts]);

  // Memoize the navigation callback
  const checkAuth = useCallback(() => {
    if (!isCheckingAuth) {
      // Redirect to login if not authenticated
      if (!userInfo || !isAuthenticated) {
        navigate('/login');
      } else {
        dispatch(getLeadStats());
      }
    }
  }, [navigate, userInfo, isAuthenticated, isCheckingAuth, dispatch]);
  
  // Use the memoized callback in useEffect
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading state while checking authentication or not authenticated yet
  if (isCheckingAuth || !userInfo) {
    return <Loader />;
  }

  return (
    <>
      <h1 className="mb-4"><i className="fas fa-tachometer-alt me-2"></i>Dashboard</h1>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : (
        <>
          <Row>
            <Col md={4}>
              <Card className="mb-4 shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                      <i className="fas fa-users fa-lg text-info"></i>
                    </div>
                    <Card.Title as="h4" className="mb-0">Customers</Card.Title>
                  </div>
                  <Card.Text className="mb-3">
                    Manage your customer database and relationships
                  </Card.Text>
                  <Link to="/customers" className="btn btn-info text-white">
                    <i className="fas fa-arrow-right me-1"></i> View Customers
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4 shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                      <i className="fas fa-user-plus fa-lg text-primary"></i>
                    </div>
                    <Card.Title as="h4" className="mb-0">Leads</Card.Title>
                  </div>
                  <Card.Text className="mb-3">
                    {totalLeads}{' '}
                    total leads to manage
                  </Card.Text>
                  <Link to="/leads" className="btn btn-primary">
                    <i className="fas fa-arrow-right me-1"></i> View Leads
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4 shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                      <i className="fas fa-file-contract fa-lg text-success"></i>
                    </div>
                    <Card.Title as="h4" className="mb-0">Proposals</Card.Title>
                  </div>
                  <Card.Text className="mb-3">
                    Create and manage customer proposals
                  </Card.Text>
                  <Link to="/proposals" className="btn btn-success">
                    <i className="fas fa-arrow-right me-1"></i> View Proposals
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Card className="mb-4 shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                      <i className="fas fa-solar-panel fa-lg text-warning"></i>
                    </div>
                    <Card.Title as="h4" className="mb-0">Projects</Card.Title>
                  </div>
                  <Card.Text className="mb-3">
                    Track installation projects from start to finish
                  </Card.Text>
                  <Link to="/projects" className="btn btn-warning text-dark">
                    <i className="fas fa-arrow-right me-1"></i> View Projects
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4 shadow-sm border-0">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-danger bg-opacity-10 p-3 me-3">
                      <i className="fas fa-tools fa-lg text-danger"></i>
                    </div>
                    <Card.Title as="h4" className="mb-0">Service Requests</Card.Title>
                  </div>
                  <Card.Text className="mb-3">
                    Manage customer service and maintenance requests
                  </Card.Text>
                  <Link to="/service-requests" className="btn btn-danger">
                    <i className="fas fa-arrow-right me-1"></i> View Service Requests
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            {userInfo && userInfo.role === 'admin' && (
              <Col md={4}>
                <Card className="mb-4 shadow-sm border-0">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="rounded-circle bg-secondary bg-opacity-10 p-3 me-3">
                        <i className="fas fa-users-cog fa-lg text-secondary"></i>
                      </div>
                      <Card.Title as="h4" className="mb-0">Users</Card.Title>
                    </div>
                    <Card.Text className="mb-3">
                      Manage user accounts and permissions
                    </Card.Text>
                    <Link to="/users" className="btn btn-secondary text-white">
                      <i className="fas fa-arrow-right me-1"></i> View Users
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>

          {/* Recent Service Requests */}
          <Row className="mt-5">
            <Col>
              <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
                  <h5 className="mb-0"><i className="fas fa-tools me-2 text-primary"></i>Recent Service Requests</h5>
                  <Link to="/service-requests" className="btn btn-sm btn-outline-primary">View All</Link>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">Inverter Troubleshooting</h6>
                      <p className="text-muted mb-0 small">Customer: Rajan Sharma • <span className="text-muted">Standalone</span></p>
                    </div>
                    <Badge bg="info">New</Badge>
                  </div>
                  <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">Annual Maintenance</h6>
                      <p className="text-muted mb-0 small">Customer: Green Valley Resort • <span className="text-muted">Standalone</span></p>
                    </div>
                    <Badge bg="warning">Scheduled</Badge>
                  </div>
                  <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">Battery Replacement</h6>
                      <p className="text-muted mb-0 small">Customer: Govt FHC • <span className="text-muted">Standalone</span></p>
                    </div>
                    <Badge bg="primary">In Progress</Badge>
                  </div>
                  <div className="p-3 d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">System Performance Check</h6>
                      <p className="text-muted mb-0 small">Customer: Janatha Home World • <span className="text-muted">Standalone</span></p>
                    </div>
                    <Badge bg="success">Completed</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {statusCounts.length > 0 && (
            <Row className="mt-4">
              <h3 className="mb-3">Analytics</h3>
              <Col md={6}>
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-white border-bottom py-3">
                    <h5 className="mb-0"><i className="fas fa-chart-pie me-2 text-primary"></i>Lead Status</h5>
                  </Card.Header>
                  <Card.Body>
                    {statusCounts.map((stat, index) => {
                      const total = statusCounts.reduce((sum, s) => sum + s.count, 0);
                      const percentage = total > 0 ? Math.round((stat.count / total) * 100) : 0;
                      let badgeColor = 'primary';
                      
                      switch(stat._id?.toLowerCase()) {
                        case 'new': badgeColor = 'info'; break;
                        case 'contacted': badgeColor = 'primary'; break;
                        case 'qualified': badgeColor = 'success'; break;
                        case 'proposal': badgeColor = 'warning'; break;
                        case 'won': badgeColor = 'success'; break;
                        case 'lost': badgeColor = 'danger'; break;
                        default: badgeColor = 'secondary';
                      }
                      
                      return (
                        <div key={stat._id || index} className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <div>
                              <span className={`badge bg-${badgeColor} me-2`}>{stat._id || 'Unknown'}</span>
                              <span>{stat.count} leads</span>
                            </div>
                            <span className="text-muted">{percentage}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className={`progress-bar bg-${badgeColor}`} 
                              role="progressbar" 
                              style={{ width: `${percentage}%` }} 
                              aria-valuenow={percentage} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </Card.Body>
                </Card>
              </Col>
              {sourceCounts.length > 0 && (
              <Col md={6}>
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-white border-bottom py-3">
                    <h5 className="mb-0"><i className="fas fa-bullhorn me-2 text-success"></i>Lead Sources</h5>
                  </Card.Header>
                  <Card.Body>
                    {sourceCounts.map((stat, index) => {
                      const total = sourceCounts.reduce((sum, s) => sum + s.count, 0);
                      const percentage = total > 0 ? Math.round((stat.count / total) * 100) : 0;
                      const colors = ['success', 'info', 'warning', 'danger', 'primary', 'secondary'];
                      const colorIndex = index % colors.length;
                      
                      return (
                        <div key={stat._id || `source-${index}`} className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <div>
                              <span className="me-2">{stat._id || 'Unknown'}</span>
                              <span>{stat.count} leads</span>
                            </div>
                            <span className="text-muted">{percentage}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className={`progress-bar bg-${colors[colorIndex]}`} 
                              role="progressbar" 
                              style={{ width: `${percentage}%` }} 
                              aria-valuenow={percentage} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </Card.Body>
                </Card>
              </Col>
              )}
            </Row>
          )}
        </>
      )}
    </>
  );
};

export default DashboardPage;