const express = require("express");
const router = express.Router();
const mysql = require("../database/db");
const auth = require("../middleware/auth");

// 1️ pagination
router.get("/page/session", auth, async (req, res) => {
  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 5);
  const offset = (page - 1) * limit;

  const [rows] = await mysql.query(
    `
    SELECT * FROM session
    ORDER BY startTime DESC
    LIMIT ? OFFSET ?
  `,
    [limit, offset]
  );

  res.json({
    page,
    limit,
    data: rows,
  });
});

// 2️ filter by username
router.get("/session/user/:name", auth, async (req, res) => {
  const { name } = req.params;

  const [rows] = await mysql.query(
    `
    SELECT * FROM session
    WHERE userName = ?
  `,
    [name]
  );

  res.json(rows);
});

// 3 filter by date

router.get("/session/date", auth, async (req, res) => {
  let { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ message: "Start and End required" });
  }

  start = start + " 00:00:00";
  end = end + " 23:59:59";

  const [rows] = await mysql.query(
    `SELECT * FROM session 
     WHERE startTime BETWEEN ? AND ?`,
    [start, end]
  );

  res.json(rows);
});

// 4️ sort by fastest session avg duration
// router.get("/session/fastest", auth, async (req, res) => {
//   // join all laps and count laps , calculate avg lap duration , sort sessions by fastest avarage lap time
//   try {
//     const [rows] = await mysql.query(`
//       SELECT s.id, s.userName, s.startTime, s.endTime, s.duration,
//              COUNT(l.lapId) AS totalLaps,
//              AVG(l.duration) AS avgLap
//       FROM session s
//       LEFT JOIN lap l ON s.id = l.sessionId
//       GROUP BY s.id, s.userName, s.startTime, s.endTime, s.duration
//       ORDER BY avgLap ASC
//     `);

//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

router.get("/session/fastest", auth, async (req, res) => {
  try {
    const [rows] = await mysql.query(`
      SELECT 
        s.id,
        s.userName,
        s.startTime,
        s.endTime,
        s.duration,
        COUNT(l.lapId) AS totalLaps,
        IFNULL(AVG(CAST(l.duration AS UNSIGNED)), 0) AS avgLap
      FROM session s
      LEFT JOIN lap l ON s.id = l.sessionId
      GROUP BY s.id
      ORDER BY avgLap ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("FASTEST SESSION ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
