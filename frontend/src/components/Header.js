import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { logout } from '../features/auth/authSlice';

const Header = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <header>
      <Navbar expand="lg" collapseOnSelect className="py-2 shadow-sm">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img 
                src="/tenaga-logo.png" 
                alt="Tenaga" 
                height="40" 
                className="d-inline-block align-top"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg width="160" height="40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg%3E%3Crect x="0" y="0" width="40" height="40" rx="0" fill="%23c02c2c"/%3E%3Ctext x="48" y="25" font-family="Arial" font-size="18" font-weight="bold" fill="%23183e34"%3ETENAGA%3C/text%3E%3C/g%3E%3C/svg%3E';
                }}
              />
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {userInfo ? (
                <>
                  <LinkContainer to="/dashboard">
                    <Nav.Link className="fw-medium">Dashboard</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/customers">
                    <Nav.Link className="fw-medium">Customers</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/leads">
                    <Nav.Link className="fw-medium">Leads</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/proposals">
                    <Nav.Link className="fw-medium">Proposals</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/projects">
                    <Nav.Link className="fw-medium">Projects</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/service-requests">
                    <Nav.Link className="fw-medium">Service</Nav.Link>
                  </LinkContainer>

                  {(userInfo.role === 'admin' || userInfo.role === 'manager') && (
                    <LinkContainer to="/users">
                      <Nav.Link>Users</Nav.Link>
                    </LinkContainer>
                  )}
                  <NavDropdown title={<span><i className="fas fa-user-circle me-1"></i> {userInfo.name}</span>} id="username">
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>Profile</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logoutHandler}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link className="btn btn-primary ms-2 text-white">
                    Login
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;