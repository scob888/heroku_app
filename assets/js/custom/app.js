/**
 * app.js
 *
 * This file contains some conventional defaults for working with Socket.io + Sails.
 * It is designed to get you up and running fast, but is by no means anything special.
 *
 * Feel free to change none, some, or ALL of this file to fit your needs!
 */


(function (io) {

  // as soon as this file is loaded, connect automatically,
  var socket = io.connect();
  if (typeof console !== 'undefined') {
    log('Connecting to Sails.js...');
  }

  io.socket.on('connect', function socketConnected() {
    // Listen for Comet messages from Sails
    io.socket.on('user', cometMessageReceivedFromServer);

    io.socket.get('/user/subscribe');

    ///////////////////////////////////////////////////////////
    // Here's where you'll want to add any custom logic for
    // when the browser establishes its socket connection to
    // the Sails.js server.
    ///////////////////////////////////////////////////////////
    log(
        'Socket is now connected and globally accessible as `socket`.\n' +
        'e.g. to send a GET request to Sails, try \n' +
        '`socket.get("/", function (response) ' +
        '{ console.log(response); })`'
    );
    ///////////////////////////////////////////////////////////


  });


  // Expose connected `socket` instance globally so that it's easy
  // to experiment with from the browser console while prototyping.
  window.socket = socket;


  // Simple log function to keep the example simple
  function log () {
    if (typeof console !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }


})(

  // In case you're wrapping socket.io to prevent pollution of the global namespace,
  // you can replace `window.io` with your own `io` here:
  window.io

);

function cometMessageReceivedFromServer(message) {
  ///////////////////////////////////////////////////////////
  // Replace the following with your own custom logic
  // to run when a new message arrives from the Sails.js
  // server.
  ///////////////////////////////////////////////////////////
  console.log('Herer is the message: ', message);
  //////////////////////////////////////////////////////
  console.log("messageId: "+message.id)
  //if (message.model === 'user') {
    var userId = message.id;
    updateUserInDom(userId, message);
    if (message.verb !== 'destroyed') {
      displayFlashActivity(message)
    }
  //}

  // $('#chatAudio')[0].play();
  // $('.page-header').append("<div class='alert alert-success'>What happened? "  + "id: " + message.id + " was: " + message.verb + "</div>");
  // $(".alert").fadeOut(3000);
}

function displayFlashActivity(message) {
  // $('#chatAudio')[0].play();
  $('.navbar').after("<div class='alert alert-success'>" + message.data.name + message.data.action + "</div>");
  $(".alert").fadeOut(5000);
}

function updateUserInDom(userId, message) {
  var page = document.location.pathname;

  page = page.replace(/(\/)$/, '');
  switch(page) {
    case '/user':
      if (message.verb === 'updated') {
        UserIndexPage.updateUser(userId, message);
      }
      if (message.verb === 'created') {
        UserIndexPage.addUser(message);
      }
      if (message.verb === 'destroyed') {
        UserIndexPage.destroyUser(userId);
      }
      break;
  }
}

var UserIndexPage = {

  updateUser: function(id, message) {
    if (message.data.loggedIn) {
      var $userRow = $('tr[data-id="' + id + '"] td img').first();
      $userRow.attr('src', '/images/online.png');
    } else {
      var $userRow = $('tr[data-id="' + id + '"] td img').first();
      $userRow.attr('src', '/images/offline.png');
    }
  },

  addUser: function (user) {
    var obj = {
      user : user.data,
      // windows.website.csrf comes from layout (add manualy to get the token)
      _csrf: window.website.csrf || ''
    }

    $('tr:last').after(
      JST['assets/templates/addUser.ejs'](obj)
    )
  },

  destroyUser: function(id) {
    $('tr[data-id="' + id + '"]').remove();
  }
}
