const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const productBase = process.env.PRODUCT_SERVICE_URL || 'http://localhost:8001';
const cartBase = process.env.CART_SERVICE_URL || 'http://localhost:8002';
const approvalBase = process.env.APPROVAL_SERVICE_URL || 'http://localhost:8003';

app.get('/api/products', async (req, res) => {
  const { data } = await axios.get(`${productBase}/products`, { params: req.query });
  res.json(data);
});

app.post('/api/products', async (req, res) => {
  const { data } = await axios.post(`${productBase}/products`, req.body);
  res.json(data);
});

app.get('/api/carts/:customer_id', async (req, res) => {
  const { data } = await axios.get(`${cartBase}/carts/${req.params.customer_id}`);
  res.json(data);
});

app.post('/api/carts', async (req, res) => {
  const { data } = await axios.post(`${cartBase}/carts`, req.body);
  res.json(data);
});

app.get('/api/submissions', async (req, res) => {
  const { data } = await axios.get(`${approvalBase}/submissions`, { params: req.query });
  res.json(data);
});

app.put('/api/submissions/:submission_id/approve', async (req, res) => {
  const { data } = await axios.put(`${approvalBase}/submissions/${req.params.submission_id}/approve`);
  res.json(data);
});

app.put('/api/submissions/:submission_id/reject', async (req, res) => {
  const { data } = await axios.put(`${approvalBase}/submissions/${req.params.submission_id}/reject`, null, { params: { reason: req.body.reason } });
  res.json(data);
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`BFF listening on port ${port}`));
