import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Badge, Card, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getUsers, createUser, updateUser, deleteUser } from '../features/auth/authSlice';

const UserManagementPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { userInfo, users, isLoading, isError, message } = useSelector((state) => state.auth);

  // State for user form
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer',
    department: 'sales',
    active: true,
  });

  // Custom permissions state
  const [customPermissions, setCustomPermissions] = useState({
    proposal: {
      create: false,
      view: true,
      edit: false,
      approve: false,
      finalApprove: false,
    },
    project: {
      create: false,
      view: true,
      edit: false,
    },
    serviceRequest: {
      create: false,
      view: true,
      edit: false,
      assign: false,
    },
    user: {
      create: false,
      view: false,
      edit: false,
    },
  });

  // State for role template selector
  const [selectedRoleTemplate, setSelectedRoleTemplate] = useState('custom');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else if (userInfo.role !== 'admin') {
      navigate('/dashboard');
    } else {
      dispatch(getUsers());
    }
  }, [dispatch, navigate, userInfo]);

  // Handle role template selection
  const handleRoleTemplateChange = (e) => {
    const selectedRole = e.target.value;
    setSelectedRoleTemplate(selectedRole);
    
    if (selectedRole === 'custom') {
      return; // Keep current custom permissions
    }
    
    // Apply role template permissions
    let newPermissions = { ...customPermissions };
    
    switch (selectedRole) {
      case 'admin':
        // Admin has all permissions
        Object.keys(newPermissions).forEach(resource => {
          Object.keys(newPermissions[resource]).forEach(action => {
            newPermissions[resource][action] = true;
          });
        });
        break;
      case 'manager':
        // Reset permissions
        newPermissions = {
          proposal: {
            create: true,
            view: true,
            edit: true,
            approve: true,
            finalApprove: false,
          },
          project: {
            create: true,
            view: true,
            edit: true,
          },
          serviceRequest: {
            create: true,
            view: true,
            edit: true,
            assign: true,
          },
          user: {
            create: false,
            view: true,
            edit: false,
          },
        };
        break;
      case 'sales':
        // Reset permissions
        newPermissions = {
          proposal: {
            create: true,
            view: true,
            edit: true,
            approve: false,
            finalApprove: false,
          },
          project: {
            create: false,
            view: true,
            edit: false,
          },
          serviceRequest: {
            create: true,
            view: true,
            edit: false,
            assign: false,
          },
          user: {
            create: false,
            view: false,
            edit: false,
          },
        };
        break;
      // Add more role templates as needed
      default:
        break;
    }
    
    setCustomPermissions(newPermissions);
    setUserForm(prev => ({ ...prev, role: selectedRole }));
  };

  // Handle permission toggle
  const handlePermissionChange = (resource, action) => {
    setCustomPermissions(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource][action],
      },
    }));
    
    // Set to custom role if changing permissions
    setSelectedRoleTemplate('custom');
    setUserForm(prev => ({ ...prev, role: 'custom' }));
  };

  // Open modal for editing or creating user
  const openUserModal = (user = null) => {
    if (user) {
      // Editing existing user
      setEditingUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        password: '', // Don't set password when editing
        role: user.role,
        department: user.department || 'sales',
        active: user.active,
      });
      setCustomPermissions(user.permissions || customPermissions);
      setSelectedRoleTemplate(user.role);
    } else {
      // Creating new user
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'viewer',
        department: 'sales',
        active: true,
      });
      // Reset permissions to default
      setCustomPermissions({
        proposal: {
          create: false,
          view: true,
          edit: false,
          approve: false,
          finalApprove: false,
        },
        project: {
          create: false,
          view: true,
          edit: false,
        },
        serviceRequest: {
          create: false,
          view: true,
          edit: false,
          assign: false,
        },
        user: {
          create: false,
          view: false,
          edit: false,
        },
      });
      setSelectedRoleTemplate('viewer');
    }
    setShowUserModal(true);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const userData = {
      ...userForm,
      permissions: customPermissions,
    };
    
    if (editingUser) {
      // Update existing user
      dispatch(updateUser({
        id: editingUser._id,
        userData,
      }));
    } else {
      // Create new user
      dispatch(createUser(userData));
    }
    
    setShowUserModal(false);
  };

  // Handle user deletion
  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(userId));
    }
  };

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="mb-0"><i className="fas fa-users-cog me-2 text-primary"></i>User Management</h1>
          <p className="text-muted mt-2 mb-0">Manage user accounts and permissions</p>
        </Col>
        <Col className="text-end">
          <Button 
            variant="primary" 
            onClick={() => openUserModal()}
            className="mb-3"
          >
            <i className="fas fa-user-plus me-2"></i>
            Add New User
          </Button>
        </Col>
      </Row>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white py-3 border-bottom">
            <h5 className="mb-0">User Accounts</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive bordered hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users && users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <Badge bg={
                        user.role === 'admin' ? 'danger' :
                        user.role === 'manager' ? 'warning' :
                        user.role === 'sales' ? 'info' :
                        'secondary'
                      }>
                        {user.role}
                      </Badge>
                    </td>
                    <td>{user.department || 'N/A'}</td>
                    <td>
                      {user.active ? (
                        <Badge bg="success">Active</Badge>
                      ) : (
                        <Badge bg="secondary">Inactive</Badge>
                      )}
                    </td>
                    <td>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => openUserModal(user)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* User Form Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password {editingUser && '(Leave blank to keep current)'}</Form.Label>
                  <Form.Control
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required={!editingUser}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  >
                    <option value="management">Management</option>
                    <option value="sales">Sales</option>
                    <option value="operations">Operations</option>
                    <option value="service">Service</option>
                    <option value="finance">Finance</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role Template</Form.Label>
                  <Form.Select
                    value={selectedRoleTemplate}
                    onChange={handleRoleTemplateChange}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="sales">Sales</option>
                    <option value="technician">Technician</option>
                    <option value="viewer">Viewer</option>
                    <option value="custom">Custom</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={userForm.active.toString()}
                    onChange={(e) => setUserForm({ ...userForm, active: e.target.value === 'true' })}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mt-4 mb-3">Custom Permissions</h5>

            {/* Proposal Permissions */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <h6 className="mb-0">Proposal Permissions</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col xs={6} md={3}>
                    <Form.Check
                      type="switch"
                      id="proposal-create"
                      label="Create"
                      checked={customPermissions.proposal.create}
                      onChange={() => handlePermissionChange('proposal', 'create')}
                    />
                  </Col>
                  <Col xs={6} md={3}>
                    <Form.Check
                      type="switch"
                      id="proposal-view"
                      label="View"
                      checked={customPermissions.proposal.view}
                      onChange={() => handlePermissionChange('proposal', 'view')}
                    />
                  </Col>
                  <Col xs={6} md={3}>
                    <Form.Check
                      type="switch"
                      id="proposal-edit"
                      label="Edit"
                      checked={customPermissions.proposal.edit}
                      onChange={() => handlePermissionChange('proposal', 'edit')}
                    />
                  </Col>
                  <Col xs={6} md={3}>
                    <Form.Check
                      type="switch"
                      id="proposal-approve"
                      label="Approve"
                      checked={customPermissions.proposal.approve}
                      onChange={() => handlePermissionChange('proposal', 'approve')}
                    />
                  </Col>
                  <Col xs={6} md={3} className="mt-2">
                    <Form.Check
                      type="switch"
                      id="proposal-finalApprove"
                      label="Final Approve"
                      checked={customPermissions.proposal.finalApprove}
                      onChange={() => handlePermissionChange('proposal', 'finalApprove')}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Project Permissions */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <h6 className="mb-0">Project Permissions</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col xs={6} md={4}>
                    <Form.Check
                      type="switch"
                      id="project-create"
                      label="Create"
                      checked={customPermissions.project.create}
                      onChange={() => handlePermissionChange('project', 'create')}
                    />
                  </Col>
                  <Col xs={6} md={4}>
                    <Form.Check
                      type="switch"
                      id="project-view"
                      label="View"
                      checked={customPermissions.project.view}
                      onChange={() => handlePermissionChange('project', 'view')}
                    />
                  </Col>
                  <Col xs={6} md={4}>
                    <Form.Check
                      type="switch"
                      id="project-edit"
                      label="Edit"
                      checked={customPermissions.project.edit}
                      onChange={() => handlePermissionChange('project', 'edit')}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Service Request Permissions */}
            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                <h6 className="mb-0">Service Request Permissions</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col xs={6} md={3}>
                    <Form.Check
                      type="switch"
                      id="serviceRequest-create"
                      label="Create"
                      checked={customPermissions.serviceRequest.create}
                      onChange={() => handlePermissionChange('serviceRequest', 'create')}
                    />
                  </Col>
                  <Col xs={6} md={3}>
                    <Form.Check
                      type="switch"
                      id="serviceRequest-view"
                      label="View"
                      checked={customPermissions.serviceRequest.view}
                      onChange={() => handlePermissionChange('serviceRequest', 'view')}
                    />
                  </Col>
                  <Col xs={6} md={3}>
                    <Form.Check
                      type="switch"
                      id="serviceRequest-edit"
                      label="Edit"
                      checked={customPermissions.serviceRequest.edit}
                      onChange={() => handlePermissionChange('serviceRequest', 'edit')}
                    />
                  </Col>
                  <Col xs={6} md={3}>
                    <Form.Check
                      type="switch"
                      id="serviceRequest-assign"
                      label="Assign"
                      checked={customPermissions.serviceRequest.assign}
                      onChange={() => handlePermissionChange('serviceRequest', 'assign')}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* User Management Permissions */}
            <Card>
              <Card.Header className="bg-light py-2">
                <h6 className="mb-0">User Management Permissions</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col xs={6} md={4}>
                    <Form.Check
                      type="switch"
                      id="user-create"
                      label="Create"
                      checked={customPermissions.user.create}
                      onChange={() => handlePermissionChange('user', 'create')}
                    />
                  </Col>
                  <Col xs={6} md={4}>
                    <Form.Check
                      type="switch"
                      id="user-view"
                      label="View"
                      checked={customPermissions.user.view}
                      onChange={() => handlePermissionChange('user', 'view')}
                    />
                  </Col>
                  <Col xs={6} md={4}>
                    <Form.Check
                      type="switch"
                      id="user-edit"
                      label="Edit"
                      checked={customPermissions.user.edit}
                      onChange={() => handlePermissionChange('user', 'edit')}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUserModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default UserManagementPage;