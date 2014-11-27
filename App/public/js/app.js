(function(){
	var app = angular.module('contacts', []);

	app.controller('contactsCTRL', function($scope, $http) {
		$http.get('./data/contacts.json').
			success(function(data) {
				//console.log(data.contact),
				$scope.contacts = data;
			});
	});

})();