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

let gameId;
let game;
let players = [];

morgan.token("reqbody", (req) => {
	return JSON.stringify(req.body);
});

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :reqbody"));

app.use(express.static("../frontend"));
app.use(cors());
// turning request into JSON
app.use(express.json());

// socket.io connection event listener
io.on("connection", (socket) => {
	console.log(socket.id);

	socket.on("playerJoin", (joinedPlayerName) => {
		if (!joinedPlayerName) {
			console.log("error", "New player must have a name!");
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
			console.log(
				"error",
				`Unauthorized request to get create new game, player with id ${requestingPlayerId} is not recognized!`
			);
			return socket.emit(
				"error",
				`Unauthorized request to get create new game, player with id ${requestingPlayerId} is not recognized!`
			);
		}

		if (game || gameId) {
			console.log("error", `Game already running!`);
			return socket.emit("error", `Game already running!`);
		}

		gameId = uuid.v4();
		game = new classes.Game(players, gameId);

		console.log(`Created new game with id: ${gameId}, number of players: ${game.players.length}`);

		for (const player of players) {
			player.socket.emit("gameCreated", game.getGameState(player.playerId));
		}
	});

	// event listener for making a new turn
	socket.on("makeTurn", (rawMoveData) => {
		console.log(rawMoveData);
		const moveData = convertPlayRequest(rawMoveData);
		const requestingPlayerId = moveData.playerId;
		const requestingPlayer = players.find((player) => player.playerId === requestingPlayerId);
		console.log(moveData);

		console.log(requestingPlayerId);
		console.log(game.playerInTurn.playerId);
		if (requestingPlayerId !== game.playerInTurn.playerId) {
			console.log(
				"error",
				`Unauthorized request to make turn, it is not ${requestingPlayer.playerName}'s turn!`
			);
			return socket.emit(
				"error",
				`Unauthorized request to make turn, it is not ${requestingPlayer.playerName}'s turn!`
			);
		}

		try {
			gameManager.makeTurn(
				game,
				moveData.callYaniv,
				moveData.cardsToDiscard,
				moveData.isCardToGetFromGameDeck,
				moveData.cardPickedFromSet
			);

			for (const player of players) {
				player.socket.emit("update", game.getGameState(player.playerId));
			}
		} catch (error) {
			console.log(error);
			return socket.emit("error", error.message);
		}
	});

	socket.on("disconnect", () => {
		console.log("a player disconnected");
	});
	console.log("a player connected");
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

function convertPlayRequest(moveData) {
	const playerId = moveData.playerId;
	const callYaniv = moveData.callYaniv;
	const cardsToDiscard = !moveData.cardsToDiscard 
	? null 
	: moveData.cardsToDiscard.map((cardLike) => new classes.Card(cardLike.suit, cardLike.rank, cardLike.isJoker));
	const isCardToGetFromGameDeck = moveData.isCardToGetFromGameDeck;
	const cardPickedFromSet = !moveData.cardPickedFromSet 
	? null
	: new classes.Card(
		moveData.cardPickedFromSet.suit,
		moveData.cardPickedFromSet.rank,
		moveData.cardPickedFromSet.isJoker
	);
	const play = {
		playerId,
		callYaniv,
		cardsToDiscard,
		isCardToGetFromGameDeck,
		cardPickedFromSet,
	};
	return moveData;
}
