const checkCartOwnership = (req, res, next) => {
    const cartIdInSession = req.session.user.associatedCart._id;
    const cartIdInParams = req.params.cid;
  
    if (cartIdInSession !== cartIdInParams) {
      return res.status(401).json({ error: "Unauthorized access to the cart." });
    }
    next();
  };
  
  module.exports = checkCartOwnership;
  