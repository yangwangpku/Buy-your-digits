function init(OPPONENT,LEVEL="easy"){
    // SELECT CANAVS
    const canvas = document.getElementById("cvs");
    const ctx = canvas.getContext("2d");

    const oppImage = new Image();
    oppImage.src = OPPONENT == "computer"?    "img/computer.svg":"img/player2.svg";
    oppImage.onload = function() {
        ctx.drawImage(oppImage, 150, 0, 50, 50);
    };

    const manImage = new Image();
    manImage.src = "img/player1.svg";
    manImage.onload = function() {
        ctx.drawImage(manImage, 150, 400, 50, 50);
    };

}
