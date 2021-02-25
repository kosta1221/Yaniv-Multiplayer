"use strict";
// A class for building player objects
class Player {
	constructor(playerName, points, playerDeck) {
		this.playerName = playerName;

		if (points) {
			this.points = points;
		} else this.points = 0;

		if (playerDeck) {
			this.playerDeck = playerDeck;
			this.numberOfCards = playerDeck.cards.length;
		} else {
			this.playerDeck = new PlayerDeck();
			this.numberOfCards = 0;
		}
	}

	giveCardFromTopOfDeck(deck) {
		this.playerDeck.cards.push(deck.getFirstCard());
		this.numberOfCards++;
		deck.cards.shift();
	}

	giveFiveCardsFromTopOfDeck(deck) {
		for (let i = 0; i < 5; i++) {
			this.playerDeck.cards.push(deck.getFirstCard());
			this.numberOfCards++;
			deck.cards.shift();
		}
	}

	// Needs to be tested
	moveCardsFromPlayerDeckToOpenCards(cardsToMove, game) {
		for (const card of cardsToMove) {
			game.openCardDeck.cards.push(card);
			this.numberOfCards--;
		}
		this.playerDeck.removeCards(cardsToMove);
	}
}

// A class for building card objects
class Card {
	#suit;
	#rank;
	#isJoker;
	constructor(suit, rank, isJoker) {
		this.#suit = suit;
		this.#rank = rank;
		this.#isJoker = isJoker;
	}

	get suit() {
		return this.#suit;
	}

	get rank() {
		return this.#rank;
	}

	get isJoker() {
		return this.#isJoker;
	}

	// set suit(suit) {
	// 	this.#suit = suit;
	// }

	// set rank(rank) {
	// 	this.#rank = rank;
	// }

	// set isJoker(isJoker) {
	// 	this.#isJoker = isJoker;
	// }
}

// A class for having instances of games
class Game {
	constructor(playerNames, gameDeck) {
		if (gameDeck) {
			this.gameDeck = gameDeck;
		} else {
			const fullDeck = new Deck();
			fullDeck.createNewFullDeck();
			fullDeck.shuffleDeck();
			this.gameDeck = fullDeck;
		}

		this.players = [];
		for (const playerName of playerNames) {
			const player = new Player(playerName);
			this.players.push(player);
			console.log(player);
			player.giveFiveCardsFromTopOfDeck(this.gameDeck);
		}

		this.turn = 0;
		this.playerInTurn = this.players[this.turn % 4];

		this.openCardDeck = new Deck();

		this.getGameState = function () {
			const gameState = {};
			gameState.allPlayersPoints = {};
			gameState.allPlayersNumberOfCards = {};
			for (const player of this.players) {
				Object.defineProperty(gameState.allPlayersPoints, player.playerName, {
					value: player.points,
					writable: false,
				});
				Object.defineProperty(gameState.allPlayersNumberOfCards, player.playerName, {
					value: player.numberOfCards,
					writable: false,
				});
			}

			gameState.cards = this.gameDeck;
			gameState.openCards = this.openCardDeck;

			// Can get whole player object if needed
			gameState.nameOfPlayerInTurn = this.playerInTurn.playerName;
			gameState.playerNames = playerNames;

			return gameState;
		};
	}
}

// A class for having gameState objects
/* class gameState {
	constructor() {}
} */

// A class for building objects of decks of cards
class Deck {
	constructor() {
		this.cards = [];
	}

	createNewFullDeck() {
		let suits = ["clubs", "diamonds", "hearts", "spades"];
		let ranks = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"];
		for (let i = 0; i < suits.length; i++) {
			for (let j = 0; j < ranks.length; j++) {
				this.cards.push(new Card(suits[i], ranks[j], false));
			}
		}
		this.cards.push(new Card(null, null, true));
		this.cards.push(new Card(null, null, true));
	}
	shuffleDeck() {
		// shuffle the cards
		for (let i = this.cards.length - 1; i > 0; i--) {
			let randomIndex = Math.floor(Math.random() * i);
			let temp = this.cards[i];
			this.cards[i] = this.cards[randomIndex];
			this.cards[randomIndex] = temp;
		}
	}

	getFirstCard() {
		return this.cards[0];
	}

	getFirstCards(numberOfCardsToGet) {
		const cardsToGet = [];
		for (let i = 0; i < numberOfCardsToGet; i++) {
			cardsToGet.push(this.cards[i]);
		}
	}

	// Not sure if works
	removeCards(cardsToRemove) {
		console.log(cardsToRemove);
		this.cards = this.cards.filter((card) => {
			for (const cardToRemove of cardsToRemove) {
				console.log(card);
				console.log(cardToRemove);
				console.log(card != cardToRemove);
				return card != cardToRemove;
			}
		});
	}
}

class PlayerDeck extends Deck {
	constructor() {
		super();
	}
}

class TableDeck extends Deck {
	constructor() {
		super();
	}
}

class PileDeck extends Deck {
	constructor() {
		super();
	}
}

// module.exports = { Player, Card, Game, Deck, PlayerDeck };
