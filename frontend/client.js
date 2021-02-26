"use strict";
document.addEventListener("DOMContentLoaded", onLoad);
function onLoad() {
  let myName;
  let id;
  let player;
  let opponents = {};
  let playerInTurn;
  let matchNumber;
  let pileDeck;
  const activePlayerMove = {
    "selected-cards": new Deck(),
  };
  const playerElement = document.querySelector(".active-player");
  const joinButton = document.querySelector("#join-button");
  const readyButton = document.querySelector("#ready-button");
  const playerButtons = document.querySelector("#player-buttons-div");
  joinButton.addEventListener("click", () => {
    const input = document.querySelector("#login");
    const userName = input.value;
    // if (!userName) return;
    myName = userName;
    joinGame();
    joinButton.hidden = true;
    input.hidden = true;
    readyButton.hidden = false;
    readyButton.addEventListener("click", () => {
      netUtils.ready(myName);
      updateGameState();
      renderAll();
    });

    updateGameState();
    renderAll();
  });
  joinButton.click();
  readyButton.click();
  playerElement.addEventListener("click", (e) => {
    let clickedCard = e.target;
    collectMoveData(clickedCard);
  });

  function joinGame() {
    netUtils.joinGame(myName);
    const state = netUtils.getGameStateForPlayer(myName);
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
    playerInTurn = state.playerInTurn;
  }

  function renderAll() {
    const playersStatus = netUtils.getPlayersStatus();
    let isAllReady = true;
    for (const name in playersStatus) {
      isAllReady = isAllReady && playersStatus[name];
    }
    if (!isAllReady) return;
    //RENDER PLAYER
    for (const card of player.cards) {
      const cardElement = utils.createCardElement(card);
      const cardSelectability =
        playerInTurn === myName ? "selectable" : "unselectable";
      cardElement.classList.add(cardSelectability);
      playerElement.appendChild(cardElement);
    }
    //RENDER OPPONENTS
    const opponentsElements = document.querySelectorAll(".opponent");
    let j = 0;
    for (const opponentName in opponents) {
      const opponentElement = opponentsElements.item(j);
      opponentsElements[1].classList.add("flip");
      opponentsElements[2].classList.add("flip");
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
    //RENDER TABLE DECK
    const tableDeckElement = document.querySelector("#table-deck");
    const pileDeckCount = pileDeck.cards.length;
    let opponentsCardCount = 0;
    for (const opponentName in opponents) {
      const opponent = opponents[opponentName];
      opponentsCardCount += opponent.numberOfCards;
    }
    const playerCardCount = player.cards.length;
    const tableDeckCount =
      54 - pileDeckCount - opponentsCardCount - playerCardCount;
    for (let i = 0; i < tableDeckCount + 30; i++) {
      const li = document.createElement("li");
      const cardElement = utils.createCardElement(null, true);
      li.appendChild(cardElement);
      tableDeckElement.appendChild(li);
    }
  }

  function collectMoveData(clickedCard) {
    if (!clickedCard.classList.contains("selectable")) return;

    const suit = clickedCard.getAttribute("suit");
    const rank = clickedCard.getAttribute("rank");
    const isJoker = clickedCard.getAttribute("is-joker");
    const card = new Card(suit, rank, isJoker);

    if (clickedCard.classList.contains("selected")) {
      clickedCard.classList.remove("selected");
      activePlayerMove["selected-cards"].removeCard(card);
    } else {
      clickedCard.classList.add("selected");
      activePlayerMove["selected-cards"].addCard(card);
    }

    const allPlayerCards = document.querySelectorAll("#active-player > .card");
    for (const cardElement of allPlayerCards) {
      if (cardElement.classList.contains("selected")) continue;
      const suit = cardElement.getAttribute("suit");
      const rank = cardElement.getAttribute("rank");
      const isJoker = cardElement.getAttribute("is-joker");
      const card = new Card(suit, rank, isJoker);
      if (!verifyMoveEligibility(card)) {
        cardElement.classList.replace("selectable", "unselectable");
      } else {
        cardElement.classList.replace("unselectable", "selectable");
      }
    }
  }

  function verifyMoveEligibility(card) {
    //takes a card from player hand and checks if is selectable by comparison to selected cards
    const selectedCards = activePlayerMove["selected-cards"].cards; //object array of active cards [{}]
    //no cards selected => true
    if (selectedCards.length === 0) return true;
    //same rank cards => true
    let isAllSelectedCardsSameRank = true;
    for (let i = 0; i < selectedCards.length - 1; i++) {
      if (selectedCards[i].rank !== selectedCards[i + 1].rank)
        isAllSelectedCardsSameRank = false;
    }
    if (isAllSelectedCardsSameRank && card.rank === selectedCards[0].rank)
      return true;
    //same suit series => true
    let isAllSelectedCardsSameSuit = true;
    for (let i = 0; i < selectedCards.length - 1; i++) {
      if (selectedCards[i].suit !== selectedCards[i + 1].suit)
        isAllSelectedCardsSameSuit = false;
    }
    const rankPlace = utils.ranks.indexOf(card.rank);
    const lowSelectedCard = utils.ranks.indexOf(selectedCards[0].rank);
    const highSelectedCard = utils.ranks.indexOf(
      selectedCards[selectedCards.length - 1].rank
    );
    const isOneAboveOrBelow =
      lowSelectedCard - 1 === rankPlace || highSelectedCard + 1 === rankPlace;
    if (
      isAllSelectedCardsSameSuit &&
      isOneAboveOrBelow &&
      card.suit === selectedCards[0].suit
    )
      return true;
    //non of the above => false
    return false;
  }

  function executeMove(move) {
    //looks at move player is trying to make and asks gameManager to perform
    switch (move) {
      case "Place": {
        if (activePlayerMove["selected-cards"].cards.length < 1) {
          Swal.fire({
            icon: "info",
            title: "Oops...",
            text: "You must pick a card!",
            toast: true,
          });
        }
      }
      case "Yaniv!": {
      }
      case "Assaf!": {
      }
    }
  }

  function switchPlayer() {
    //myName = state.playerInturn;
  }

  playerButtons.addEventListener("click", (e) => {
    let clickedBtn = e.target;
    executeMove(clickedBtn.innerHTML);
  });
}
