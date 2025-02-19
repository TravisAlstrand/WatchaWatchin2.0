import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { supabase } from "../app.js";

const userRouter = express.Router();

let token;

// Create new User
userRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    // Basic validation
    if (!email || !password || !username) {
      return res.status(400).json({
        error: "Email, password, and username are required",
      });
    }

    try {
      // First, create the auth user
      const {
        data: { user, session },
        error: authError,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error("Sign-up error:", authError);
        return res.status(400).json({ error: authError.message });
      }

      console.log("Session:", session);

      // Then, insert the additional user data into your Users table
      const { data: profile, error: profileError } = await supabase
        .from("Users")
        .insert([
          {
            username,
            email,
          },
        ])
        .select()
        .single();

      if (profileError) {
        console.error("Profile insert error:", profileError);
        return res.status(400).json({ error: profileError.message });
      }

      return res.status(201).json({
        message: "Signup successful",
        user: {
          id: user.id,
          email: user.email,
          username: profile.username,
        },
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }
  })
);

userRouter.post(
  "/make-admin",
  asyncHandler(async (req, res) => {
    const { email, password, role } = req.body; // Include role in the request body

    // Basic validation
    if (!email || !password || !role) {
      return res.status(400).json({
        error: "Email, password and role are required",
      });
    }

    try {
      // Sign in the existing user
      const {
        data: { user, session },
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Sign-in error:", authError);
        return res.status(400).json({ error: authError.message });
      }

      // Log the session to check if it's valid
      console.log("Session:", session);

      // Update the user's metadata to include the role
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          role: role, // Assign the role here
        },
      });

      if (updateError) {
        console.error("Update user error:", updateError);
        return res.status(400).json({ error: updateError.message });
      }

      return res.status(200).json({
        message: "User role updated successfully",
        user: {
          id: user.id,
          email: user.email,
          role: role, // Include the role in the response
        },
      });
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }
  })
);

// Login in existing user
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const {
    data: { user, session },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  token = session.access_token;

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  return res.json({ user });
});

// Get all users route (protected)
userRouter.get(
  "/all",
  isAdmin,
  asyncHandler(async (req, res) => {
    const { data: users, error } = await supabase.from("Users").select("*");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(users);
  })
);

export default userRouter;
