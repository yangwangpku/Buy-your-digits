import { action,createGame } from "./game.js";
import { getRandomNumber } from "./utils.js";

export function init(OPPONENT,LEVEL="easy"){

    const gamestart = document.querySelector(".gamestart");
    const opponent = document.querySelector(".opponent");
    const guessSection = document.querySelector(".guess");
    const guesstext = document.querySelector(".guesstext");
    const guessnumber = document.getElementById("guessnumber");
    const guessdigit = document.getElementById("guessdigit");
    const call = document.querySelector(".call");
    const nextround = document.querySelector(".nextround");
    const gameOverElement = document.querySelector(".gameover");
    const northView = document.querySelector(".northView");
    const southView = document.querySelector(".southView");
    const southTurn = document.querySelector(".southTurn");
    const northTurn = document.querySelector(".northTurn");
    const prompt = document.querySelector(".prompt");
    const northBubble = document.querySelector(".northBubble");
    const southBubble = document.querySelector(".southBubble");

    opponent.src = OPPONENT == "computer"?    "img/computer.svg":"img/player2.svg";
    gamestart.classList.remove("hide");

    if(OPPONENT == "friend") {
        northView.classList.remove("hide");
        southView.classList.remove("hide");
    }

    const tileWidth = 50;
    const UNKNOWN = 0;
    let tileColor="#ffffe0";

    let man={name:"man",digits:5,imgSrc:"img/player1.svg"};
    let opp={name:OPPONENT,digits:5,imgSrc:opponent.src};

    let lastLoser = man;
    let player0 = man;
    let player1 = opp;

    let game = createGame(man.digits,opp.digits);

    const currentPlayer = () => {
        return (game.getCurrentPlayer() === 0)? player0:player1;
    };

    newRound();

    function activatePlayer(player) {
        if(player == man) {
            southTurn.classList.remove("hide");
            northTurn.classList.add("hide");
        }
        else {
            southTurn.classList.add("hide");
            northTurn.classList.remove("hide");            
        }
    }


    function speak(player,message) {
        const bubble = (player==man)?   northBubble:southBubble;
        bubble.style.display="flex";
        const bubbletext = bubble.querySelector(".bubbletext");
        bubbletext.innerHTML = message;
    }

    function newRound() {
        northView.innerHTML="View";
        southView.innerHTML="View";
        northBubble.style.display="none";
        southBubble.style.display="none";

        activatePlayer(lastLoser);
        player0 = lastLoser;
        player1 = (lastLoser.name == "man")? opp:man;

        game = createGame(player0.digits,player1.digits);
        
        if(OPPONENT=="friend")
            drawNumbers(new Array(man.digits).fill(UNKNOWN),"bottom");
        else
            drawNumbers((player0.name == "man")? game.playerCards0:game.playerCards1,"bottom");
        drawNumbers(new Array(opp.digits).fill(UNKNOWN),"top");
        drawGuessBTNs();

        if(player0.name=="computer") {
            // computer makes the first move
            let computerAction = computerEasyAction();
            speak(currentPlayer(),`${computerAction.number} ${computerAction.digit}(s)`);
            game.step(computerAction);
            drawGuessBTNs(computerAction);
            activatePlayer(player1);
        }
    }


    function validGuess(guess) {
        return game.validAction(guess);
    }

    function manCards() {
        return player0.name == "man"? game.playerCards0:game.playerCards1;
    }

    function oppCards() {
        return player0.name == "man"? game.playerCards1:game.playerCards0;
    }

    function drawNumbers(numbers,position) {
        // position: top or bottom
        for(let i=0; i<5; i++) {
            let number = document.getElementById(`${i} ${position}`);
            if(i>=numbers.length){
                if(number)  number.style.display = "none";  // hide the lost digits
                continue;
            }

            if(!number) {
                number = document.createElement("div");
                number.id = `${i} ${position}`;
                number.classList.add("number");
                if(position == "top")
                    number.style.top = 0;
                else
                    number.style.bottom = 0;
                number.style.left = (5+i)*tileWidth + "px";
                gamestart.appendChild(number);
            }
            number.innerHTML = (numbers[i]==UNKNOWN)?   "?" : numbers[i];
        }
    }

    function drawGuessBTNs(action = null) {
        for(let i=1; i<=10; i++) {
            for(let j=1; j<=4; j++) {
                let guesstile = document.getElementById(`${i} ${j}`);
                if(i > man.digits+opp.digits) {
                    // hide illegal guess
                    if(guesstile)
                        guesstile.style.display = "none";
                }
                if(!guesstile) {
                    // draw the button for the first time
                    guesstile = document.createElement("div");
                    guesstile.id = `${i} ${j}`;
                    guesstile.dataset.guess = JSON.stringify({number:i, digit:j});
                    guesstile.classList.add("guesstile");
                    guesstile.innerHTML = j;
                    guesstile.style.top = (2+j)*tileWidth + "px";;
                    guesstile.style.left = (i)*tileWidth + "px";
                    guessSection.appendChild(guesstile);
                }

                // change the color to yellow if it's the last guess
                if(action != null && i <= action.number && j == action.digit)
                    guesstile.style.backgroundColor = "yellow"
                else
                    guesstile.style.backgroundColor = tileColor;
            }
        }
    }


    guessSection.addEventListener('mouseover', function(event){
        if(game.roundover()) {
            // the round has been over!
            return;
        }
        const hoveredElement = event.target;
        if(hoveredElement.classList.contains("guesstile")) {
            const guess = JSON.parse(hoveredElement.dataset.guess);
            for(let i=1; i<=guess.number;i++) {
                let guesstile = document.getElementById(`${i} ${guess.digit}`);
                guesstile.style.backgroundColor = validGuess(guess)? "green":"red";                
            }

            if(validGuess(guess)) {
                guesstext.style.display = "flex";
                guessnumber.innerHTML=guess.number;
                guessdigit.innerHTML=guess.digit;
            }
            else
                guesstext.style.display = "none";
        }
    })

    guessSection.addEventListener('mouseout', function(event){
        if(game.roundover()) {
            // the round has been over!
            return
        }
        const outElement = event.target;
        if(outElement.classList.contains("guesstile")) {
            guesstext.style.display = "none";
            const guess = JSON.parse(outElement.dataset.guess);
            for(let i=1; i<=guess.number;i++) {
                let guesstile = document.getElementById(`${i} ${guess.digit}`);
                guesstile.style.backgroundColor = (game.lastAction() && i <= game.lastAction().number && guess.digit == game.lastAction().digit)? "yellow":tileColor;
            }
        }
    })

    guessSection.addEventListener('click', function(event){
        prompt.classList.add("hide");   // prompt is not needed for old players
        if(!nextround.classList.contains("hide")) {
            // the round has been over!
            return;
        }
        // make guess
        const clickedElement = event.target;
        if(!clickedElement.classList.contains("guesstile")) return;

        const guess = JSON.parse(clickedElement.dataset.guess);
        if(!validGuess(guess))  return;
        speak(currentPlayer(),`${guess.number} ${guess.digit}(s)`);
        game.step(guess);
        activatePlayer(currentPlayer());

        drawGuessBTNs(guess);
        
        if(OPPONENT=="computer") {
            let computerAction = computerEasyAction();
            if(computerAction == "call") {
                speak(currentPlayer(),"Call");
                game.step({number:0,digit:0});
                drawNumbers(oppCards(),"top");

                let gamewinner = game.winner();
                let winner = (gamewinner == 0)? player0:player1;
                let loser = (gamewinner == 0)? player1:player0;

                if(loser.digits == 1)
                    showGameOver(winner);
                else {
                    loser.digits--;
                    lastLoser = loser;
                    nextround.classList.remove("hide");
                }
                return;
            }
            else {
                speak(currentPlayer(),`${computerAction.number} ${computerAction.digit}(s)`);
                game.step(computerAction);
                activatePlayer(currentPlayer());
                drawGuessBTNs(computerAction);
            }
        }

    })

    call.addEventListener('click',function(event){
        prompt.classList.add("hide");   // prompt is not needed for old players
        if(!nextround.classList.contains("hide")) {
            // the round has been over!
            return;
        }
        if(!game.lastAction())  return;
        speak(currentPlayer(),"Call");
        game.step({number:0,digit:0});
        drawNumbers(oppCards(),"top");
        drawNumbers(manCards(),"bottom");
        
        let gamewinner = game.winner();
        let winner = (gamewinner == 0)? player0:player1;
        let loser = (gamewinner == 0)? player1:player0;

        if(loser.digits == 1)
            showGameOver(winner);
        else {
            loser.digits--;
            lastLoser = loser;
            nextround.classList.remove("hide");
        }
    })

    northView.addEventListener('click',function(event){
        if(northView.innerHTML=="View") {
            drawNumbers(manCards(),"bottom");
            northView.innerHTML="Hide";
        }
        else {
            drawNumbers(new Array(man.digits).fill(UNKNOWN),"bottom");
            northView.innerHTML="View";
        }
    })

    southView.addEventListener('click',function(event){
        if(southView.innerHTML=="View") {
            drawNumbers(oppCards(),"top");
            southView.innerHTML="Hide";
        }
        else {
            drawNumbers(new Array(opp.digits).fill(UNKNOWN),"top");
            southView.innerHTML="View";
        }
    })

    nextround.addEventListener('click',function(event){
        nextround.classList.add("hide");
        newRound();
    })

    function showGameOver(winner){
        let message = "The Winner is";

        gameOverElement.innerHTML = `
            <h1>${message}</1>
            <img class="winner-img " src=${winner.imgSrc} </img>
            <div class="play" onclick="location.reload()">Play Again!</div>
        `;

        gameOverElement.classList.remove("hide");
    }


    function computerEasyAction() {
        const safeGuess = [];
        const dangerGuess = [];
        let lastGuess = null;
        if(game.lastAction()) {
            lastGuess = game.lastAction();
        }

        for(let i=1; i<=man.digits+opp.digits; i++) {
            for(let j=1; j<=4; j++) {
                let guess = action(i,j);
                if(!validGuess(guess))  continue;
                let estimateCountLow = oppCards().filter(num=>num==j).length+(man.digits+1)/4;
                let estimateCountHigh = oppCards().filter(num=>num==j).length+man.digits/4+1;
                if(i<=estimateCountLow)
                    safeGuess.push(guess);
                if(i<=estimateCountHigh)
                    dangerGuess.push(guess);
            }
        }

        if (safeGuess.length > 0) {
            let randomIndex = getRandomNumber(0,safeGuess.length-1);
            let guess = safeGuess[randomIndex];
            if(lastGuess && guess.digit != lastGuess.digit && guess.number + lastGuess.number > man.digits+opp.digits) {
                // don't make stupid guess
                return "call";
            }
            else
                return safeGuess[randomIndex];
        }
        else if (dangerGuess.length > 0) {
            let randomIndex = getRandomNumber(0,dangerGuess.length-1);
            let guess = dangerGuess[randomIndex];
            if(lastGuess && guess.digit != lastGuess.digit && guess.number + lastGuess.number > man.digits+opp.digits) {
                // don't make stupid guess
                return "call";
            }
            else
                return dangerGuess[randomIndex];
        } 
        else if (oppCards().filter(num=>num==lastGuess.digit).length < lastGuess.number) {
            // don't make stupid call
            return "call";
        } 
        else {
            // make a naive guess if don't know what to do
            return action(lastGuess.number+1, lastGuess.digit);
        }
    }

}