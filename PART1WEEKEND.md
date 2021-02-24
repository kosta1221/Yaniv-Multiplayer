# ![Scale-Up Velocity](./readme-files/logo-main.png) Yaniv Full Stack Exercise 📋

You will create online Yaniv Game. Playing Yaniv Instrctions [video](https://www.youtube.com/watch?v=8kaDw6lIwek&ab_channel=%D7%9B%D7%90%D7%9F) [text](<https://www.bekaloot.co.il/%D7%9E%D7%93%D7%A8%D7%99%D7%9A-1274-%D7%90%D7%99%D7%9A%20%D7%9E%D7%A9%D7%97%D7%A7%D7%99%D7%9D%20%D7%99%D7%A0%D7%99%D7%91%20(%D7%9E%D7%A9%D7%97%D7%A7%20%D7%A7%D7%9C%D7%A4%D7%99%D7%9D).aspx>)

# Game Rules Standardization

## Objective

- The objective of the game is to earn the fewest points in each round. The player with the fewest points at the end of the game is the winner.
- Each round in the game ends when a player declares "Yaniv!" Each player's score is calculated from their remaining cards. The player with the lowest score wins the round and receives no points for the round. Other players record their corresponding scores for the round.

## Play

- The game proceeds clockwise. Since the starting player in each round has an advantage, the starting player in the first round must be chosen at random. In subsequent rounds, the winner of the previous round becomes the starting player.
- Players have two options for their turn: They may either play one or more cards or call "Yaniv!" When playing cards, the player may discard a single card or a single set of cards, placing them into the discard pile. The player must then draw a card from the draw pile. Alternatively, the player may choose to take the card played by the previous player from the discard pile. However, if the previous player played a multi-card set, only the first or the last card in the set may be chosen. Note that the two jokers in the deck are taken into consideration.
- If the drawing deck is empty and no one has yet called "Yaniv!", then all cards of the free stack, excluding the last player's drop, are shuffled and placed face down as a new deck.

## Sets

A player may discard any of the following sets of cards:

- A single card
- Two or more cards of the same rank
- Three or more cards of consecutive ranks in the same suit. Note that aces are considered low for the purposes of sequences (i.e., an ace can be used before a 2, but not after a king)

## Calling "Yaniv!"

- At the beginning of their turn, instead of playing cards, a player may call "Yaniv!" if their current score (the sum of all card values in the player's hand) is less than an agreed-upon value; this value is often 7, but may be significantly higher. When a player calls "Yaniv!," the round ends, and all players reveal their card totals. If the player who called "Yaniv!" has the lowest card total, they score 0 points; however, if another player has a total less than or equal to the calling player's total (a situation often called "Asaf"), the calling player scores points equal to their card total plus 30 penalty points.
- All other players, regardless of whether their card totals are lower than the calling player's total, score points equal to their card totals. The winner of the round is the player with the lowest card total (not necessarily the player who called "Yaniv"), they become the dealer and the starting player for the next round.

## Ending the game

- When a player's point total (the sum of the totals for each round) crosses a set threshold, that player is eliminated from the game. Once all players but one have been eliminated, the remaining player is declared the winner.
  There are two variations:
- A certain limit is set. Whenever a player crosses that limit, the game ends and the victor is the one with the smallest score. A certain limit is set. Whenever a player crosses that limit, they quit the game. The victor is the last remaining player. The common limit is 200.

## Important stuff!

- When a player's score reaches above **200** points, he is out of the game.
- If you reach exactly **200** points, your score is set back to 0.
- When a player declares 'Yaniv!', but gets beaten by another player's 'Assaf!' call, he is then fined **30** points.

# Instructions

- Create new Github Repository with 2 folders called 'Frontend' & 'Backend'.
- Make changes to the code to meet project's requirements 📝
- [Commit Early, Push Often](https://www.worklytics.co/commit-early-push-often/) - your work will be evaluated by your push history 📖
- Good Luck! 🤘

# Requirments

- Create Yaniv game with up to 4 players that can play on the same window (and see each others cards).
- Cards could be showed as a string like '9 Hearts' or to make it look like a real card.
- Use SASS
- Use Class name 'Card' with properties 'suit': (Spade, Heart, Club, Diamond), 'rank'(A, 1-10, J, Q, K), 'isJocker'(true, false).
- Use Class name 'Deck', and classes 'PlayerDeck', 'TableDeck', and 'PileDeck' which inherit from 'Deck'.
- Create more classes

# Bonus

- Make the game online by using the JSOBBIN like service you built.
- Make the cards look like a real cards.
- Make animations when moving cards.
- Any Feature you wish.

**Add an explanation in `README.md` for each bonus feature you add and a link to any resoure you used**

# Grading policy

- Your project will be graded by the doing all requirments
- Extra freestyle features - Please add an explanation about the bonus features you added to the readme.md
- Code quality and style: indentation, Meaningful and non-disambiguate variable names, Comments documentation
- Visual creativity, use css to make this app look awesome 💅🏿
- Division to reusable functions, no code duplication
- Git usage: meaningful commit messages, small commits, folder and file structures

# Submitting

- Submit your solution repository to the CRM system
- Submit beckend by Sunday 9 am

GOOD LUCK!
