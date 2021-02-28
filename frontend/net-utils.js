"use strict"

const netUtils = {
  URL: "http://localhost:3000",
  async joinGame(userName) {
    mocks.joinGame(userName);
    return;
    const init = {
      method: "POST",
      body: JSON.stringify({"player-name": userName})
    }; 
    fetch(this.URL + "/join", init);
  },
  ready(playerIdentity) {
    mocks.setReady(playerIdentity);
    return;
  },
  async startGame() {
    return;
    const init = {
      method: "POST"
    };
    fetch(this.URL + "/createGame", init);
  },
  getPlayersStatus() {
    return mocks.playersReady();
  },
  async getGameStateForPlayer(playerIdentity) {
    return mocks.state(playerIdentity);
    fetch(this.URL + "/status");
  },
  async play(move) {
    mocks.executeMove(move);
    return;
    const isYaniv = move.move === "Yaniv"; 
    const cards = move.cards.cards;
    const init = {
      method: "PUT",
      body: JSON.stringify({
        yaniv: isYaniv,
        cardsToDiscard: cards,
        isCardToGetFromGameDeck: true,
        cardPickedFromSet: null
      })
    };
    fetch(this.URL , init);
  }
};

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
