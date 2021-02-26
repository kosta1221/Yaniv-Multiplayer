"use strict";
const mock = {
  players: ["koren", "kosta", "dvir"],
  playersReady: {
    koren: true,
    kosta: true,
    dvir: true,
  },
  state(name) {
    const pd = new PileDeck();
    // pd.createNewFullDeck()
    pd.cards.push(
      new Card("spades", "10", false),
      new Card("clubs", "king", false)
    );
    const state = {
      playersPoints: {
        koren: 15,
        kosta: 12,
        dvir: 21,
      },
      playersCardNumbers: {
        koren: 3,
        kosta: 1,
        dvir: 2,
      },
      cards: [
        new Card("hearts", "jack", false),
        new Card("spades", "10", false),
        new Card("clubs", "king", false),
        new Card("diamonds", "2", false),
        new Card("hearts", "queen", false),
      ],
      pileDeck: pd,
      playerInTurn: name,
      playerNames: this.players,
    };
    state.playersCardNumbers[name] = 5;
    return state;
  },
};

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
    return mock.state(playerIdentity);
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
