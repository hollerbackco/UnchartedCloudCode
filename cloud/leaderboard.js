var _ = require('underscore');


// test: 
// curl -X POST \
//   -H "X-Parse-Application-Id: 3B2W6n5eNNtmhPLWoT6CIcXawweNAaOLKYsO7PJX" \
//   -H "X-Parse-Master-Key: vPGpG083c8b20zuMq4fUgMxhBc2JxqePphyKtWX3" \
//   -H "Content-Type: application/json" \
//   -d '{"plan":"paid"}' \
// https://api.parse.com/1/jobs/rebuildLeaderboard

Parse.Cloud.job("rebuildLeaderboard", function(request, status) {
  
  // Set up to modify user data
  Parse.Cloud.useMasterKey();
  var VisitedLocation = Parse.Object.extend("VisitedLocation");
  var Leaderboard = Parse.Object.extend("Leaderboard");

  var q1 = new Parse.Query(Parse.User)
  q1.find().then(function(results) {

    var promises = [];

    // for each user
    _.each(results, function(user) {

      var username = user.get("username");

      var promise = new Parse.Promise();

      // get visitedLocations count
      var q2 = new Parse.Query(VisitedLocation);
      q2.equalTo("user", user)
      q2.count({
        success: function(count) {
          // console.log(username + ": " + count);

          var q3 = new Parse.Query(Leaderboard);
          q3.equalTo("user", user);

          q3.find({
            success: function(results) {

              console.log(username + " count: " + results.length);
              if (results.length == 0) {

                // create new leaderboard
                var leaderboard = new Leaderboard();
                leaderboard.save({
                  score: count,
                  user: user
                }, {
                  success: function(savedLeaderboard) {

                    console.log("saved leaderboard: " + username + ": " + savedLeaderboard.get("score"));

                    promise.resolve();
                  },
                  error: function(error) {

                    console.error(error);
                    promise.reject();
                  }
                });

              } else {

                // update existing leaderboard
                var existingLeaderboard = results[0];
                existingLeaderboard.save({
                  score: count
                }, {
                  success: function(updatedLeaderboard) {

                    console.log("updated leaderboard: " + savedLeaderboard.get("username") + ": " + savedLeaderboard.get("score"));

                    promise.resolve();
                  },
                  error: function(error) {

                    console.error(error);
                    promise.reject();
                  }
                });                
              }

            }, 
            error: function(error) {

              console.error(error);
              promise.reject();
            }
          });
        }, 
        error: function(error) {

          console.error(error);
          promise.reject();
        }
      });
      
      promises.push(promise);

    });

    return Parse.Promise.when(promises);

  }).then(function() {

    console.log("finished");

    status.success();
  });


});