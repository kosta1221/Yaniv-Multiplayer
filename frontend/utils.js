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
    isPlayValid(play, playerDeck) {
      console.log("in isPlayValid");
      console.log(play, playerDeck);
      const playerCardsValueSum = playerDeck.cards.reduce((sum, card) => {
        return sum + this.getCardValue(card)
      }, 0);
      console.log("sum of cards: " + playerCardsValueSum);
      if (play.move === "yaniv" && playerCardsValueSum <= 7) return true;
      if (play.move === "yaniv" && playerCardsValueSum > 7) throw "Sum of cards values must be less than 7";
      const selectedCards = play.cards.cards;
      if (selectedCards.length < 1 && play.move === "place") throw "You must pick a card!";
      if (selectedCards.length === 1) return true;
      const isAllSelectedCardsSameRank = selectedCards.every((card, i, cards) => cards[0].rank === card.rank);
      if (isAllSelectedCardsSameRank) return true;
      if (selectedCards.length < 3) throw "You must discard at least 3 of same suit";
      const isAllSelectedCardsSameSuit = selectedCards.every((card, i, cards) => cards[0].suit === card.suit);
      selectedCards.sort((a,b) => this.ranks.indexOf(a) - this.ranks.indexOf(b));
      const isCardsConsecutive = selectedCards.every((card, i, cards)=> {
        if(i === 0) return true;
        this.ranks.indexOf(card) === this.ranks.indexOf(cards[i-1].rank) + 1;
      });
      if (isAllSelectedCardsSameSuit && isCardsConsecutive) return true;
      throw "Cards must be consecutive";
    },
    getValidCardsFromOpenDeck(discardedCards){
      if(discardedCards.length === 1) return discardedCards;
      const isCardsConsecutive = discardedCards.every((card, i, cards)=> {
        if (i === 0) return true;
        this.ranks.indexOf(card) === this.ranks.indexOf(cards[i-1].rank) + 1;
      });
      if (isCardsConsecutive) return [discardedCards[0], discardedCards[discardedCards.length - 1]];
      return [discardedCards[discardedCards.length - 1]];
    },
    getCardValue(card) {
      if (card.isJoker) return 0;
      return Math.min(this.ranks.indexOf(card.rank) + 1, 10);
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
    },
    sleep(ms) {
      return new Promise((resolve, reject) => {
        setTimeout(()=>{resolve(true)}, ms);
      });
    }
}