const mocks = {
  state(player) {
    const state = {
      playersPoints: {
        koren: 15,
        kosta: 12,
        dvir: 21,
      },
      playersCardNumbers: {
        koren: 3,
        kosta: 1,
        dvir: 2,
      },
      cards: [
        new Card("hearts", "jack", false),
        new Card("spades", "10", false),
        new Card("clubs", "king", false),
        new Card("diamonds", "2", false),
        new Card("hearts", "queen", false),
      ],
      pileDeck: pd,
      playerInTurn: name,
      playerNames: this.players,
    };
    return state;
  },
};

// const onPut = (obj) => {
//     updatedState(obj.name) {
//         const updatedState = {
//         }
//     }
//     return updatedState
// }
