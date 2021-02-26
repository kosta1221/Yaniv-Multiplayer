"use strict";
const mock = {
  players:["koren", "kosta", "dvir"],
  playersReady: {
    koren: true,
    kosta: true,
    dvir: true
  },
  state(name) {
    const pd = new PileDeck();
    pd.createNewFullDeck();
    const state = {
      playersPoints: {
        koren: 15,
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
      playerNames: this.players
    };
    state.playersCardNumbers[name] = 5;
    return state;
  }
}

const netUtils = {
  getWaitingGames() {},
  createGame() {},
  joinGame(userName) {
    mock.players.push(userName);
    mock.playersReady[userName] = false;
  },
  ready(playerIdentity) {
    mock.playersReady[playerIdentity] = true;
  },
  getPlayersStatus() {
    return mock.playersReady;
  },
  getGameStateForPlayer(playerIdentity) {
    return mock.state(playerIdentity);
  },
  play() {},
};
