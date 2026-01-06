// const express = require("express");
// const router = express.Router();
// const auth = require("../middleware/auth");
// const adminOnly = require("../middleware/admin-only");
// const mysql = require("../database/db");

// // get all users
// router.get("/users", auth, adminOnly, async (req, res) => {
//   try {
//     const [rows] = await mysql.query(`
//       SELECT id, userName, email, role, createdAt
//       FROM users
//       ORDER BY createdAt DESC
//     `);

//     res.json({ users: rows });
//   } catch (err) {
//     console.error("ADMIN USERS ERROR:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ALL SESSIONS

// router.get("/sessions", auth, adminOnly, async (req, res) => {
//   try {
//     const [sessions] = await mysql.query(`
//       SELECT
//         s.id,
//         s.userName,
//         s.startTime,
//         s.endTime,
//         s.duration
//       FROM session s
//       ORDER BY s.startTime DESC
//     `);

//     res.json(sessions);
//   } catch (err) {
//     console.error("ADMIN SESSIONS ERROR:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ALL LAPS

// router.get("/laps", auth, adminOnly, async (req, res) => {
//   try {
//     const [laps] = await mysql.query(`
//       SELECT
//         l.lapId,
//         l.sessionId,
//         l.lapStart,
//         l.lapEnd,
//         l.duration,
//         s.userName
//       FROM lap l
//       JOIN session s ON l.sessionId = s.id
//       ORDER BY l.lapStart DESC
//     `);

//     res.json(laps);
//   } catch (err) {
//     console.error("ADMIN LAPS ERROR:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// //DELETE ANY SESSION

// router.delete("/session/:id", auth, adminOnly, async (req, res) => {
//   const { id } = req.params;

//   // delete laps first (FK safety)
//   await mysql.query("DELETE FROM lap WHERE sessionId = ?", [id]);

//   // delete session
//   await mysql.query("DELETE FROM session WHERE id = ?", [id]);

//   res.json({ message: "Session deleted" });
// });

// //DELETE ANY LAP

// router.delete("/lap/:lapId", auth, adminOnly, async (req, res) => {
//   const { lapId } = req.params;

//   await mysql.query("DELETE FROM lap WHERE lapId = ?", [lapId]);

//   res.json({ message: "Lap deleted" });
// });

// // DELETE ANY USER

// router.delete("/user/:id", auth, adminOnly, async (req, res) => {
//   try {
//     const userId = req.params.id;

//     // 1️ Get username first
//     const [users] = await mysql.query(
//       "SELECT userName FROM users WHERE id = ?",
//       [userId]
//     );

//     if (!users.length) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const userName = users[0].userName;

//     // 2️ Get all sessions of this user
//     const [sessions] = await mysql.query(
//       "SELECT id FROM session WHERE userName = ?",
//       [userName]
//     );

//     // 3️ Delete laps for each session
//     for (const s of sessions) {
//       await mysql.query("DELETE FROM lap WHERE sessionId = ?", [s.id]);
//     }

//     // 4️ Delete sessions
//     await mysql.query("DELETE FROM session WHERE userName = ?", [userName]);

//     // 5️ Delete user
//     await mysql.query("DELETE FROM users WHERE id = ?", [userId]);

//     res.json({ message: "User and all related data deleted" });
//   } catch (err) {
//     console.error("ADMIN DELETE USER ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

// routes/admin.js
const express = require("express");
const router = express.Router();
const mysql = require("../database/db");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/admin-only");

// ==================== ADMIN STATS ====================
router.get("/stats", auth, isAdmin, async (req, res) => {
  try {
    const [stats] = await mysql.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS totalUsers,
        (SELECT COUNT(*) FROM session) AS totalSessions,
        (SELECT COUNT(*) FROM lap) AS totalLaps,
        (SELECT COUNT(*) FROM session WHERE endTime IS NULL) AS activeSessions
    `);
    res.json(stats[0]);
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

// ==================== ALL USERS ====================
router.get("/users", auth, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    let whereClause = "";
    let params = [];

    if (search) {
      whereClause = "WHERE userName LIKE ? OR email LIKE ?";
      params = [`%${search}%`, `%${search}%`];
    }

    const [users] = await mysql.query(
      `SELECT id, userName, email, role, createdAt 
       FROM users ${whereClause}
       ORDER BY createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await mysql.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    res.json({
      users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("ADMIN USERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ==================== DELETE USER ====================
router.delete("/users/:userId", auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting yourself
    if (userId === req.user.userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Get user's sessions
    const [sessions] = await mysql.query(
      "SELECT id FROM session WHERE userName = (SELECT userName FROM users WHERE id = ?)",
      [userId]
    );

    if (sessions.length > 0) {
      const sessionIds = sessions.map((s) => s.id);
      // Delete laps
      await mysql.query("DELETE FROM lap WHERE sessionId IN (?)", [sessionIds]);
      // Delete sessions
      await mysql.query("DELETE FROM session WHERE id IN (?)", [sessionIds]);
    }

    // Delete user
    await mysql.query("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ==================== UPDATE USER ROLE ====================
router.patch("/users/:userId/role", auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    await mysql.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);

    res.json({ message: "Role updated successfully" });
  } catch (err) {
    console.error("UPDATE ROLE ERROR:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
});

// ==================== ALL SESSIONS ====================
router.get("/sessions", auth, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    let whereClause = "";
    let params = [];

    if (search) {
      whereClause = "WHERE s.userName LIKE ?";
      params = [`%${search}%`];
    }

    const [sessions] = await mysql.query(
      `SELECT s.*, 
              (SELECT COUNT(*) FROM lap WHERE sessionId = s.id) as lapCount
       FROM session s
       ${whereClause}
       ORDER BY s.startTime DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await mysql.query(
      `SELECT COUNT(*) as total FROM session s ${whereClause}`,
      params
    );

    res.json({
      sessions,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("ADMIN SESSIONS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// ==================== DELETE SESSION (ADMIN) ====================
router.delete("/sessions/:sessionId", auth, isAdmin, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Delete laps first
    await mysql.query("DELETE FROM lap WHERE sessionId = ?", [sessionId]);
    // Delete session
    await mysql.query("DELETE FROM session WHERE id = ?", [sessionId]);

    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    console.error("ADMIN DELETE SESSION ERROR:", err);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

// ==================== ALL LAPS ====================
router.get("/laps", auth, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    let whereClause = "";
    let params = [];

    if (search) {
      whereClause = "WHERE s.userName LIKE ?";
      params = [`%${search}%`];
    }

    const [laps] = await mysql.query(
      `SELECT l.*, s.userName
       FROM lap l
       JOIN session s ON l.sessionId = s.id
       ${whereClause}
       ORDER BY l.lapStart DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await mysql.query(
      `SELECT COUNT(*) as total 
       FROM lap l 
       JOIN session s ON l.sessionId = s.id 
       ${whereClause}`,
      params
    );

    res.json({
      laps,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("ADMIN LAPS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch laps" });
  }
});

// ==================== DELETE LAP (ADMIN) ====================
router.delete("/laps/:lapId", auth, isAdmin, async (req, res) => {
  try {
    const { lapId } = req.params;
    await mysql.query("DELETE FROM lap WHERE lapId = ?", [lapId]);
    res.json({ message: "Lap deleted successfully" });
  } catch (err) {
    console.error("ADMIN DELETE LAP ERROR:", err);
    res.status(500).json({ error: "Failed to delete lap" });
  }
});

module.exports = router;
