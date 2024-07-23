export const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const getRandomNumberSequence = (length, max = 4) => {
    const sequence = [];
    for (let i = 0; i < length; i++) {
        sequence.push(getRandomNumber(1, max));
    }
    return sequence;
}

export function sample(probabilities) {
    // Normalize the probabilities if they don't sum to 1
    const sum = probabilities.reduce((acc, val) => acc + val, 0);
    const normalizedProbabilities = probabilities.map(prob => prob / sum);
    
    // Generate a random number between 0 and 1
    const random = Math.random();
    
    // Use the CDF to find the index
    let cumulativeSum = 0;
    for (let i = 0; i < normalizedProbabilities.length; i++) {
        cumulativeSum += normalizedProbabilities[i];
        if (random < cumulativeSum) {
            return i;
        }
    }
    
    // In case of floating-point precision issues, return the last index
    return normalizedProbabilities.length - 1;
}