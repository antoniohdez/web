$(document).ready(function(){
	startVideo();
});

var socket = new WebSocket('ws://10.43.23.208:8000/');
var stunServer = "stun.l.google.com:19302";
var localVideo = document.getElementById('local-video');
var remoteVideo = document.getElementById('remote-video');
var localStream = null;
var remoteStream;
var peerConn = null;
var started = false;
var isRTCPeerConnection = true;
var mediaConstraints = {'mandatory':{
							'OfferToReceiveAudio':true, 
							'OfferToReceiveVideo':true
							}
						};

function startVideo() {
	try{ 
		navigator.webkitGetUserMedia({audio: true, video: true}, successCallback, errorCallback);
	}catch (e){
		navigator.webkitGetUserMedia("video,audio", successCallback, errorCallback);
	}
	function successCallback(stream) {
		// Replace the source of the video element with the stream from the camera
		localVideo.src = window.webkitURL.createObjectURL(stream);
		localVideo.style.webkitTransform = "rotateY(180deg)";
		localStream = stream;

		connect();
	}
	function errorCallback(error) {
		// Error on the client side
		console.log('An error occurred: [CODE ' + error.code + ']');
	}
}

function stopVideo() {
	localVideo.src = "";
}

// start the connection upon user request
function connect() {
	if (!started && localStream) {
		//document.getElementById('loader').style.visibility='visible';
		console.log("Creating PeerConnection.");
		//
		createPeerConnection();
		console.log('Adding local stream...');
		peerConn.addStream(localStream);
		started = true;
		console.log("isRTCPeerConnection: " + isRTCPeerConnection);
		//create offer
		if (isRTCPeerConnection) {
			peerConn.createOffer(setLocalAndSendMessage, null, mediaConstraints);
		}else{
			var offer = peerConn.createOffer(mediaConstraints);
			peerConn.setLocalDescription(peerConn.SDP_OFFER, offer);
			sendMessage({type: 'offer', sdp: offer.toSdp()});
			peerConn.startIce();
	  	}
	}else{
		alert("Local stream not running yet.");
	}
}

function createPeerConnection() {
	try {
		console.log("Creating peer connection");
		var servers = [];
		servers.push({'url':'stun:' + stunServer});
		var pc_config = {'iceServers':servers};	  
		peerConn = new webkitRTCPeerConnection(pc_config);
		peerConn.onicecandidate = onIceCandidate;
	} catch (e) {
		try {
			peerConn = new RTCPeerConnection('STUN ' + stunServer, onIceCandidate00);
			isRTCPeerConnection = false;
		} catch (e) {
			console.log("Failed to create PeerConnection, exception: " + e.message);
		}
	}
	peerConn.onaddstream = onRemoteStreamAdded;
	peerConn.onremovestream = onRemoteStreamRemoved;
}

function setLocalAndSendMessage(sessionDescription) {
	peerConn.setLocalDescription(sessionDescription);
	sendMessage(sessionDescription);
}

function onIceCandidate(event) {
	if (event.candidate) {
		sendMessage({type: 'candidate',
			label: event.candidate.sdpMLineIndex,
			id: event.candidate.sdpMid,
			candidate: event.candidate.candidate
		});
	} else {
		console.log("End of candidates.");
	}
}

function onIceCandidate00(candidate, moreToFollow) {
	if (candidate) {
		sendMessage({type: 'candidate',
			label: candidate.label,
			candidate: candidate.toSdp()
		});
	}
	if (!moreToFollow) {
		console.log("End of candidates.");
	}
}

// when remote adds a stream, hand it on to the local video element
function onRemoteStreamAdded(event) {
	console.log("Added remote stream");
	remoteVideo.src = window.webkitURL.createObjectURL(event.stream);
}

// when remote removes a stream, remove it from the local video element
function onRemoteStreamRemoved(event) {
	console.log("Remove remote stream");
	remoteVideo.src = "";
}

function onRemoteHangUp() {
	console.log("Remote Hang up.");
	closeSession();
}

function onHangUp() {
	console.log("Hang up.");
	//document.getElementById('anim').style.visibility='hidden';
	if (started) {
		sendMessage({type: 'bye'});
		closeSession();
	}
}

function closeSession() {
	peerConn.close();
	peerConn = null;
	started = false;
	remoteVideo.src = "";	
}

window.onbeforeunload = function() {
	if (started) {
			sendMessage({type: 'bye'});
	}
}

