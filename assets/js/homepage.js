(function(){
	var app = angular.module('homepage', []);
	
	app.controller('loginController', function($scope) {
		this.signUpDisplay = true;
		this.signUpName;
		this.signUpEmail;
		this.signUpPw;
		this.signUpRepeatPw;
		
		this.signUp = function() {
			console.log("signing up");
			io.socket.put('/signUp', {
				name: $scope.signUpName,
				email: $scope.login.signUpEmail,
				pw: $scope.login.signUpPw
			}, function(res) {
				console.log(res);
			});
		};
		
		this.login = function () {
			console.log("logging in");
			io.socket.put('/login', {
				email: $scope.login.loginEmail,
				pw: $scope.login.loginPw
			}, function() {});
		};
	});
})();