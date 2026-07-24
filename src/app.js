const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const { NotFoundError } = require('./utils/errors');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (adds requestId and logs request/response)
app.use(requestLogger);

// Swagger Documentation
const swaggerDocument = yaml.load(path.join(__dirname, '../swagger.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customSiteTitle: 'Page Pulse API Docs' }));

// Routes
app.use('/', routes);

// 404 Handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
