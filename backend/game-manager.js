// const classes = require("../classes");

const mockPlayerNames = ["alon", "koren", "kosta", "dvir"];

const mockGame = new Game(mockPlayerNames);

const mockCardsToDiscard = mockGame.playerInTurn.playerDeck.cards.slice(1, 4);
console.log(mockCardsToDiscard);

console.log(mockGame);
console.log(mockGame.getGameState());

console.log(makeTurn(mockGame, false, mockCardsToDiscard));

function makeTurn(game, callYaniv, cardsToDiscard) {
	const playerInTurn = game.playerInTurn;
	const gameDeck = game.gameDeck;

	// Players have two options for their turn: They may either play one or more cards or call "Yaniv!"
	if (callYaniv) {
	} else {
		// When playing cards, the player may discard a single card or a single set of cards, placing them into the discard pile. The player must then draw a card from the draw pile.

		playerInTurn.moveCardsFromPlayerDeckToOpenCards(cardsToDiscard, game);
		console.log(playerInTurn.numberOfCards);

		// Draw a card from the draw pile (game deck)
		playerInTurn.giveCardFromTopOfDeck(gameDeck);
		console.log(playerInTurn);
		console.log(playerInTurn.numberOfCards);

		//Alternatively, the player may choose to take the card played by the previous player from the discard pile. However, if the previous player played a multi-card set, only the first or the last card in the set may be chosen. Note that the two jokers in the deck are taken into consideration.

		// If the drawing deck is empty and no one has yet called "Yaniv!", then all cards of the free stack, excluding the last player's drop, are shuffled and placed face down as a new deck.
	}
}
