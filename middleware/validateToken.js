const secretKey = process.env.SECRETTOKEN;

module.exports = (req, res, next) => {
  const token = req.headers['x-token'] || req.query.token;
  if (token && token === secretKey) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Token tidak valid.' });
};
