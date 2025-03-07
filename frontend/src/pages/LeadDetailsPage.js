import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Button, ListGroup, Form, Alert } from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getLeadById, resetLead, createLead, updateLead } from '../features/leads/leadSlice';

const LeadDetailsPage = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    source: 'website',
    propertyType: 'residential',
    status: 'new',
    notes: '',
    energyBill: {
      averageMonthly: '',
      annualUsage: '',
    },
    roofDetails: {
      material: '',
      age: '',
      condition: '',
    },
  });

  const { userInfo } = useSelector((state) => state.auth);
  const { lead, isLoading, isError, message } = useSelector(
    (state) => state.leads
  );

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else if ((!isCreateMode || isEditMode) && id) {
      dispatch(getLeadById(id));
    }

    return () => {
      dispatch(resetLead());
    };
  }, [dispatch, navigate, userInfo, id, isCreateMode, isEditMode]);

  // Update form data when lead is loaded
  useEffect(() => {
    if (lead && (isEditMode || (!isCreateMode && !isEditMode))) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        address: {
          street: lead.address?.street || '',
          city: lead.address?.city || '',
          state: lead.address?.state || '',
          zipCode: lead.address?.zipCode || '',
          country: lead.address?.country || '',
        },
        source: lead.source || 'website',
        propertyType: lead.propertyType || 'residential',
        status: lead.status || 'new',
        notes: lead.notes || '',
        energyBill: {
          averageMonthly: lead.energyBill?.averageMonthly || '',
          annualUsage: lead.energyBill?.annualUsage || '',
        },
        roofDetails: {
          material: lead.roofDetails?.material || '',
          age: lead.roofDetails?.age || '',
          condition: lead.roofDetails?.condition || '',
        },
      });
    }
  }, [lead, isCreateMode, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset status messages when form is changed
    setSubmitError('');
    setSubmitSuccess(false);
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);
    
    if (isCreateMode) {
      dispatch(createLead(formData))
        .unwrap()
        .then((result) => {
          setSubmitSuccess(true);
          // Redirect after a short delay to show success message
          setTimeout(() => {
            navigate(`/leads/${result._id}`, { state: { freshCreated: true } });
          }, 1000);
        })
        .catch(err => {
          console.error('Failed to create lead:', err);
          setSubmitError(err || 'Failed to create lead. Please try again.');
        });
    } else if (isEditMode) {
      dispatch(updateLead({ id, leadData: formData }))
        .unwrap()
        .then(() => {
          setSubmitSuccess(true);
          // Redirect after a short delay to show success message
          setTimeout(() => {
            navigate(`/leads/${id}`);
          }, 1000);
        })
        .catch(err => {
          console.error('Failed to update lead:', err);
          setSubmitError(err || 'Failed to update lead. Please try again.');
        });
    }
  };

  // Create or Edit mode - render form
  if (isCreateMode || isEditMode) {
    return (
      <>
        <Link to="/leads" state={{ refresh: true }} className="btn btn-light my-3">
          Go Back
        </Link>
        <h1>{isCreateMode ? 'Create New Lead' : 'Edit Lead'}</h1>
        {isLoading && <Loader />}
        {isError && <Message variant="danger">{message}</Message>}
        {submitError && <Alert variant="danger">{submitError}</Alert>}
        {submitSuccess && (
          <Alert variant="success">
            {isCreateMode ? 'Lead created successfully!' : 'Lead updated successfully!'}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>Contact Information</Card.Header>
                <Card.Body>
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="email" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="phone" className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter phone number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="address.street" className="mb-3">
                    <Form.Label>Street Address</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter street address"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="address.city" className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter city"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="address.state" className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter state"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="address.zipCode" className="mb-3">
                        <Form.Label>Zip Code</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter zip code"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="address.country" className="mb-3">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter country"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>Lead Information</Card.Header>
                <Card.Body>
                  <Form.Group controlId="source" className="mb-3">
                    <Form.Label>Source</Form.Label>
                    <Form.Select
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                    >
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="social_media">Social Media</option>
                      <option value="call">Phone Call</option>
                      <option value="email">Email</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group controlId="propertyType" className="mb-3">
                    <Form.Label>Property Type</Form.Label>
                    <Form.Select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industrial</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group controlId="status" className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal</option>
                      <option value="closed_won">Closed Won</option>
                      <option value="closed_lost">Closed Lost</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group controlId="notes" className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              <Button variant="primary" type="submit" className="w-100 mb-3">
                {isCreateMode ? 'Create Lead' : 'Save Changes'}
              </Button>
            </Col>
          </Row>
        </Form>
      </>
    );
  }

  // View mode - display lead details
  return (
    <>
      <Link to="/leads" state={{ refresh: true }} className="btn btn-light my-3">
        Go Back
      </Link>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : lead ? (
        <>
          <Row>
            <Col md={6}>
              <h1>{lead.name}</h1>
              <Card className="mb-4">
                <Card.Header>Contact Information</Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${lead.email}`}>{lead.email}</a>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Phone:</strong>{' '}
                    <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                  </ListGroup.Item>
                  {lead.address && (
                    <ListGroup.Item>
                      <strong>Address:</strong>
                      <div>
                        {lead.address.street && <div>{lead.address.street}</div>}
                        {lead.address.city && lead.address.state && (
                          <div>
                            {lead.address.city}, {lead.address.state}{' '}
                            {lead.address.zipCode}
                          </div>
                        )}
                        {lead.address.country && <div>{lead.address.country}</div>}
                      </div>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>Lead Information</Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col md={4}>
                        <strong>Status:</strong>
                      </Col>
                      <Col md={8}>
                        <span
                          className={`badge ${
                            lead.status === 'closed_won'
                              ? 'bg-success'
                              : lead.status === 'closed_lost'
                              ? 'bg-danger'
                              : lead.status === 'proposal'
                              ? 'bg-info'
                              : lead.status === 'qualified'
                              ? 'bg-primary'
                              : 'bg-secondary'
                          }`}
                        >
                          {lead.status.replace('_', ' ')}
                        </span>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col md={4}>
                        <strong>Source:</strong>
                      </Col>
                      <Col md={8}>{lead.source}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col md={4}>
                        <strong>Property Type:</strong>
                      </Col>
                      <Col md={8}>{lead.propertyType}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col md={4}>
                        <strong>Created:</strong>
                      </Col>
                      <Col md={8}>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col md={4}>
                        <strong>Assigned To:</strong>
                      </Col>
                      <Col md={8}>
                        {lead.assignedTo ? lead.assignedTo.name : 'Unassigned'}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
              <Row className="mb-2">
                <Col>
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={() => navigate(`/leads/${lead._id}/edit`)}
                  >
                    Edit Lead
                  </Button>
                </Col>
                <Col>
                  <Button
                    variant="success"
                    className="w-100"
                    onClick={() =>
                      navigate(`/proposals/create`, {
                        state: { leadId: lead._id },
                      })
                    }
                  >
                    Create Proposal
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>

          {lead.notes && (
            <Row className="my-3">
              <Col>
                <Card>
                  <Card.Header>Notes</Card.Header>
                  <Card.Body>
                    <Card.Text style={{ whiteSpace: 'pre-line' }}>
                      {lead.notes}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </>
      ) : (
        <Message variant="danger">Lead not found</Message>
      )}
    </>
  );
};

export default LeadDetailsPage;