const mysql = require("mysql2/promise"); // this loads mysql2/promise library with async/await support

const db = mysql.createPool({
  // creating a group of reusable connection pool
  host: "localhost",
  user: "root",
  password: "Midhi@2002",
  database: "racinglap",
  waitForConnections: true, // wait in a line if connectionLimit exceed
  connectionLimit: 10, // no of user api hits and connecting to db at a time
  queueLimit: 0, // 0 -> unlimited people will wait in a line
});

// test DB connection at start
async function testDBConnection() {
  try {
    const connection = await db.getConnection(); // manually requesting a connection from the pool
    console.log(" MySQL Connected");
    connection.release(); // borrowing one connection from the pool , after finish returned to pool. others can use instead of getting error:no connection available
  } catch (err) {
    console.error(" DB Connection Failed:", err.message);
    process.exit(1); // Stop app if DB is unreachable // stops/terminate application immediately with error like , Browser:ERR_CONNECTION_RESET
  }
}

// Immediately test connection
testDBConnection();

module.exports = db;
