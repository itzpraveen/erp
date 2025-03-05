import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
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
      <Navbar bg="light" variant="light" expand="lg" collapseOnSelect className="shadow-sm mb-3">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand><span className="fw-bold text-primary">Solar</span><span className="text-secondary">ERP</span></Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {userInfo ? (
                <>
                  <LinkContainer to="/dashboard">
                    <Nav.Link className="mx-1"><i className="fas fa-tachometer-alt me-1"></i> Dashboard</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/customers">
                    <Nav.Link className="mx-1"><i className="fas fa-users me-1"></i> Customers</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/leads">
                    <Nav.Link className="mx-1"><i className="fas fa-user-plus me-1"></i> Leads</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/proposals">
                    <Nav.Link className="mx-1"><i className="fas fa-file-contract me-1"></i> Proposals</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/projects">
                    <Nav.Link className="mx-1"><i className="fas fa-solar-panel me-1"></i> Projects</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/service-requests">
                    <Nav.Link className="mx-1"><i className="fas fa-tools me-1"></i> Service</Nav.Link>
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
                  <Nav.Link className="mx-1">
                    <i className="fas fa-sign-in-alt me-1"></i> Sign In
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