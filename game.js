import { getRandomNumberSequence } from "./utils.js";

export const action = (number,digit) => {
    return { number, digit }
}

export const createGame = (playerLength0, playerLength1) => {   // player0 moves first
    const playerCards0 = getRandomNumberSequence(playerLength0);
    const playerCards1 = getRandomNumberSequence(playerLength1);

    let currentPlayer = 0;
    const history = []

    const getCurrentPlayer = () => {
        return currentPlayer
    }

    const currentPlayerCards = () => {
        return currentPlayer === 0 ? playerCards0 : playerCards1
    }

    const currentPlayerLength = () => {
        return currentPlayer === 0 ? playerLength0 : playerLength1
    }

    const oppPlayerLength = () => {
        return currentPlayer === 0 ? playerLength1 : playerLength0
    }

    const roundover = () => {
        return (history.length !== 0 && history[history.length - 1].number === 0)
    }

    const lastAction = () => {
        if(history.length === 0) return null
        return history[history.length - 1]
    }

    const validAction = action => {
        // zero action is always valid
        if (action.number === 0) return true

        return (action.number <= playerLength0 + playerLength1) &&
                (history.length == 0 || (action.number > history[history.length - 1].number) ||
                (action.number === history[history.length - 1].number && action.digit > history[history.length - 1].digit))
    }

    const step = action => {
        history.push(action)
        currentPlayer = 1 - currentPlayer
    }

    const winner = () => {
        if (!roundover()) {
            throw new Error("Game is not over yet")
        }
        let guesser = currentPlayer
        let lastGuess = history[history.length - 2]
        let guessNumber = lastGuess.number
        let guessDigit = lastGuess.digit
        let guessSucess = (guessNumber <= playerCards0.filter(card => card === guessDigit).length
                                          + playerCards1.filter(card => card === guessDigit).length)
        return guessSucess ? guesser : (1 - guesser)
    }

    const gameover = () => {
        return playerCards0.length === 0 || playerCards1.length === 0
    }

    const Cstate = () => {
        const ACTION_BITS = 5;
        const ACTION_MASK = (1<<(ACTION_BITS))-1;
        const ACTIONS_RECORD = 6;
        const HISTORY_BITS = 30;
        const HISTORY_MASK = (1<<(HISTORY_BITS))-1;
        const CARDS_BITS = 12;
        const HISTORY_SHIFT = ((CARDS_BITS));
        const PLAYER_SHIFT = ((CARDS_BITS)+(HISTORY_BITS));
        
        function CAction(action) {
            if (action.number === 0) return 0;
            return (action.number - 1) * 4 + action.digit;
        }        

        let CHistory = 0

        // only keep the last 4 actions
        let startIdx = Math.max(0,history.length-4)
        if(startIdx % 2 === 1) startIdx ++

        for (let i = startIdx; i < history.length; i++) {
            CHistory = ((CHistory << ACTION_BITS) | CAction(history[i])) & 0x3FFFFFFF;
        }

        let playerCards = currentPlayerCards()
        // sort the cards
        playerCards.sort((a,b) => a - b)

        let CCards = 0;
        for (let i = 0; i < playerCards.length; i++) {
            CCards = (CCards << 2) | (playerCards[i] - 1);
        }

        return BigInt(CCards) | (BigInt(CHistory) << BigInt(HISTORY_SHIFT)) | (BigInt(currentPlayer) << BigInt(PLAYER_SHIFT));
    }

    return {
        playerLength0,
        playerLength1,
        playerCards0,
        playerCards1,
        getCurrentPlayer,
        currentPlayerCards,
        currentPlayerLength,
        oppPlayerLength,
        history,
        roundover,
        lastAction,
        validAction,
        step,
        winner,
        gameover,
        Cstate
    }
}