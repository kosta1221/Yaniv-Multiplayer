"use strict";
// A class for building player objects
class Player {
	calledYaniv = false;
	calledAssaf = false;
	constructor(playerName, playerId, points, playerDeck) {
		this.playerName = playerName;
		this.playerId = playerId;

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
		this.didLose = false;
	}

	calculateRoundPointsBasedOnRank() {
		let sum = 0;
		for (const playerCard of this.playerDeck.cards) {
			switch (playerCard.rank) {
				case "ace":
					sum += 1;
					break;
				case "jack":
				case "queen":
				case "king":
					sum += 10;
					break;
				default:
					sum += +playerCard.rank;
					break;
			}
		}
		return sum;
	}

	// Default value is cards in own playerDeck.
	sortCardsByRankIndex(cards = this.playerDeck.cards) {
		// Numeric sort of cards by rankIndex in ascending order
		cards.sort((a, b) => a.rankIndex - b.rankIndex);
	}

	giveFirstCardFromDeck(deck) {
		this.playerDeck.cards.push(deck.getFirstCard());
		this.numberOfCards++;
		deck.cards.shift();
	}

	giveLastCardFromDeck(deck) {
		this.playerDeck.cards.push(deck.getLastCard());
		this.numberOfCards++;
		deck.cards.pop();
	}

	giveNthCardFromDeck(deck, n) {
		this.playerDeck.cards.push(deck.cards[n]);
		this.numberOfCards++;
		deck.cards.splice(n, 1);
	}

	giveFiveCardsFromTopOfDeck(deck) {
		for (let i = 0; i < 5; i++) {
			this.playerDeck.cards.push(deck.getFirstCard());
			this.numberOfCards++;
			deck.cards.shift();
		}
	}

	// works
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
	constructor(suit, rank, isJoker) {
		this.suit = suit;
		this.rank = rank;
		this.isJoker = isJoker;

		switch (rank) {
			case "ace":
				this.rankIndex = 1;
				break;
			case "jack":
				this.rankIndex = 11;
				break;
			case "queen":
				this.rankIndex = 12;
				break;
			case "king":
				this.rankIndex = 13;
				break;
			default:
				this.rankIndex = +this.rank;
				break;
		}
	}

	// get suit() {
	// 	return this.suit;
	// }

	// get rank() {
	// 	return this.rank;
	// }

	// get isJoker() {
	// 	return this.isJoker;
	// }

	cardEquals(card) {
		return this.suit === card.suit && this.rank === card.rank && this.isJoker === card.isJoker;
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
	match = 1;
	constructor(playerNamesAndIds, gameDeck) {
		if (gameDeck) {
			this.gameDeck = gameDeck;
		} else {
			const fullDeck = new Deck();
			fullDeck.createNewFullDeck();
			fullDeck.shuffleDeck();
			this.gameDeck = fullDeck;
		}

		this.players = [];
		for (const playerNameAndId of playerNamesAndIds) {
			const player = new Player(playerNameAndId.playerName, playerNameAndId.playerId);
			this.players.push(player);
			player.giveFiveCardsFromTopOfDeck(this.gameDeck);
		}

		this.turn = 0;
		this.playerInTurn = this.players[0];

		this.openCardDeck = new Deck();

		// give openCardDeck the first card from gameDeck
		this.gameDeck.putFirstCardFromOneDeckToAnother(this.openCardDeck);
		this.gameDeck.cards.shift();

		this.numberOfPlayers = playerNamesAndIds.length;
		this.turnsSinceStart = 0;
		this.pointsToLose = 100;
		this.amountOfCardsLastPlayerPutInOpenCardDeck = 0;
		this.getGameState = function (requestingPlayerId) {
			const gameState = {};
			gameState.playerCalledYaniv = null;
			gameState.playerCalledAssaf = null;
			gameState.allPlayersNames = [];
			gameState.allPlayersPoints = {};
			gameState.allPlayersNumberOfCards = {};
			for (const player of this.players) {
				gameState.allPlayersNames.push(player.playerName);
				gameState.allPlayersPoints[player.playerName] = player.points;
				gameState.allPlayersNumberOfCards[player.playerName] = player.numberOfCards;
				if (player.calledYaniv) gameState.playerCalledYaniv = player.playerName;
				if (player.calledAssaf) gameState.playerCalledAssaf = player.playerName;
				// Object.defineProperty(gameState.allPlayersNumberOfCards, player.playerName, {
				// 	value: player.numberOfCards,
				// 	writable: false,
				// });

				if (requestingPlayerId === player.playerId) {
					gameState.requestingPlayer = player;
				}
			}
			gameState.openCards = this.openCardDeck;

			// Can get whole player object if needed
			gameState.nameOfPlayerInTurn = this.playerInTurn.playerName;
			gameState.match = this.match;
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
	constructor(cards = []) {
		this.cards = cards;
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

	getLastCard() {
		return this.cards[this.cards.length - 1];
	}

	getFirstCards(numberOfCardsToGet) {
		const cardsToGet = [];
		for (let i = 0; i < numberOfCardsToGet; i++) {
			cardsToGet.push(this.cards[i]);
		}
	}

	// put first card from one deck to the other
	putFirstCardFromOneDeckToAnother(secondDeck) {
		secondDeck.cards.push(this.cards[0]);
	}

	// put last card from one deck to the other
	putLastCardFromOneDeckToAnother(secondDeck) {
		secondDeck.cards.push(this.cards[this.cards.length - 1]);
	}

	//adds card to top of deck
	addCard(card) {
		this.cards.push(card);
	}

	// removes cards from deck
	removeCards(cardsToRemove) {
		for (const cardToRemove of cardsToRemove) {
			for (const card of this.cards) {
				if (card.cardEquals(cardToRemove)) {
					this.cards.splice(this.cards.indexOf(card), 1);
				}
			}
		}
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
