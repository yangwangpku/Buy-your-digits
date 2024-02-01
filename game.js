function init(OPPONENT,LEVEL="easy"){

    const gamestart = document.querySelector(".gamestart");
    const opponent = document.querySelector(".opponent");
    const guessSection = document.querySelector(".guess");
    const guesstext = document.querySelector(".guesstext");
    const guesscount = document.getElementById("guesscount");
    const guessnumber = document.getElementById("guessnumber");

    opponent.src = OPPONENT == "computer"?    "img/computer.svg":"img/player2.svg";
    gamestart.classList.remove("hide");

    const tileWidth = 50;
    const UNKNOWN = 0;

    function drawNumbers(numbers,position) {
        // position: top or bottom
        for(let i=0; i< numbers.length; i++) {
            const number = document.createElement("div");
            number.classList.add("number");
            number.innerHTML = (numbers[i]==UNKNOWN)?   "?" : numbers[i];
            if(position == "top")
                number.style.top = 0;
            else
                number.style.bottom = 0;
            number.style.left = (5+i)*tileWidth + "px";
            gamestart.appendChild(number);
        }
    }

    // game state
    let manDigits = 5;
    let oppDigits = 5;

    let lastGuess = null;
    lastGuess = {count:3, number:2};

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
}
