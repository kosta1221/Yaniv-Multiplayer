"use strict"
const netUtils = {
    getWaitingGames() {

    },
    createGame() {

    },
    joinGame() {

    },
    getState(playerIdentity) {
        //fetch()
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
            openCard: [new Card("hearts", "jack", false), new Card("clubs", "king", false)],
            activePlayer: "alon",
            playerNames: ["alon", "koren"]
        }
        return state;

    },
    play() {

    }
}