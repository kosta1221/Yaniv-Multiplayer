const mocks = {
  tableDeck: null,
  pileDeck: null,
  players: {
    koren: new Player(new PlayerDeck(), 0, 0),
    kosta: new Player(new PlayerDeck(), 0, 0),
    dvir: new Player(new PlayerDeck(), 0, 0),
  },
  playerInTurn: null,
  initialize() {
    this.players["koren"].isReady = true;
    this.players["kosta"].isReady = true;
    this.players["dvir"].isReady = false;
  },
  joinGame(playerName) {
    this.players[playerName] = new Player(new PlayerDeck(), 0, 0);
    this.players[playerName].isReady = false;
    this.players["dvir"].isReady = true;
  },
  setReady(playerName) {
    this.players[playerName].isReady = true;
    this.startGame(playerName);
  },
  startGame(playerName) {
    this.tableDeck = new TableDeck();
    this.pileDeck = new PileDeck();
    this.tableDeck.createNewFullDeck();
    this.tableDeck.shuffleDeck();
    for (const playerName in this.players) {
      this.players[playerName].cards.giveFiveCardsFromTopOfDeck(this.tableDeck);
    }
    const cardToPile = this.tableDeck.cards[0];
    this.pileDeck.addCard(cardToPile);
    this.playerInTurn = playerName;
  },
  playersReady() {
    const playersReadyObject = {};
    for (const playerName in this.players) {
      playersReadyObject[playerName] = this.players[playerName].isReady;
    }
    return playersReadyObject;
  },
  state(playerName) {
    const playersPoints = {};
    const playersCardNumbers = {};
    for (const name in this.players) {
      playersPoints[name] = this.players[name].points;
      playersCardNumbers[name] = this.players[name].cards.cards.length;
    }
    const cards = this.players[playerName].cards.cards;
    const pd = this.pileDeck;
    const playerNames = Object.getOwnPropertyNames(this.players);
    const PIN = this.playerInTurn;
    const state = {
      playersPoints,
      playersCardNumbers,
      cards,
      pileDeck: pd,
      playerInTurn: PIN,
      playerNames,
    };
    return state;
  },
  executeMove(name, moveObj) {},
};
mocks.initialize();

// const onPut = (obj) => {
//     updatedState(obj.name) {
//         const updatedState = {
//         }
//     }
//     return updatedState
// }
