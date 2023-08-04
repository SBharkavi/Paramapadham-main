"use strict";

//page
const homePage=document.querySelector('.home');
const sub=document.querySelector('.homeBG');
const startPage=document.querySelector('.main--0');
const gamePage=document.querySelector('.main--1');


//coins
const coinP0=document.querySelector('#p0--coin');
const coinP1=document.querySelector('#p1--coin');
//button
const homeBtn=document.querySelector('.btn--begin');
const startBtn=document.querySelector('.btn--start');
const rollBtn=document.querySelector('.btn--roll');
const goBackBtn=document.querySelector('.btn--go-back');
const newBtn=document.querySelector(".btn--new");
const replayBtn=document.querySelector('.btn--again');
const endBtn=document.querySelector(".btn--end");
//for keyboard event handlers
const pnamefield0=document.getElementById('pname0');
const pnamefield1=document.getElementById('pname1');
//dice
const dice0El=document.querySelector("#dice--0");
const dice1El=document.querySelector("#dice--1");
//players
const player0El=document.querySelector(".player--0");
const player1El=document.querySelector(".player--1");
//player name 
const playerName0El=document.querySelector('#p0-name');
const playerName1El=document.querySelector('#p1-name');
//scores
const score0El=document.querySelector('#score--0');
const score1El=document.querySelector('#score--1');
//rules
// const gameFlowOverlay= document.querySelector('#game-flow-overlay');
// const gameFlowModal= document.querySelector('#game-flow-modal');
// const closeModalBtn=document.querySelector('.close-gfmodal');
//winner 
const winnerOverlay= document.querySelector('#winner-overlay');
const winnerModal= document.querySelector('#winner-modal');

// voice message
var msg = new SpeechSynthesisUtterance();

//sound
const rolling=new Audio('assets/dice-rolling-sound.mp3');
rolling.playbackRate=3;
const winning=new Audio('assets/winning-sound.mp3');
const snakeHissing=new Audio('assets/snake-sound.mp3');
snakeHissing.playbackRate=2;
const ladderUp=new Audio('assets/ladder-sound.mp3');
ladderUp.playbackRate=6;


//Global declaration
let scores,activePlayer,totalScore,isPlaying,diceVal0,diceVal1,dicevalue,steps,targetPos,currentPos,opponentPlayer,p0Coin,p1Coin,player0,player1,playerNames;

//Objects
const players={
    active:0,
    opponent:1
}
const snakes={
    s16:6,
    s46:21,
    s49:38,
    s62:43,
    s64:4,
    s74:21,
    s89:21,
    s92:4,
    s95:20,
    s99:19
};
const ladders={
    l2:36,
    l7:7,
    l8:23,
    l15:11,
    l21:21,
    l28:56,
    l36:8,
    l51:16,
    l71:20,
    l78:28,
    l87:7
};


// // functionalities
// keyboard event handler - trigger focus once
function triggerFocusOnce(){
    document.addEventListener("keypress",(event)=>{
        if(event.key==="Enter"){
            event.preventDefault();
            pnamefield0.focus();
        }
    },{once : true})
}

function init(){
    scores=[0,0];
    /* players.active=0;
    players.opponent=1; */
    playerNames=[];
    activePlayer=0;
    opponentPlayer=1;
    totalScore=0;
    isPlaying=true;
    steps=0;

    score0El.textContent=0;
    score1El.textContent=0;
    dice0El.classList.add('hidden');
    dice1El.classList.add('hidden');
    rollBtn.disabled=false;
    player0El.classList.add('player--active');
    triggerFocusOnce();
}

//2. generate random dice
const generateRandom=()=>{
    return Math.trunc((Math.random())*3);
}
function rollDice(){
    diceVal0=generateRandom();
    dice0El.src=`assets/dice-${diceVal0}.png`;
    dice0El.classList.remove("hidden");
    diceVal1=generateRandom();
    dice1El.src=`assets/dice-${diceVal1}.png`;
    dice1El.classList.remove("hidden");
    return (diceVal0+diceVal1);
    //return 100;
}

// 4. Move coin to the desired position
function moveCoin(currentCoin,targetPos){
    if(targetPos==='coin'){
        //cut the coin
        console.log(document.getElementsByClassName(targetPos));
        document.getElementsByClassName(targetPos)[opponentPlayer].appendChild(document.getElementById(currentCoin));
    }else{
        //move the coin acoordingly while playing
        document.getElementById(targetPos).appendChild(document.getElementById(currentCoin));
        document.getElementById(currentCoin).style.top='15%';
        document.getElementById(currentCoin).style.left='13%'; 
    } 
}

