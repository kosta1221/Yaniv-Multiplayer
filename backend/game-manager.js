// const classes = require("../classes");

const mockPlayerNames = ["alon", "koren", "kosta", "dvir"];

const mockGame = new Game(mockPlayerNames);

const mockCardsToDiscard = mockGame.playerInTurn.playerDeck.cards.slice(1, 4);
// console.log("The cards I want to discard from alon");
// console.log(mockCardsToDiscard);

// console.log("game upon creation");
// console.log(mockGame);
// console.log(mockGame.getGameState());

makeTurn(mockGame, false, true, null, mockCardsToDiscard);

// console.log("Game after turn");
console.log(mockGame);
// console.log(mockGame.getGameState());

function makeTurn(game, callYaniv, isCardToGetFromGameDeck, cardPickedFromSet, cardsToDiscard) {
	// shortening obvious variables for better readability
	const playerInTurn = game.playerInTurn;
	const gameDeck = game.gameDeck;
	const openCardDeck = game.openCardDeck;
	const players = game.players;

	// Players have two options for their turn: They may either play one or more cards or call "Yaniv!"
	if (callYaniv) {
		let winningPlayer;
		let playersRoundPointSum = [];
		const indexOfPlayerInTurn = players.indexOf(playerInTurn);
		for (const player of players) {
			let playerRoundPointSum = player.calculateRoundPointsBasedOnRank();
			playersRoundPointSum.push(playerRoundPointSum);
		}
		const indexOfPlayerWithLowestSum = playersRoundPointSum.indexOf(
			Math.min(...playersRoundPointSum)
		);

		// Assaf
		if (indexOfPlayerWithLowestSum !== indexOfPlayerInTurn) {
			winningPlayer = players[indexOfPlayerWithLowestSum];
			for (let i = 0; i < playersRoundPointSum.length; i++) {
				if (i === indexOfPlayerInTurn) {
					players[i].points += 30 + playersRoundPointSum[i];
				} else if (i !== indexOfPlayerWithLowestSum) {
					players[i].points += playersRoundPointSum[i];
				}

				// if a player reaches pointsToLose exactly his points are set back to 0
				if (players[i].points === game.pointsToLose) {
					players[i].points = 0;
				}

				// if a player's score goes above game.pointsToLose he loses
				if (players[i].points > game.pointsToLose) {
					players[i].didLose = true;
				}
			}
		}
		// Yaniv successful
		else {
			for (let i = 0; i < playersRoundPointSum.length; i++) {
				if (i !== indexOfPlayerInTurn) {
					players[i].points += playersRoundPointSum[i];
				}

				// if a player reaches pointsToLose exactly his points are set back to 0
				if (players[i].points === game.pointsToLose) {
					players[i].points = 0;
				}

				// if a player's score goes above game.pointsToLose he loses
				if (players[i].points > game.pointsToLose) {
					players[i].didLose = true;
				}
			}
		}
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

	game.turnsSinceStart++;
	game.playerInTurn = players[(players.indexOf(game.playerInTurn) + 1) % game.numberOfPlayers];
}
