//store the four kind of poker suit
var flower = ["b","r","s","f"];

/*
 * use an array to record this poker has been delivered or not.
 * 0 is avaible and 1 is unavaible.
 * */
var map = [];

var competitorData = null;

/*
 * singleton for maker and player
 * score -- the sum of pokers
 * numOfA -- the number of poker A
 * setScore -- add the sum of pokers
 * getScore -- get the sum of pokers now
 * getNumOfA -- get the number of poker A now
 * */
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
		getNumOfA: function() {
			return numOfA;
		}
	};
}();

var player = function(){
	var score = 0;
	var numOfA = 0;
	var winTime = 0;
	var cards = [];
	return {
		init: function() {
			score = 0;
			numOfA = 0;
			winTime = 0;
			cards = [];
		},
		pushPoker: function(num) {
			cards.push(num);
		},
		getPoker: function() {
			return cards;
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

/*
 * bind click event for start/stand/hit/restart button
 * @return void
 * */
document.getElementById("start").onclick = initStart;

/*
* a function to handle the action of standing
* @return void
* */
document.getElementById("stand").onclick = function() {
	var playerScore = calculateScore(player);
	document.getElementById("hit").style.display = "none";
	document.getElementById("stand").style.display = "none";
	if (competitorData != null)
	{
		//if competitorData exists, we should judge and show the result and  tell the competitor that the data has received
		sendData(competitor, playerScore, player.getPoker(), -1, 3);
		judgeResult(playerScore, competitorData.score, competitorData.cards);
	}
	else
	{
		//otherwise we should pause the game and wait for the competitor response
		sendData(competitor, playerScore, player.getPoker(), -1, 2)
	}
};

document.getElementById("hit").onclick = function() {
	document.getElementById("hit").style.display = "none";
	document.getElementById("stand").style.display = "none";
	console.log("Hit" + player.getPoker());
	sendData(competitor, -1, -1, -1, 1);
};

document.getElementById("restart").onclick = function() {
	connection.close();
	window.location = window.location;
};

/*
 * init the UI for gaming
 * @return void
 * */
function initStart() {
	var wait = document.createElement("p");
	wait.innerHTML = "please waiting for competitor to join...";
	wait.style.fontSize = "70px";
	wait.style.color = "white";
	var ss = document.getElementById("start");
	competitor = prompt("Please input the id which in your competitor's right-top corner of screen","");
	ss.style.display = "none";
	document.getElementById("container").insertBefore(wait,ss);
	sendData(competitor, -1, -1, 0);
}

function confirmStart(competitorID) {
	var con = confirm("User No." + competitorID + " invites you to join a game. Ready to go? ");
	if(con){
		competitor = competitorID;
		sendData(competitorID, -1, -1, 1);
	}
}

function startGame(myCards, cardsOfCompetitor) {
	for(var i = 0;i < 54;++i)
		map[i] = 0;
	maker.init();
	player.init();
	document.getElementById("container").style.display = "none";
	document.getElementById("restart").style.display = "none";
	document.getElementById("gaming").style.display = "flex";

	//init competitor's first card
	maker.setScore(createPoker(cardsOfCompetitor[0], 4));
	//Make a fake poker for competitor
	createPoker(-1, 1);
	document.getElementById("maker-score").innerHTML = "Score:" + calculateScore(maker);

	//init my first card
	player.setScore(createPoker(myCards[0], 2));
	//init my second card
	player.setScore(createPoker(myCards[1], 2));
	document.getElementById("player-score").innerHTML = "Score:" + calculateScore(player);

	console.log("Start:" + player.getPoker());
}

/*
 * create the poker random.
 * 1 -- create back of poker for maker
 * 2 -- create pokers for player
 * 3 -- create the rest of pokers for maker
 * 4 -- create the first poker for maker
 * @return number
 * */
function createPoker(randomNumber, p) {
	var poker = document.createElement("li");
	if(p == 1)
	{
		var pokerUrl = "url('./img/blue.png')";
		poker.setAttribute("id","maker-poke-back");
	}
	else
	{
		var time = randomNumber;
		var pokerUrl = "url('./img/" + flower[time % 4] + (time % 13 + 1)+ ".png')";
		player.pushPoker(time % 4 * 13 + time % 13 + 1);
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

/*
 * judge who is winner
 * @return void
 * */
function judgeResult(playerScore, makerScore, cards) {
	//here is how we show the data of the competitor
	document.getElementById("maker-score").innerHTML = "Score:" + makerScore;
	drawCompetitorPoker(cards);

	var standBt = document.getElementById("stand");
	var message = document.createElement("p");
	//according sum of poker to judge who is winner
	if(playerScore > 21)
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
	// document.getElementById("maker-poke-back").style.display = "none";
}

/*
 * calculate the score by the player
 * @return number
 * */
function calculateScore(ob) {
	//when the A is 1,the sum of poker
	var ans = ob.getScore();
	//the number of A
	var num = ob.getNumOfA();
	//according the sum to deside A is 11 or 1
	while(ans < 12 && num)
	{
		ans += 10;
		--num;
	}
	return ans;
}


/*************** Client part ****************/
var heartTimer = 0;
var isAlive = false;
var currentID = -1;
var connection = new WebSocket("ws://127.0.0.1:2016/");

/*
 * a function to send heartbeat package to keep the connection alive
 * @return void
 * */
function keepAlive(connection) {
	var time = new Date();
	if (heartTimer != 0 && time.getTime() - heartTimer > 20000)
	{
		connection.close();
		console.log("Connection has been closed");
	}
	else
	{
		connection.send("Heartbeat");
		heartTimer = time.getTime();
		setTimeout(function() {
			keepAlive(connection);
		}, 10000);
	}
}

/*
 * establish the connection
 * @return void
 * */
connection.onopen = function() {
	console.log("Connected to the server");
	isAlive = true;
	var currentIDFromCookie = getCookie("currentID");
	if (currentIDFromCookie != ""){
		connection.send(JSON.stringify({loginAs : currentIDFromCookie}));
	} else {
		connection.send(JSON.stringify({loginAs : "-1"}));
	}

	//send heartbeat packages
	setTimeout(function() {
		keepAlive(connection);
	}, 10000)
};

/*
 * receive the messages from server
 * @return boolean
 * */
connection.onmessage = function(message) {
	console.log(message.data);
	if (message.data == "Invalid competitor client ID")
	{
		window.location = window.location;
		return false;
	}
	else
	{
		var json = JSON.parse(message.data);
		console.log(json);

		//assign the current client ID received from the server to local variable
		if(json.hasOwnProperty("currentID"))
		{
			currentID = json.currentID;
			setCookie("currentID", currentID, 365);
			var id = document.getElementById("ID");
			id.innerHTML = "ID: " + currentID;
			return true;
		}

		//handle the data related to the game
		if (json.hasOwnProperty("deliverTo") && json.deliverTo == currentID)
		{
			if(0 == json.start)
			{
				confirmStart(json.sendBy);
			}
			else if(2 == json.start)
			{
				startGame(json.cards.receiver, json.cards.sender);
			}
			console.log(json.status);
			if (1 == json.status)
			{
				player.setScore(createPoker(json.card, 2));
				document.getElementById("player-score").innerHTML = "Score:" + calculateScore(player);
				console.log( calculateScore(player) );
				console.log(competitorData);

				//when user is busted, send data to the other one and hide buttons
				if (calculateScore(player) > 21)
				{
					var playerScore = calculateScore(player);
					if (competitorData != null)
					{
						sendData(competitor, playerScore, player.getPoker(), -1, 3);
						judgeResult(playerScore, competitorData.score, competitorData.cards);
					}
					else
					{
						sendData(competitor, playerScore, player.getPoker(), -1, 2)
					}
				}
				else
				{
					document.getElementById("hit").style.display = "inline";
					document.getElementById("stand").style.display = "inline";
				}
			}
			else if (2 == json.status)
			{
				//a status code 2 means the other one has finished the game, so we store the competitor's data and wait for the end the game
				competitorData = json;
			}
			else if (3 == json.status)
			{
				//a status code 3 means the other one has received the data of current client and ready to end the game. So we judge and show the result.
				console.log(calculateScore(player)+ "&&&" + json.score);
				judgeResult(calculateScore(player), json.score, json.cards);
			}
			return true;
		}
		return false;
	}
};

function drawCompetitorPoker(cards) {
	var makerList = document.getElementById("maker-poke");
	while(makerList.hasChildNodes())
	{
		makerList.removeChild(makerList.firstChild);
	}
	for (var i = 1; i < cards.length; i++){
		console.log("X---" + i);
		console.log("XXXXX" + cards[i]);
		showCompetitor(cards[i]);
	}
}

function showCompetitor(num) {
	var num1 = num % 13;
	if(num1 == 0)
		num1 = 13;
	var num2 = (num - num1) / 13;
	var poker = document.createElement("li");
	var pokerUrl = "url('./img/" + flower[num2] + num1 + ".png')";
	poker.setAttribute("style","background:"+pokerUrl+";background-size:100% 100%");
	document.getElementById("maker-poke").appendChild(poker);
	return num1;
}

/*
 * disconnect from the server
 * @return void
 * */
connection.onclose = function() {
	isAlive = false;
	currentID = -1;
	console.log("Disconnected from the server");
};

/*
 * handle the error occurred to the connection
 * @return void
 * */
connection.onerror = function(event) {
	isAlive = false;
	currentID = -1;
	console.log(event);
};

/*
 * a function to simplify the sending action
 * @return boolean
 * */
var sendData = function(competitor, myScore, cards, start, status) {
	if (currentID < 0 && connection != null) return false;
	var time = new Date();
	var dataToSend = JSON.stringify({
		deliverTo : competitor,
		sendBy : currentID ,
		score : myScore,
		cards : cards,
		start : start,
		status : status,
		timeStamp : time.getTime()
	} );
	connection.send(dataToSend.toString());
	return true;
};

function setCookie(cookieName, value, expireDays){
	var expireDate = new Date();
	expireDate.setDate(expireDate.getDate() + expireDays);
	document.cookie=cookieName+ "=" + encodeURIComponent(value) + ((expireDays==null) ? "" : ";expires=" + expireDate.toGMTString() + ";path=/");
}

function getCookie(cookieName){
	if (document.cookie.length > 0)
	{　　
		var startOfCookie = document.cookie.indexOf(cookieName + "=");
		if (startOfCookie != -1)
		{
			startOfCookie = startOfCookie + cookieName.length + 1;
			var endOfCookie = document.cookie.indexOf(";", startOfCookie);
			if (endOfCookie == -1) endOfCookie = document.cookie.length;
			return decodeURIComponent(document.cookie.substring(startOfCookie, endOfCookie));
		}
	}
	return ""
}
