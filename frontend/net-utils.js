"use strict"

const netUtils = {
  URL: "http://localhost:3000",
  async joinGame(userName) {
    mocks.joinGame(userName);
    // return;
    const init = {
      method: "POST",
      body: JSON.stringify({playerName: userName})
    }; 
    const response = await fetch(this.URL + "/join", init);
    const body = await response.json();
    console.log(body);
    return body.playerId;
  },
  ready(playerIdentity) {
    mocks.setReady(playerIdentity);
    return;
  },
  async startGame(id) {
    // return;
    const init = {
      method: "POST"
    };
    fetch(`${this.URL}/game/new/${id}`, init);
  },
  getPlayersStatus() {
    return mocks.playersReady();
  },
  async getGameStateForPlayer(playerIdentity, id) {
    // return mocks.state(playerIdentity);
    const response = await fetch(`${this.URL}/game/state/${id}`);
    const body = response.json();
    console.log(body);
    
    return body;
  },
  async play(move, id) {
    mocks.executeMove(move);
    // return;
    const isYaniv = move.move === "Yaniv"; 
    const cards = move.cards.cards;
    const init = {
      method: "PUT",
      body: JSON.stringify({
        callYaniv: isYaniv,
        cardsToDiscard: cards,
        isCardToGetFromGameDeck: true,
        cardPickedFromSet: null
      })
    };
    fetch(`${this.URL}/game/play/${id}` , init);
  }
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
