//store the four kind of poker suit
var flower = ["b","r","s","f"];

//use an array to record this poker has been delivered or not.0 is avaible and 1 is unavaible.
var map = [];

/***
singleton for maker and player
score -- the sum of pokers
numOfA -- the number of poker A
setScore -- add the sum of pokers
getScore -- get the sum of pokers now
getNumOfA -- get the number of poker A now
***/
var maker = function(){
  var score = 0;
  var numOfA = 0;
  var winTime = 0;
  return {
    init: function() {
      score = 0;
      numOfA = 0;
      winTime = 0;
    },
    setScore: function(sc) {
      if(sc < 10)
        score += sc;
      else
        score += 10;
      if(sc == 1)
        ++numOfA;
    },
    getScore: function() {
      return score;
    },
    getNumOfA: function  () {
      return numOfA;
    }
  };
}();

var player = function(){
  var score = 0;
  var numOfA = 0;
  var winTime = 0;
  return {
    init: function() {
      score = 0;
      numOfA = 0;
      winTime = 0;
    },
    setScore: function(sc) {
      if(sc < 10)
        score += sc;
      else
        score += 10;
      if(sc == 1)
        ++numOfA;
    },
    getScore: function() {
      return score;
    },
    increaseNumOfA: function() {
      ++numOfA;
    },
    getNumOfA: function() {
      return numOfA;
    }
  };
}();

//bind click event for start/stand/hit/restart button
document.getElementById("start").onclick = initStart;

document.getElementById("stand").onclick = judgeResult;

document.getElementById("hit").onclick = function() {
  player.setScore(createPoker("",2));
  document.getElementById("player-score").innerHTML = "Score:" + calculateScore(player);
  if(calculateScore(player) > 21)
  {
    judgeResult();
  }
}

document.getElementById("restart").onclick = function  () {
   var makerList = document.getElementById("maker-poke");
   var playerList = document.getElementById("player-poke");
   while(makerList.hasChildNodes())
   {
    makerList.removeChild(makerList.firstChild);
   }
   while(playerList.hasChildNodes())
   {
    playerList.removeChild(playerList.firstChild);
   }
   initStart();
   var msg = document.getElementById("message");
   msg.parentNode.removeChild(msg);
   document.getElementById("hit").style.display = "inline";
   document.getElementById("stand").style.display = "inline";
}

//init the UI for gaming
function initStart() {
  for(var i = 0;i < 54;++i)
    map[i] = 0;
  maker.init();
  player.init();
  document.getElementById("container").style.display = "none";
  document.getElementById("restart").style.display = "none";
  document.getElementById("gaming").style.display = "flex";
  maker.setScore(createPoker("" , 4));
  createPoker("maker-poke-back" , 1);
  document.getElementById("maker-score").innerHTML = "Score:" + calculateScore(maker);
  makerPlay();
  player.setScore(createPoker("" , 2));
  player.setScore(createPoker("" , 2));
  document.getElementById("player-score").innerHTML = "Score:" + calculateScore(player);
};

/***
create the poker random.
1 -- create back of poker for maker
2 -- create pokers for player
3 -- create the rest of pokers for maker
4 -- create the first poker for maker
***/
function createPoker(id,p) {
  var poker = document.createElement("li");
  if(p == 1)
  {
    var pokerUrl = "url('./img/blue.png')";
    poker.setAttribute("id","maker-poke-back");
  }
  else
  {
    var time = setRandom();
    var pokerUrl = "url('./img/" + flower[time % 4] + (time % 13 + 1)+ ".png')";
  }
  poker.setAttribute("style","background:"+pokerUrl+";background-size:100% 100%");
  if(p == 1 || p == 4)
    document.getElementById("maker-poke").appendChild(poker);
  if(p == 2)
    document.getElementById("player-poke").appendChild(poker);
  if(p == 3)
  {
    poker.style.display = "none";
    document.getElementById("maker-poke").appendChild(poker);
  }
  return time % 13 + 1;
}

//the AI for maker
function makerPlay () {
  while(calculateScore(maker) < 17)
  {
    maker.setScore(createPoker("",3));
  }
}

//judge who is winner
function judgeResult() {
  document.getElementById("maker-score").innerHTML = "Score:" + calculateScore(maker);
  var standBt = document.getElementById("stand");
  var message = document.createElement("p");
  var playerScore = calculateScore(player);
  var makerScore = calculateScore(maker);
  if(playerScore > 21)                //according sum of poker to judge who is winner
    message.innerHTML = "You Bust!";
  else if(makerScore > 21)
    message.innerHTML = "Maker Bust!<br />You Win!";
  else if(playerScore > makerScore)
    message.innerHTML = "You Win!";
  else if(playerScore < makerScore)
    message.innerHTML = "You Lost!";
  else
    message.innerHTML = "Push!";
  message.style.color = "white";
  message.setAttribute("id","message");
  message.style.fontSize = "60px";
  document.getElementById("right-top").insertBefore(message,standBt);
  standBt.style.display = "none";
  $("ul li").show();
  document.getElementById("restart").style.display = "inline";
  document.getElementById("hit").style.display = "none";
  document.getElementById("maker-poke-back").style.display = "none";
}

//calculate the score by the object
function calculateScore (ob) {
  var ans = ob.getScore();    //when the A is 1,the sum of poker
  var num = ob.getNumOfA();   //the number of A
  while(ans < 12 && num)      //according the sum to deside A is 11 or 1
  {
    ans += 10;
    --num;
  }
  return ans;
}

// return the real random number instead of Math.random
function setRandom() {
  while(1)
  {
    var nowTime = Date.now();   //using now time mod 4/13 to create two number which are random
    if(judgeOccur(nowTime % 4,nowTime % 13))
      break;
  }
  return nowTime;
}

//judge this poker can be deliver or not
function judgeOccur(num1,num2) {
  if(map[num1 * 13 + num2] == 0)  //this poker isn't be delivered
  {
    map[num1 * 13 + num2] = 1;    //mark this poker has been delivered
    return true;
  }
  return false;
}
