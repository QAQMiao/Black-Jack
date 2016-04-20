var clients = [];
var webSocket = require('ws').Server;
var server = new webSocket( {host : "127.0.0.1", port : 2016} );
var map = [];

/*
 * return the real random number instead of Math.random
 * @return number
 * */
function setRandom() {
  while(1)
  {
    //using now time mod 4/13 to create two number which are random
    var nowTime = Date.now();
    if(judgeOccur(nowTime % 4,nowTime % 13))
      break;
  }
  return nowTime;
}

/*
 * judge this poker can be deliver or not
 * @return boolean
 * */
function judgeOccur(num1,num2) {
  //this poker isn't be delivered
  if(map[num1 * 13 + num2] == 0)
  {
    //mark this poker has been delivered
    map[num1 * 13 + num2] = 1;
    return true;
  }
  return false;
}

server.on('connection', function(webSocket) {

	//Handle the data received from the client
	webSocket.on('message',function(data){
		//Ignore heartbeat data, send score information to the competitor
		if ( data != "Heartbeat" ){
			console.log(data);
			var json = JSON.parse(data);

			if ( json.hasOwnProperty("loginAs") ){
				if ( json.loginAs == "-1" ) {
					// clients.push(webSocket);
					clients[clients.length] = webSocket;
					console.log("A new client has connected to the server");

				} else {
					clients[ json.loginAs ] = webSocket;
					console.log("An old client has connected to the server");
				}
				//Send client ID to the client which has just connected to the server
				var currentClientID = -1;
				for (var x in clients) {
					if (clients[x] == webSocket) {
						currentClientID = x;
						break;
					}
				}
				console.log("Current client ID is: " + currentClientID);
				var clientIDData = JSON.stringify({currentID: currentClientID});
				webSocket.send( clientIDData.toString() );
			} else if ( json.hasOwnProperty("deliverTo") ){
				var cards;
				if (json.deliverTo in clients){
					var i;
					if ( json.hasOwnProperty("start") ){
						if (0 == json.start){
							//A start code 0 means either of the clients attempts to ask the other one to join the game
							clients[ json.deliverTo.toString() ].send(data);
						} else if (1 == json.start) {
							//A start code 1 means the connection between two clients has been established and they are asking server to assign cards
							for (i = 0;i < 54;++i)
								map[i] = 0;
							cards = generateRandomNumber();
							clients[ json.deliverTo.toString() ].send( generatePoker(cards, json.deliverTo, -1, -1, 2, -1) );
							cards = exchange(cards);
							clients[ json.sendBy.toString() ].send( generatePoker(cards, json.sendBy, -1, -1, 2, -1) );
						}
					}

					if (1 == json.status){
						//Status code 1 stands for a requirement for cards from the client
						var cardInfo = setRandom();
						webSocket.send( JSON.stringify( { deliverTo : json.sendBy, card : cardInfo, status : 1 } ) );
					} else if (2 == json.status){
						//Status code 2 or 3 means the clients are trying to end the game and exchange the result, so we just transfer the data from one to the other
						clients[ json.deliverTo.toString() ].send(data);
					} else if (3 == json.status){
						//Status code 2 or 3 means the clients are trying to end the game and exchange the result, so we just transfer the data from one to the other
						clients[ json.deliverTo.toString() ].send(data);
						//Clear and rebuild the map to be ready for a new game
						for(i = 0;i < 54;++i)
							map[i] = 0;
					}
				} else {
					webSocket.send("Invalid competitor client ID");
				}
			} else {
				webSocket.send("Invalid competitor client ID");
			}
		}
	});

	function generatePoker(cards, deliverTo, sendBy, status, start) {
		var data = {
			deliverTo : deliverTo,
			sendBy : sendBy,
			cards : cards,
			start : start,
			status : status
		};
		return JSON.stringify(data);
	}

	function exchange(cards) {
		var temp = cards.sender;
		cards.sender = cards.receiver;
		cards.receiver = temp;
		return cards;
	}

	function generateRandomNumber() {
		return {
			receiver : [setRandom(), setRandom()],
			sender : [setRandom(), setRandom()]
		}
	}

	//Remove the connection when a client disconnect form server
	webSocket.on('close', function() {
		for(var i = 0; i < clients.length; i++){
			if(clients[i] == webSocket) {
				delete clients[i];
				console.log("Client No." + i + " has disconnected from server");
			}
		}
	});
});
console.log("Black-Jack server is running now");
