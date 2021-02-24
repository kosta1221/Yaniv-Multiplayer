"use strict"
const netUtils = { 
    login() {

    },
    getState(playerIdentity) {
        const state = {
            playersPoints: {
                "alon": 30,
                "koren": 15
            },
            playersCardNumbers: {
                "alon": 5,
                "koren": 3
            },
            cards: [new Card("hearts", "jack", false), new Card("clubs", "king", false)],
            openCard: {
                suit: "spade",
                rank: "A",
                isJocker: false
            },
            activePlayer: "alon",
            numberOfPlayers: 2,
            playerNames: ["alon", "koren"]
        }
        return state;

    },
    play() {

    }
}