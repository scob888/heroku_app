/**
 * SessionController > used to handle req.session
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	// New session
	new: function(req, res) {
		// Expiration of session
		// var oldDateObj = new Date();
		// var newDateObj = new Date(oldDateObj + 60000);
		// req.session.cookie.expire = newDateObj;

		res.view('session/new');
	},

	create: function(req, res, next) {
		// Check if email or password is filled
		if(!req.param('email') || !req.param('password')) {
			var usernamePasswordRequiredError = [{name		: 'usernamePasswordRequired',
																						message	: 'You must enter both'}];
			req.session.flash = {
				err: usernamePasswordRequiredError
			};

			res.redirect('/session/new');
			return;
		}

		// Find user by email
		User.findOneByEmail(req.param('email'), function foundUser(err, user) {
			if (err) return next(err);

			// If there is no corresponding user
			if (!user) {
				var noAccountError = [{	name		: 'noAccount',
																message	: 'The email address ' + req.param('email') + ' not found'}];
				req.session.flash = {
					err: noAccountError
				}

				res.redirect('/session/new');
				return;
			}

			require("bcrypt-nodejs").compare(req.param('password'), user.encryptedPassword, function(err, valid) {
				if (err) return next(err);

				// If the password is invalid
				if (!valid) {
					var usernamePasswordMismatchError = [{	name: 'usernamePasswordMismatch',
																									message: 'Invalid password'}]
					req.session.flash = {
						err: usernamePasswordMismatchError
					}

					res.redirect('/session/new');
					return;
				}

				// If authentification is OK
				req.session.authenticated = true;
				req.session.User = user;
				user.online = true;

				// Save the modification of user (online = true)
				user.save(function(err) {
					if (err) next(err);

					//User.publishCreate(user, req);
					// Publish to the listner
					User.publishUpdate(user.id, {
						loggedIn: true,
						id: user.id,
						name: user.name,
						action: ' has logged in.'
					})

					// If user is admin
					if (req.session.User.admin) {
						res.redirect('/user');
						return;
					}

					res.redirect('/user/show/' + user.id);
				})
			})
		})
	},

	destroy: function(req, res, next) {
		User.findOne(req.session.User.id, function foundUser(err, user) {
			var userId = req.session.User.id;

			// Alternative syntax
			if (user) {
				user.online = false;

				user.save(function(err) {
					if (err) next(err);

					User.publishUpdate(user.id, {
						loggedIn: false,
						id: user.id,
						name: user.name,
						action: ' has logged out.'
					})

				})
			}
			req.session.destroy();
			res.redirect('/session/new');



			// Tuto syntax
			// if (user) {
			// 	User.update(userId, {online: false,}, function (err) {
			// 		if (err) return next(err);
			//
			// 		User.publishUpdate(userId, {
			// 			loggedIn: false,
			// 			id: userId,
			// 			name: user.name,
			// 			action: ' has logged out.'
			// 		})
			//
			// 		req.session.destroy();
			// 		res.redirect('/session/new');
			//
			// 	})
			// } else {
			// 	req.session.destroy();
			// 	res.redirect('/session/new');
			// }
		})
	}
};