// Move coin to default positions
const moveCoinDefault=()=>{
    document.getElementsByClassName('coin')[0].appendChild(coinP0);
    document.getElementsByClassName('coin')[2].appendChild(coinP1);
}

// voice message snake & ladder
let textTospeechLadder = function(){
    msg.text = `congrats ${playerNames[activePlayer]}!you are enter a ladder`;
    window.speechSynthesis.speak(msg);
}

let textTospeechSnake = function(){
    msg.text = `Oppsss! ${playerNames[activePlayer]} you are stepped a snake`
    window.speechSynthesis.speak(msg);
}

// 5. snake and ladder verification
function calcSnakesladders(totalScore,activePlayer){
    if((`s${totalScore}`) in snakes){
        textTospeechSnake();
        snakeHissing.play();
        setTimeout(function(){
            moveCoin(`p${activePlayer}--coin`,`b${totalScore-(snakes[`s${totalScore}`])}`); 
        },700)
        return (totalScore-(snakes[`s${totalScore}`]));
    }else if((`l${totalScore}`) in ladders){
        textTospeechLadder();
        ladderUp.play();
        setTimeout(function(){
            moveCoin(`p${activePlayer}--coin`,`b${totalScore+(ladders[`l${totalScore}`])}`);
        },500)
        return (totalScore+ladders[`l${totalScore}`]);
    }else{
        return totalScore;
    }
}

// 6. Update score
function updateScore(totalScore,activeplayer){
    //safe code
    if(totalScore<0){
        totalScore*=(-1);
    }else if(totalScore>100){
        totalScore=100;
    }else{
        totalScore+=0;
    }
    scores[activeplayer]=totalScore;
    //we can easily manipulate HTML DOM using this template strings and proper naming of attribute values
    document.querySelector(`#score--${activeplayer}`).textContent=totalScore;
    return totalScore;
}

// Declare winner
const declareWinner=(activePlayer)=>{
    isPlaying=false;
    document.querySelector('#winner-name').textContent=playerNames[activePlayer] ;
    winnerOverlay.classList.remove('hidden');
    winnerModal.classList.remove('hidden');
    winning.play();
    msg.text = `congratulations ${playerNames[activePlayer]} you are the winner` ;
    window.speechSynthesis.speak(msg); 
}

// 7. throw or switch
function throwOrSwitch(activePlayer,opponentPlayer){
    //GIVING AN ACTIVE PLAYER A SECOND CHANCE TO ROLL AGAIN
    if(scores[activePlayer]===scores[opponentPlayer]){
        if(!((scores[activePlayer]===0)&&(scores[opponentPlayer]===0))){
         scores[opponentPlayer]=0;
         document.querySelector(`#score--${opponentPlayer}`).textContent=scores[opponentPlayer];
         moveCoin(`p${opponentPlayer}--coin`,'coin');
        }
        //giving an active player a second chance to roll
        rollBtn.disabled=false;
    }
    //UPDATE SCORE AND DECLARE WINNER
    else if(scores[activePlayer]>=100){
        updateScore(scores[activePlayer],activePlayer);
         //calling winner code- winner selection
        declareWinner(activePlayer);
    }
    //SWITCH PLAYER
    else{
         //switch player
         activePlayer=(activePlayer===0)?1:0;
         players.active=activePlayer;
         opponentPlayer=(opponentPlayer===0)?1:0;
         players.opponent=opponentPlayer;
         //document.querySelector(`#p${activePlayer}--coin`).style.opacity=1;
         player0El.classList.toggle("player--active");
         player1El.classList.toggle("player--active");
         //after switched, chance is given for an active player to play in their turn itself
         rollBtn.disabled=false;
    }
}

// // functionalities of Event listeners
const startGame=()=>{
   //1. Store player names
   console.log(document.getElementsByClassName('name-field'));
   player0=document.querySelector('#pname0').value;
   player1=document.querySelector('#pname1').value;
   if(player0===''||player1===''){
       alert("Please, enter your name ");
   
   }else{
       //2. Go to next page to play
       init();
       playerNames.push(player0,player1);
       playerName0El.textContent=playerNames[activePlayer];
       playerName1El.textContent=playerNames[opponentPlayer];
       startPage.classList.add('hidden');
       gamePage.classList.remove('hidden');
       gameFlowModal.classList.add('hidden');
       gameFlowOverlay.classList.add('hidden');
    //    gameFlowOverlay.classList.remove('hidden');
    //    gameFlowModal.classList.remove('hidden'); 
   }
}

