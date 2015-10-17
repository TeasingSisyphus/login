/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var passwords = require('machinepack-passwords');
module.exports = {
	signUp: function(req, res) {
		console.log("Signup requested");
	
		//req.socket.manager.sockets.auth = true; 
		
		//You can directly assign new attributes to socket manager
		if (!req.socket.manager.foo) {
			req.socket.manager.foo = 'foo';
		} else {
			req.socket.manager.foo += ' foo';		
		}
		console.log(req.socket.manager.foo);		
		
		//Including json
		req.socket.manager.testJson = {fudge: 'maker', made: 3};
		console.log(req.socket.manager.testJson);
		
		//Create copy of session for websocket
		//This should be better than using manager
    	var session = req.session;
	    if (req.isSocket) {
	    	var socketId = req.socket.id
    	    var handshake = req.socket.manager.handshaken[req.socket.id];
	        if (handshake) {
            	handshake.session = session;
        	}
    	}
    	console.log(handshake.session);
    	res.send(handshake);
    	handshake.session.boo = 'boo';
    	handshake.session.testJson = {fudge: 'pounder', pounded: 4};
		console.log(handshake.session.boo);
		console.log(handshake.session.testJson);
		passwords.encryptPassword({password: req.body.pw}).exec({
			error: function (err) {
				console.log(err);
				res.send(404);
			},
			
			success: function (result) {
				User.create({
				name: req.body.name,
				email: req.body.email,
				encryptedPw: result
				}).exec(function (err, newUser){
					if (err || !newUser) {
						console.log(err);
						res.send(404);
					} else {
						console.log(newUser);
					}
				});				
			}
		});
	},
	
			
	login: function(req, res) {
		console.log("login requested from " + req.socket.id);
		User.findOne({email: req.body.email}).exec(function (err, user){
			if (err || !user) {
				console.log("user not found");
				res.send(404);
			} else {
				passwords.checkPassword({
					passwordAttempt: req.body.pw,
					encryptedPassword: user.encryptedPw
				}).exec({
					//Unexpected error
					error: function(err) {
						console.log("Unexpected error in password comparison:");
						console.log(err);
					},
					incorrect: function() {
						console.log("Passwords were not a match");
					},
					success: function () {
						console.log("Passwords matched. Logging in " + req.body.email);
						//Create copy of session for websocket
						//This should be better than using manager
    					var session = req.session;
					    if (req.isSocket) {
			    		    var handshake = req.socket.manager.handshaken[req.socket.id];
		    			    if (handshake) {
			            		session = handshake.session;
        					}
							console.log(session.usr); 
							console.log(session.auth);       					
        					session.usr = user;
        					session.auth = true;
        					req.socket.manager.handshaken[req.socket.id].session = session;
        					
						}
					}	
				});
			}
		});
	},
	
	test: function (req, res) {
		console.log(req.session);
	}

};

