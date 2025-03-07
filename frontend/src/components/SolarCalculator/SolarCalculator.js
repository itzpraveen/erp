import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Col, Row, Spinner, Alert, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import services from '../../services/apiService';

const SolarCalculator = () => {
  // Get auth state from Redux
  const { userInfo } = useSelector((state) => state.auth);
  
  // States for form inputs
  const [monthlyUsage, setMonthlyUsage] = useState(1000);
  const [offsetPercentage, setOffsetPercentage] = useState(100);
  const [sunHoursPerDay, setSunHoursPerDay] = useState(5);
  const [electricityRate, setElectricityRate] = useState(0.15);
  const [installationCostPerWatt, setInstallationCostPerWatt] = useState(2.5);
  
  // States for calculation results
  const [systemSize, setSystemSize] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [production, setProduction] = useState(null);
  const [emissions, setEmissions] = useState(null);
  
  // State for equipment options
  const [panels, setPanels] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  
  // Load equipment options on component mount
  useEffect(() => {
    const loadEquipment = async () => {
      try {
        setLoading(true);
        const { data, error } = await services.solarDesign.getAvailableEquipment('panels');
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data && data.equipment) {
          setPanels(data.equipment);
          if (data.equipment.length > 0) {
            setSelectedPanel(data.equipment[0].id);
          }
        }
      } catch (err) {
        setError('Failed to load equipment options: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadEquipment();
  }, []);
  
  // Calculate system size
  const calculateSystemSize = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await services.solarDesign.calculateSystemSize({
        monthlyUsage,
        offsetPercentage,
        sunHoursPerDay,
        systemLosses: 14 // Default value
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setSystemSize(data);
      setActiveStep(2);
      
      // Auto-calculate financials
      if (data && data.systemSizeKW) {
        calculateFinancials(data.systemSizeKW, data.annualProduction);
      }
      
    } catch (err) {
      setError('System size calculation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate financials
  const calculateFinancials = async (systemSizeKW, annualProduction) => {
    try {
      setLoading(true);
      
      // Calculate installation cost based on system size and cost per watt
      const installationCost = systemSizeKW * 1000 * installationCostPerWatt;
      
      const { data, error } = await services.solarDesign.calculateROI({
        systemSizeKW,
        installationCost,
        electricityRate,
        annualProduction,
        annualDegradation: 0.5, // Default panel degradation
        electricityInflation: 3, // Default electricity price inflation
        incentives: 0, // No incentives by default
        financingYears: 0 // Cash purchase by default
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setFinancials(data);
      
      // Also calculate production and emissions
      calculateProduction(systemSizeKW);
      calculateEmissions(annualProduction);
      
    } catch (err) {
      setError('Financial calculation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate monthly production
  const calculateProduction = async (systemSizeKW) => {
    try {
      setLoading(true);
      
      const { data, error } = await services.solarDesign.estimateProduction({
        systemSizeKW,
        location: {
          climateZone: 'temperate' // Default climate zone
        },
        tilt: 30, // Default tilt angle
        azimuth: 180, // South-facing
        systemLosses: 14 // Default value
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setProduction(data);
      
    } catch (err) {
      setError('Production calculation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate emissions reduction
  const calculateEmissions = async (annualProduction) => {
    try {
      setLoading(true);
      
      const { data, error } = await services.solarDesign.calculateROI({
        annualProduction,
        region: 'US' // Default region
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setEmissions(data);
      
    } catch (err) {
      setError('Emissions calculation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset calculator
  const resetCalculator = () => {
    setSystemSize(null);
    setFinancials(null);
    setProduction(null);
    setEmissions(null);
    setActiveStep(1);
  };
  
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0">Solar System Calculator</h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {activeStep === 1 && (
          <>
            <h5 className="mb-3">Step 1: Enter Your Energy Information</h5>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Monthly Electricity Usage (kWh)</Form.Label>
                    <Form.Control 
                      type="number" 
                      value={monthlyUsage}
                      onChange={(e) => setMonthlyUsage(Number(e.target.value))}
                      min="1"
                    />
                    <Form.Text className="text-muted">
                      Enter your average monthly electricity consumption
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Electricity Rate ($/kWh)</Form.Label>
                    <Form.Control 
                      type="number" 
                      step="0.01"
                      value={electricityRate}
                      onChange={(e) => setElectricityRate(Number(e.target.value))}
                      min="0.01"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Offset Percentage (%)</Form.Label>
                    <Form.Control 
                      type="number" 
                      value={offsetPercentage}
                      onChange={(e) => setOffsetPercentage(Number(e.target.value))}
                      min="1"
                      max="200"
                    />
                    <Form.Text className="text-muted">
                      Percentage of your electricity usage to offset with solar
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sun Hours Per Day</Form.Label>
                    <Form.Control 
                      type="number" 
                      step="0.1"
                      value={sunHoursPerDay}
                      onChange={(e) => setSunHoursPerDay(Number(e.target.value))}
                      min="0.5"
                      max="12"
                    />
                    <Form.Text className="text-muted">
                      Average peak sun hours per day in your location
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Installation Cost ($/watt)</Form.Label>
                    <Form.Control 
                      type="number" 
                      step="0.1"
                      value={installationCostPerWatt}
                      onChange={(e) => setInstallationCostPerWatt(Number(e.target.value))}
                      min="0.5"
                    />
                    <Form.Text className="text-muted">
                      Typical costs range from $2.00 to $3.50 per watt
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Solar Panel Type</Form.Label>
                    <Form.Select 
                      value={selectedPanel}
                      onChange={(e) => setSelectedPanel(e.target.value)}
                      disabled={loading || panels.length === 0}
                    >
                      {panels.map((panel) => (
                        <option key={panel.id} value={panel.id}>
                          {panel.manufacturer} {panel.model} ({panel.wattage}W)
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-grid gap-2 mt-4">
                <Button 
                  variant="primary" 
                  onClick={calculateSystemSize}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Calculating...
                    </>
                  ) : (
                    'Calculate Solar System'
                  )}
                </Button>
              </div>
            </Form>
          </>
        )}
        
        {activeStep === 2 && systemSize && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">Solar System Results</h5>
              <Button variant="outline-secondary" size="sm" onClick={resetCalculator}>
                Start New Calculation
              </Button>
            </div>
            
            <Row>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header className="bg-success text-white">
                    <h5 className="mb-0">System Size</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered>
                      <tbody>
                        <tr>
                          <td>System Size</td>
                          <td><strong>{systemSize.systemSizeKW} kW</strong></td>
                        </tr>
                        <tr>
                          <td>Number of Panels</td>
                          <td><strong>{systemSize.numberOfPanels}</strong></td>
                        </tr>
                        <tr>
                          <td>Roof Space Required</td>
                          <td><strong>{systemSize.roofSpaceRequired} m²</strong></td>
                        </tr>
                        <tr>
                          <td>Annual Production</td>
                          <td><strong>{systemSize.annualProduction.toLocaleString()} kWh</strong></td>
                        </tr>
                        <tr>
                          <td>Daily Production</td>
                          <td><strong>{systemSize.dailyProduction} kWh</strong></td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              
              {financials && (
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header className="bg-primary text-white">
                      <h5 className="mb-0">Financial Analysis</h5>
                    </Card.Header>
                    <Card.Body>
                      <Table striped bordered>
                        <tbody>
                          <tr>
                            <td>Total Installation Cost</td>
                            <td><strong>${financials.netCost.toLocaleString()}</strong></td>
                          </tr>
                          <tr>
                            <td>Cost per Watt</td>
                            <td><strong>${financials.costPerWatt}/watt</strong></td>
                          </tr>
                          <tr>
                            <td>First Year Savings</td>
                            <td><strong>${financials.firstYearSavings.toLocaleString()}/year</strong></td>
                          </tr>
                          <tr>
                            <td>Payback Period</td>
                            <td><strong>{financials.paybackPeriod} years</strong></td>
                          </tr>
                          <tr>
                            <td>25-Year Savings</td>
                            <td><strong>${financials.totalSavings.toLocaleString()}</strong></td>
                          </tr>
                          <tr>
                            <td>Return on Investment</td>
                            <td><strong>{financials.roi}%</strong></td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
            
            {production && (
              <Row>
                <Col md={12}>
                  <Card className="mb-4">
                    <Card.Header className="bg-info text-white">
                      <h5 className="mb-0">Monthly Production Estimate</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex flex-wrap">
                        {production.monthlyProduction.map((month) => (
                          <div key={month.month} className="text-center p-2" style={{ width: '16.66%' }}>
                            <Card className="h-100">
                              <Card.Body className="p-2">
                                <h6>{month.month}</h6>
                                <p className="mb-0 fw-bold">{month.productionKWh} kWh</p>
                              </Card.Body>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
            
            {emissions && (
              <Row>
                <Col md={12}>
                  <Card className="mb-4">
                    <Card.Header className="bg-success text-white">
                      <h5 className="mb-0">Environmental Impact</h5>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <p className="mb-2">Annual CO2 Reduction:</p>
                          <h4>{emissions.annualCO2Reduction.toLocaleString()} kg CO2</h4>
                        </Col>
                        <Col md={6}>
                          <p className="mb-2">25-Year CO2 Reduction:</p>
                          <h4>{emissions.twentyFiveYearCO2Reduction.toLocaleString()} kg CO2</h4>
                        </Col>
                      </Row>
                      <hr />
                      <p className="mb-2">Environmental Equivalents:</p>
                      <Row>
                        <Col md={4}>
                          <Card className="text-center p-2 bg-light">
                            <p className="mb-1">Equivalent to planting</p>
                            <h5>{emissions.equivalents.treesPlanted.toLocaleString()} trees</h5>
                          </Card>
                        </Col>
                        <Col md={4}>
                          <Card className="text-center p-2 bg-light">
                            <p className="mb-1">Equivalent to removing</p>
                            <h5>{(emissions.equivalents.carMilesDriven / 12000).toFixed(1)} cars</h5>
                          </Card>
                        </Col>
                        <Col md={4}>
                          <Card className="text-center p-2 bg-light">
                            <p className="mb-1">Equivalent to saving</p>
                            <h5>{emissions.equivalents.gasConsumedGallons.toLocaleString()} gallons of gas</h5>
                          </Card>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
            
            <div className="d-grid gap-2 mt-4">
              <Button 
                variant="success" 
                onClick={() => alert('Feature in development: This will create a proposal based on these calculations.')}
              >
                Create Proposal Based on These Calculations
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default SolarCalculator;