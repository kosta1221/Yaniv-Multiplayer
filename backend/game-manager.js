// const classes = require("../classes");

function makeTurn(game, callYaniv, cardsToDiscard, isCardToGetFromGameDeck, cardPickedFromSet) {
	// shortening obvious variables for better readability
	const playerInTurn = game.playerInTurn;
	const gameDeck = game.gameDeck;
	const openCardDeck = game.openCardDeck;
	const players = game.players;
	players.forEach((player) => {
		player.calledYaniv = false;
		player.calledAssaf = false;
	});
	// Players have two options for their turn: They may either play one or more cards or call "Yaniv!"
	if (callYaniv) {
		if (cardPickedFromSet || cardsToDiscard.length !== 0) {
			const turnError = new Error(`Cannot call yaniv and do other things!`);
			turnError.name = "TurnError";
			throw turnError;
		}

		playerInTurn.calledYaniv = true;
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
			players[indexOfPlayerWithLowestSum].calledAssaf = true;
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

		//Finish Match actions
		game.gameDeck.cards = [];
		game.gameDeck.createNewFullDeck();
		game.gameDeck.shuffleDeck();
		game.openCardDeck.cards = [];
		game.gameDeck.putFirstCardFromOneDeckToAnother(game.openCardDeck);
		game.gameDeck.cards.shift();
		game.turnsSinceMatchStart = 0;
		game.match++;
		const newPlayers = [];
		for (let i = 0; i < game.players.length; i++) {
			if (game.players[i].didLose) continue;
			const player = game.players[i];
			player.playerDeck.cards = [];
			player.giveFiveCardsFromTopOfDeck(game.gameDeck);
			player.numberOfCards = 5;
			newPlayers.push(player);
		}
		game.players = newPlayers;
		game.numberOfPlayers = newPlayers.length;
		game.amountOfCardsLastPlayerPutInOpenCardDeck = 0;
		////finish yaniv
	} else {
		console.log(cardsToDiscard);
		// When playing cards, the player may discard a single card or a single set of cards, placing them into the openCardDeck. The player must then draw a card from the open cards or draw pile.

		// rules for cardsToDiscard

		if (cardsToDiscard.length === 1) {
			const cardToDiscard = cardsToDiscard[0];
			// the discarded card has to be from player's cards.
			if (!playerInTurn.playerDeck.cards.some((card) => card.cardEquals(cardToDiscard))) {
				const turnError = new Error(
					`Discarded card has to be in ${playerInTurn.playerName}s cards!`
				);
				turnError.name = "TurnError";
				throw turnError;
			}
		} else if (cardsToDiscard.length > 1) {
			// the discarded cards have to be from player's cards.
			cardsToDiscard.forEach((cardToDiscard) => {
				console.log(cardToDiscard);
				if (!playerInTurn.playerDeck.cards.some((card) => card.cardEquals(cardToDiscard))) {
					const turnError = new Error(
						`Discarded cards have to be in ${playerInTurn.playerName}s cards!`
					);
					turnError.name = "TurnError";
					throw turnError;
				}
			});
			// true if the rank of even one card in cardsToDiscard isn't the same as the rank of the other cards.
			if (!cardsToDiscard.every((card) => card.rank === cardsToDiscard[0].rank)) {
				// If trying to discard a set of 2 cards which don't have the same rank, throw an error!
				if (cardsToDiscard.length === 2) {
					console.log("error3");
					const turnError = new Error(
						`Illegal set of 2 cards, can't throw 2 cards with consecutive order!`
					);
					turnError.name = "TurnError";
					throw turnError;
				}
				// true if the suit of even one card in cardsToDiscard isn't the same as the suit of the other cards.
				if (!cardsToDiscard.every((card) => card.suit === cardsToDiscard[0].suit)) {
					console.log("error4");
					// Throws error when: trying to discard multiple cards, which are not all the same rank and also not all the same suit.
					const turnError = new Error(
						`Illegal set of ${cardsToDiscard.length} cards, they have to be of the same rank or suit!`
					);
					turnError.name = "TurnError";
					throw turnError;
				}
				// true if the suit of every card in cardsToDiscard is the same.
				else {
					// sorting cardsToDiscard by their index in ascending order
					playerInTurn.sortCardsByRankIndex(cardsToDiscard);
					for (let i = 0; i < cardsToDiscard.length - 1; i++) {
						if (cardsToDiscard[i + 1].rankIndex - cardsToDiscard[i].rankIndex !== 1) {
							console.log("error5");
							// Throws error when: trying to discard multiple cards, which are not all the same rank, but do have the same suit, but aren't in order.
							const turnError = new Error(
								`Illegal set of ${cardsToDiscard.length} cards of the ${cardsToDiscard[0].suit} suit, they are not in order!`
							);
							turnError.name = "TurnError";
							throw turnError;
						}
					}
				}
			}
		}

		if (isCardToGetFromGameDeck) {
			// If the player chooses to draw the card from the gameDeck, he cannot pick a card from set.
			if (cardPickedFromSet) {
				console.log("error6");
				const turnError = new Error(
					`Can't pick from the game-deck and open-cards-deck at the same time!`
				);
				turnError.name = "TurnError";
				throw turnError;
			}

			// Draw a card from the draw pile (game deck)
			playerInTurn.giveFirstCardFromDeck(gameDeck);

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
		}
		// Draw a card from the open cards deck instead
		else {
			// If it's the first turn of the game just give him the card that is open
			if (game.turnsSinceMatchStart === 0) {
				playerInTurn.giveLastCardFromDeck(openCardDeck);
			} else {
				let areRanksSame = true;
				let indexOfCardPickedFromSet;
				const iterationStart = openCardDeck.length - game.amountOfCardsLastPlayerPutInOpenCardDeck;

				for (let i = iterationStart; i < openCardDeck.length; i++) {
					if (openCardDeck[iterationStart].rank !== openCardDeck[i].rank) {
						areRanksSame = false;
					}
				}
				if (areRanksSame) {
					// if trying to pick a card from openCardDeck which is part from a set of cards with the same rank
					playerInTurn.giveLastCardFromDeck(openCardDeck);
				} else {
					// If trying to pick a card from open deck which is part of a consecutive set
					if (openCardDeck[iterationStart].rank === cardPickedFromSet.rank) {
						playerInTurn.giveNthCardFromDeck(openCardDeck, iterationStart);
					} else if (openCardDeck[openCardDeck.length - 1].rank === cardPickedFromSet.rank) {
						playerInTurn.giveLastCardFromDeck(openCardDeck);
					} else {
						console.log("error7");
						const turnError = new Error(
							`Trying to pick an illegal card, with rank ${cardPickedFromSet.rank} which is not part of the set that the last player put in the open card deck!`
						);
						turnError.name = "TurnError";
						throw turnError;
					}
				}
			}
		}

		playerInTurn.moveCardsFromPlayerDeckToOpenCards(cardsToDiscard, game);
		game.amountOfCardsLastPlayerPutInOpenCardDeck = cardsToDiscard.length;

		game.turnsSinceMatchStart++;
	}
	game.playerInTurn = players[(players.indexOf(game.playerInTurn) + 1) % game.numberOfPlayers];
}

// Utility function for checking object similarity (not by memory)
// Works when you have simple JSON-style objects without methods and DOM nodes inside.
function areObjectsSimilar(object1, object2) {
	return JSON.stringify(object1) === JSON.stringify(object2);
}

module.exports = { makeTurn, areObjectsSimilar };
