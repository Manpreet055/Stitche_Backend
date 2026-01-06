exports.verifyAdmin = (req, res, next) => {
  const role = req.user.payload.role;
  if (role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
