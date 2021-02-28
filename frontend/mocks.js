const mocks = {
  tableDeck: null,
  pileDeck: null,
  players: {
    // constructor(playerName, playerId, points, playerDeck)
    koren: new Player("koren", null, 0, new PlayerDeck()),
    kosta: new Player("kosta", null, 0, new PlayerDeck()),
    dvir: new Player("dvir", null, 0, new PlayerDeck())
  },
  playerInTurn: null,
  initialize() {
    this.players["koren"].isReady = true;
    this.players["kosta"].isReady = true;
    this.players["dvir"].isReady = false;
  },
  joinGame(playerName) {
    this.players[playerName] = new Player(playerName, null, 0, new PlayerDeck());
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
      this.players[playerName].giveFiveCardsFromTopOfDeck(this.tableDeck);
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
      playersCardNumbers[name] = this.players[name].playerDeck.cards.length; 
    }
    const cards = this.players[playerName].playerDeck;
    const pd = this.pileDeck;
    const playerNames = Object.getOwnPropertyNames(this.players);
    const PIN = this.playerInTurn;
    const state = {
      playersPoints, //allPlayersPoints
      playersCardNumbers, //allPlayersNumberOfCards
      cards,
      deckOfPlayerInTurn: null,
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
