const express = require("express");
const router = express.Router();
const mysql = require("../database/db");
const auth = require("../middleware/auth");

//  1) GET all sessions with laps
router.get("/sessions", auth, async (_, res) => {
  try {
    const [rows] = await mysql.query(`
      SELECT s.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            "lapStart", l.lapStart,
            "lapEnd", l.lapEnd,
            "duration", l.duration
          )
        ) AS laps
      FROM session s
      LEFT JOIN lap l ON s.id = l.sessionId
      GROUP BY s.id
    `);

    return res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// get the loged-in-user sessions
router.get("/user/sessions", auth, async (req, res) => {
  try {
    const userName = req.user.userName;

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // fetch sessions
    const [sessions] = await mysql.query(
      `SELECT 
          id,
          startTime,
          endTime,
          duration
       FROM session
       WHERE userName = ?
       ORDER BY startTime DESC
       LIMIT ? OFFSET ?`,
      [userName, limit, offset]
    );

    // total count (for pagination UI)
    const [[{ total }]] = await mysql.query(
      `SELECT COUNT(*) as total
       FROM session
       WHERE userName = ?`,
      [userName]
    );

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      sessions,
    });
  } catch (error) {
    console.error("GET SESSIONS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

//  2) GET single session by id , only session details like(sessionId,userName,sessionStart,sessionEnd,duration)
router.get("/session/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await mysql.query(
      `
      SELECT *
      FROM session
      WHERE id = ?
    `,
      [id]
    );

    return res.json(rows[0] || {});
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//  3) GET laps of a session , total laps
router.get("/session/:id/laps", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await mysql.query(
      `
      SELECT lapStart, lapEnd, duration
      FROM lap
      WHERE sessionId = ?
    `,
      [id]
    );

    return res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// laps of a loged in user with pagenation
router.get("/laps/user", auth, async (req, res) => {
  try {
    const userName = req.user.userName;
    const page = parseInt(req.query.page, 10) || 1; // 10 -> decimal number system using to convert string to number
    const limit = parseInt(req.query.limit, 10) || 6;
    const offset = (page - 1) * limit;

    // total laps count
    const [[{ total }]] = await mysql.query(
      `SELECT COUNT(*) AS total
       FROM lap l
       JOIN session s ON l.sessionId = s.id
       WHERE s.userName = ?`,
      [userName]
    );

    // paginated laps
    const [laps] = await mysql.query(
      `SELECT l.*
       FROM lap l
       JOIN session s ON l.sessionId = s.id
       WHERE s.userName = ?
       ORDER BY l.lapStart DESC
       LIMIT ?, ?`,
      [userName, offset, limit]
    );

    res.json({
      laps,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching laps" });
  }
});

//  4) GET summary (session count, total laps, avg duration)

router.get("/user/stats", auth, async (req, res) => {
  try {
    const userName = req.user.userName;

    const [stats] = await mysql.query(
      `
      SELECT
        (SELECT COUNT(*) 
         FROM \`session\`
         WHERE userName = ?) AS totalSessions,

        (SELECT COUNT(*) 
         FROM lap l
         JOIN \`session\` s ON s.id = l.sessionId
         WHERE s.userName = ?) AS totalLaps,

         (
          SELECT IFNULL(
            AVG(
              TIME_TO_SEC(l.duration)
            ), 0
          )
          FROM lap l
          JOIN \`session\` s ON s.id = l.sessionId
          WHERE s.userName = ?
            AND l.duration IS NOT NULL
            AND l.duration != ''
        ) AS avgLapDuration

        
      `,
      [userName, userName, userName]
    );

    res.json(stats[0]);
  } catch (error) {
    console.error("STATS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
