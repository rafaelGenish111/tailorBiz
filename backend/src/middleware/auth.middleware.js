// Temporary auth middleware - replace with actual JWT implementation
const protect = async (req, res, next) => {
  // For now, just pass through - implement actual JWT auth later
  req.user = { id: 'temp-user-id' }; // Temporary user ID
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // For now, just pass through - implement role check later
    next();
  };
};

module.exports = { protect, authorize };




