if(localStorage.getItem('easyWin') == null) {
    localStorage.setItem("easyWin", 0);
}
if(localStorage.getItem('easyLose') == null) {
    localStorage.setItem("easyLose", 0);
}

if(localStorage.getItem('easyOngoing') == null) {
    localStorage.setItem("easyOngoing", 0);
}
else {
    // if the game was ongoing, set the user to lose
    localStorage.setItem("easyLose", parseInt(localStorage.getItem("easyLose")) + parseInt(localStorage.getItem("easyOngoing")));
    localStorage.setItem("easyOngoing", 0);
}


if(localStorage.getItem('hardWin') == null) {
    localStorage.setItem("hardWin", 0);
}
if(localStorage.getItem('hardLose') == null) {
    localStorage.setItem("hardLose", 0);
}
if(localStorage.getItem('hardOngoing') == null) {
    localStorage.setItem("hardOngoing", 0);
}
else {
    // if the game was ongoing, set the user to lose
    localStorage.setItem("hardLose", parseInt(localStorage.getItem("hardLose")) + parseInt(localStorage.getItem("hardOngoing")));
    localStorage.setItem("hardOngoing", 0);
}

renderStats();

export function startGameStats(LEVEL) {
    if(LEVEL == "easy") {
        localStorage.setItem("easyOngoing", 1);
    } else {
        localStorage.setItem("hardOngoing", 1);
    }
}

export function updateStats(LEVEL, win) {
    if(LEVEL == "easy") {
        if(win) {
            localStorage.setItem("easyWin", parseInt(localStorage.getItem("easyWin")) + 1);
        } else {
            localStorage.setItem("easyLose", parseInt(localStorage.getItem("easyLose")) + 1);
        }
        localStorage.setItem("easyOngoing", 0);
    } else {
        if(win) {
            localStorage.setItem("hardWin", parseInt(localStorage.getItem("hardWin")) + 1);
        } else {
            localStorage.setItem("hardLose", parseInt(localStorage.getItem("hardLose")) + 1);
        }
        localStorage.setItem("hardOngoing", 0);
    }
    renderStats();
}

export function resetStats() {
    localStorage.setItem("easyWin", 0);
    localStorage.setItem("easyLose", 0);
    localStorage.setItem("hardWin", 0);
    localStorage.setItem("hardLose", 0);
    
    renderStats();
}

function renderStats() {
    const easyWin = document.getElementById("easyWin")
    const easyLose = document.getElementById("easyLose")
    const easyWinRate = document.getElementById("easyWinRate")
    const easyGamesPlayed = document.getElementById("easyGamesPlayed")

    const hardWin = document.getElementById("hardWin")
    const hardLose = document.getElementById("hardLose")
    const hardWinRate = document.getElementById("hardWinRate")
    const hardGamesPlayed = document.getElementById("hardGamesPlayed")

    const easyWinNum = parseInt(localStorage.getItem("easyWin"));
    const easyLoseNum = parseInt(localStorage.getItem("easyLose"));
    const easyGamesPlayedNum = easyWinNum + easyLoseNum;
    const easyWinRateNum = (easyGamesPlayedNum == 0)? 0: Math.round(easyWinNum / (easyWinNum + easyLoseNum) * 100);

    const hardWinNum = parseInt(localStorage.getItem("hardWin"));
    const hardLoseNum = parseInt(localStorage.getItem("hardLose"));
    const hardGamesPlayedNum = hardWinNum + hardLoseNum;
    const hardWinRateNum = (hardGamesPlayedNum == 0)? 0: Math.round(hardWinNum / (hardWinNum + hardLoseNum) * 100);

    easyWin.innerHTML = easyWinNum;
    easyLose.innerHTML = easyLoseNum;
    easyGamesPlayed.innerHTML = easyGamesPlayedNum
    easyWinRate.innerHTML = easyWinRateNum + "%";

    hardWin.innerHTML = hardWinNum;
    hardLose.innerHTML = hardLoseNum;
    hardGamesPlayed.innerHTML = hardGamesPlayedNum
    hardWinRate.innerHTML = hardWinRateNum + "%";

}