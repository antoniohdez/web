var element = $("#suggestion");
var topics = ["Your favorite food", "Wheter", "Your favorite music", "Movies you have seen", "Places in your country/city", "Work/School", "Trips", "A book you have read"];
var randomIndex = Math.floor(Math.random()*topics.length);
element.html( topics[randomIndex] );