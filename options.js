import { game_init } from "./gameloop.js";
import { preloadMsgpackFile } from "./msgpackLoader.js";
import { resetStats } from "./statistics.js";

// SELECT START ELEMENT
const options = document.querySelector(".options");

// SELECT BUTTONS
const computerBtn = document.querySelector(".computer");
const friendBtn = document.querySelector(".friend");
const easyBtn = document.querySelector(".easy");
const hardBtn = document.querySelector(".hard");
const playBtn = document.querySelector(".play");
const difficultySection = document.getElementById("difficulty");
const statisticsSection = document.querySelector(".statistics");
const statisticsBtn = document.getElementById("statisticsBtn");
const backBtn = document.querySelector(".back");
const resetBtn = document.querySelector(".reset");

// GAME OVER ELEMENT
const gameOverElement = document.querySelector(".gameover");

let OPPONENT="computer"
let LEVEL="hard";
switchActive(easyBtn, hardBtn);
switchActive(friendBtn, computerBtn);
difficultySection.classList.remove("hide");

easyBtn.addEventListener("click", function(){
    LEVEL = "easy";
    switchActive(hardBtn, easyBtn);
});

hardBtn.addEventListener("click", function(){
    LEVEL = "hard";
    switchActive(easyBtn, hardBtn);
});
 
computerBtn.addEventListener("click", function(){
    OPPONENT = "computer";
    switchActive(friendBtn, computerBtn);
    difficultySection.classList.remove("hide");
});

friendBtn.addEventListener("click", function(){
    OPPONENT = "friend";
    switchActive(computerBtn, friendBtn);
    difficultySection.classList.add("hide");
});

playBtn.addEventListener("click", function(){
    if( !OPPONENT){
        computerBtn.style.backgroundColor = "red";
        friendBtn.style.backgroundColor = "red";
        return;
    }

    if( OPPONENT=="computer" && !LEVEL  ){
        easyBtn.style.backgroundColor = "red";
        hardBtn.style.backgroundColor = "red";
        return;
    }
    
    if( OPPONENT=="friend")
        game_init(OPPONENT);
    else
        game_init(OPPONENT,LEVEL);
    
    options.classList.add("hide");
});

function switchActive(off, on){
    off.classList.remove("active");
    on.classList.add("active");
}

statisticsBtn.addEventListener("click", function(){
    if(statisticsSection.classList.contains("hide"))
        statisticsSection.classList.remove("hide");
    else
        statisticsSection.classList.add("hide");
});

backBtn.addEventListener("click", function(){
    statisticsSection.classList.add("hide");
});

resetBtn.addEventListener("click", function(){
    resetStats();
    alert("Statistics Reseted!");
});

document.addEventListener("DOMContentLoaded",  () => {
    // load everything to cache

    for(let i=5;i>0;i--) {
        for(let j=5;j>0;j--) {
            preloadMsgpackFile(`./strategy/${i}-${j}-core.msgpack`);
        }
    }    

    for(let i=5;i>0;i--) {
        for(let j=5;j>0;j--) {
            preloadMsgpackFile(`./strategy/${i}-${j}.msgpack`);
        }
    }
});