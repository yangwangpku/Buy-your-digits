import { createGame } from "./game.js";
import { HeuristicStrategy, PretrainedStrategy } from "./strategy.js";
import { updateStats,startGameStats } from "./statistics.js";

export function game_init(OPPONENT,LEVEL="easy"){

    const gamestart = document.querySelector(".gamestart");
    const opponent = document.querySelector(".opponent");
    const guessSection = document.querySelector(".guess");
    const call = document.querySelector(".call");
    const nextround = document.querySelector(".nextround");
    const gameOverElement = document.querySelector(".gameover");
    const peekNorth = document.querySelector(".peekNorth");
    const peekSouth = document.querySelector(".peekSouth");
    const northSeat = document.getElementById("northSeat");
    const southSeat = document.getElementById("southSeat");
    const northHand = document.getElementById("northHand");
    const southHand = document.getElementById("southHand");
    const southBubble = document.querySelector(".southBubble");
    const northBubble = document.querySelector(".northBubble");
    const status = document.getElementById("status");
    const history = document.getElementById("historytext");

    const VS_COMPUTER = OPPONENT == "computer";

    opponent.src = VS_COMPUTER?    "img/computer.svg":"img/player2.svg";
    document.getElementById("southName").textContent = VS_COMPUTER? "You":"Player 1";
    document.getElementById("northName").textContent = VS_COMPUTER? "Computer":"Player 2";
    gamestart.classList.remove("hide");

    if(!VS_COMPUTER) {
        peekNorth.classList.remove("hide");
        peekSouth.classList.remove("hide");
    }

    let computerStrategy = (LEVEL == "easy")? HeuristicStrategy:PretrainedStrategy;

    const UNKNOWN = 0;
    const MAX_DIGITS = 5;
    const THINK_TIME = 600;     // ms the computer "thinks", so its move is readable

    let southPlayer={name:"player",label:VS_COMPUTER? "You":"Player 1",digits:MAX_DIGITS,imgSrc:"img/player1.svg"};
    let northPlayer={name:OPPONENT,label:VS_COMPUTER? "Computer":"Player 2",digits:MAX_DIGITS,imgSrc:opponent.src};

    let lastLoser = southPlayer;
    let player0 = southPlayer;
    let player1 = northPlayer;

    let game = createGame(southPlayer.digits,northPlayer.digits);

    if(VS_COMPUTER) {
        startGameStats(LEVEL);
    }

    const currentPlayer = () => {
        return (game.getCurrentPlayer() === 0)? player0:player1;
    };

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    const formatGuess = guess => `<span class="bid"><b>${guess.number}</b> × <span class="chip">${guess.digit}</span></span>`;

    const tileAt = (number,digit) => document.getElementById(`${number} ${digit}`);

    newRound();

    function activatePlayer(player) {
        const south = player.name == southPlayer.name;
        southSeat.classList.toggle("is-turn", south);
        northSeat.classList.toggle("is-turn", !south);
    }

    function bubbleOf(player) {
        return (player.name==southPlayer.name)?   southBubble:northBubble;
    }

    function speak(player,message) {
        const bubble = bubbleOf(player);
        bubble.classList.remove("is-thinking");
        bubble.classList.add("is-visible");
        bubble.querySelector(".bubbletext").innerHTML = message;

        // replay the pop animation
        bubble.classList.remove("pop");
        void bubble.offsetWidth;
        bubble.classList.add("pop");

        history.innerHTML += `<li><span class="who">${player.label}</span>${message}</li>`;
        history.parentElement.scrollTop = history.parentElement.scrollHeight;
    }

    function showThinking(player) {
        const bubble = bubbleOf(player);
        bubble.classList.add("is-visible","is-thinking");
        bubble.querySelector(".bubbletext").innerHTML = "<i></i><i></i><i></i>";
    }

    function setStatus(html) {
        status.innerHTML = html;
    }

    function showTurnStatus() {
        if(game.roundover())    return;
        const player = currentPlayer();
        const last = game.lastAction();

        if(player.name == "computer") {
            setStatus("Computer is thinking…");
            return;
        }

        const who = VS_COMPUTER? "Your turn." : `${player.label}'s turn.`;
        if(!last)
            setStatus(`<strong>${who}</strong> Open the round: pick how many of a digit are in both hands.`);
        else
            setStatus(`<strong>${who}</strong> Raise above ${formatGuess(last)} or call it.`);
    }

    async function newRound() {
        history.innerHTML="";
        peekNorth.innerHTML="View";
        peekSouth.innerHTML="View";
        southBubble.classList.remove("is-visible","is-thinking");
        northBubble.classList.remove("is-visible","is-thinking");
        gamestart.classList.remove("round-over");
        call.classList.remove("hide");

        activatePlayer(lastLoser);
        player0 = lastLoser;
        player1 = (lastLoser.name == southPlayer.name)? northPlayer:southPlayer;

        game = createGame(player0.digits,player1.digits);

        if(!VS_COMPUTER)
            drawNumbers(new Array(southPlayer.digits).fill(UNKNOWN),"bottom");
        else
            drawNumbers(southPlayerCards(),"bottom");
        drawNumbers(new Array(northPlayer.digits).fill(UNKNOWN),"top");
        drawGuessBTNs();
        showTurnStatus();

        if(player0.name=="computer") {
            // computer makes the first move
            await computerMove();
        }
    }

    async function computerMove() {
        showThinking(currentPlayer());
        const [computerAction] = await Promise.all([computerStrategy(game), sleep(THINK_TIME)]);

        if(computerAction == "call") {
            speak(currentPlayer(),"Call!");
            game.step({number:0,digit:0});
            endRound();
        }
        else {
            speak(currentPlayer(),formatGuess(computerAction));
            game.step(computerAction);
            activatePlayer(currentPlayer());
            drawGuessBTNs();
            showTurnStatus();
        }
    }

    function validGuess(guess) {
        return game.validAction(guess);
    }

    function southPlayerCards() {
        return player0.name == southPlayer.name? game.playerCards0:game.playerCards1;
    }

    function northPlayerCards() {
        return player0.name == southPlayer.name? game.playerCards1:game.playerCards0;
    }

    function drawNumbers(numbers,position,matchDigit = null) {
        // position: top or bottom
        const hand = (position == "top")? northHand:southHand;
        for(let i=0; i<MAX_DIGITS; i++) {
            let number = document.getElementById(`${i} ${position}`);

            if(!number) {
                number = document.createElement("div");
                number.id = `${i} ${position}`;
                number.classList.add("number");
                number.style.setProperty("--i", i);
                hand.appendChild(number);
            }

            if(i>=numbers.length){
                // a lost digit leaves an empty slot behind
                number.className = "number is-lost";
                number.innerHTML = "";
                continue;
            }

            const wasHidden = number.classList.contains("is-hidden");
            const hidden = numbers[i]==UNKNOWN;
            number.innerHTML = hidden?   "?" : numbers[i];
            number.classList.remove("is-lost");
            number.classList.toggle("is-hidden", hidden);
            number.classList.toggle("is-match", matchDigit != null && numbers[i] == matchDigit);
            number.classList.toggle("reveal", wasHidden && !hidden);
        }
    }

    function drawGuessBTNs() {
        const total = southPlayer.digits+northPlayer.digits;
        const last = game.lastAction();
        const waiting = game.roundover() || currentPlayer().name == "computer";

        guessSection.style.setProperty("--cols", total);
        guessSection.classList.toggle("is-locked", waiting);

        for(let i=1; i<=10; i++) {
            let head = document.getElementById(`count ${i}`);
            if(!head) {
                head = document.createElement("span");
                head.id = `count ${i}`;
                head.classList.add("colhead");
                head.innerHTML = i;
                head.style.gridColumn = i;
                guessSection.appendChild(head);
            }
            head.classList.toggle("hide", i > total);

            for(let j=1; j<=4; j++) {
                let guesstile = tileAt(i,j);

                if(!guesstile) {
                    // draw the button for the first time
                    guesstile = document.createElement("button");
                    guesstile.type = "button";
                    guesstile.id = `${i} ${j}`;
                    guesstile.dataset.guess = JSON.stringify({number:i, digit:j});
                    guesstile.classList.add("guesstile");
                    guesstile.setAttribute("aria-label", `Guess ${i} of digit ${j}`);
                    guesstile.innerHTML = j;
                    guesstile.style.gridColumn = i;
                    guesstile.style.gridRow = j+1;
                    guessSection.appendChild(guesstile);
                }

                // hide illegal guess
                guesstile.classList.toggle("hide", i > total);

                guesstile.classList.remove("is-preview","is-bad","is-actual","is-short");
                // highlight the last guess, and fade what can no longer be guessed
                const isLast = last != null && last.number !== 0 && i <= last.number && j == last.digit;
                guesstile.classList.toggle("is-last", isLast);
                guesstile.classList.toggle("is-spent", !isLast && !validGuess({number:i, digit:j}));
            }
        }

        call.disabled = waiting || !last;
    }

    function showPreview(target) {
        if(!target.classList || !target.classList.contains("guesstile"))   return;
        if(game.roundover() || currentPlayer().name == "computer")   return;

        const guess = JSON.parse(target.dataset.guess);
        const valid = validGuess(guess);
        for(let i=1; i<=guess.number;i++) {
            tileAt(i,guess.digit).classList.add(valid? "is-preview":"is-bad");
        }

        if(valid)
            setStatus(`Guess: at least ${formatGuess(guess)} across both hands.`);
        else
            setStatus(`Too low. A guess must beat ${formatGuess(game.lastAction())}.`);
    }

    function clearPreview(target) {
        if(!target.classList || !target.classList.contains("guesstile"))   return;
        if(game.roundover())    return;

        guessSection.querySelectorAll(".is-preview, .is-bad").forEach(tile => {
            tile.classList.remove("is-preview","is-bad");
        });
        showTurnStatus();
    }

    guessSection.addEventListener('mouseover', event => showPreview(event.target));
    guessSection.addEventListener('mouseout', event => clearPreview(event.target));
    guessSection.addEventListener('focusin', event => showPreview(event.target));
    guessSection.addEventListener('focusout', event => clearPreview(event.target));

    guessSection.addEventListener('click', async function(event){
        if(game.roundover()) {
            // the round has been over!
            return;
        }

        if(currentPlayer().name == "computer") {
            return;
        }
        // make guess
        const clickedElement = event.target;
        if(!clickedElement.classList.contains("guesstile")) return;

        const guess = JSON.parse(clickedElement.dataset.guess);
        if(!validGuess(guess))  return;
        speak(currentPlayer(),formatGuess(guess));
        game.step(guess);
        activatePlayer(currentPlayer());

        drawGuessBTNs();
        showTurnStatus();

        if(VS_COMPUTER) {
            await computerMove();
        }
    })

    call.addEventListener('click',function(event){
        if(game.roundover()) {
            // the round has been over!
            return;
        }
        if(!game.lastAction())  return;
        if(currentPlayer().name == "computer")  return;
        speak(currentPlayer(),"Call!");
        game.step({number:0,digit:0});
        endRound();
    })

    function endRound() {
        // the call has just been stepped, so the turn is back with the guesser
        const guess = game.history[game.history.length - 2];
        const gamewinner = game.winner();
        const winner = (gamewinner == 0)? player0:player1;
        const loser = (gamewinner == 0)? player1:player0;
        const actual = game.playerCards0.concat(game.playerCards1).filter(card => card === guess.digit).length;

        gamestart.classList.add("round-over");
        southSeat.classList.remove("is-turn");
        northSeat.classList.remove("is-turn");

        // reveal both hands, lighting up the digits that count
        drawNumbers(northPlayerCards(),"top",guess.digit);
        drawNumbers(southPlayerCards(),"bottom",guess.digit);

        // show the real count against the guess on the board
        drawGuessBTNs();
        for(let i=1; i<=Math.max(actual,guess.number); i++) {
            const tile = tileAt(i,guess.digit);
            tile.classList.remove("is-last","is-spent");
            tile.classList.add(i <= actual? "is-actual":"is-short");
        }

        const verdict = (actual >= guess.number)? "holds":"fails";
        const loses = (loser.label == "You")? "You lose" : `${loser.label} loses`;
        setStatus(`There ${actual == 1? "is":"are"} <b>${actual}</b> × <span class="chip">${guess.digit}</span>, so the guess of ${formatGuess(guess)} <strong class="verdict-${verdict}">${verdict}</strong>. ${loses} a digit.`);

        call.classList.add("hide");

        if(loser.digits == 1)
            setTimeout(() => showGameOver(winner), 1400);
        else {
            loser.digits--;
            lastLoser = loser;
            nextround.classList.remove("hide");
            nextround.focus({preventScroll:true});
        }
    }

    peekSouth.addEventListener('click',function(event){
        if(peekSouth.innerHTML=="View") {
            drawNumbers(southPlayerCards(),"bottom");
            peekSouth.innerHTML="Hide";
        }
        else {
            drawNumbers(new Array(southPlayer.digits).fill(UNKNOWN),"bottom");
            peekSouth.innerHTML="View";
        }
    })

    peekNorth.addEventListener('click',function(event){
        if(peekNorth.innerHTML=="View") {
            drawNumbers(northPlayerCards(),"top");
            peekNorth.innerHTML="Hide";
        }
        else {
            drawNumbers(new Array(northPlayer.digits).fill(UNKNOWN),"top");
            peekNorth.innerHTML="View";
        }
    })

    nextround.addEventListener('click',function(event){
        nextround.classList.add("hide");
        newRound();
    })

    function showGameOver(winner){
        const playerWon = winner.name == southPlayer.name;
        if(VS_COMPUTER) {
            updateStats(LEVEL, playerWon);
        }

        let message = `${winner.label} wins!`;
        if(VS_COMPUTER)
            message = playerWon? "You win!":"Computer wins";

        gameOverElement.innerHTML = `
            <div class="panel">
                <p class="panel-sub">Game over</p>
                <h2>${message}</h2>
                <img class="winner-img" src="${winner.imgSrc}" alt="">
                <div class="panel-actions">
                    <button type="button" class="btn btn-primary" onclick="location.reload()">Play again</button>
                </div>
            </div>
        `;

        gameOverElement.classList.remove("hide");
        gameOverElement.querySelector("button").focus({preventScroll:true});
    }

}
