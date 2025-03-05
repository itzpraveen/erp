import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const UsersPage = () => {
  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Users</h1>
        </Col>
        <Col className="text-end">
          <Link to="/users/create">
            <Button className="my-3">
              <i className="fas fa-plus"></i> Create User
            </Button>
          </Link>
        </Col>
      </Row>
      <p>User management module would be implemented here.</p>
    </>
  );
};

export default UsersPage;