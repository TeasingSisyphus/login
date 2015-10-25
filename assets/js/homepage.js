(function(){
	var app = angular.module('homepage', []);
	
	app.controller('loginController', function($scope) {
		this.signUpDisplay = true;
		this.signUpName;
		this.signUpEmail;
		this.signUpPw;
		this.signUpRepeatPw;
		this.loginEmail;
		this.loginPw;
		
		this.signUp = function() {
			console.log("signing up");
			io.socket.put('/signUp', {
				name: $scope.login.signUpName,
				email: $scope.login.signUpEmail,
				pw: $scope.login.signUpPw
			}, function(res) {
				console.log(res);
				$scope.login.signUpName = '';
				$scope.login.signUpEmail = '';
				$scope.login.signUpPw = '';
				$scope.login.signUpRepeatPw = '';
				$scope.$apply();
			});
		};
		
		this.login = function () {
			console.log("logging in");
			io.socket.put('/login', {
				email: $scope.login.loginEmail,
				pw: $scope.login.loginPw
			}, function(res) {
				console.log(res);
				$scope.login.loginEmail = '';
				$scope.login.loginPw = '';
				$scope.$apply();
				
			});
		};
		
		
		this.amIAuthenticated = function () {
			console.log("checking authentication status");
			io.socket.get('/amIAuthenticated', function (res) {
				console.log(res);
			});
		};		
	});
	

	
})();