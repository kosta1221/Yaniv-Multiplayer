"use strict"
// A class for building player objects
class Player {
	constructor(cards, points, numberOfCards) {
		this.cards = cards;
		this.points = points;
		this.numberOfCards = numberOfCards;
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

// A class for building objects of decks of cards
class Deck {
	constructor() {
		this.cards = [];
	}

	createNewFullDeck() {
		let suits = ["clubs", "diamonds", "hearts", "spades"];
		let ranks = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"];
		for (let i = 0; i < suits.length; i++) {
			for (let j = 0; j < ranks.length; j++) {s
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
	getFirstCard(deck) {
		return deck.cards[0];
	}
}

class PlayerDeck extends Deck {
	constructor() {
		super();
	}

	giveCardFromTopOfDeck(deck) {
		this.cards.push(this.getFirstCard(deck));
		deck.cards.shift();
	}

	giveFiveCardsFromTopOfDeck(deck) {
		for (let i = 0; i < 5; i++) {
			this.cards.push(this.getFirstCard(deck));
			deck.cards.shift();
		}
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

