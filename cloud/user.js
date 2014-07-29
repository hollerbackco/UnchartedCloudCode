
var _ = require('underscore');

var VisitedLocation = Parse.Object.extend("VisitedLocation");
var Leaderboard = Parse.Object.extend("Leaderboard");

// test: 
// curl -X POST \
//   -H "X-Parse-Application-Id: 3B2W6n5eNNtmhPLWoT6CIcXawweNAaOLKYsO7PJX" \
//   -H "X-Parse-Master-Key: vPGpG083c8b20zuMq4fUgMxhBc2JxqePphyKtWX3" \
//   -H "Content-Type: application/json" \
//   -d '{}' \
// https://api.parse.com/1/jobs/deleteUserAndVisitedLocations

// deletes user and their visited locations
Parse.Cloud.job("deleteUserAndVisitedLocations", function(request, status) {

  // Set up to modify user data
  Parse.Cloud.useMasterKey();

  var q1 = new Parse.Query(Parse.User)
  q1.startsWith("username", "joe");
  q1.limit(1000);
  q1.find().then(function(users) {

    var promises = [];

    _.each(users, function(user) {

      var promise = new Parse.Promise();

      var username = user.get("username");
      var userId = user.id;

      if (username != "joen" && 
        username != "joe") {

        var q2 = new Parse.Query(VisitedLocation);
        q2.equalTo("user", user);
        q2.limit(1000);
        q2.find({
          success: function(locations) {

            console.log(userId + " " + username + ": " + locations.length);

            _.each(locations, function(location) {

              promises.push(location.destroy());
            });  

            promise.resolve();

          }, 
          error: function(error) {

            console.error(error);
            promise.reject();
          }
        });


        // delete Leaderboard row

        var p2 = new Parse.Promise();
        var q3 = new Parse.Query(Leaderboard);
        q3.equalTo("user", user);
        q3.limit(1000);
        q3.find({
          success: function(leaderboards) {

            console.log(userId + " " + username + ": " + leaderboards.length);
            
            _.each(leaderboards, function(leaderboard) {

              promises.push(leaderboard.destroy());
            });  

            p2.resolve();

          }, 
          error: function(error) {

            console.error(error);
            p2.reject();
          }
        });

        promises.push(p2);

        // delete User row

        // promises.push(user.destroy());

      } else {
        promise.resolve();
      }

      promises.push(promise);
    });

    return Parse.Promise.when(promises);

  }).then(function() {

    console.log("finished");
    status.success();
  });
});
