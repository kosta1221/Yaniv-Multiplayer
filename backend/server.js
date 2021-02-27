const express = require("express");
const fs = require("fs");
const uuid = require("uuid");
const gameManager = require("./game-manager.js");

const app = express();
const PORT = process.env.PORT || 3000;

// turning request into JSON
app.use(express.json());

// middleware for waiting 0.1 seconds between server requests
app.use(function (req, res, next) {
	console.log("Time:", Date.now());
	console.log("Request Type:", req.method);
	setTimeout(next, 100);
});

app.get("/status", (req, res) => {});

// example join request:
/* joinRequest = {
	URL: "/join",
	method: "PUT",
	body: {
		"user-name": "Name",
	},
}; */
// PUT requests to /join put the players in a lobby
app.put("/join", (req, res) => {
	const responseBody = req.body;
	// create 36 char id
	const id = uuid.v4();
	responseBody["user-id"] = id;

	if (!responseBody["user-name"]) {
		res.status(400).json({ message: "New player must have a name!" });
	} else {
		fs.writeFile(`./lobby.json`, JSON.stringify(responseBody, null, 4), (err) => {
			if (err) {
				res.status(500).json({ message: "Internal server error", error: err });
			} else {
				console.log(`joined player id: ${id}, name: ${responseBody["user-name"]}`);
				res.status(201).json(responseBody);
			}
		});
	}
});

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
