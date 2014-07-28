
var _ = require('underscore');

Parse.Cloud.beforeSave("VisitedLocation", function(request, response) {

  var coordinateKey = request.object.get("coordinateKey");
  var currentUser = request.object.get("user");
  
  var VisitedLocation = Parse.Object.extend("VisitedLocation");
  var query = new Parse.Query(VisitedLocation);
  query.equalTo("coordinateKey", coordinateKey);
  query.equalTo("user", currentUser);

  query.find().then(function(results) {

      console.log("results: " + results);
      console.log("length: " + results.length);

      if (results.length > 0) {

        console.log("found coordinateKey");
        response.error("keyExists");
      } else {

        console.log("success ");
        response.success();
      }

    }, function(error) {

      console.error(error);
      response.error();
    }
  )
});







// test: 
// curl -X POST \
//   -H "X-Parse-Application-Id: 3B2W6n5eNNtmhPLWoT6CIcXawweNAaOLKYsO7PJX" \
//   -H "X-Parse-Master-Key: vPGpG083c8b20zuMq4fUgMxhBc2JxqePphyKtWX3" \
//   -H "Content-Type: application/json" \
//   -d '{"plan":"paid"}' \
// https://api.parse.com/1/jobs/removeDuplicateVisitedLocations


Parse.Cloud.job("removeDuplicateVisitedLocations", function(request, status) {
  
  // Set up to modify user data
  Parse.Cloud.useMasterKey();

  // Query for all users
  var query = new Parse.Query(Parse.User);
  query.equalTo("username", "willydennis");
  query.find().then(function(results) {

    console.log("user: " + results[0].get("username"));

    var q2 = new Parse.Query("VisitedLocation");
    q2.equalTo("user", results[0]);
    q2.ascending("coordinateKey");
    q2.limit(1000);
    return q2.find();

  }).then(function(visitedLocations) {

    console.log("visitedLocations.length: " + visitedLocations.length);

    var promise = Parse.Promise.as();

    var coordinateKey;
    var prevCoordinateKey;
    var destroyCount = 0;
    _.each(visitedLocations, function(visitedLocation) {
      
      // console.log("coordinateKey: " + coordinateKey + ", prevCoordinateKey: " + prevCoordinateKey);
      coordinateKey = visitedLocation.get("coordinateKey");
      if (prevCoordinateKey) {
        if (prevCoordinateKey == coordinateKey) {

          destroyCount++;
          promise = promise.then(function() {
            return visitedLocation.destroy();
          });
        }
      }

      prevCoordinateKey = coordinateKey;

    });

    console.log("destroyed: " + destroyCount);

    return promise;

  }).then(function() {

    console.log("success");
    status.success();
  });

});









