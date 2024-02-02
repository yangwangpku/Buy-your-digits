function init(OPPONENT,LEVEL="easy"){

    const gamestart = document.querySelector(".gamestart");
    const opponent = document.querySelector(".opponent");
    const guessSection = document.querySelector(".guess");
    const guesstext = document.querySelector(".guesstext");
    const guesscount = document.getElementById("guesscount");
    const guessnumber = document.getElementById("guessnumber");
    const call = document.querySelector(".call");
    const nextround = document.querySelector(".nextround");
    const gameOverElement = document.querySelector(".gameover");
    const viewman = document.querySelector(".viewman");
    const viewopp = document.querySelector(".viewopp");
    const manturn = document.querySelector(".manturn");
    const oppturn = document.querySelector(".oppturn");
    const prompt = document.querySelector(".prompt");
    const manbubble = document.querySelector(".manbubble");
    const oppbubble = document.querySelector(".oppbubble");

    opponent.src = OPPONENT == "computer"?    "img/computer.svg":"img/player2.svg";
    gamestart.classList.remove("hide");

    if(OPPONENT == "friend") {
        viewman.classList.remove("hide");
        viewopp.classList.remove("hide");
    }

    const tileWidth = 50;
    const UNKNOWN = 0;
    let tileColor="#ffffe0";

    let man={name:"man",digits:5,imgSrc:"img/player1.svg"};
    let opp={name:OPPONENT,digits:5,imgSrc:opponent.src};
    let currentPlayer = man;

    let lastGuess = null;
    let lastLoser = man;


    newRound();

    function switchTurn(activePlayer = null) {
        if(activePlayer == null)    activePlayer = (currentPlayer==man)?  opp:man;

        if(activePlayer == man) {
            manturn.classList.remove("hide");
            oppturn.classList.add("hide");
        }
        else {
            manturn.classList.add("hide");
            oppturn.classList.remove("hide");            
        }
        currentPlayer = activePlayer;
    }

    function speak(player,message) {
        const bubble = (player==man)?   manbubble:oppbubble;
        bubble.style.display="flex";
        const bubbletext = bubble.querySelector(".bubbletext");
        bubbletext.innerHTML = message;
    }

    function newRound() {
        viewman.innerHTML="View";
        viewopp.innerHTML="View";
        manbubble.style.display="none";
        oppbubble.style.display="none";
        lastGuess = null;

        switchTurn(lastLoser);
        man.sequence = getRandomNumberSequence(man.digits,4);
        opp.sequence = getRandomNumberSequence(opp.digits,4);

        if(OPPONENT=="friend")
            drawNumbers(new Array(man.digits).fill(UNKNOWN),"bottom");
        else
            drawNumbers(man.sequence,"bottom");
        drawNumbers(new Array(opp.digits).fill(UNKNOWN),"top");
        drawGuessBTNs();

        if(currentPlayer.name=="computer") {
            // computer makes the first move
            let computerAction = computerEasyAction();
            speak(currentPlayer,`${computerAction.count} ${computerAction.number}(s)`);
            lastGuess = computerAction;
            drawGuessBTNs();
            switchTurn();
        }
    }


    function validGuess(guess) {
        if(!lastGuess)  return true;
        if(guess.count != lastGuess.count)  return guess.count > lastGuess.count;
        return guess.number > lastGuess.number;
    }

    function correctGuess(guess) {
        let total = man.sequence.filter(num=>num==guess.number).length + opp.sequence.filter(num=>num==guess.number).length
        return guess.count <= total;
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

    function drawGuessBTNs() {
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
                    guesstile.dataset.guess = JSON.stringify({count:i, number:j});
                    guesstile.classList.add("guesstile");
                    guesstile.innerHTML = j;
                    guesstile.style.top = (2+j)*tileWidth + "px";;
                    guesstile.style.left = (i)*tileWidth + "px";
                    guessSection.appendChild(guesstile);
                }

                // change the color to yellow if it's the last guess
                guesstile.style.backgroundColor = (lastGuess && i <= lastGuess.count && j == lastGuess.number)? "yellow":tileColor;
            }
        }
    }


    guessSection.addEventListener('mouseover', function(event){
        if(!nextround.classList.contains("hide")) {
            // the round has been over!
            return;
        }
        const hoveredElement = event.target;
        if(hoveredElement.classList.contains("guesstile")) {
            const guess = JSON.parse(hoveredElement.dataset.guess);
            for(let i=1; i<=guess.count;i++) {
                let guesstile = document.getElementById(`${i} ${guess.number}`);
                guesstile.style.backgroundColor = validGuess(guess)? "green":"red";                
            }

            if(validGuess(guess)) {
                guesstext.style.display = "flex";
                guesscount.innerHTML=guess.count;
                guessnumber.innerHTML=guess.number;
            }
            else
                guesstext.style.display = "none";
        }
    })

    guessSection.addEventListener('mouseout', function(event){
        const outElement = event.target;
        if(outElement.classList.contains("guesstile")) {
            guesstext.style.display = "none";
            const guess = JSON.parse(outElement.dataset.guess);
            for(let i=1; i<=guess.count;i++) {
                let guesstile = document.getElementById(`${i} ${guess.number}`);
                guesstile.style.backgroundColor = (lastGuess && i <= lastGuess.count && guess.number == lastGuess.number)? "yellow":tileColor;
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
        speak(currentPlayer,`${guess.count} ${guess.number}(s)`);
        lastGuess = guess;
        switchTurn();
        drawGuessBTNs();
        
        if(OPPONENT=="computer") {
            let computerAction = computerEasyAction();
            if(computerAction == "call") {
                speak(currentPlayer,"Call");
                drawNumbers(opp.sequence,"top");
                
                let winner = correctGuess(lastGuess)?   man:opp;
                let loser = correctGuess(lastGuess)?   opp:man;

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
                speak(currentPlayer,`${computerAction.count} ${computerAction.number}(s)`);
                lastGuess = computerAction;
                switchTurn();
            }
        }

        drawGuessBTNs();
    })

    call.addEventListener('click',function(event){
        prompt.classList.add("hide");   // prompt is not needed for old players
        if(!nextround.classList.contains("hide")) {
            // the round has been over!
            return;
        }
        if(!lastGuess)  return;
        speak(currentPlayer,"Call");
        drawNumbers(opp.sequence,"top");
        drawNumbers(man.sequence,"bottom");
        
        let otherPlayer = currentPlayer==man? opp:man;
        let winner = correctGuess(lastGuess)?   otherPlayer:currentPlayer;
        let loser = correctGuess(lastGuess)?   currentPlayer:otherPlayer;

        if(loser.digits == 1)
            showGameOver(winner);
        else {
            loser.digits--;
            lastLoser = loser;
            nextround.classList.remove("hide");
        }

    })

    viewman.addEventListener('click',function(event){
        if(viewman.innerHTML=="View") {
            drawNumbers(man.sequence,"bottom");
            viewman.innerHTML="Hide";
        }
        else {
            drawNumbers(new Array(man.digits).fill(UNKNOWN),"bottom");
            viewman.innerHTML="View";
        }
    })

    viewopp.addEventListener('click',function(event){
        if(viewopp.innerHTML=="View") {
            drawNumbers(opp.sequence,"top");
            viewopp.innerHTML="Hide";
        }
        else {
            drawNumbers(new Array(opp.digits).fill(UNKNOWN),"top");
            viewopp.innerHTML="View";
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

        for(let i=1; i<=man.digits+opp.digits; i++) {
            for(let j=1; j<=4; j++) {
                let guess = {count:i, number:j};
                if(!validGuess(guess))  continue;
                estimateCountLow = opp.sequence.filter(num=>num==j).length+(man.digits+1)/4;
                estimateCountHigh = opp.sequence.filter(num=>num==j).length+man.digits/4+1;
                if(i<=estimateCountLow)
                    safeGuess.push(guess);
                if(i<=estimateCountHigh)
                    dangerGuess.push(guess);
            }
        }

        if (safeGuess.length > 0) {
            let randomIndex = getRandomNumber(0,safeGuess.length-1);
            let guess = safeGuess[randomIndex];
            if(lastGuess && guess.number != lastGuess.number && guess.count + lastGuess.count > man.digits+opp.digits) {
                // don't make stupid guess
                return "call";
            }
            else
                return safeGuess[randomIndex];
        }
        else if (dangerGuess.length > 0) {
            let randomIndex = getRandomNumber(0,dangerGuess.length-1);
            let guess = dangerGuess[randomIndex];
            if(lastGuess && guess.number != lastGuess.number && guess.count + lastGuess.count > man.digits+opp.digits) {
                // don't make stupid guess
                return "call";
            }
            else
                return dangerGuess[randomIndex];
        } 
        else if (opp.sequence.filter(num=>num==lastGuess.number).length < lastGuess.count) {
            // don't make stupid call
            return "call";
        } 
        else {
            // make a naive guess if don't know what to do
            return {count:lastGuess.count+1,number:lastGuess.number};
        }
    }

}
