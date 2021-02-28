"use strict";
document.addEventListener("DOMContentLoaded", onLoad);
async function onLoad() {
  let myName;
  let id;
  let player;
  let opponents = {};
  let playerInTurn;
  let matchNumber;
  let pileDeck;
  let allPlayersPoints;
  const activePlayerMove = { "selected-cards": new Deck() };
  const lastDiscardedCards = [new Card("clubs", "5", false), new Card("clubs", "6", false), new Card("clubs", "7", false)];

  const playerElement = document.querySelector(".active-player");
  const joinButton = document.querySelector("#join-button");
  const readyButton = document.querySelector("#ready-button");
  const playerButtons = document.querySelector("#player-buttons-div");
  const playerButtonsMobile = document.querySelector("#player-buttons-mobile");
  const oppNames = document.querySelectorAll(".opp-name");
  const body = document.getElementsByTagName("BODY")[0];
  const input = document.querySelector("#login");

  
  joinButton.addEventListener("click", async () => {
    const userName = input.value;
    if (!userName) {
      input.focus();
      return;
    }
    myName = userName;
    await joinGame();
    joinButton.hidden = true;
    input.hidden = true;
    readyButton.hidden = false;
    console.log("show ready button");
  });

  input.addEventListener("keydown", (event) => {
    if (event.keyCode == 13 || event.which == 13) {
      joinButton.click();
    }
  });

  readyButton.addEventListener("click", async () => {
    netUtils.ready(myName);
    await updateGameState();
    renderAll();
    readyButton.hidden = true;
    playerButtons.style.visibility = "visible";
    playerButtonsMobile.style.visibility = "visible";
    oppNames.forEach((name) => {
      name.style.display = "unset";
    });
  });
  
  playerElement.addEventListener("click", (e) => {
    let clickedCard = e.target;
    collectMoveData(clickedCard);
  });

  playerButtons.addEventListener("click", (e) => {
    let clickedBtn = e.target;
    executeMove(clickedBtn.innerHTML);
  });

  document.querySelector("#pile-deck").addEventListener("click", (e) => {
    if (lastDiscardedCards.length === 0) return;
    if (activePlayerMove["selected-cards"].cards.length === 0) return;
    const pileSelection = document.querySelector("#pile-selection");
    pileSelection.innerHTML = "";
    if (pileSelection.getAttribute("expanded") === "true") {
      pileSelection.setAttribute("expanded", "false");
      return;
    }
    pileSelection.setAttribute("expanded", "true");
    const bottomCard = utils.createCardElement(lastDiscardedCards[0]);
    const cardSelectability = playerInTurn === myName ? "selectable" : "unselectable";
    bottomCard.classList.add(cardSelectability);
    pileSelection.appendChild(bottomCard);
    if (lastDiscardedCards.length > 1) {
      const topCard = utils.createCardElement(lastDiscardedCards[lastDiscardedCards.length-1]);
      topCard.classList.add(cardSelectability);
      pileSelection.appendChild(topCard);
    }
  });

  setInterval(() => {
    if (playerInTurn === myName) return;
    updateGameState();
    renderAll();
  }, 4000);

  input.focus();
  playerButtons.style.visibility = "hidden";
  playerButtonsMobile.style.visibility = "hidden";
  const STARTFAST = false; //change to false for full join sequence
  if (STARTFAST) {
    document.querySelector("#login").value = "fast-name";
    joinButton.click();
    await setTimeout(()=>{}, 1000);
    readyButton.click();
  }

  async function joinGame() {
    const joinstatus = await netUtils.joinGame(myName);
    const state = await netUtils.getGameStateForPlayer(myName);
    sessionStorage.setItem("gameStarted", "true");
  }
  
  async function updateGameState() {
    //runs every x seconds and asks for data relevant to player
    const state = await netUtils.getGameStateForPlayer(myName);
    allPlayersPoints = state.playersPoints;
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
    const playersElements = Array.from(document.querySelectorAll(".player"));
    playersElements.forEach((elem) => (elem.innerHTML = ""));
    const stacks = Array.from(document.querySelectorAll(".stack"));
    stacks.forEach((elem) => (elem.innerHTML = ""));
    const playerBox = document.createElement("div");
    const playerInfo = document.createElement("p");
    const lineBreak = document.createElement("BR");
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
    playerBox.setAttribute("id", "player-tag");
    playerInfo.setAttribute("id", "my-name");
    playerInfo.appendChild(document.createTextNode(`Name: ${myName}`));
    playerInfo.appendChild(lineBreak);
    playerInfo.appendChild(
      document.createTextNode(`Points: ${allPlayersPoints[myName]}`)
    );
    playerBox.appendChild(playerInfo);
    playerElement.appendChild(playerBox);

    //RENDER OPPONENTS
    const opponentsElements = document.querySelectorAll(".opponent");
    let j = 0;
    for (const opponentName in opponents) {
      const opponentNameTag = document.querySelector(`#opp-name${j + 1}`);
      const opponentElement = opponentsElements.item(j);
      const pointsSpan = document.createElement("span");
      opponentsElements[1].classList.add("flip");
      opponentsElements[2].classList.add("flip");
      opponentNameTag.appendChild(pointsSpan);
      opponentNameTag.innerHTML = `${opponentName}, <span id="point-span">Points: ${allPlayersPoints[opponentName]}</span>`;
      opponentNameTag.hidden = false;
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
    for (let i = 0; i < tableDeckCount; i++) {
      const li = document.createElement("li");
      const cardElement = utils.createCardElement(null, true);
      li.appendChild(cardElement);
      tableDeckElement.appendChild(li);
    }
    if (playerInTurn === myName) {
      body.setAttribute("disable-select", "false");
    } else {
      body.setAttribute("disable-select", "true");
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
      makeShiny();
      activePlayerMove["selected-cards"].removeCard(card);
    } else {
      clickedCard.classList.add("selected");
      makeShiny("true");
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
    const isAllSelectedCardsSameRank = selectedCards.every((card, i, cards) => cards[0].rank === card.rank);
    if (isAllSelectedCardsSameRank && card.rank === selectedCards[0].rank)
      return true;
    //same suit series => true
    const isAllSelectedCardsSameSuit = selectedCards.every((card, i, cards) => cards[0].suit === card.suit);
    const rankPlace = utils.ranks.indexOf(card.rank);
    const lowSelectedCard = utils.ranks.indexOf(selectedCards[0].rank);
    const highSelectedCard = utils.ranks.indexOf(selectedCards[selectedCards.length - 1].rank);
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
    const selectedPlayerCards = activePlayerMove["selected-cards"].cards;
    switch (move) {
      case "Place": {
        if (selectedPlayerCards.length < 1) {
          Swal.fire({
            icon: "info",
            title: "Oops...",
            text: "You must pick a card!",
            toast: true,
          });
        } else {
          netUtils.play({
            move: "place",
            cards: activePlayerMove["selected-cards"],
          });
        }
      }
      case "Yaniv!": {
        netUtils.play({
          move: "yaniv",
          cards: null,
        });
      }
      case "Assaf!": {
        netUtils.play({
          move: "assaf",
          cards: null,
        });
      }
    }
    activePlayerMove["selected-cards"].cards = [];
    updateGameState();
    renderAll();
  }
  
  function makeShiny(bool) {
    const pileDeckElement = document.querySelector("#pile-deck");
    if (bool) {
      pileDeckElement.classList.add("shimmer-pile");
    } else if (!bool) {
      pileDeckElement.classList.remove("shimmer-pile");
    }
  }
}

// TODO:
//add dicarded cards selection
// add player points and opp points
