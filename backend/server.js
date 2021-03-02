const express = require("express");
const fs = require("fs");
const cors = require("cors");
const uuid = require("uuid");
const gameManager = require("./game-manager.js");
const classes = require("./classes");

const app = express();
const PORT = process.env.PORT || 3000;
const PLAYER_TIMEOUT = 30 * 1000; // 30 seconds
const TIMEOUT_CHECKING_TIME = 10 * 1000; // 10 seconds

let gameId;
let game;
let players = [];
let playersTimedOut = [];

// Checking for player timeouts every TIMEOUT_CHECKING_TIME milliseconds.
setInterval(() => {
	for (const player of players) {
		if (Date.now() - player.lastPinged > PLAYER_TIMEOUT) {
			playersTimedOut.push(player);
			players.splice(players.indexOf(player), 1);
			console.log(
				`Moved player ${player.playerName}, id: ${player.playerId}, to timed out players!`
			);
			console.log(
				`Reason for timeout: haven't recieved ping from player in ${PLAYER_TIMEOUT} ms, last ping was ${
					Date.now() - player.lastPinged
				} ms ago.`
			);

			// Adding reason for timeout in the player file
			fs.appendFileSync(
				`./players/${player.playerId}.json`,
				`Reason for timeout: haven't recieved ping from player in ${PLAYER_TIMEOUT} ms, last ping was ${
					Date.now() - player.lastPinged
				} ms ago.`
			);

			// Moving the player file to timedOutPlayers folder
			fs.rename(
				`./players/${player.playerId}.json`,
				`./timedOutPlayers/${player.playerId}.json`,
				function (err) {
					if (err) throw err;
					console.log("Successfully moved players file to timedOutPlayers!");
				}
			);
		}
	}
}, TIMEOUT_CHECKING_TIME)
app.use(express.static("../frontend"));
app.use(cors());
// turning request into JSON
app.use(express.json());

// middleware for waiting 0.01 seconds between server requests
app.use(function (req, res, next) {
	console.log("Time:", Date.now());
	console.log("Request Type:", req.method);
	setTimeout(next, 10);
});

// EXAMPLE PING REQUEST (GET):
/* gameStateRequest = {
    URL: "/ping + playerId",
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    }
} */
// if received ping from player, set his lastPinged property to the current time. also sets out the game state as the response.
app.get("/ping/:playerId", (req, res) => {
	const pingingPlayerId = req.params.playerId;
	if (!players.some((player) => player.playerId === pingingPlayerId)) {
		res.status(401).send({
			message: `Unrecognized ping, player with id ${pingingPlayerId} is not recognized!`,
		});
	} else {
		let currentTime = Date.now();
		for (const player of players) {
			if (player.playerId === pingingPlayerId) {
				player.lastPinged = currentTime;
			}
		}
		console.log(`Ping time: ${currentTime}, by player id: ${pingingPlayerId}`);
		res.send("Pong " + pingingPlayerId);
	}
});

// EXAMPLE STATE REQUEST (GET):
/* gameStateRequest = {
    URL: "/game/state + playerId",
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    }
} */
// GET requests to /game/state:playerId gets the current state of the game for playerId
app.get("/game/state/:playerId", (req, res) => {
	const requestingPlayerId = req.params.playerId;

	if (!game || !gameId) {
		res.status(404).json({ message: "Game not found!" });
	} else if (!players.some((player) => player.playerId === requestingPlayerId)) {
		res.status(401).json({
			message: `Unauthorized request to get game state, player with id ${requestingPlayerId} is not recognized!`,
		});
	} else {
		console.log(`Game state for player id: ${requestingPlayerId} of game with id:${gameId}:`);
		res.send(game.getGameState(requestingPlayerId));
	}
});

// EXAMPLE JOIN REQUEST (POST):
/* joinRequest = {
	URL: "/join",
	method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
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
	body.gameJoined = gameId;
	players.push(body);

	if (!body.playerName) {
		res.status(400).json({ message: "New player must have a name!" });
	} else {
		fs.writeFile(`./players/${id}.json`, JSON.stringify(body, null, 4), (err) => {
			if (err) {
				res.status(500).json({ message: "Internal server error", error: err });
			} else {
				console.log(`joined player id: ${id}, name: ${body.playerName}`);
				res.status(201).send(body);
			}
		});
	}
});

// EXAMPLE CREATE NEW GAME REQUEST (POST):
/* createGameRequest = {
    URL: "/game/new + playerId",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    }
} */
// POST request to /game/new:playerId - create a new game
app.post("/game/new/:playerId", (req, res) => {
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

			game = new classes.Game(players);

			console.log(`Created new game with id: ${gameId}, number of players: ${game.players.length}`);
			res.status(201).json(body);
		} catch (error) {
			console.log("failed to start game");
			res.status(500).json({ message: "Internal server error", error: error });
		}
	}
});

// EXAMPLE MAKE A TURN REQUEST (PUT):
/* playRequest = {
	URL: "/game/play + playerId",
	method: "PUT",
	headers: {
		"Content-Type": "application/json",
	},
	body: {
        callYaniv: false,
        *cardsToDiscard: [Card, Card, Card],
        *isCardToGetFromGameDeck: true,
        *cardPickedFromSet: Card
    } (* are optional parameters)
}; */
// PUT requests to /game/play:playerId to make a new turn
app.put("/game/play/:playerId", (req, res) => {
	const body = req.body;
	const requestingPlayerId = req.params.playerId;
	if (requestingPlayerId !== game.playerInTurn.playerId) {
		res.status(401).json({
			message: `Unauthorized request to make turn, it is not ${requestingPlayerId.playerName}'s turn!`,
		});
	} else {
		try {
			console.log("hi");
			console.log(body);
			gameManager.makeTurn(
				game,
				body.callYaniv,
				body.cardsToDiscard,
				body.isCardToGetFromGameDeck,
				body.cardPickedFromSet
			);
		} catch (error) {
			res.status(500).send(error);
		}
	}
});

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
