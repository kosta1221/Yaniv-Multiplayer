// const classes = require("../classes");

const mockPlayerNames = ["alon", "koren", "kosta", "dvir"];

const mockGame = new Game(mockPlayerNames);

const mockCardsToDiscard = mockGame.playerInTurn.playerDeck.cards.slice(1, 4);
// console.log("The cards I want to discard from alon");
// console.log(mockCardsToDiscard);

// console.log("game upon creation");
// console.log(mockGame);
// console.log(mockGame.getGameState());

// makeTurn(mockGame, false, true, mockCardsToDiscard);
// console.log("Game after turn");
console.log(mockGame);
// console.log(mockGame.getGameState());

function makeTurn(game, callYaniv, isCardToGetFromGameDeck, cardsToDiscard) {
	const playerInTurn = game.playerInTurn;
	const gameDeck = game.gameDeck;
	const openCardDeck = game.openCardDeck;

	// Players have two options for their turn: They may either play one or more cards or call "Yaniv!"
	if (callYaniv) {
	} else {
		// When playing cards, the player may discard a single card or a single set of cards, placing them into the discard pile. The player must then draw a card from the open cards or draw pile.

		playerInTurn.moveCardsFromPlayerDeckToOpenCards(cardsToDiscard, game);
		// console.log(playerInTurn.numberOfCards);
		// console.log(gameDeck);
		// console.log(openCardDeck);
		if (isCardToGetFromGameDeck) {
			// Draw a card from the draw pile (game deck)
			playerInTurn.giveFirstCardFromDeck(gameDeck);

			/* for (let i = 0; i < 34; i++) {
				playerInTurn.giveFirstCardFromDeck(gameDeck);
			} */

			// If the drawing deck is empty and no one has yet called "Yaniv!", then all cards of the free stack, excluding the last player's drop, are shuffled and placed face down as a new deck.
			if (gameDeck.cards.length === 0) {
				// moving all cards from openCardDeck to gameDeck
				gameDeck.cards = [...openCardDeck.cards];
				// removing all cards from openCardDeck
				openCardDeck.cards.splice(0, openCardDeck.cards.length);
				gameDeck.putLastCardFromOneDeckToAnother(openCardDeck);
				gameDeck.cards.pop();
				gameDeck.shuffleDeck();
			}
		} else {
			// Draw a card from the open cards deck instead
			playerInTurn.giveLastCardFromDeck(openCardDeck);
		}
		// console.log(gameDeck);
		// console.log(openCardDeck);

		// console.log(playerInTurn);
		console.log(playerInTurn.numberOfCards);
	}
}
