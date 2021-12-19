const CryptoJS = require("crypto-js");
const crypto = require('crypto').webcrypto;
var Table = require('cli-table');
const prompt = require('prompt-sync')();

class GameTable{
    parametrs;
    array;
    table;
    constructor (parametrs){
        this.parametrs = parametrs;
        this.array = this.#createArray(this.parametrs.length);
        this.table = this.#createTable(parametrs,this.array);
    }
    #createArray(length){
        let array = [];
        for (let i = 0; i < length; i++){
            array[i] = [];
            for (let j = 0; j < length; j++){
                if (i==j)
                array[i][j] = 'Draw';
                else if ((i < j && (i + j)% 2 !== 0) || (i > j && (i + j)% 2 == 0))
                array[i][j] = 'Win';
                else
                array[i][j] = 'Lose';
            }
        }
        return array;
    }
    #createTable(param, arr){
        let tempArray = arr.map(function (item) {
            return [...item]
        })
        tempArray.unshift([... param]);
            tempArray.forEach(function(item, i){
                item.unshift(tempArray[0][i]);
            })
        tempArray[0][0] = "X";
        return tempArray;
    }
    print(){
        let printTable = new Table();
        this.table.forEach(function(item, i){ 
            printTable.push(item);
        })
        console.log("You muve: vertically (columns).")
        console.log("Computer muve: horizontally (rows).")
        console.log(printTable.toString());
    }
    
}
class Key{
    hexKey;
    constructor(){
        this.hexKey = this.#createKey();
    }
    #createKey(){
        let a = new Int16Array(32);
        const Key = Buffer.from(crypto.getRandomValues(a)).toString('hex');
        return Key;
    }
    print(){
        console.log("HMAC key: " + this.hexKey);
    }
}
class Hmac{
    text;
    key;
    HmacHash;
    constructor(text, key){
        this.text = text;
        this.key = key;
        this.HmacHash = this.#createHmacHash(text, key)
    }
    #createHmacHash(text, key){
        let hash = CryptoJS.HmacSHA256(text, key);
        let hashInBase64 = CryptoJS.enc.Hex.stringify(hash);
        return hashInBase64;
    }
    print(){
        console.log("HMAC: " + this.HmacHash);
    }
}
class Winner{
    playerMuve;
    compMuve;
    gameArray;
    winner;
    constructor (playerMuve, compMuve, gameArray){
        this.playerMuve = playerMuve;
        this.compMuve = compMuve;
        this.gameArray = gameArray;
        this.winner = this.#searchWinner(playerMuve, compMuve, gameArray);
    }
    #searchWinner(playerMuve, compMuve, gameArray){

        switch(gameArray[playerMuve][compMuve]){
            case "Win":
                return 'Player';
            case "Lose":
                return 'Computer';
            default:
                return 'Draw';
        }
    }
    showMessage(){
        switch(this.winner){
            case "Player":
                console.log("You Win");
                break;
            case "Computer":
                console.log("You Lose");
                break;
            default:
                console.log("Draw");
        }
    }
}
function checkСorrectArguments(input){
    if (input[0] == 'help'){
        console.log("Enter 3 or more an odd words or symbols by a space for the game.");
        console.log("Example: rock paper scissors lizard Spock  or: A B C D E F G");
        return true;
    }
    if(input.length < 3){
        console.log ("Enter three or more arguments or use command 'help'");
        return true;
    }
    if(input.length % 2 == 0){
        console.log ("Enter even number of arguments or use command 'help'");
        return true;
    }
    if(input.some(x => input.indexOf(x) !== input.lastIndexOf(x))){
        console.log ("Enter non-duplicate arguments or use command 'help'");
        return true
    }
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
} 
function game(arguments){
    var compMuve = getRandomInt(arguments.length);
    const key = new Key();
    const HMACkey = new Hmac(compMuve, key.hexKey);
    HMACkey.print();
    var gameTable = new GameTable(arguments);
    let playerMuve;
    console.log("Available muves:");
    arguments.forEach(function(item, i){
        console.log(++i + " - " + item);
    })
    console.log("0 - exit");
    console.log("? - help");
    for (;;){
        playerMuve = prompt('Enter your muve: ');
        if (playerMuve == "?"){
            gameTable.print();
        }
        else if (playerMuve == "0"){
            return "Good bye!"
        }
        else if (playerMuve <= arguments.length && playerMuve > 0){
            console.log("You muve: " + arguments[playerMuve-1])
            playerMuve--;
            break;
        }
        else{
            console.log("Enter the number from '1' to '" + arguments.length + "', '0' to exit and '?' to help")
        }
    }     
    console.log("Computer muve: " + arguments[compMuve]);
    const winner = new Winner(playerMuve, compMuve, gameTable.array);
    winner.showMessage();
    key.print();
    return "";
}
if (checkСorrectArguments(process.argv.slice(2)) !== true){
    console.log(game(process.argv.slice(2)));
}
