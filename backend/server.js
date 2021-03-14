const express = require("express");
const fs = require("fs");
const cors = require("cors");
const uuid = require("uuid");
const gameManager = require("./game-manager.js");
const classes = require("./classes");
const morgan = require("morgan");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;
const PLAYER_TIMEOUT = 3 * 60 * 1000; // 3 minutes
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
}, TIMEOUT_CHECKING_TIME);

morgan.token("reqbody", (req) => {
	return JSON.stringify(req.body);
});

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :reqbody"));

app.use(express.static("../frontend"));
app.use(cors());
// turning request into JSON
app.use(express.json());

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
		return res.status(401).json({
			error: `Unrecognized ping, player with id ${pingingPlayerId} is not recognized!`,
		});
	}

	let currentTime = Date.now();
	for (const player of players) {
		if (player.playerId === pingingPlayerId) {
			player.lastPinged = currentTime;
		}
	}
	// console.log(`Ping time: ${currentTime}, by player id: ${pingingPlayerId}`);
	res.send("Pong " + pingingPlayerId);
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
		return res.status(404).json({ error: "Game not found!" });
	}

	if (!players.some((player) => player.playerId === requestingPlayerId)) {
		return res.status(401).json({
			error: `Unauthorized request to get game state, player with id ${requestingPlayerId} is not recognized!`,
		});
	}

	// console.log(`Game state for player id: ${requestingPlayerId} of game with id:${gameId}:`);
	res.send(game.getGameState(requestingPlayerId));
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

	if (!body.playerName) {
		return res.status(400).json({ error: "New player must have a name!" });
	}

	// create 36 char id for player
	const id = uuid.v4();
	body.playerId = id;
	body.lastPinged = Date.now();
	body.gameJoined = gameId;
	players.push(body);

	fs.writeFile(`./players/${id}.json`, JSON.stringify(body, null, 4), (err) => {
		if (err) {
			return res.status(500).json({ error: "Internal server error" });
		} else {
			console.log(`joined player id: ${id}, name: ${body.playerName}`);
			res.status(201).send(body);
		}
	});
});

// socket.io connection event listener
io.on("connection", (socket) => {
	console.log(socket.id);

	socket.on("playerJoin", (joinedPlayerName) => {
		if (!joinedPlayerName) {
			socket.emit("error", "New player must have a name!");
		}

		// create 36 char id for player
		const id = uuid.v4();
		const newPlayer = new classes.Player(joinedPlayerName, id);

		if (players.length === 0) newPlayer.isHost = true;
		else newPlayer.isHost = false;

		newPlayer.socket = socket;
		players.push(newPlayer);
		console.log(players);

		console.log(`new player joined with name ${joinedPlayerName}`);

		socket.broadcast.emit("otherPlayerCreated", {
			playerName: newPlayer.playerName,
		});
		socket.emit("playerCreated", {
			playerName: newPlayer.playerName,
			playerId: newPlayer.playerId,
		});
	});

	// create a new game
	socket.on("newGame", (requestingPlayerId) => {
		const requestingPlayer = players.find((player) => player.playerId === requestingPlayerId);

		if (!requestingPlayer.isHost) {
			console.log("123");
			return socket.emit(
				"error",
				`Unauthorized request to get create new game, player with id ${requestingPlayerId} is not recognized!`
			);
		}

		if (game || gameId) {
			console.log("4567");
			return socket.emit("error", `Game already running!`);
		}

		gameId = uuid.v4();
		game = new classes.Game(players, gameId);

		console.log(`Created new game with id: ${gameId}, number of players: ${game.players.length}`);

		for (const player of players) {
			player.socket.emit("gameCreated", game.getGameState(player.playerId));
		}
	});

	socket.on("disconnect", () => {
		console.log("a player disconnected");
	});
	console.log("a player connected");
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
		return res.status(401).json({
			error: `Unauthorized request to get create new game, player with id ${requestingPlayerId} is not recognized!`,
		});
	}

	if (game || gameId) {
		return res.status(400).json({ error: "Game already running!" });
	}

	try {
		const body = req.body;
		gameId = uuid.v4();
		body.gameId = gameId;

		game = new classes.Game(players);

		console.log(`Created new game with id: ${gameId}, number of players: ${game.players.length}`);
		res.status(201).json(body);
	} catch (error) {
		console.log("failed to start game");
		res.status(500).json({ error: "Internal server error" });
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
app.put("/game/play/:playerId", (req, res, next) => {
	const body = req.body;
	const requestingPlayerId = req.params.playerId;
	if (requestingPlayerId !== game.playerInTurn.playerId) {
		return res.status(401).json({
			error: `Unauthorized request to make turn, it is not ${requestingPlayerId.playerName}'s turn!`,
		});
	}

	try {
		const play = convertPlayRequest(body);
		gameManager.makeTurn(
			game,
			play.callYaniv,
			play.cardsToDiscard,
			play.isCardToGetFromGameDeck,
			play.cardPickedFromSet
		);
		console.log(req.body);
		res.status(200).json({
			message: `move executed successfully`,
		});
	} catch (error) {
		next(error);
	}
});

const errorHandler = (error, request, response, next) => {
	console.log(error.name);
	console.error(error.message);

	if (error.name === "TurnError") {
		return response.status(400).json({ error: error.message });
	} else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message });
	}

	next(error);
};

app.use(errorHandler);

http.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});

function convertPlayRequest(body) {
	const callYaniv = body.callYaniv;
	const cardsToDiscard =
		body.cardsToDiscard === null
			? null
			: body.cardsToDiscard.map(
					(cardLike) => new classes.Card(cardLike.suit, cardLike.rank, cardLike.isJoker)
			  );
	const isCardToGetFromGameDeck = body.isCardToGetFromGameDeck;
	const cardPickedFromSet =
		body.cardPickedFromSet === null
			? null
			: new classes.Card(
					body.cardPickedFromSet.suit,
					body.cardPickedFromSet.rank,
					body.cardPickedFromSet.isJoker
			  );
	const play = {
		callYaniv,
		cardsToDiscard,
		isCardToGetFromGameDeck,
		cardPickedFromSet,
	};
	return play;
}
