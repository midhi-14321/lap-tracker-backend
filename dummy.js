// ----------------------------------
// API 2: ADD LAP
// ----------------------------------
// router.post("/lap/add", (req, res) => {
//   const { sessionId, lapTime } = req.body;

//   if (!sessionId || !lapTime) {
//     return res.status(400).json({ error: "sessionId and lapTime required" });
//   }

//   const sessions = getSessions();
//   const session = sessions.find((s) => s.sessionId === sessionId);

//   if (!session) {
//     return res.status(404).json({ error: "Session not found" });
//   }

//   const newLap = {
//     lapId: uuidv4(),
//     lapTime,
//     createdAt: new Date(),
//   };

//   session.laps.push(newLap);
//   saveSessions(sessions);

//   res.json({
//     message: "Lap added successfully",
//     session,
//   });
// });

// const express = require("express");
// const router = express.Router(); // creates a mini express app instead of creating all api in app.js file. creates a separate routes
// const { v4: uuidv4 } = require("uuid"); // importing uuid library takes only v4 function , rename v4 it as uuidv4 in code
// const fs = require("fs"); // importing a node built in module fs(file system) that do: read , write ,create,delete,update files
// const path = require("path"); // imports node built in modules path that helps node correct file path

// const sessionsFile = path.join(__dirname, "..", "data", "session.json");
// const db = require("../database/db");

// // Read sessions
// function getSessions() {
//   const data = fs.readFileSync(sessionsFile);
//   return JSON.parse(data);
// }

// // Save sessions
// function saveSessions(sessions) {
//   fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2)); /**
//   JSON.stringify -> converts js object/array to JSON ,
//   sessions -> data we want to convert ,
//   null -> replacer that means converts normally everything ,we don't skip anyfields
//   2 -> space -> This adds indentation to make the JSON pretty.

//   */
// }

// // ----------------------------------
// // API 1: START NEW SESSION
// // ----------------------------------
// router.post("/start", (req, res) => {
//   const { userName } = req.body; // user enters only name

//   if (!userName) {
//     return res.status(400).json({ error: "User name is required" });
//   }

//   // create new session
//   const newSession = {
//     sessionId: uuidv4(),
//     userName,
//     laps: [],
//     startTime: new Date(),
//   };

//   // const sessions = getSessions();
//   // sessions.push(newSession);
//   // saveSessions(sessions);

//   // res.json({
//   //   message: "Session started",
//   //   sessionId: newSession.sessionId,
//   // });
//   const sql = `INSERT INTO sessions (sessionId, userName, startTime)
// VALUES (?, ?, ?)`;

//   db.query(sql, [newSession.sessionId, userName, new Date()], (err, result) => {
//     if (err) return res.status(500).json({ error: "DB error", err });

//     res.json({
//       message: "Session started",
//       sessionId: newSession.sessionId,
//     });
//   });
// });

// // router.post("/lap/add", (req, res) => {
// //   const { sessionId } = req.body;

// //   if (!sessionId) {
// //     return res.status(400).json({ error: "sessionId required" });
// //   }

// //   const sessions = getSessions();
// //   const session = sessions.find((s) => s.sessionId === sessionId);

// //   if (!session) {
// //     return res.status(404).json({ error: "Session not found" });
// //   }

// //   let lapStartTime;

// //   // no laps? first lap starts from session start
// //   if (session.laps.length === 0) {
// //     lapStartTime = session.startTime;
// //   } else {
// //     // next lap starts from previous lap end
// //     lapStartTime = session.laps[session.laps.length - 1].lapEndTime;
// //   }

// //   function formatDuration(ms) {
// //     let totalSeconds = Math.floor(ms / 1000);

// //     const hours = Math.floor(totalSeconds / 3600);
// //     totalSeconds %= 3600;

// //     const minutes = Math.floor(totalSeconds / 60);
// //     const seconds = totalSeconds % 60;

// //     return `${hours}:${minutes}:${seconds}`;
// //   }

// //   const lapEndTime = new Date();
// //   // const duration = lapEndTime - new Date(lapStartTime);
// //   const durationMs = lapEndTime - new Date(lapStartTime);
// //   const duration = formatDuration(durationMs);

// //   const newLap = {
// //     lapId: uuidv4(),
// //     lapStartTime: lapStartTime.toLocaleString("en-IN", {
// //       timeZone: "Asia/Kolkata",
// //     }),
// //     lapEndTime: lapEndTime.toLocaleString("en-IN", {
// //       timeZone: "Asia/Kolkata",
// //     }),
// //     duration,
// //   };

// //   session.laps.push(newLap);
// //   saveSessions(sessions);

// //   res.json({
// //     message: "Lap added successfully",
// //     newLap,
// //   });
// // });
// // module.exports = router;

// router.post("/lap/add", (req, res) => {
//   const { sessionId } = req.body;

//   if (!sessionId) {
//     return res.status(400).json({ error: "sessionId required" });
//   }

//   // const sessions = getSessions();
//   // const session = sessions.find((s) => s.sessionId === sessionId);

//   if (!session) {
//     return res.status(404).json({ error: "Session not found" });
//   }

//   let lapStartTime;

//   // no laps? first lap starts from session start
//   if (session.laps.length === 0) {
//     lapStartTime = new Date(session.startTime);
//   } else {
//     // next lap starts from previous lap end
//     lapStartTime = new Date(
//       session.laps[session.laps.length - 1].lapEndTimeUTC
//     );
//   }