const playMyTurn=()=>{
    if(isPlaying){
        //1. play sound and button disabled
        rolling.play();
        rollBtn.disabled=true;
        //2. generate random dice
        dicevalue=rollDice();
        //3. calc movements 
        currentPos=scores[activePlayer];
        steps=dicevalue;
        targetPos=currentPos+steps;
        //4. move coin
        //Avoiding logical error that targetPos<0 which means negative
        if(targetPos>0){ 
            //final move
            if(targetPos>100){
                targetPos=100;
            }
            moveCoin(`p${activePlayer}--coin`,`b${targetPos}`);//moveCoin(p0--coin,b5)
        }
        totalScore=targetPos;
        //5. snake ladder verification
        totalScore=calcSnakesladders(totalScore,activePlayer);
        //6. update score
        totalScore=updateScore(totalScore,activePlayer);
        //7. throw or switch
        throwOrSwitch(activePlayer,opponentPlayer);
        activePlayer=players.active;
        opponentPlayer=players.opponent;
    } 
}

const closeModal=function(){
    gameFlowModal.classList.add('hidden');
    gameFlowOverlay.classList.add('hidden');
}

// go back function
const goBack=()=>{
    winnerModal.classList.add('hidden');
    winnerOverlay.classList.add('hidden');
    gamePage.classList.add('hidden');
    startPage.classList.remove('hidden');
    document.querySelector('#pname0').value='';
    document.querySelector('#pname1').value='';
    moveCoinDefault();
    document.querySelector(`.player--${activePlayer}`).classList.remove('player--active');
    init();
}

// home function
const homeFunction=()=>{
        homePage.classList.add('hidden');
        sub.classList.add('hidden');
        homeBtn.classList.add('hidden');
        startPage.classList.remove('hidden');
    }
 

//starting point of the game
init();

// // Event listeners - Mouse
// home page
homeBtn.addEventListener("click",homeFunction);
// start button
startBtn.addEventListener("click",startGame);

// // close modal button
// closeModalBtn.addEventListener("click",closeModal);

// roll dice button
rollBtn.addEventListener("click",playMyTurn);

//Go back to start button
goBackBtn.addEventListener("click",goBack);

//new button
newBtn.addEventListener("click",()=>{
    /* window.location.reload(); */
    //REMOVE WINNER AND ACTIVE PLAYER VISIBILITY
    console.log(document.getElementsByClassName('coin'));
    moveCoinDefault();
    document.querySelector(`.player--${activePlayer}`).classList.remove('player--active');
    init(); 
    player0=document.querySelector('#pname0').value;
    player1=document.querySelector('#pname1').value;
    playerNames.push(player0,player1);
})

//replay button
replayBtn.addEventListener("click",()=>{
    document.querySelector('#winner-name').textContent=``;
    moveCoinDefault();
    winnerModal.classList.add('hidden');
    winnerOverlay.classList.add('hidden');
    document.querySelector(`.player--${activePlayer}`).classList.remove('player--active');
    init(); 
    player0=document.querySelector('#pname0').value;
    player1=document.querySelector('#pname1').value;
    playerNames.push(player0,player1);
})

//end button
endBtn.addEventListener("click",history(0));

// // Event listeners - Keyboard
pnamefield0.addEventListener("keypress",function(event){
    if (event.key === 'Enter') {
        pnamefield1.focus();
    }
})
pnamefield0.addEventListener("keydown",function(event){
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        pnamefield1.focus();
    }
})
pnamefield1.addEventListener("keypress",function(event){
    if (event.key === 'Enter') {
        event.preventDefault();
        startBtn.click();
    }
})
pnamefield1.addEventListener("keydown",function(event){
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        pnamefield0.focus();
    }
})
document.addEventListener("keypress",(event)=>{
    if(event.key==="Enter"){
        if((!(gamePage.classList.contains('hidden')))&&(gameFlowModal.classList.contains('hidden'))&&(gameFlowOverlay.classList.contains('hidden'))){
            event.preventDefault();
            rollBtn.click();
        }   
    }
})




