function init(OPPONENT,LEVEL="easy"){

    const gamestart = document.querySelector(".gamestart");
    const opponent = document.querySelector(".opponent");
    const guessSection = document.querySelector(".guess");
    const guesstext = document.querySelector(".guesstext");
    const guesscount = document.getElementById("guesscount");
    const guessnumber = document.getElementById("guessnumber");
    const call = document.querySelector(".call");
    const gameOverElement = document.querySelector(".gameover");

    opponent.src = OPPONENT == "computer"?    "img/computer.svg":"img/player2.svg";
    gamestart.classList.remove("hide");

    const tileWidth = 50;
    const UNKNOWN = 0;

    // game state
    let manDigits = 5;
    let oppDigits = 5;

    let lastGuess = null;

    let manSequence = getRandomNumberSequence(manDigits,4);
    let oppSequence = getRandomNumberSequence(oppDigits,4);

    drawNumbers(manSequence,"bottom");
    drawNumbers(new Array(oppDigits).fill(UNKNOWN),"top");
    drawGuessBTNs();


    function validGuess(guess) {
        if(!lastGuess)  return true;
        if(guess.count != lastGuess.count)  return guess.count > lastGuess.count;
        return guess.number > lastGuess.number;
    }

    function correctGuess(guess) {
        let total = manSequence.filter(num=>num==guess.number).length + oppSequence.filter(num=>num==guess.number).length
        return guess.count <= total;
    }

    function drawNumbers(numbers,position) {
        // position: top or bottom
        for(let i=0; i< numbers.length; i++) {
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
        for(let i=1; i<=manDigits+oppDigits; i++) {
            for(let j=1; j<=4; j++) {
                let guesstile = document.getElementById(`${i} ${j}`);
                
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
                guesstile.style.backgroundColor = (lastGuess && i <= lastGuess.count && j == lastGuess.number)? "yellow":"white";
            }
        }
    }


    guessSection.addEventListener('mouseover', function(event){
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
                guesstile.style.backgroundColor = (lastGuess && i <= lastGuess.count && guess.number == lastGuess.number)? "yellow":"white";
            }
        }
    })

    guessSection.addEventListener('click', function(event){
        const clickedElement = event.target;
        if(!clickedElement.classList.contains("guesstile")) return;

        const guess = JSON.parse(clickedElement.dataset.guess);
        if(!validGuess(guess))  return;
        lastGuess = guess;

        drawGuessBTNs();
    })

    call.addEventListener('click',function(event){
        if(!lastGuess)  return;
        drawNumbers(oppSequence,"top");
        showGameOver(correctGuess(lastGuess)?   OPPONENT:"man");
    })

    function showGameOver(winner){
        let message = "The Winner is";
        let imgSrc = winner == "man"?     "img/player1.svg":
                     winner == "friend"?  "img/player2.svg":
                                          "img/computer.svg";

        gameOverElement.innerHTML = `
            <h1>${message}</1>
            <img class="winner-img " src=${imgSrc} </img>
            <div class="play" onclick="location.reload()">Play Again!</div>
        `;

        gameOverElement.classList.remove("hide");
    }
}
