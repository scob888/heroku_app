/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	// Return the view 'new' > the view to create a new user
	new: function(req, res) {
		res.view();
	},

	// Create a new user
	create: function(req, res, next) {
		User.create(req.params.all(), function userCreated(err, user) {
			if (err) {
				console.log(err);
				// if session model is define, error in flash of session
				req.session.flash = {
				 	err: err
				}

				return res.redirect('/user/new');
			}
			// res.json(user);
			// Require session model defined
			// Authenticate the new user
			req.session.authenticated = true;
			// Set the user of the current session
			req.session.User = user;

			// Change the status to online
			user.online = true;

			// The user publish to other users his creation
			user.save(function(err) {
				if (err) return next(err);
				user.action = ' signed-up and logged in.'
				User.publishCreate(user);
				// Redirect to the created user
				res.redirect('/user/show/' + user.id);
			})
		})
	},

	// Show a specific user
	show: function(req, res, next) {
		User.findOne(req.params.id, function foundUser (err, user) {
			if(err) return next(err);
			if(!user) return next();

			// Pass to the view 'show' the object user with name user
			res.view({
				user: user
			});
		});
	},

	// List all users
	index: function(req, res, next) {
		User.find(function foundUsers(err, users) {
			if(err) return next(err);

			// Pass to the view 'index' the list of all users
			res.view({
				users:users
			});
		});
	},

	// Edit a user
	edit: function(req, res, next) {
		User.findOne(req.params.id, function foundUser(err, user) {
			if (err) return next(err);
			if (!user) return next('User does not exist');

			res.view({
				user: user
			});
		});
	},

	// Update a user
	update: function(req, res, next) {

		// Marshalling

		// Working
		// var userObj = {
		// 	name: req.param('name'),
		// 	title: req.param('title'),
		// 	email: req.param('email'),
		// 	admin: req.param('admin') ? true : false
		// }

		// Alternative DRY
		var userObj = {
			name: req.param('name'),
			title: req.param('title'),
			email: req.param('email')
		}

		if (req.session.User.admin) {
			userObj['admin'] = req.param('admin') ? true : false
		}
		// If admin
		// if(req.session.User.admin) {
		// 	userObj['admin'] = req.param('admin')
		// }

		User.update(req.params.id, userObj, function userUpdated(err) {

			if (err) {
				return res.redirect('/user/edit/' + req.params.id);
			}
			// Redirect to the show page of the user
			res.redirect('/user/show/' + req.params.id);
		});
	},

	destroy: function(req, res, next) {
		User.findOne(req.params.id, function userFound(err, user) {
			if (err) return next(err);

			// If user doesn't exist, it can be destroyed
			if (!user) return next('User does not exist');

			User.destroy(req.params.id, function userDestroyed(err) {
				if (err) return next(err);

				// Publish the desctruction of the user before destroy it
				User.publishUpdate(userId, {
					name: user.name,
					action: ' has been destroyed.'
				})

				User.publishDestroy(user.id, req);
			})
			// Redirect to the list of user
			res.redirect('/user');
		})
	},

	// A remplacer par autosubscribe ? Non
	subscribe: function(req, res) {

		User.watch(req);
		User.find(function foundUser(err, users) {
			if (err) return next(err);

			//User.watch(req);
			//User.subscribe(req, user, 'message');
			User.subscribe(req, users);

			//res.send(200);
		})

	}

};
