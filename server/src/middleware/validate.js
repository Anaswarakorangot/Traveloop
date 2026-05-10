export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.errors?.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }
};
