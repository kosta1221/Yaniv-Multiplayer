"use strict"
document.addEventListener("DOMContentLoaded", onLoad);

function onLoad() {
    let myName = "alon";
    let player;
    let opponents = {};
    let activePlayer;
    let matchNumber;
    let activeCards;
    
    updateGameState();
    renderAll();
    
    function renderAll() {
        //RENDER PLAYER
        const playerElement = document.querySelector(".active-player");
        for (const card of player.cards) {
            const cardElement = document.createElement("img");
            const src = `./images/cards-svg/${getImageName(card)}.svg`;
            cardElement.setAttribute("src", src);
            cardElement.classList.add("card");
            playerElement.appendChild(cardElement);
        }
        //RENDER OPPONENTS
        const opponentsElements = document.querySelectorAll(".player");
        for (const [index, opponent] of opponents) {
            
        }
    }

    function startGame() {//request for creation of a new game
    }
    
    function updateGameState() {//runs every x seconds and asks for data relevant to player
        const state = netUtils.getState(myName);
        player = new Player(state.cards, state.playersPoints[myName], state.playersCardNumbers[myName]);
        for (const playerName of state.playerNames) {
            if (playerName === myName) continue;
            const points = state.playersPoints[playerName];
            const numberOfCards = state.playersCardNumbers[playerName];
            opponents[playerName] = new Player(null, state.playersPoints[playerName], numberOfCards);
        }
    }

    function executeMove() {//looks at move player is trying to make and asks gameManager to perform
        /*{
            move: //"place" | "yaniv" | "assaf",
            cards: //activeCards | null
        }*/
    }

    function switchPlayer() {
        //myName = state.activePlayer;
    }

    function getImageName(card) {
        let imgName = "";
        if (card.isJoker) return "Black_joker";
        switch (card.rank) {
            case "ace":
                imgName += "A";
                break;
            case "jack":
                imgName += "J";
                break;
            case "queen":
                imgName += "Q";
                break;
            case "king":
                imgName += "K";
                break;
            default:
                imgName += card.rank;
                break;
        }  
        switch (card.suit) {
            case "hearts":
                imgName += "H"
                break;
            case "clubs":
                imgName += "C"
                break;
            case "diamonds":
                imgName += "D"
                break;
            case "spades":
                imgName += "S"
                break;
        }
        return imgName;
    }
}

