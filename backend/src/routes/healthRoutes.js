const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');
const { version } = require('../../package.json');

// GET /api/health - Enhanced health check for production monitoring
router.get('/', async (req, res) => {
  const dbStatus = mongoose.connection ? mongoose.connection.readyState : 0;
  
  // Check DB connection with timeout
  let dbPingSuccess = false;
  try {
    if (dbStatus === 1) {
      // Simple DB operation to verify connection is working
      const pingResult = await mongoose.connection.db.admin().ping();
      dbPingSuccess = pingResult && pingResult.ok === 1;
    }
  } catch (err) {
    dbPingSuccess = false;
  }

  // System information
  const systemInfo = {
    uptime: process.uptime(),
    systemUptime: os.uptime(),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    loadAverage: os.loadavg(),
    freeMemory: os.freemem(),
    totalMemory: os.totalmem()
  };

  res.json({
    status: dbStatus === 1 && dbPingSuccess ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version,
    environment: process.env.NODE_ENV,
    database: {
      connected: dbStatus === 1,
      pingSuccess: dbPingSuccess,
      status: dbStatus
    },
    system: systemInfo
  });
});

// GET /api/health/db - Detailed database health information
router.get('/db', async (req, res) => {
  const dbStatus = mongoose.connection ? mongoose.connection.readyState : 0;
  
  if (dbStatus !== 1) {
    return res.status(503).json({
      status: 'error',
      message: 'Database connection unavailable',
      code: 'DB_UNAVAILABLE',
      connectionState: dbStatus
    });
  }
  
  try {
    // Get basic DB stats
    const stats = await mongoose.connection.db.stats();
    // Check MongoDB server status
    const serverStatus = await mongoose.connection.db.admin().serverStatus();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      connectionState: dbStatus,
      dbName: stats.db,
      collections: stats.collections,
      documents: stats.objects,
      storageSize: stats.storageSize,
      connections: serverStatus.connections,
      networkStats: serverStatus.network,
      memory: serverStatus.mem,
      uptime: serverStatus.uptime
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve database statistics',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
});

module.exports = router;