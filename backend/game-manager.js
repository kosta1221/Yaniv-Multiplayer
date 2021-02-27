// const classes = require("../classes");

const mockPlayerNames = ["alon", "koren", "kosta", "dvir"];

const mockGame = new Game(mockPlayerNames);

const mockCardsToDiscard = mockGame.playerInTurn.playerDeck.cards.slice(1, 4);
const mockCardsToDiscard2 = [new Card("spades", "king", false), new Card("hearts", "king", false)];

// console.log("The cards I want to discard from alon");
// console.log(mockCardsToDiscard);

// console.log("game upon creation");
// console.log(mockGame);
// console.log(mockGame.getGameState());

try {
	makeTurn(mockGame, true);
	// makeTurn(mockGame, false, [new Card("hearts", "king", false)], false, null);
} catch (error) {
	console.log(error);
}

// console.log("Game after turn");
console.log(mockGame);
// console.log(mockGame.getGameState());

function makeTurn(game, callYaniv, cardsToDiscard, isCardToGetFromGameDeck, cardPickedFromSet) {
	// shortening obvious variables for better readability
	const playerInTurn = game.playerInTurn;
	const gameDeck = game.gameDeck;
	const openCardDeck = game.openCardDeck;
	const players = game.players;

	// Players have two options for their turn: They may either play one or more cards or call "Yaniv!"
	if (callYaniv) {
		if (isCardToGetFromGameDeck !== undefined || cardPickedFromSet || cardsToDiscard) {
			throw new Error(`Cannot call yaniv and do other things!`);
		}

		let playersRoundPointSum = [];
		const indexOfPlayerInTurn = players.indexOf(playerInTurn);
		for (const player of players) {
			let playerRoundPointSum = player.calculateRoundPointsBasedOnRank();
			playersRoundPointSum.push(playerRoundPointSum);
		}
		let indexOfPlayerWithLowestSum = playersRoundPointSum.indexOf(
			Math.min(...playersRoundPointSum)
		);

		// indexOfPlayerWithLowestSum is the same as the player in turn, and there can be a similar sum in the rest of the array (because indexOf returns the first instance of the minimum value found) which we need to check for.
		if (indexOfPlayerWithLowestSum === indexOfPlayerInTurn) {
			const secondPotentialIndexOfPlayerWithLowestSum = playersRoundPointSum.indexOf(
				Math.min(...playersRoundPointSum.slice(indexOfPlayerWithLowestSum + 1)),
				indexOfPlayerWithLowestSum + 1
			);
			console.log(secondPotentialIndexOfPlayerWithLowestSum);
			//If the check was successful, meaning that there was in fact a similar sum in the rest of the array, we need to check if it is equal to the first one (assaf), then we reassign value of indexOfPlayerWithLowestSum
			if (
				playersRoundPointSum[secondPotentialIndexOfPlayerWithLowestSum] ===
				playersRoundPointSum[indexOfPlayerWithLowestSum]
			) {
				indexOfPlayerWithLowestSum = secondPotentialIndexOfPlayerWithLowestSum;
			}
		}

		// Assaf
		if (indexOfPlayerWithLowestSum !== indexOfPlayerInTurn) {
			console.log("In assaf");
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
			console.log("In yaniv");
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
		console.log(cardsToDiscard);
		// When playing cards, the player may discard a single card or a single set of cards, placing them into the openCardDeck. The player must then draw a card from the open cards or draw pile.

		// rules for cardsToDiscard

		if (cardsToDiscard.length === 1) {
			const cardToDiscard = cardsToDiscard[0];
			// the discarded card has to be from player's cards.
			if (!playerInTurn.playerDeck.cards.some((card) => areObjectsSimilar(card, cardToDiscard))) {
				throw new Error(`Discarded card has to be in ${playerInTurn.playerName}s cards!`);
			}
		} else if (cardsToDiscard.length > 1) {
			// the discarded cards have to be from player's cards.
			cardsToDiscard.forEach((cardToDiscard) => {
				console.log(cardToDiscard);
				console.log(playerInTurn.playerDeck.cards[5]);
				console.log(areObjectsSimilar(playerInTurn.playerDeck.cards[5], cardToDiscard));
				if (!playerInTurn.playerDeck.cards.some((card) => areObjectsSimilar(card, cardToDiscard))) {
					throw new Error(`Discarded cards have to be in ${playerInTurn.playerName}s cards!`);
				}
			});
			// true if the rank of even one card in cardsToDiscard isn't the same as the rank of the other cards.
			if (!cardsToDiscard.every((card) => card.rank === cardsToDiscard[0].rank)) {
				// true if the suit of even one card in cardsToDiscard isn't the same as the suit of the other cards.
				if (!cardsToDiscard.every((card) => card.suit === cardsToDiscard[0].suit)) {
					// Throws error when: trying to discard multiple cards, which are not all the same rank and also not all the same suit.
					throw new Error(
						`Illegal set of ${cardsToDiscard.length} cards, they have to be of the same rank or suit!`
					);
				}
				// true if the suit of every card in cardsToDiscard is the same.
				else {
					// sorting cardsToDiscard by their index in ascending order
					playerInTurn.sortCardsByRankIndex(cardsToDiscard);
					for (let i = 0; i < cardsToDiscard.length - 1; i++) {
						if (cardsToDiscard[i + 1].rankIndex - cardsToDiscard[i].rankIndex !== 1) {
							// Throws error when: trying to discard multiple cards, which are not all the same rank, but do have the same suit, but aren't in order.
							throw new Error(
								`Illegal set of ${cardsToDiscard.length} cards of the ${cardsToDiscard[0].suit} suit, they are not in order!`
							);
						}
					}
				}
			}
		}

		playerInTurn.moveCardsFromPlayerDeckToOpenCards(cardsToDiscard, game);
		// console.log(playerInTurn.numberOfCards);
		// console.log(gameDeck);
		// console.log(openCardDeck);
		if (isCardToGetFromGameDeck) {
			// If the player chooses to draw the card from the gameDeck, he cannot pick a card from set.
			if (cardPickedFromSet) {
				throw new Error(`Can only pick from a set of cards from the openCardDeck!`);
			}

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

// Utility function for checking object similarity (not by memory)
// Works when you have simple JSON-style objects without methods and DOM nodes inside.
function areObjectsSimilar(object1, object2) {
	return JSON.stringify(object1) === JSON.stringify(object2);
}