//   function formatDuration(ms) {
//     let totalSeconds = Math.floor(ms / 1000);

//     const hours = Math.floor(totalSeconds / 3600);
//     totalSeconds %= 3600;

//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;

//     return `${hours}:${minutes}:${seconds}`;
//   }

//   const lapEndTime = new Date();
//   const durationMs = lapEndTime - lapStartTime;
//   const duration = formatDuration(durationMs);

//   const newLap = {
//     lapId: uuidv4(),
//     lapStartTimeUTC: lapStartTime, // store original Date
//     lapEndTimeUTC: lapEndTime, // store original Date
//     duration,
//   };

//   session.laps.push(newLap);
//   saveSessions(sessions);

//   // Convert times to IST strings only for response
//   const responseLap = {
//     lapId: newLap.lapId,
//     lapStartTime: newLap.lapStartTimeUTC.toLocaleString("en-IN", {
//       timeZone: "Asia/Kolkata",
//     }),
//     lapEndTime: newLap.lapEndTimeUTC.toLocaleString("en-IN", {
//       timeZone: "Asia/Kolkata",
//     }),
//     duration: newLap.duration,
//   };

//   res.json({
//     message: "Lap added successfully",
//     newLap: responseLap,
//   });
// });

// module.exports = router;

// const express = require("express");
// const router = express.Router();
// const { v4: uuidv4 } = require("uuid");
// const mysql = require("../database/db");

// // ------------------ Helper --------------------
// function formatDuration(ms) {
//   const totalSeconds = Math.floor(ms / 1000);
//   const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
//   const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
//   const secs = String(totalSeconds % 60).padStart(2, "0");
//   return `${hrs}:${mins}:${secs}`;
// }

// // ------------------ START SESSION ---------------------
// router.post("/start", async (req, res) => {
//   const { userName } = req.body;

//   if (!userName) {
//     return res.status(400).json({ error: "userName required" });
//   }

//   const sessionId = uuidv4();
//   const startTime = new Date(); // store proper datetime

//   await mysql.query(
//     "INSERT INTO session (id, userName, startTime) VALUES (?,?,?)",
//     [sessionId, userName, startTime]
//   );

//   return res.json({
//     message: "Session started",
//     sessionId,
//     startTime,
//   });
// });

// // ------------------ END SESSION ---------------------
// router.post("/end", async (req, res) => {
//   const { sessionId } = req.body;
//   const endTime = Date.now();

//   const [rows] = await mysql.query("SELECT startTime FROM session WHERE id=?", [
//     sessionId,
//   ]);

//   const duration = formatDuration(endTime - rows[0].startTime);

//   await mysql.query("UPDATE session SET endTime=?, duration=? WHERE id=?", [
//     endTime,
//     duration,
//     sessionId,
//   ]);

//   return res.json({ sessionId, endTime, duration });
// });

// // ------------------ START LAP ---------------------
// router.post("/lap/start", async (req, res) => {
//   const { sessionId } = req.body;

//   // await mysql.query(
//   //   "INSERT INTO lap (id, sessionId, startTime) VALUES (?,?,?)",
//   //   [uuidv4(), sessionId, Date.now()]
//   // );
//   await mysql.query(
//     "INSERT INTO lap (lapId, sessionId, lapStart) VALUES (?,?,?)",
//     [uuidv4(), sessionId, new Date()]
//   );

//   res.json({ message: "Lap started" });
// });

// // ------------------ END LAP ---------------------
// router.post("/lap/end", async (req, res) => {
//   const { lapId } = req.body;
//   const endTime = new Date();

//   const [lap] = await mysql.query("SELECT startTime FROM lap WHERE id=?", [
//     lapId,
//   ]);

//   const duration = formatDuration(endTime - lap[0].startTime);

//   await mysql.query("UPDATE lap SET endTime=?, duration=? WHERE id=?", [
//     endTime,
//     duration,
//     lapId,
//   ]);

//   return res.json({ lapId, endTime, duration });
// });

// // ------------------ GET ALL --------------------
// router.get("/", async (_, res) => {
//   const [rows] = await mysql.query(`
//     SELECT s.*, JSON_ARRAYAGG(
//       JSON_OBJECT("startTime", l.startTime, "endTime", l.endTime, "duration", l.duration)
//     ) AS lap
//     FROM session s
//     LEFT JOIN laps l ON s.id=l.sessionId
//     GROUP BY s.id
//   `);

//   res.json(rows);
// });

// module.exports = router;

'/api/auth/register':{
  post:{
    tags:['Auth'],
    summary:"Login user",
    description:'Authenticate user and get JWT token',
    requestBody:{
      required:true,
      content:{
        'application/json':{
          schema:{
            type:'object',
            required:['userName','email','password'],
            properties:{
              userName:{
                type:'string',
                example:'John_doe',
              },
              email:{
                type:'string',
                format:'email',
                example:'john@example.com',
              },
              password:{
                type:'string',
                format:'password',
                example:'password123'
              },
            },
          },
        },
      },
    },
    response:{
      200:{
        description:"user registered successfully",
        content:{
          'application/json':{
            schema:{
              type:'object',
              properties:{
                message:{type:'string'},
                userId:{type:'string'}
              }
            }
          }
        }
      }
      400:{
        description:'Validation error'
      }
      500:{
        description:'Server error'
      }
    }
  }
}