"use strict"

const netUtils = {
  URL: "localhost:3000",
  getWaitingGames() {},
  createGame() {
    const init = {
      method: "POST"
    };
    fetch(this.URL + "createGame", init);
  },
  async joinGame(userName) {
    mocks.joinGame(userName);
    const init = {
      method: "POST",
      body: JSON.stringify({"player-name": userName})
    }; 
    fetch(this.URL + "/join", init);
  },
  ready(playerIdentity) {
    mocks.setReady(playerIdentity);
  },
  getPlayersStatus() {
    return mocks.playersReady();
  },
  getGameStateForPlayer(playerIdentity) {
    return mocks.state(playerIdentity);
    fetch(this.URL + "/status");
  },
  play(move) {
    mocks.executeMove(move);
    const isYaniv = move.move === "Yaniv"; 
    const cards = move.cards.cards;
    const init = {
      method: "PUT",
      body: JSON.stringify({
        yaniv: isYaniv,
        cardsToDiscard: cards,
        isCardToGetFromGameDeck: false,
        cardPickedFromSet: null
      })
    };
    fetch(this.URL, init);
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
