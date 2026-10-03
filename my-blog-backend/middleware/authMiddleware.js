const jwt = require('jsonwebtoken');
require('dotenv').config();

const authAdmin = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const verified = jwt.verify(actualToken, process.env.JWT_SECRET);

    if (verified.role !== 'admin') {
      return res.status(403).json({ message: "Admin Only" });
    }
    
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = authAdmin;