import { action } from './game.js';
import { getRandomNumber,sample } from './utils.js';


export const HeuristicStrategy = game => {
    const safeGuess = [];
    const dangerGuess = [];
    let lastGuess = game.lastAction();

    const playerId = game.getCurrentPlayer();
    const playerCards = game.currentPlayerCards();
    const playerLength = game.currentPlayerLength();
    const oppLength = game.oppPlayerLength();

    for(let i=1; i<=playerLength+oppLength; i++) {
        for(let j=1; j<=4; j++) {
            let guess = action(i,j);
            if(!game.validAction(guess))  continue;
            let estimateCountLow = playerCards.filter(num=>num==j).length+(oppLength+1)/4;
            let estimateCountHigh = playerCards.filter(num=>num==j).length+oppLength/4+1;
            if(i<=estimateCountLow)
                safeGuess.push(guess);
            if(i<=estimateCountHigh)
                dangerGuess.push(guess);
        }
    }

    if (safeGuess.length > 0) {
        let randomIndex = getRandomNumber(0,safeGuess.length-1);
        let guess = safeGuess[randomIndex];
        if(lastGuess && guess.digit != lastGuess.digit && guess.number + lastGuess.number > oppLength+playerLength) {
            // don't make stupid guess
            return "call";
        }
        else
            return safeGuess[randomIndex];
    }
    else if (dangerGuess.length > 0) {
        let randomIndex = getRandomNumber(0,dangerGuess.length-1);
        let guess = dangerGuess[randomIndex];
        if(lastGuess && guess.digit != lastGuess.digit && guess.number + lastGuess.number > playerLength+oppLength) {
            // don't make stupid guess
            return "call";
        }
        else
            return dangerGuess[randomIndex];
    } 
    else if (playerCards.filter(num=>num==lastGuess.digit).length < lastGuess.number) {
        // don't make stupid call
        return "call";
    } 
    else {
        // make a naive guess if don't know what to do
        return action(lastGuess.number+1, lastGuess.digit);
    }
}

export async function PretrainedStrategy(game) {

    // const fs = require('fs');
    // const msgpack = require('@msgpack/msgpack');

    let playerLength0 = game.playerLength0;
    let playerLength1 = game.playerLength1;

    async function fetchAndDecodeMsgpack(filePath) {
        try {
            // Fetch the .msgpack file
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }


            // Read the response as an array buffer
            const arrayBuffer = await response.arrayBuffer();

            // Decode the array buffer using msgpack
            const decodedData = msgpack.decode(new Uint8Array(arrayBuffer),{int64: true});
            
            return decodedData;
            // Handle the decoded data as needed
        } catch (error) {
            console.error("Error fetching or decoding msgpack file:", error);
        }
    }

    const strategy = await fetchAndDecodeMsgpack(`./strategy/${playerLength0}-${playerLength1}.msgpack`);
    console.log("Strategy loaded from strategy.msgpack:", strategy);

    const strategyInstance = strategy[game.Cstate()];
    if(!strategyInstance) {
        console.log("Weird Action, falling into heuristic");
        return HeuristicStrategy(game);
    }


    const actions = strategyInstance[0];
    const probs = strategyInstance[1];

    const retAction = actions[sample(probs)];
    if(retAction == 0) {
        return "call";
    }
    else {
        return action(Math.floor((retAction-1)/4)+1,(retAction-1)%4+1);
    }
}