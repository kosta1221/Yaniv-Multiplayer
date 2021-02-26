"use strict"

const netUtils = {
  getWaitingGames() {},
  createGame() {},
  joinGame(userName) {
    mocks.joinGame(userName);
  },
  ready(playerIdentity) {
    mocks.setReady(playerIdentity);
  },
  getPlayersStatus() {
    return mocks.playersReady();
  },
  getGameStateForPlayer(playerIdentity) {
    return mocks.state(playerIdentity);
  },
  play(move) {
    mocks.executeMove(move);
  },
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
