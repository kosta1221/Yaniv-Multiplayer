"use strict";
document.addEventListener("DOMContentLoaded", onLoad);

function onLoad() {
  let myName = "alon";
  let player;
  let opponents = {};
  let activePlayer;
  let matchNumber;
  let pileDeck;
  const activePlayerMove = {
    "selected-cards": new Deck()
  };
  const playerElement = document.querySelector(".active-player");

  
  updateGameState();
  renderAll();
  updateGameState();

  function startGame() {
    //request for creation of a new game
  }

  function updateGameState() {
    //runs every x seconds and asks for data relevant to player
    const state = netUtils.getGameStateForPlayer(myName);
    player = new Player(
      state.cards,
      state.playersPoints[myName],
      state.playersCardNumbers[myName]
    );
    for (const playerName of state.playerNames) {
      if (playerName === myName) continue;
      const points = state.playersPoints[playerName];
      const numberOfCards = state.playersCardNumbers[playerName];
      opponents[playerName] = new Player(null, points, numberOfCards);
    }
    pileDeck = state.pileDeck;
    if (state.playerInTurn === myName) {
      const allPlayerCards = document.querySelectorAll("#active-player > .card");
      for (const cardElement of allPlayerCards) {
        cardElement.classList.add("selectable");
      }
    }
  }

  function renderAll() {
    //RENDER PLAYER
    for (const card of player.cards) {
      const cardElement = utils.createCardElement(card);
      playerElement.appendChild(cardElement);
    }
    //RENDER OPPONENTS
    const opponentsElements = document.querySelectorAll(".opponent");
    let j = 0;
    for (const opponentName in opponents) {
      const opponentElement = opponentsElements.item(j);
      j++;
      const opponent = opponents[opponentName];
      for (let i = 0; i < opponent.numberOfCards; i++) {
        const cardElement = utils.createCardElement(null, true);
        opponentElement.appendChild(cardElement);
      }
    }
    //RENDER PILE
    const pileDeckElement = document.querySelector("#pile-deck");
    for (const card of pileDeck.cards) {
      const li = document.createElement("li");
      const cardElement = utils.createCardElement(card);
      li.appendChild(cardElement);
      pileDeckElement.appendChild(li);
    }
  }
  
  function collectMoveData(clickedCard) {
    if ( !clickedCard.classList.contains("selectable") ) return;
    const suit = clickedCard.getAttribute("suit");
    const rank = clickedCard.getAttribute("rank");
    const isJoker = clickedCard.getAttribute("is-joker");
    const card = new Card(suit, rank, isJoker);
    if ( clickedCard.classList.contains("selected") ) {
      clickedCard.classList.remove("selected");
      activePlayerMove["selected-cards"].removeCard(card);
    } else {
      clickedCard.classList.add("selected");
      activePlayerMove["selected-cards"].addCard(card);
    }
    const allPlayerCards = document.querySelectorAll("#active-player > .card");
    for (const cardElement of allPlayerCards) {
      if (cardElement === clickedCard) continue;
      const suit = cardElement.getAttribute("suit");
      const rank = cardElement.getAttribute("rank");
      const isJoker = cardElement.getAttribute("is-joker");
      const card = new Card(suit, rank, isJoker);
      console.log(card);
      console.log(verifyMoveEligibility(card));
      if ( !verifyMoveEligibility(card) ) {
        cardElement.classList.replace("selectable", "unselectable");
      } else {
        cardElement.classList.replace("unselectable", "selectable");
      }
    }
  }

  playerElement.addEventListener("click", (e) => {
    let clickedCard = e.target;
    collectMoveData(clickedCard);
  });

  function verifyMoveEligibility(card) {
    //takes a card from player hand and checks if is selectable by comparison to selected cards
    const selectedCards = activePlayerMove["selected-cards"].cards; //object array of active cards [{}]
    if (selectedCards.length === 0) return true;
    const isSameRank = selectedCards[0].rank === card.rank;
    if (isSameRank) return true;
    //let isAllSelectedCardsSameSuit = true;
    for (let i = 0; i < selectedCards.length -1; i++) {
      if ( selectedCards[i] !== selectedCards[i + 1]) return false;
    }
    const isSameSuit = selectedCards[0].suit === card.suit;
    const rankPlace = utils.ranks.indexOf(card.rank);
    const lowSelectedCard = utils.ranks.indexOf(selectedCards[0].rank);  
    const highSelectedCard = utils.ranks.indexOf(selectedCards[selectedCards.length - 1].rank);  
    if (lowSelectedCard - 1 === rankPlace || highSelectedCard + 1 === rankPlace) return true;
    return false;
  }

  function executeMove() {
    //looks at move player is trying to make and asks gameManager to perform
    /*{
            move: //"place" | "yaniv" | "assaf",
            cards: //activeCards | null
        }*/
  }

  function switchPlayer() {
    //myName = state.playerInturn;
  }
}
