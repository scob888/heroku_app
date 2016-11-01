/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  /***************************************************************************
  *                                                                          *
  * A flag to toggle schemaless or schema mode in databases that support     *
  * schemaless data structures. If turned off, this will allow you to store  *
  * arbitrary data in a record. If turned on, only attributes defined in the *
  * model's attributes object will be stored.                                *
  *                                                                          *
  ***************************************************************************/
  schema:  true,
  //autosubscribe: ['destroy', 'update'],

  attributes: {
    name: {
      type: 'string',
      required: true
    },

    title: {
      type: 'string'
    },

    email: {
      type:'string',
      email: true,
      required: true,
      unique: true,
    },

    encryptedPassword: {
      type: 'string'
    },

    online: {
      type: 'boolean',
      defaultsTo: false
    },

    admin: {
      type: 'boolean',
      defaultsTo: false
    },

    // toJson: function() {
    //   var obj = this.toObject();
    //   delete obj.password;
    //   delete obj.confirmation;
    //   delete obj.encryptedPassword;
    //   delete obj._csrf;
    //   return obj;
    // },
  },

  // Because of checkbox
  // beforeValidate: function(values, next) {
  //   if (typeof values.admin !== 'undefined') {
  //     if(values.admin === 'unchecked') {
  //       values.admin = false;
  //     }
  //     else if(values.admin[1] === 'checked') {
  //       values.admin = true;
  //     }
  //   }
  //   next();
  // },

  // Encrypte the password > need bcrypt-nodejs
  beforeCreate: function(values, next) {
    // If password not null and password = confirmation
    if (!values.password || values.password != values.confirmation) {
      return next({err: ["Password not match"]})
    }

    require("bcrypt-nodejs").hash(values.password, null, null, function passwordEncrypted(err, encryptedPassword) {
      if (err) return next(err);
      values.encryptedPassword = encryptedPassword;

      next();
    })
  }
};
