const { z } = require('zod');

const auditRequestSchema = z.object({
  body: z.object({
    url: z.string({
      required_error: 'URL is required',
    })
      .url('Invalid URL format. Must include protocol (e.g., https://)')
      .max(2048, 'URL is too long'),
  }),
});

/**
 * Middleware to validate request against a Zod schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

module.exports = {
  auditRequestSchema,
  validate,
};
