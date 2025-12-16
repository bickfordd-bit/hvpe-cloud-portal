/**
 * BTI Cloud API
 * Public REST/GraphQL interface for multi-tenant execution platform
 */

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'bti-api' });
});

// Tenant-scoped API routes
app.post('/api/v1/intents', (req, res) => {
  // TODO: Implement intent ingestion
  const tenantId = req.headers['x-tenant-id'];
  
  if (!tenantId) {
    return res.status(401).json({ error: 'Missing tenant ID' });
  }

  res.json({ 
    message: 'Intent received',
    tenant_id: tenantId,
    // Placeholder response
  });
});

app.listen(PORT, () => {
  console.log(`BTI API listening on port ${PORT}`);
});
