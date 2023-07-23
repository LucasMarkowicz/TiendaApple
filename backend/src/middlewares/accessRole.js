const userErrors = require('../errors/userErrors.js');


const accessRole = (roles) => {
    return (req, res, next) => {
      const { user } = req.session;
      if (!user || !roles.includes(user.role)) {
        res.status(401).json({ error: userErrors.UNAUTHORIZED_ACCESS });
      } else {
        next();
      }
    };
  };
  
  module.exports = accessRole;
  