const request = require('supertest');
const app = require('../../src/app');
const { redisClient } = require('../../src/cache/redis');
const axios = require('axios');

// Mock Axios
jest.mock('axios');

describe('Page Pulse API', () => {
  
  afterAll(async () => {
    // Close Redis connection after tests
    await redisClient.quit();
  });

  describe('GET /health', () => {
    it('should return 200 and status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body).toHaveProperty('redis');
    });
  });

  describe('GET /', () => {
    it('should return the HTML landing page', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
      expect(res.text).toContain('Page Pulse API');
      expect(res.text).toContain('Built for <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer">Digital Heroes</a>');
    });
  });

  describe('POST /api/audit', () => {
    it('should return 400 if URL is missing', async () => {
      const res = await request(app)
        .post('/api/audit')
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });

    it('should return 400 if URL is invalid', async () => {
      const res = await request(app)
        .post('/api/audit')
        .send({ url: 'not-a-url' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });

    it('should return 200 and audit data for a valid URL', async () => {
      // Setup Axios mock
      axios.get.mockResolvedValueOnce({
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'content-length': '100',
        },
        data: '<html><head><title>Mock Title</title><meta name="description" content="Mock Desc"></head><body></body></html>',
        request: {
          res: {
            responseUrl: 'https://example.com/'
          }
        }
      });

      const res = await request(app)
        .post('/api/audit')
        .send({ url: 'https://example.com' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.statusCode).toBe(200);
      expect(res.body.pageTitle).toBe('Mock Title');
      expect(res.body.metaDescription).toBe('Mock Desc');
      expect(res.body.contentLength).toBe(100);
      expect(res.body).toHaveProperty('responseTimeMs');
      expect(res.body).toHaveProperty('cached');
    });
  });
});
