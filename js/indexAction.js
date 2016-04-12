var flower = ["b","r","s","f"];   //store the four kind of poker suit
var map = [];   //use an array to record this poker has been delivered or not.0 is avaible and 1 is unavaible.

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

document.getElementById("start").onclick = initStart;

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

function makerPlay () {
  while(calculateScore(maker) < 17)
  {
    maker.setScore(createPoker("",3));
  }
}

document.getElementById("hit").onclick = function() {
  player.setScore(createPoker("",2));
  document.getElementById("player-score").innerHTML = "Score:" + calculateScore(player);
  if(calculateScore(player) > 21)
  {
    judgeResult();
  }
}

function judgeResult() {
  document.getElementById("maker-score").innerHTML = "Score:" + calculateScore(maker);
  var standBt = document.getElementById("stand");
  var message = document.createElement("p");
  var playerScore = calculateScore(player);
  var makerScore = calculateScore(maker);
  if(playerScore > 21)
    message.innerHTML = "You Bust!";
  else if(makerScore > 21)
    message.innerHTML = "Maker Bust!";
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

document.getElementById("stand").onclick = judgeResult;

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

function calculateScore (ob) {
  var ans = ob.getScore();
  var num = ob.getNumOfA();
  while(ans < 12 && num)
  {
    ans += 10;
    --num;
  }
  return ans;
}

function setRandom() {
  while(1)
  {
    var nowTime = Date.now();
    if(judgeOccur(nowTime % 4,nowTime % 13))
      break;
  }
  return nowTime;
}

function judgeOccur(num1,num2) {
  if(map[num1 * 13 + num2] == 0)
  {
    map[num1 * 13 + num2] = 1;
    return true;
  }
  return false;
}
