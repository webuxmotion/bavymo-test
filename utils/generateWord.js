const randomWords = require("random-english-words");

function generateWord() {
    let word = "";
    do {
        const result = randomWords();
        word = Array.isArray(result) ? result[0] : result;
    } while (word.length < 3 || word.length > 7);

    return word.toUpperCase();
}

module.exports = { generateWord };