//Text chat
var chatInput;
var chatArea;
var chatNick;
var chatFrame;
myMid = Math.floor(Math.random()*100000);
chatInput = document.getElementById("chat-input");
chatNick = document.getElementById("chat-nick");
chatFrame = document.getElementById("chat-frame");
chatNick.innerHTML = myMid;

$("#chat-input").keypress(function(e) {
    if(e.which == 13) {
        sendChatMsg();
    }
});

$("#chat-send-msj").click(function(){
	sendChatMsg();
});

// send the message to websocket server
function sendMessage(message) {
	var mymsg = JSON.stringify(message);
	console.log("SEND: " + mymsg);
	socket.send(mymsg);
}

function waitForremoteVideoeo() {
	if (remoteStream.videoTracks.length === 0 || remoteVideo.currentTime > 0) {
		transitionToActive();
	} else {
		setTimeout(waitForremoteVideoeo, 100);
	}
}

function transitionToActive() {
	remoteVideo.style.opacity = 1;
	card.style.webkitTransform = "rotateY(180deg)";
	setTimeout(function() { localVideo.src = ""; }, 500);
	setStatus("<input type=\"button\" id=\"hangup\" value=\"Hang up\" onclick=\"onHangup()\" />");
}

// accept connection request
socket.addEventListener("message", onMessage, false);
function onMessage(evt) {
	console.log("RECEIVED: " + evt.data);
	if (isRTCPeerConnection){
		processSignalingMessage(evt.data);
	}else{
		processSignalingMessage00(evt.data);
	}
}

function processSignalingMessage(message) {
	var msg = JSON.parse(message);
	if (msg.type === 'offer') {
		if (!started && localStream) {
			createPeerConnection();
			console.log('Adding local stream...');
			peerConn.addStream(localStream);
			started = true;
			console.log("isRTCPeerConnection: " + isRTCPeerConnection);

			if (isRTCPeerConnection) {
				//set remote description
				peerConn.setRemoteDescription(new RTCSessionDescription(msg));
				//create answer
				console.log("Sending answer to peer.");
				peerConn.createAnswer(setLocalAndSendMessage, null, mediaConstraints);
			}else{
				//set remote description
				peerConn.setRemoteDescription(peerConn.SDP_OFFER, new SessionDescription(msg.sdp));
				//create answer
				var offer = peerConn.remoteDescription;
				var answer = peerConn.createAnswer(offer.toSdp(), mediaConstraints);
				console.log("Sending answer to peer.");
				setLocalAndSendMessage00(answer);
			}
		}
	}else if(msg.type === 'answer' && started){
		peerConn.setRemoteDescription(new RTCSessionDescription(msg));
	}else if(msg.type === 'candidate' && started){
		var candidate = new RTCIceCandidate({sdpMLineIndex:msg.label, candidate:msg.candidate});
		peerConn.addIceCandidate(candidate);
	}else if(msg.type == 'chat'){
		addChatMsg(msg.nick, msg.cid, msg.data);
	}else if(msg.type === 'bye' && started) {
		onRemoteHangUp();
	}
}

function processSignalingMessage00(message) {
	var msg = JSON.parse(message);
	// if (msg.type === 'offer')  --> will never happened since isRTCPeerConnection=true initially
	if(msg.type === 'answer' && started){
		peerConn.setRemoteDescription(peerConn.SDP_ANSWER, new SessionDescription(msg.sdp));
	}else if(msg.type === 'candidate' && started) {
		var candidate = new IceCandidate(msg.label, msg.candidate);
		peerConn.processIceMessage(candidate);
	}else if(msg.type === 'bye' && started) {
		onRemoteHangUp();
	}
}

function setLocalAndSendMessage00(answer) {
	peerConn.setLocalDescription(peerConn.SDP_ANSWER, answer);
	sendMessage({type: 'answer', sdp: answer.toSdp()});
	peerConn.startIce();
}

function sendChatMsg(){
	var classIdx = myMid;
	if(chatInput.value.length < 1){
		return;
	}
	console.log("msg will be sent -> "+chatInput.value);
	addChatMsg("Me", classIdx, chatInput.value);
	sendMessage({type:"chat", data:chatInput.value, mid:myMid, nick:myMid, cid:classIdx});
	
	chatInput.value='';
}

function addChatMsg(id, classIdx, message){
	var div = document.createElement("div");

	var username = document.createElement("span");
	username.className = "chat-username";
	username.innerHTML = id + ": ";

	var msg = document.createElement("span");
	msg.className = "chat-msg";
	msg.innerHTML = message;

	div.appendChild(username);
	div.appendChild(msg);

	chatFrame.appendChild(div);
	chatFrame.scrollTop = chatFrame.scrollHeight;
}