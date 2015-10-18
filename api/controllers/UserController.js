/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var passwords = require('machinepack-passwords');
var Promise = require('bluebird');

//Session data for sockets
var Session = function() {
	this.auth = false;
	this.usr = {};
};

var findUser = function(id) {
	return new Promise(function (resolve, reject) {
		User.findOne(id).exec(function (error, user) {
			if (error || !user) {
				return reject(error);
			} else {
				return resolve(user);
			}
		});
	});
};

findUserByEmail = function (email) {
	return new Promise(function (resolve, reject) {
		User.findOne({email: email}).exec(function (error, user) {
			if (error || !user) {
				console.log("Can't find a user with requested id");
				return reject(error);
			} else {
				return resolve(user);
			}
		});
	});
};

var encryptPassword = function (pw) {
	return new Promise(function (resolve, reject) {
		passwords.encryptPassword({password: pw}).exec({
			error: function (err) {
				return reject(err);
			},
			success: function (encryptedPw) {
				return resolve(encryptedPw);
			}
		});
	});
};

var checkPassword = function (pw, encryptedPw) {
	return new Promise(function (resolve, reject) {
		passwords.checkPassword({
			passwordAttempt: pw,
			encryptedPassword: encryptedPw
		}).exec({
			error: function (err) {
				console.log("Error checking password");
				return reject(err);
			},
			incorrect: function() {
				console.log("Incorrect password");
				return reject("Wrong password");
			},
			success: function () {
				console.log("logging in");
				return resolve(true);
			}
		});
	});
};



module.exports = {
	signUp: function(req, res) {
		console.log("Signup requested");
		var promiseEncryptedPw = encryptPassword(req.body.pw).then(function (encryptedPw) {
			User.create({
				name: req.body.name,
				email: req.body.email,
				encryptedPw: encryptedPw
			}).exec(function (err, user) {
				if (err || !user) {
					console.log("Error creating user for signup");
					res.negotiate(err);
				} else {
					res.send(user);
				}
			});
		}).catch(function (reason) {
			console.log("Error encrypting password for signup");
			res.negotiate(reason);
		});
	},
	
	//This prints user session data, THEN updates it
	//The session data is created upon the first login request
	//It will print as undefined for the first request, and populated
	//in subsequent requests
	login: function(req, res) {
		console.log("\nLogin requested from " + req.socket.id + " for email: " + req.socket.email);
		
		var promiseUser = findUserByEmail(req.body.email).then(function(user){
			checkPassword(req.body.pw, user.encryptedPw).then(function(val){
    			var session = req.session;
				if (req.isSocket) {
			    	var handshake = req.socket.manager.handshaken[req.socket.id];
		    		if (handshake) {
						if (handshake.session) {
							session = handshake.session;
						}
						//This is undefined the first time, to show that the updated session
						//data persists between requests
						console.log("logging session data");
						console.log(req.socket.manager.handshaken[req.socket.id].session);						
						session.user = user;
						session.auth = true;
						req.socket.manager.handshaken[req.socket.id].session = session;
						res.send({loggedIn: true, user: user, session: session});
        			}
        		}				
			}).catch(function (reason) {
				console.log("login for email " + req.body.email + " failed due to ");
				console.log(reason);
			});
		}).catch(function (reason) {
			console.log("Failed to find user with email " + req.body.email);
			console.log(reason);
		});
		
	},
	
	//Sends 200 status code
	//Only fires if request passes isSignedIn.js
	//request receives a 403 if unauthenticated
	amIAuthenticated: function (req, res) {
		console.log("\nUser is authenticated");
		res.send(200);
	},
	
	test: function (req, res) {
		console.log(req.session);
	},

};

