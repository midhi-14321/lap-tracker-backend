const express = require("express"); // useCase: build web servers and api's to handle http request(GET/POST) with routes and middlewares
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const mysql = require("../database/db");
const auth = require("../middleware/auth");

// ------------------ Helper --------------------
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}

// ------------------ START SESSION ---------------------

router.post("/start", auth, async (req, res) => {
  try {
    console.log("USER:", req.user);

    //  validation for token
    if (!req.user || !req.user.userName) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userName = req.user.userName;

    const [existing] = await mysql.query(
      `SELECT id, startTime, endTime
       FROM session
       WHERE userName = ?
       ORDER BY startTime DESC
       LIMIT 1`,
      [userName]
    );

    if (existing[0] && !existing[0].endTime) {
      return res.status(400).json({
        error: "User already has an active session",
        sessionId: existing[0].id,
        startTime: existing[0].startTime,
      });
    }

    const sessionId = uuidv4();
    const startTime = new Date();

    await mysql.query(
      "INSERT INTO session (id, userName, startTime) VALUES (?,?,?)",
      [sessionId, userName, startTime]
    );

    return res.json({ message: "Session started", sessionId, startTime });
  } catch (error) {
    console.error("SESSION START ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------ END SESSION ---------------------

router.post("/end", auth, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    //  get user from token
    const userName = req.user.userName;

    const [rows] = await mysql.query(
      "SELECT startTime, endTime, userName FROM session WHERE id = ?",
      [sessionId]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: "Session not found" });
    }

    //  ownership check
    if (rows[0].userName !== userName) {
      return res.status(403).json({ error: "Not allowed to end this session" });
    }

    if (rows[0].endTime) {
      return res.status(400).json({
        error: "Session already ended",
        endTime: rows[0].endTime,
      });
    }

    const endTime = new Date();
    const duration = formatDuration(endTime - rows[0].startTime);

    await mysql.query(
      "UPDATE session SET endTime = ?, duration = ? WHERE id = ?",
      [endTime, duration, sessionId]
    );

    return res.json({
      message: "Session ended",
      sessionId,
      endTime,
      duration,
    });
  } catch (error) {
    console.error("SESSION END ERROR:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// ------------------ START LAP ---------------------

router.post("/lap/start", auth, async (req, res) => {
  try {
    const { sessionId } = req.body;

    // 1. Validate sessionId
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    // 2. Check if session exists and is not ended
    const [sessions] = await mysql.query(
      "SELECT endTime FROM session WHERE id = ?",
      [sessionId]
    );

    if (!sessions[0]) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (sessions[0].endTime) {
      return res
        .status(400)
        .json({ error: "Cannot start lap: session already ended" });
    }

    // 3. Insert new lap
    const lapId = uuidv4();
    const lapStart = new Date();

    await mysql.query(
      "INSERT INTO lap (lapId, sessionId, lapStart) VALUES (?, ?, ?)",
      [lapId, sessionId, lapStart]
    );

    res.json({ message: "Lap started", lapId, lapStart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ------------------ END LAP ---------------------

router.post("/lap/end", auth, async (req, res) => {
  try {
    const { lapId } = req.body;

    // 1. Validate lapId
    if (!lapId) {
      return res.status(400).json({ error: "lapId is required" });
    }

    // 2. Fetch lap info
    const [laps] = await mysql.query(
      "SELECT lapStart, lapEnd FROM lap WHERE lapId = ?",
      [lapId]
    );

    if (!laps[0]) {
      return res.status(404).json({ error: "Lap not found" });
    }

    const lap = laps[0];

    // 3. Check if lap already ended
    if (lap.lapEnd) {
      return res.status(400).json({
        error: "Lap already ended",
        lapId,
        lapEnd: lap.lapEnd,
        duration: lap.duration,
      });
    }

    // 4. Calculate duration
    const endTime = new Date();
    const duration = endTime - lap.lapStart;

    // 5. Update lap
    await mysql.query("UPDATE lap SET lapEnd=?, duration=? WHERE lapId=?", [
      endTime,
      duration,
      lapId,
    ]);

    res.json({ lapId, endTime, duration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// router.get("/active", auth, async (req, res) => {
//   try {
//     const userName = req.user.userName;

//     const [rows] = await mysql.query(
//       `SELECT id, startTime
//        FROM session
//        WHERE userName = ?
//          AND endTime IS NULL
//        ORDER BY startTime DESC
//        LIMIT 1`,
//       [userName]
//     );

//     if (!rows[0]) {
//       return res.json({ active: false });
//     }

//     return res.json({
//       active: true,
//       session: {
//         sessionId: rows[0].id,
//         startTime: rows[0].startTime,
//       },
//     });
//   } catch (err) {
//     console.error("ACTIVE SESSION ERROR:", err);
//     return res.status(500).json({ error: "Something went wrong" });
//   }
// });

router.get("/active", auth, async (req, res) => {
  console.log("ACTIVE SESSION HIT");
  console.log("COOKIES:", req.cookies);
  console.log("USER:", req.user);
  try {
    const userName = req.user.userName;

    const [rows] = await mysql.query(
      `SELECT id, startTime
       FROM session
       WHERE userName = ?
         AND endTime IS NULL
       ORDER BY startTime DESC
       LIMIT 1`,
      [userName]
    );

    if (!rows[0]) {
      return res.json({ session: null });
    }

    return res.json({
      session: {
        id: rows[0].id,
        startTime: rows[0].startTime,
      },
    });
  } catch (err) {
    console.error("ACTIVE SESSION ERROR:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// ------------------ GET ALL --------------------
// router.get("/", async (_, res) => {
//   const [rows] = await mysql.query(`
//     SELECT s.*, JSON_ARRAYAGG(
//       JSON_OBJECT(
//         "lapStart", l.lapStart,
//         "lapEnd", l.lapEnd,
//         "duration", l.duration
//       )
//     ) AS laps
//     FROM session s
//     LEFT JOIN lap l ON s.id = l.sessionId
//     GROUP BY s.id
//   `);

//   res.json(rows);
// });

module.exports = router;
