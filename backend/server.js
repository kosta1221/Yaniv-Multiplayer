const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// turning request into JSON
app.use(express.json());

// middleware for waiting 1 second between server requests
app.use(function (req, res, next) {
	console.log("Time:", Date.now());
	console.log("Request Type:", req.method);
	setTimeout(next, 300);
});

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
