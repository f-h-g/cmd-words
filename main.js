const fs = require('fs');
const readline = require('readline');
const words = fs.readFileSync('./words.txt', 'utf-8').split('\r\n');
var scores = JSON.parse(fs.readFileSync('./highscores.json', 'utf-8'));
const letters = { //1,1 2-4,2 5-9,3 10+,4
    'A': {count: 9, variation: 3},
    'B': {count: 2, variation: 2},
    'C': {count: 2, variation: 2},
    'D': {count: 8, variation: 3},
    'E': {count: 12, variation: 4},
    'F': {count: 2, variation: 2},
    'G': {count: 3, variation: 2},
    'H': {count: 2, variation: 2},
    'I': {count: 9, variation: 3},
    'J': {count: 1, variation: 1},
    'K': {count: 1, variation: 1},
    'L': {count: 4, variation: 2},
    'M': {count: 2, variation: 2},
    'N': {count: 6, variation: 3},
    'O': {count: 8, variation: 3},
    'P': {count: 2, variation: 2},
    'Q': {count: 1, variation: 1},
    'R': {count: 6, variation: 3},
    'S': {count: 4, variation: 2},
    'T': {count: 6, variation: 3},
    'U': {count: 4, variation: 2},
    'V': {count: 2, variation: 2},
    'W': {count: 2, variation: 2},
    'X': {count: 1, variation: 1},
    'Y': {count: 2, variation: 2},
    'Z': {count: 1, variation: 1}
};
const board = [];
var start = randomizeSet();
var maxScore = start.length;
var numWords = 0;
randomSlice();
var timer = process.hrtime();

function randomizeSet(){
    var temp = "";
    for(var i in letters){
        var delta = Math.floor(Math.random() * (letters[i].variation+1)); // can be 0
        var sign = Math.floor(Math.random() * 2);
        if(sign == 0) delta *= -1;
        var amount = letters[i].count + delta;
        while(amount > 0){
            temp += i;
            amount--;
        }
    }
    return temp; //APPLE - test word
}

function randomSlice(){
    while(board.length <= 20 && start.length > 0){
        var index = Math.floor(Math.random() * start.length);
        var remove = start.charAt(index);
        board.push(remove);
        start = start.replace(remove, "");
    }
}

function removeLetters(w){
    for(var i = 0; i < w.length; i++){
        board.splice(board.indexOf(w[i]), 1);
    }
}

function checkLetters(w){
    var temp = board.slice();
    for(var i = 0; i < w.length; i++){
        if(!temp.includes(w[i])) return false;
        else temp.splice(temp.indexOf(w[i]), 1);
    }
    return true;
}

function getScore(completed){
    if(completed) return (timer[0] + timer[1] / 1E9).toFixed(3) + " seconds";
    else return maxScore - (start.length + board.length);
}

function runGame(){
    var str = "";
    for(var i = 0; i < board.length; i++){
        if(i != 0 && i%7==0) str += '\n\n';
        str += board[i] + "  ";
    }
    console.log(str);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("Enter a word: ", (word) => {
        if(word == "1"){
            console.log("Nice Try! Score: " + getScore(false));
            if(numWords > 4) console.log("You spelled " + numWords + " words!");
            rl.close();
            return printScores();
        }
        else if(words.includes(word.toLocaleUpperCase())){
            if(checkLetters(word.toLocaleUpperCase())){
                numWords++;
                removeLetters(word.toLocaleUpperCase());
                if(start.length == 0 && board.length == 0){
                    timer = process.hrtime(timer);
                    console.log("Congratulations! Score: " + getScore(true));
                    console.log("You spelled " + numWords + " words!");
                    rl.close();
                    return checkScores(timer[0] + timer[1] / 1E9);
                }
                randomSlice();
                rl.close();
                return runGame();
            }
            else{
                console.log("You don't have the letters for '" + word + "'");
                rl.close();
                return runGame();
            }
        }
        else{
            if(word.length < 2) console.log("Sorry, words must be at least 2 letters");
            else console.log("'" + word + "' is not a word");
            rl.close();
            return runGame();
        }
    });
}
runGame();

function questionName(time){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Enter name: ", (name) => {
        if(name != ""){
            rl.close();
            return updateScores(time, name.slice(0,10));
        }
        else{
            rl.close();
            return questionName(time);
        }
    });
}

function updateScores(time, name){
    for(var i = 0; i < scores.length; i++){
        if(time < scores[i].score){
            scores.splice(i, 0, {"name": name, "score": time});
            scores.pop();
            fs.writeFileSync('./highscores.json', JSON.stringify(scores));
            return printScores();
        }
    }
}

function checkScores(time){
    for(var i = 0; i < scores.length; i++){
        if(time < scores[i].score) return questionName(time);
    }
    return printScores();
}

function printScores(){
    console.log("\nHighscores:");
    for(var i = 0; i < scores.length; i++){
        console.log(scores[i].name.padEnd(10) + ": " + scores[i].score + " seconds");
    }
}