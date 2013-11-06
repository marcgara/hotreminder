'use strict';

angular.module('hotreminderApp.services.db', []).factory('Db', function($rootScope, $location, CONFIG) {

  var user;

  var subjects    = [];
  var subjects_ref = new Firebase(CONFIG.firebaseUrl + '/subjects');
  console.log("Connected to subjects db. Ref: " + subjects_ref);

  function safeApply(scope, fn) {
    (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
  };

  return {

    setUser: function(u) {
      user = u;
      console.log('connection: '+u.name + ", " + u.id);
      return u;
    },

    getSubjects : function(callbackSuccess) {
      subjects_ref.on('value', function(snapshot) {
        if(snapshot.val() !== null) {
          safeApply($rootScope, function(){
            callbackSuccess(snapshot.val());
            return;
          });
        }
        else { console.log('no values in DB'); }
      });
    },

    getUser: function() {return user;},

    setState: function(id, state) {
      subjects_ref.child(id).child('states').child(user.id).update({state : state});
      },

    addSubject : function(title, content) {
      console.log('Db.addSubject '+ title + ", " + content);
      var date = (new Date()).getTime();
      if(!content) content = '';
      var states = {} // no associations is done at all
      subjects_ref.push({title: title, content: content, author: {name: user.name, id: user.id}, states: states});
    },

    deleteSubject : function(id) {
      subjects_ref.child(id).remove();
    },

    newSubject : function (id, title, content, author, states, date) {
      return {
        id: id,
        title: title,
        content: content,
        author: author,
        states: states,
        date: date,

        hasStateForCurrentUser: function(state) {
          return(states && states[user.id] && states[user.id].state && states[user.id].state == state);
        },
        hasNoState: function() {
          return(!states || !states[user.id] || !states[user.id].state);
        },



      }
    },

  };

});
