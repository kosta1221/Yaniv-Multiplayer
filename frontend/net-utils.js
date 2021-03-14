"use strict";
const socket = io();
const netUtils = {
	
	URL: "",
	async joinGame(userName) {
		socket.emit("playerJoin", userName);
	},

	ready(playerIdentity) {
		// mocks.setReady(playerIdentity);
		return;
	},
	async startGame(id) {
		socket.emit("newGame", id);
	},
	convertState(rawState) {
		const state = {
			allPlayersNames: rawState.allPlayersNames,
			allPlayersPoints: rawState.allPlayersPoints,
			allPlayersNumberOfCards: rawState.allPlayersNumberOfCards,
			playerDeck: rawState.requestingPlayer.playerDeck,
			openCards: rawState.openCards,
			playerInTurn: rawState.nameOfPlayerInTurn,
			match: rawState.match,
			playerCalledYaniv: rawState.playerCalledYaniv,
			playerCalledAssaf: rawState.playerCalledAssaf
		};
		return state;
	},

	async getGameStateForPlayer(playerIdentity, id) {
		// return mocks.state(playerIdentity);
		const response = await fetch(`${this.URL}/game/state/${id}`);
		const body = await response.json();
		console.log("gameState request responded with:");
		console.log(body);
		const state = {
			allPlayersNames: body.allPlayersNames,
			allPlayersPoints: body.allPlayersPoints,
			allPlayersNumberOfCards: body.allPlayersNumberOfCards,
			playerDeck: body.requestingPlayer.playerDeck,
			openCards: body.openCards,
			playerInTurn: body.nameOfPlayerInTurn,
			match: body.match,
			playerCalledYaniv: body.playerCalledYaniv,
			playerCalledAssaf: body.playerCalledAssaf
		};
		return state;
	},
	async play(move, id) {
		// mocks.executeMove(move);
		// return;
		console.log(move.move);
		const isYaniv = move.move === "yaniv";
		const cardsToDiscard = move.cards.cards;
		const {cardPickedFromSet, isCardToGetFromGameDeck} = move;
		const playObj = {
			playerId: id,
			callYaniv: isYaniv,
			cardsToDiscard,
			isCardToGetFromGameDeck,
			cardPickedFromSet
		};
		socket.emit("makeTurn", playObj);
	},
};
// body.callYaniv,
// 			body.cardsToDiscard,
// 			body.isCardToGetFromGameDeck,
// 			body.cardPickedFromSet

// joinRequest = {
//     URL: "/join",
//     method: "PUT",
//     headers: {
//         "user-name": "Name"
//     }
// }
// readyRequest = {
//     URL: "/ready",
//     method: "PUT",
//     headers: {
//         "ready": true
//     }
// }
// playersStatusRequest = {
//     URL: "/status",
//     method: "GET"
// }
// gameStateRequest = {
//     URL: "/game/state",
//     method: "GET",
//     headers: {
//         "player-id": "idString"
//     }
// }
// playRequest = {
//     URL: "/game/play",
//     method: "PUT",
//     headers: {
//         "player-id": "idString"
//     },
//     body: {
//         move: "place",
//         cards: ["card", "card", "card"]
//     }
// }
