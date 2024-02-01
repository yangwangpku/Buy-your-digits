function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomNumberSequence(length, max = 4) {
    const sequence = [];
    for (let i = 0; i < length; i++) {
        sequence.push(getRandomNumber(1, max));
    }
    return sequence;
}