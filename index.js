/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const fs = require('fs');
const index = fs.readFileSync('public/index.html');
/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";

/**
 *  App Configuration
 */
app.use(express.static(path.join(__dirname, "public")));
/**
 * Routes Definitions
 */
app.get("/", (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(index);
});

/**
 * Server Activation
 */
app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});


