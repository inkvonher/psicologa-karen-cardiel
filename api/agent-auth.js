// api/agent-auth.js - Handlers para endpoints de Auth.md (agent registration, claiming, events)

module.exports = function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    status: 'ok',
    service: 'psicologa-karen-cardiel',
    auth_protocol: 'auth.md',
    message: 'Auth.md registration and assertion endpoint is active.'
  });
};
