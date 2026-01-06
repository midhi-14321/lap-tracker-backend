const express = require("express");
const mysql = require("../database/db");
const auth = require("../middleware/auth");
const router = express.Router();

router.delete("/session/delete/:sessionId", auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userName = req.user.userName;

    if (!sessionId) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const [sessionData] = await mysql.query(
      "SELECT * FROM session WHERE id = ?",
      [sessionId]
    );

    if (sessionData.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }
    // check the ownership
    if (sessionData[0].userName !== userName) {
      return res
        .status(403)
        .json({ error: "Not allowed to delete this session" });
    }

    await mysql.query("DELETE FROM lap WHERE sessionId = ?", [sessionId]); // delete all the laps related to session
    await mysql.query("DELETE FROM session WHERE id = ?", [sessionId]); // delete the session

    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error deleting session" });
  }
});

//delete lap
router.delete("/lap/delete/:lapId", auth, async (req, res) => {
  try {
    const { lapId } = req.params;
    const userName = req.user.userName; // from JWT token

    if (!lapId) {
      return res.status(400).json({ error: "Invalid lap ID" });
    }

    // Check lap and its session's user
    const [lap] = await mysql.query(
      `SELECT l.lapId, s.userName
       FROM lap l
       JOIN session s ON l.sessionId = s.id
       WHERE l.lapId = ?`,
      [lapId]
    );

    if (lap.length === 0) {
      return res.status(404).json({ error: "Lap not found" });
    }

    // User ownership check
    if (lap[0].userName !== userName) {
      return res.status(403).json({ error: "You cannot delete this lap" });
    }

    // Delete lap
    const [result] = await mysql.query("DELETE FROM lap WHERE lapId = ?", [
      lapId,
    ]);

    res.json({ message: "Lap deleted successfully" });
  } catch (err) {
    console.error("DELETE LAP ERROR:", err);
    res.status(500).json({ error: "Server error while deleting lap" });
  }
});



// delete all sessions of logged-in user
router.delete("/session/delete-all", auth, async (req, res) => {
  try {
    const userName = req.user.userName;

    // get all session ids of this user
    const [sessions] = await mysql.query(
      "SELECT id FROM session WHERE userName = ?",
      [userName]
    );

    if (sessions.length === 0) {
      return res.json({ message: "No sessions to delete" });
    }

    const sessionIds = sessions.map((s) => s.id);

    // delete laps first
    await mysql.query("DELETE FROM lap WHERE sessionId IN (?)", [sessionIds]);

    // delete sessions
    await mysql.query("DELETE FROM session WHERE id IN (?)", [sessionIds]);

    res.json({ message: "All sessions deleted successfully" });
  } catch (err) {
    console.error("CLEAR ALL SESSIONS ERROR:", err);
    res.status(500).json({ error: "Server error deleting sessions" });
  }
});



// DELETE all laps of logged-in user
router.delete("/lap/delete-all", auth, async (req, res) => {
  try {
    const userName = req.user.userName; // from JWT

    // Delete laps that belong to user's sessions
    const [result] = await mysql.query(
      `
      DELETE l
      FROM lap l
      JOIN session s ON l.sessionId = s.id
      WHERE s.userName = ?
      `,
      [userName]
    );

    res.json({
      message: "All laps deleted successfully",
      deletedCount: result.affectedRows,
    });
  } catch (err) {
    console.error("DELETE ALL LAPS ERROR:", err);
    res.status(500).json({ error: "Server error while deleting laps" });
  }
});

module.exports = router;
