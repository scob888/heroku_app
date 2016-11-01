module.exports = function(req, res, next) {
  var sessionUserMatchesId = req.session.User.id == req.param('id');
  var isAdmin = req.session.User.admin;

  if (!(sessionUserMatchesId || isAdmin)) {
    var noRightError = [{name: 'noRight', message: 'You must be admin'}]
    req.session.flash = {
      err: noRightError
    }

    res.redirect('/session/new');
    return;
  }
  next();
}
