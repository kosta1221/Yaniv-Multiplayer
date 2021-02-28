const express = require("express");
const fs = require("fs");
const uuid = require("uuid");
const gameManager = require("./game-manager.js");
const classes = require("../classes");

const app = express();
const PORT = process.env.PORT || 3000;

let gameId;
let game;
let players = [];

// turning request into JSON
app.use(express.json());

// middleware for waiting 0.1 seconds between server requests
app.use(function (req, res, next) {
	console.log("Time:", Date.now());
	console.log("Request Type:", req.method);
	setTimeout(next, 100);
});

// if make turn, set time out for the player that comes after
app.get("/ping/:id", (req, res) => {
	const { pingingPlayerId } = req.params;

	if (!players.some((player) => player.playerId !== pingingPlayerId)) {
		res.status(401).json({
			message: `Unrecognized ping, player with id ${requestingPlayerId} is not recognized!`,
		});
	} else {
		let currentTime = Date.now();
		for (const palyer of players) {
			if (player.playerId === pingingPlayerId) {
				player.lastPinged = currentTime;
			}
		}
		console.log(
			`Ping time: ${currentTime}, by player id: ${requestingPlayerId} of game with id:${gameId}:`
		);
	}
});

// EXAMPLE STATE REQUEST (GET):
/* gameStateRequest = {
    URL: "/game/state",
    method: "GET",
    headers: {
        "playerId": "idString"
    }
} */
app.get("/game/state", (req, res) => {
	const requestingPlayerId = req.headers.playerId;

	if (!game || !gameId) {
		res.status(404).json({ message: "Game not found!" });
	} else if (!players.some((player) => player.playerId !== requestingPlayerId)) {
		res.status(401).json({
			message: `Unauthorized request to get game state, player with id ${requestingPlayerId} is not recognized!`,
		});
	} else {
		console.log(`Game state for player id: ${requestingPlayerId} of game with id:${gameId}:`);
		console.log(game.getGameState());
		res.send(game.getGameState());
	}
});

// EXAMPLE JOIN REQUEST (POST):
/* joinRequest = {
	URL: "/join",
	method: "POST",
	body: {
		"playerName": "Name",
	},
}; */
// POST requests to /join adds a new player file and gives him an id
app.post("/join", (req, res) => {
	const body = req.body;
	// create 36 char id for player
	const id = uuid.v4();
	body.playerId = id;
	body.lastPinged = Date.now();
	players.push(body);

	if (!body.playerName) {
		res.status(400).json({ message: "New player must have a name!" });
	} else {
		fs.writeFile(`./players/${id}.json`, JSON.stringify(body, null, 4), (err) => {
			if (err) {
				res.status(500).json({ message: "Internal server error", error: err });
			} else {
				console.log(`joined player id: ${id}, name: ${body.playerName}`);
				res.status(201).json(body);
			}
		});
	}
});

// EXAMPLE CREATE NEW GAME REQUEST (POST):
/* createGameRequest = {
    URL: "/game/new",
    method: "POST",
    headers: {
        "playerId": "idString"
    }
} */
// POST request to /game/new - create a new game
app.post("/game/new", (req, res) => {
	const requestingPlayerId = req.headers.playerId;

	if (!players.some((player) => player.playerId !== requestingPlayerId)) {
		res.status(401).json({
			message: `Unauthorized request to get create new game, player with id ${requestingPlayerId} is not recognized!`,
		});
	} else if (game || gameId) {
		res.status(400).json({ message: "Game already running!" });
	} else {
		try {
			const body = req.body;
			gameId = uuid.v4();
			body.gameId = gameId;

			console.log(players);
			game = new classes.Game(players);
			body.status = newGame;

			console.log(`Created new game with id: ${gameId}, number of players: ${game.players.length}`);
			res.status(201).json(body);
		} catch (error) {
			res.status(500).json({ message: "Internal server error", error: err });
		}
	}
});

// EXAMPLE MAKE A TURN REQUEST (PUT):
/* playRequest = {
	URL: "/game/play",
	method: "PUT",
	headers: {
		"playerId": "idString",
	},
	body: {
        callYaniv: false,
        *cardsToDiscard: [Card, Card, Card],
        *isCardToGetFromGameDeck: true,
        *cardPickedFromSet: Card
    } (* are optional parameters)
}; */
// PUT requests to /game/play to make a new turn
app.put("/game/play", (req, res) => {
	const body = req.body;
	const requestingPlayerId = req.headers.playerId;
	if (requestingPlayerId !== game.playerInTurn.playerId) {
		res.status(401).json({
			message: `Unauthorized request to make turn, it is not ${requestingPlayerId.playerName}'s turn!`,
		});
	}

	try {
		gameManager.makeTurn(
			game,
			body.callYaniv,
			body.cardsToDiscard,
			body.isCardToGetFromGameDeck,
			body.cardPickedFromSet
		);
	} catch (error) {
		res.status(500).json({ message: "Illegal move error!", error: err });
	}
});

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
