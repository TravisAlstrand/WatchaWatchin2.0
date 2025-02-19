// Middleware to check if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    // Get the JWT token from the Authorization header
    const token = req.headers.authorization?.replace("Bearer ", "");
    console.log(token);

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify the token and get user data
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Check if user has admin role
    if (user.user_metadata?.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Access denied. Admin role required." });
    }

    // If admin, proceed to the route handler
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
