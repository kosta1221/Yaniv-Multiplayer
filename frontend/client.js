"use strict";
document.addEventListener("DOMContentLoaded", onLoad);
async function onLoad() {

  let isGameStarted = false;
  let myName;
  let id;
  let player;
  let opponents = {};
  let playerInTurn = null;
  let matchNumber = 1;
  let pileDeck = null;
  let allPlayersPoints;
  const activePlayerMove = { 
    cardPickedFromSet: null,
    "selected-cards": new Deck() 
  };
  let lastDiscardedCards = [];
  let timesMessageShowed = 0;
  
  const playerElement = document.querySelector(".active-player");
  const joinButton = document.querySelector("#join-button");
  const readyButton = document.querySelector("#ready-button");
  const placeButton = document.querySelector("#place-button");
  const yanivButton = document.querySelector("#yaniv-button");
  const oppNames = document.querySelectorAll(".opp-name");
  const body = document.getElementsByTagName("BODY")[0];
  const input = document.querySelector("#login");
  
  document.querySelector("#game-message").style.display = "none";
  
  joinButton.addEventListener("click", async () => {
    const userName = input.value;
    try {
      joinGame(userName);
      
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "info",
        title: "Oops...",
        text: error,
        toast: true,
      });
      input.focus();
      return;
    }
    
  });
  
  input.addEventListener("keydown", (event) => {
    if (event.keyCode == 13 || event.which == 13) {
      joinButton.click();
    }
  });
  
  readyButton.addEventListener("click", async () => {
    netUtils.startGame(id);

  });
  
  playerElement.addEventListener("click", (e) => {
    let clickedCard = e.target;
    collectMoveData(clickedCard);
  });
  
  placeButton.addEventListener( "click", (e) => executeMove("Place") );
  yanivButton.addEventListener( "click", (e) => executeMove("Yaniv!") );
  
  document.querySelector("#pile-deck").addEventListener("click", (e) => {
    const pileSelection = document.querySelector("#pile-selection");
    pileSelection.innerHTML = "";
    if (pileSelection.getAttribute("expanded") === "true") {
      pileSelection.setAttribute("expanded", "false");
      activePlayerMove.cardPickedFromSet = null;
      return;
    }
    pileSelection.setAttribute("expanded", "true");
    const cardElements = lastDiscardedCards.map( card => utils.createCardElement(card) );
    for (const cardElement of cardElements) {
      cardElement.classList.add("selectable");
      pileSelection.appendChild(cardElement);
    }
  });

  document.querySelector("#pile-selection").addEventListener("click", (e) => {
    const cardElement = e.target; 
    if ( !cardElement.classList.contains("card") ) return;
    if ( cardElement.classList.contains("unselectable") ) return;
    //select unselect card
    if ( cardElement.classList.contains("selected") ) {
      activePlayerMove.cardPickedFromSet = null;
      cardElement.classList.remove("selected");
    } else {
      const card = utils.getCardFromElement(cardElement);
      activePlayerMove.cardPickedFromSet = card;
      cardElement.classList.add("selected");
    }
    //check other cards selectability
    const openCards = Array.from(document.querySelector("#pile-selection").querySelectorAll(".card"));
    for(const openCardElement of openCards) {
      if(openCardElement === cardElement) continue;
      if(activePlayerMove.cardPickedFromSet !== null) {
        openCardElement.classList.replace("selectable", "unselectable");
      } else {
        openCardElement.classList.replace("unselectable", "selectable");
      }
    }
  });
  
  socket.on("playerCreated", (data) => {
    id = data.playerId;
    joinButton.hidden = true;
    input.hidden = true;
    readyButton.hidden = false;
  });
  socket.on("otherPlayerCreated", () => {});
  socket.on("gameCreated", async rawState => {
    readyButton.hidden = true;
    placeButton.style.visibility = "visible";
    yanivButton.style.visibility = "visible";
    oppNames.forEach((name) => {
      name.style.display = "unset";
    });
    const state = netUtils.convertState(rawState);
    await updateGameState(state);
    renderAll();
  });
  socket.on("update", async rawState => {
    const state = netUtils.convertState(rawState);
    await updateGameState(state);
    renderAll();
  });
  socket.on("error", err => console.log(err));
  
  function joinGame(name) {
    if(!name) throw "must enter a name";
    myName = name;
    netUtils.joinGame(myName);
  }
  /* Show message, for an amount of time in ms */
  async function showMessage(message, time, color) {
    document.querySelector("#game-message").innerText = message;
    document.querySelectorAll("body :not(#game-message)").forEach((element) => {
      element.style.filter = "blur(3px)";
      document.body.style.background = color;
    });
    document.body.style.pointerEvents = "none";
    document.querySelector("#game-message").style.display = "inline-block";

    if (message === "Yaniv") {
      document.querySelector("#yaniv-audio").play();
    } else if (message === "Assaf") {
      document.querySelector("#assaf-audio").play();
    }
    
    return new Promise(resolve => {
        setTimeout(() => {
        document.querySelectorAll("body :not(#game-message)").forEach((element) => {
          element.style.filter = "";
          document.body.style.background = "";
        });
        document.body.style.pointerEvents = "auto";
        document.querySelector("#game-message").style.display = "none";

        
        
        resolve();
      }, time)
    })
  }

  async function updateGameState(state) {
    console.log("game state:");
    console.log(JSON.stringify(state));
    playerInTurn = state.playerInTurn;
    allPlayersPoints = state.allPlayersPoints;
    player = new Player(
      myName,
      null,
      allPlayersPoints[myName],
      state.playerDeck
    );
    for (const playerName of state.allPlayersNames) { 
      if (playerName === myName) continue;
      const points = allPlayersPoints[playerName];
      const numberOfCards = state.allPlayersNumberOfCards[playerName];
      opponents[playerName] = new Player(playerName, null, points, null);
      opponents[playerName].numberOfCards = numberOfCards;
      if(playerName === state.playerCalledYaniv) opponents[playerName].calledYaniv = true; 
      if(playerName === state.playerCalledAssaf) opponents[playerName].calledAssaf = true; 
    }

    const pileDeckLastTurn = pileDeck;
    pileDeck = state.openCards;

    //figure out what cards from open pile are selectable
    if (state.turnsSinceMatchStart === 0) {
      lastDiscardedCards = pileDeck.cards;
    } else {
      const openCardsDiff = pileDeck.cards.length - pileDeckLastTurn.cards.length;
      let cardsPlacedLastTurn = pileDeck.cards.filter( (card, i) => i >= pileDeck.cards.length - openCardsDiff);
      if(openCardsDiff === 0) cardsPlacedLastTurn = [ pileDeck.cards[pileDeck.cards.length - 1] ];
      const sameRank = cardsPlacedLastTurn.every((card, i, cards) => cards[0].rank === card.rank);
      if(cardsPlacedLastTurn.length >= 3 && !sameRank) lastDiscardedCards = [cardsPlacedLastTurn[0], cardsPlacedLastTurn.pop()];
      else lastDiscardedCards = [cardsPlacedLastTurn.pop()];
    }

    matchNumber = state.match;
    // SHOW YANIV / ASSAF MESSAGE
    if (state.playerCalledYaniv && matchNumber === timesMessageShowed + 2) {
      await showMessage("Yaniv", 3000,  "#d90000");
      if (state.playerCalledAssaf) {
        await showMessage("Assaf", 3000 , "#0080cd");
      }
      timesMessageShowed++;
    }
  }
  async function MatchStartAnimation() {
    const tableDeckElement = document.querySelector("#table-deck");
    const tableDeckBCR = tableDeckElement.getBoundingClientRect();
    const tableDeckCoords = {x: tableDeckBCR.x, y: tableDeckBCR.y};
    if (matchNumber > 1) {
      
    
      //show Yaniv! on player who called yaniv
      //show Assaf! on player who called assaf
      //collect all cards to game deck
    }
    //render game deck
    for (let i = 0; i < 54; i++) {
      const li = document.createElement("li");
      const cardElement = utils.createCardElement(null, true);
      li.appendChild(cardElement);
      tableDeckElement.appendChild(li);
    }
    const allCardElements = Array.from( tableDeckElement.querySelectorAll(".card") );
    let cardIndex = allCardElements.length - 1;
    //give cards to players
    const allPlayerElements = Array.from( document.querySelectorAll(".player") );
    for(const playerElement of allPlayerElements) {
      const playerElemBCR = playerElement.getBoundingClientRect();
      const playerCoords = {x: playerElemBCR.x, y: playerElemBCR.y};
      const vector = {x: playerCoords.x - tableDeckCoords.x, y: playerCoords.y - tableDeckCoords.y};
      for(let i = 0; i < 5; i++) {
        const card = allCardElements[cardIndex];
        card.style.transition = "all 200ms";
        card.style.transform = `translate(${vector.x}, ${vector.y})`;
        cardIndex--;
        await utils.sleep(100);
      }
    }
    //place card open
    const pileElemBCR = document.querySelector("#pile-deck").getBoundingClientRect();
    const pileElemCoords = {x: pileElemBCR.x, y: pileElemBCR.y};
    const vector = {x: pileElemCoords.x - tableDeckCoords.x, y: pileElemCoords.y - tableDeckCoords.y};
    const card = allCardElements[cardIndex];
    card.style.transition = "all 200ms";
    card.style.transform = `translate(${vector.x}, ${vector.y})`;
  }

  function renderAll() {
    
    const playerDeckElements = Array.from(document.querySelectorAll(".deck"));
    playerDeckElements.forEach((elem) => (elem.innerHTML = ""));
    const stacks = Array.from(document.querySelectorAll(".stack"));
    stacks.forEach((elem) => (elem.innerHTML = ""));
    document.querySelector("#pile-selection").innerHTML = "";
    const playerBox = document.querySelector("#player-tag");
    playerBox.innerHTML = "";
    const playerInfo = document.createElement("p");
    const lineBreak = document.createElement("BR");
 
    //RENDER PLAYER
    console.log("showing player info");
    const playerDeckElement = playerElement.querySelector(".deck");
    playerDeckElement.classList.add("deck", "horizontal");
    for (const card of player.playerDeck.cards) {
      const cardElement = utils.createCardElement(card);
      const cardSelectability =
        playerInTurn === myName ? "selectable" : "unselectable";
      cardElement.classList.add(cardSelectability);
      playerDeckElement.appendChild(cardElement);
    }
    playerInfo.setAttribute("id", "my-name");
    playerInfo.appendChild(document.createTextNode(`Name: ${myName}`));
    playerInfo.appendChild(lineBreak);
    playerInfo.appendChild(
      document.createTextNode(`Points: ${allPlayersPoints[myName]}`)
    );
    playerBox.appendChild(playerInfo);

    //RENDER OPPONENTS
    const opponentsElements = document.querySelectorAll(".opponent");
    let j = 0;
    opponentsElements[1].classList.add("flip");
    opponentsElements[2].classList.add("flip");
    for (const opponentName in opponents) {
      const opponentElement = opponentsElements.item(j);
      const pointsSpan = document.createElement("span");
      const opponentNameTag = document.querySelector(`#opp-name${j + 1}`);
      opponentNameTag.appendChild(pointsSpan);
      opponentNameTag.innerHTML = `${opponentName}, <span id="point-span">Points: ${allPlayersPoints[opponentName]}</span>`;
      opponentNameTag.hidden = false;
      j++;
      const opponent = opponents[opponentName];
      const opponentDeck = opponentElement.querySelector(".deck"); 
      for (let i = 0; i < opponent.numberOfCards; i++) {
        const cardElement = utils.createCardElement(null, true);
        opponentDeck.appendChild(cardElement);
      }
    }
    //RENDER PILE
    const pileDeckElement = document.querySelector("#pile-deck");
    makeShiny(myName === playerInTurn);
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
    const playerCardCount = player.playerDeck.cards.length;
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

    const card = utils.getCardFromElement(clickedCard);
    console.log("card created from Element");
    if (clickedCard.classList.contains("selected")) {
      clickedCard.classList.remove("selected");
      activePlayerMove["selected-cards"].removeCards([card]);
    } else {
      clickedCard.classList.add("selected");
      activePlayerMove["selected-cards"].addCard(card);
    }
    console.log('after card clicked');
    console.log( JSON.stringify(activePlayerMove) );

    const allPlayerCards = document.querySelectorAll("#active-player > .deck > .card");
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
    const selectedCards = activePlayerMove["selected-cards"].cards;
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

  async function executeMove(move) {
    if(playerInTurn !== myName) return;
    console.log("you pressed: " + move);
    //looks at move player is trying to make and asks gameManager to perform
    const selectedCards = activePlayerMove["selected-cards"];
    try {
      const isCardToGetFromGameDeck = activePlayerMove.cardPickedFromSet === null;
      const moveName = move === "Place" ? "place" : move === "Yaniv!" ? "yaniv" : null; 
      const playObject = {
        move: moveName,
        cards: selectedCards,
        isCardToGetFromGameDeck,
        cardPickedFromSet: activePlayerMove.cardPickedFromSet
      };
      if ( utils.isPlayValid(playObject, player.playerDeck) ) {
        await netUtils.play(playObject, id);
      }
    } catch (error) {
      Swal.fire({
        icon: "info",
        title: "Oops...",
        text: error,
        toast: true,
      });
    }
    activePlayerMove["selected-cards"].cards = [];
    activePlayerMove.cardPickedFromSet = null;
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
