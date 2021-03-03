const utils = {
    suits: ["clubs", "diamonds", "hearts", "spades"],
    ranks: ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"],
    createCardElement(card, upSideDown = false) {
        const cardElement = document.createElement("img");
        let src;
        if (upSideDown) {
        src = `./images/cards-svg/Card_back.svg`;
        cardElement.setAttribute("src", src);
        cardElement.classList.add("card");
        return cardElement;
        }
        src = `./images/cards-svg/${this.getImageName(card)}.svg`;
        cardElement.setAttribute("src", src);
        cardElement.setAttribute("suit", `${card.suit}`);
        cardElement.setAttribute("rank", `${card.rank}`);
        cardElement.setAttribute("is-joker", `${card.isJoker}`);
        cardElement.classList.add("card");
        return cardElement;
    },
    getCardFromElement(cardElement) {
      const suit = cardElement.getAttribute("suit")=== "null" ? null : cardElement.getAttribute("suit");
    const rank = cardElement.getAttribute("rank") === "null" ? null : cardElement.getAttribute("rank");
    const isJoker = cardElement.getAttribute("is-joker") === "true" ? true : false;
    return new Card(suit, rank, isJoker);
    },
    isPlayValid(play) {
      // move: "place",
      // cards: activePlayerMove["selected-cards"],
      // isCardToGetFromGameDeck,
      // cardPickedFromSet: activePlayerMove.cardToTake
      const selectedCards = play.cards.cards;
      if(selectedCards.length < 1 && play.move === "place") return false;
      const isAllSelectedCardsSameRank = selectedCards.every((card, i, cards) => cards[0].rank === card.rank);
      if(isAllSelectedCardsSameRank) return true;
      const isAllSelectedCardsSameSuit = selectedCards.every((card, i, cards) => cards[0].suit === card.suit);
      selectedCards.reduce((prevCard, curCard)=> this.ranks.indexOf(prevCard) === this.ranks.indexOf(curCard) - 1);

    },
    getImageName(card) {
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
            imgName += "H";
            break;
          case "clubs":
            imgName += "C";
            break;
          case "diamonds":
            imgName += "D";
            break;
          case "spades":
            imgName += "S";
            break;
        }
        return imgName;
      }
}