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