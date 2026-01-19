const express = require("express"); // importing the express module from the node modules and returns the function
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid"); // loading v4 function from uuid module , that genarates a random unique Id
const mysql = require("../database/db");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/admin-only");



// REGISTER
/**
 * POST /api/auth/register
 * Register a new user
 *
 * Body: {
 *   "userName": "john_doe",
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 */

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    //  Check empty fields
    if (!userName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Trim check
    if (
      userName.trim() === "" ||
      email.trim() === "" ||
      password.trim() === ""
    ) {
      return res.status(400).json({ error: "Fields cannot be empty" });
    }

    //  Validate email format
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password strength
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    //  Check if user already exists
    const [existing] = await mysql.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10); // hashes the password , adds salt(random string) added to password before hashing it.
    // it prevents the two users having the same password. (password+random salt) ->different hash every time

    const userId = uuidv4(); // unique id genarates

    await mysql.query(
      "INSERT INTO users (id, userName, email, password) VALUES (?,?,?,?)",
      [userId, userName, email, hash]
    );

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Register failed" });
  }
});

// LOGIN
/**
 * POST /api/auth/login
 * Login user
 *
 * Body: {
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 */

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validate empty inputs
    if (!email || !password || email.trim() === "" || password.trim() === "") {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check basic email format
    if (!email.includes("@")) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const [rows] = await mysql.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]); // array of objects

    //rows --> returns a array with 2 elements
    //rows[0] -> data from the query(rows)
    //rows[1] -> field info(metadata about columns)

    if (!rows[0]) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, rows[0].password);

    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      {
        userId: rows[0].id,
        userName: rows[0].userName,
        email,
        role: rows[0].role,
      },
      process.env.JWT_SECRET
    );

    res.cookie("token", token, {
      httpOnly: true, // cookies cannot be accessed by js(browser) - protecting from XSS attacks
      secure: true, // cookie will be sent on HTTP or HTTPS
      sameSite: "none", // cookies will not be send to the server when coming from different server
      // maxAge: 24 * 60 * 60 * 1000,
    });
    return res.json({
      message: "Login success",
      token,
      user: {
        userId: rows[0].userId,
        userName: rows[0].userName,
        email,
        role: rows[0].role,
      },
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Login failed email and password are mandatory" });
  }
});

// LOGOUT
/**
 * POST /api/auth/logout
 * Logout user (requires authentication)
 */
//LOGOUT
router.post("/logout", auth, async (req, res) => {
  try {
    const userName = req.user.userName;

    //  End any active session
    await mysql.query(
      `UPDATE session
       SET endTime = NOW(),
           duration = TIMEDIFF(NOW(), startTime)
       WHERE userName = ?
         AND endTime IS NULL`,
      [userName]
    );

    //  Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({ error: "Logout failed" });
  }
});

// GET CURRENT USER
/**
 * GET /api/auth/me
 * Get logged-in user details (requires authentication)
 */

// GET LOGGED-IN USER
router.get("/me", auth, async (req, res) => {
  try {
    const { userId } = req.user;

    const [rows] = await mysql.query(
      "SELECT id, userName, email, role FROM users WHERE id = ?",
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: rows[0],
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
