// api/health.js - Endpoint de health check y estado
module.exports = function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    status: 'ok',
    service: 'psicologa-karen-cardiel',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
};
