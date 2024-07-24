import { action } from './game.js';
import { getRandomNumber,sample,fetchAndDecodeMsgpack } from './utils.js';
import { loadMsgpackFile } from './msgpackLoader.js';


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
    if(game.lastAction() ) {
        if((game.lastAction().number > 8 || (game.lastAction().number == 8 && game.lastAction().digit == 4)))
            return "call";
        if((game.lastAction().number > game.oppPlayerLength() + game.currentPlayerCards().filter(num=>num==game.lastAction().digit).length))
            return "call";
    }

    let playerLength0 = game.playerLength0;
    let playerLength1 = game.playerLength1;

    let {state, swithTurn} = game.Cstate();
    const arrayBuffer = await loadMsgpackFile(`./strategy/${playerLength0}-${playerLength1}-core.msgpack`);
    const strategy = msgpack.decode(new Uint8Array(arrayBuffer),{int64: true});
    let strategyInstance = strategy[state];

    if(strategyInstance) {
        console.log("fetching from core strategy");
    }
    else {
        for(let i = game.history.length;i>=0;i--) {
            if(game.history.length > 0 && i == 0)   continue;
            
            let {state, swithTurn} = game.Cstate(i);
            if(!swithTurn) {
                const arrayBuffer = await loadMsgpackFile(`./strategy/${playerLength0}-${playerLength1}.msgpack`);
                const strategy = msgpack.decode(new Uint8Array(arrayBuffer),{int64: true});
                strategyInstance = strategy[state];
                if(strategyInstance) {
                    console.log(`considering the last ${i} actions, swithTurn : ${swithTurn}`);
                    break;
                }
            }
            else {
                const arrayBuffer = await loadMsgpackFile(`./strategy/${playerLength1}-${playerLength0}.msgpack`);
                const strategy = msgpack.decode(new Uint8Array(arrayBuffer),{int64: true});
                strategyInstance = strategy[state];
                if(strategyInstance) {
                    console.log(`considering the last ${i} actions, swithTurn : ${swithTurn}`);
                    break;
                }            
            }
        }    
    }


    if(!strategyInstance) {
        console.log("Weird Action, falling into heuristic");
        debugger;
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