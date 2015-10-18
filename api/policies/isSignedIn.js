module.exports = function isSignedIn (req, res, next) {
    	var session = req.session;
	    var socketId = req.socket.id
    	var handshake = req.socket.manager.handshaken[req.socket.id];
	    if (handshake) {
	        if (handshake.session) {
	        	session = handshake.session;
	        }
	        console.log(session);
            if (session.auth) {
            	next();
            } else{
            	console.log("user is not authenticated.");
            	return res.forbidden();
            }
        } else {
        	console.log("user requested authentication over non-socket");
        	return res.forbidden();
        }
};