const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000').split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

const productBase = process.env.PRODUCT_SERVICE_URL || 'http://localhost:8001';
const cartBase = process.env.CART_SERVICE_URL || 'http://localhost:8002';
const userBase = process.env.USER_SERVICE_URL || 'http://localhost:8000';
const apiV1 = express.Router();

function forwardAuthorization(request) {
  const token = request.get('authorization') || (request.cookies.summit_access_token ? `Bearer ${request.cookies.summit_access_token}` : undefined);
  return { Authorization: token };
}

function authenticated(handler) {
  return async (request, response) => {
    try {
      const token = (request.get('authorization') || (request.cookies.summit_access_token ? `Bearer ${request.cookies.summit_access_token}` : '')).replace(/^Bearer\s+/i, '');
      await require('./services/authService').verifyCognitoAccessToken(token);
      await handler(request, response);
    } catch (error) {
      const status = error.response?.status || error.statusCode || 500;
      const detail = error.response?.data?.detail || error.response?.data?.error || error.message || 'The request could not be completed.';
      response.status(status).json({ error: detail });
    }
  };
}

function upstream(handler) {
  return async (request, response) => {
    try {
      await handler(request, response);
    } catch (error) {
      const status = error.response?.status || 503;
      const detail = error.response?.data?.detail || 'A required service is unavailable.';
      response.status(status).json({ error: detail });
    }
  };
}

apiV1.get('/products', upstream(async (req, res) => {
  const { data } = await axios.get(`${productBase}/products`, { params: req.query });
  res.json(data);
}));

apiV1.post('/products', authenticated(async (req, res) => {
  const { data } = await axios.post(`${productBase}/products`, req.body, { headers: forwardAuthorization(req) });
  res.json(data);
}));

apiV1.get('/products/mine', authenticated(async (req, res) => {
  const { data } = await axios.get(`${productBase}/products/supplier/mine`, { headers: forwardAuthorization(req) });
  res.json(data);
}));

apiV1.patch('/products/:productId', authenticated(async (req, res) => {
  const { data } = await axios.patch(`${productBase}/products/${req.params.productId}`, req.body, { headers: forwardAuthorization(req) });
  res.json(data);
}));

apiV1.get('/products/review/pending', authenticated(async (req, res) => {
  const { data } = await axios.get(`${productBase}/products/review/pending`, { headers: forwardAuthorization(req) });
  res.json(data);
}));

apiV1.put('/products/:productId/approve', authenticated(async (req, res) => {
  const { data } = await axios.put(`${productBase}/products/${req.params.productId}/approve`, {}, { headers: forwardAuthorization(req) });
  res.json(data);
}));

apiV1.put('/products/:productId/reject', authenticated(async (req, res) => {
  const { data } = await axios.put(`${productBase}/products/${req.params.productId}/reject`, req.body, { headers: forwardAuthorization(req) });
  res.json(data);
}));

apiV1.get('/users/me', authenticated(async (req, res) => {
  const { data } = await axios.get(`${userBase}/users/me`, { headers: forwardAuthorization(req) });
  res.json(data);
}));

apiV1.patch('/users/me', authenticated(async (req, res) => {
  const { data } = await axios.patch(`${userBase}/users/me`, req.body, { headers: forwardAuthorization(req) });
  res.json(data);
}));

apiV1.get('/users/me/reviews', authenticated(async (req, res) => {
  const { data } = await axios.get(`${userBase}/users/me/reviews`, { headers: forwardAuthorization(req) });
  res.json(data);
}));

apiV1.post('/users/me/reviews', authenticated(async (req, res) => {
  const { data } = await axios.post(`${userBase}/users/me/reviews`, req.body, { headers: forwardAuthorization(req) });
  res.status(201).json(data);
}));

apiV1.get('/cart', authenticated(async (req, res) => {
  const { data } = await axios.get(`${cartBase}/carts/me`, { headers: forwardAuthorization(req) });
  res.json(data);
}));

apiV1.put('/cart/items', authenticated(async (req, res) => {
  const { data } = await axios.put(`${cartBase}/carts/me/items`, req.body, { headers: forwardAuthorization(req) });
  res.json(data);
}));

apiV1.delete('/cart/items/:productId', authenticated(async (req, res) => {
  await axios.delete(`${cartBase}/carts/me/items/${req.params.productId}`, { headers: forwardAuthorization(req) });
  res.status(204).send();
}));

apiV1.get('/products/:productId', upstream(async (req, res) => {
  const { data } = await axios.get(`${productBase}/products/${req.params.productId}`);
  res.json(data);
}));

app.use('/api/v1', apiV1);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`BFF listening on port ${port}`));
