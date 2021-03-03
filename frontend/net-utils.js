"use strict";

const netUtils = {
	URL: "",
	async joinGame(userName) {
		// mocks.joinGame(userName);
		// return;
		const init = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ playerName: userName }),
		};
		console.log("trying to join with name: " + userName);
		const response = await fetch(this.URL + "/join", init);
		const body = await response.json();
		const id = body.playerId;
		setInterval(()=>{
		  fetch(`${this.URL}/ping/${id}`);
		}, 5000);
		console.log("join request responded with:");
		console.log(body);
		return id;
	},
	ready(playerIdentity) {
		// mocks.setReady(playerIdentity);
		return;
	},
	async startGame(id) {
		// return;
		const init = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		};
		await fetch(`${this.URL}/game/new/${id}`, init);
	},
	getPlayersStatus() {
		// return; mocks.playersReady();
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
			callYaniv: isYaniv,
			cardsToDiscard,
			isCardToGetFromGameDeck,
			cardPickedFromSet
		};
		
		const init = {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(playObj),
		};
		console.log("sending move request:");
		console.log(JSON.parse(init.body));
		await fetch(`${this.URL}/game/play/${id}`, init)
			.catch(err => console.log(err, err.message));
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
