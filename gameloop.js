import { action,createGame } from "./game.js";
import { getRandomNumber } from "./utils.js";
import { HeuristicStrategy, PretrainedStrategy } from "./strategy.js";

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
    const southBubble = document.querySelector(".southBubble");
    const northBubble = document.querySelector(".northBubble");

    const history = document.getElementById("historytext");


    opponent.src = OPPONENT == "computer"?    "img/computer.svg":"img/player2.svg";
    gamestart.classList.remove("hide");

    if(OPPONENT == "friend") {
        northView.classList.remove("hide");
        southView.classList.remove("hide");
    }

    let computerStrategy = (LEVEL == "easy")? HeuristicStrategy:PretrainedStrategy;

    const tileWidth = 50;
    const UNKNOWN = 0;
    let tileColor="#ffffe0";

    const southPlayerInitLength = 3;
    const northPlayerInitLength = 3;

    let southPlayer={name:"player",digits:southPlayerInitLength,imgSrc:"img/player1.svg"};
    let northPlayer={name:OPPONENT,digits:northPlayerInitLength,imgSrc:opponent.src};

    let lastLoser = southPlayer;
    let player0 = southPlayer;
    let player1 = northPlayer;

    let game = createGame(southPlayer.digits,northPlayer.digits);

    const currentPlayer = () => {
        return (game.getCurrentPlayer() === 0)? player0:player1;
    };

    newRound();

    function activatePlayer(player) {
        if(player.name == southPlayer.name) {
            southTurn.classList.remove("hide");
            northTurn.classList.add("hide");
        }
        else {
            southTurn.classList.add("hide");
            northTurn.classList.remove("hide");            
        }
    }


    function speak(player,message) {
        const bubble = (player.name==southPlayer.name)?   southBubble:northBubble;
        bubble.style.display="flex";
        const bubbletext = bubble.querySelector(".bubbletext");
        bubbletext.innerHTML = message;

        history.innerHTML += `<div>${player.name}: ${message}</div>`;
    }

    async function newRound() {
        history.innerHTML="";
        northView.innerHTML="View";
        southView.innerHTML="View";
        southBubble.style.display="none";
        northBubble.style.display="none";

        activatePlayer(lastLoser);
        player0 = lastLoser;
        player1 = (lastLoser.name == southPlayer.name)? northPlayer:southPlayer;

        game = createGame(player0.digits,player1.digits);
        
        if(OPPONENT=="friend")
            drawNumbers(new Array(southPlayer.digits).fill(UNKNOWN),"bottom");
        else
            drawNumbers((player0.name == southPlayer.name)? game.playerCards0:game.playerCards1,"bottom");
        drawNumbers(new Array(northPlayer.digits).fill(UNKNOWN),"top");
        drawGuessBTNs();

        if(player0.name=="computer") {
            // computer makes the first move
            const computerAction = await computerStrategy(game);
            speak(currentPlayer(),`${computerAction.number} ${computerAction.digit}(s)`);
            game.step(computerAction);
            drawGuessBTNs(computerAction);
            activatePlayer(player1);
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

                if(i > southPlayer.digits+northPlayer.digits) {
                    // hide illegal guess
                    guesstile.style.display = "none";
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

    guessSection.addEventListener('click', async function(event){
        prompt.classList.add("hide");   // prompt is not needed for old players
        if(!nextround.classList.contains("hide")) {
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
        speak(currentPlayer(),`${guess.number} ${guess.digit}(s)`);
        game.step(guess);
        activatePlayer(currentPlayer());

        drawGuessBTNs(guess);
        
        if(OPPONENT=="computer") {
            const computerAction = await computerStrategy(game);
            if(computerAction == "call") {
                speak(currentPlayer(),"Call");
                game.step({number:0,digit:0});
                drawNumbers(northPlayerCards(),"top");

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
        drawNumbers(northPlayerCards(),"top");
        drawNumbers(southPlayerCards(),"bottom");
        
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
            drawNumbers(southPlayerCards(),"bottom");
            northView.innerHTML="Hide";
        }
        else {
            drawNumbers(new Array(southPlayer.digits).fill(UNKNOWN),"bottom");
            northView.innerHTML="View";
        }
    })

    southView.addEventListener('click',function(event){
        if(southView.innerHTML=="View") {
            drawNumbers(northPlayerCards(),"top");
            southView.innerHTML="Hide";
        }
        else {
            drawNumbers(new Array(northPlayer.digits).fill(UNKNOWN),"top");
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

}