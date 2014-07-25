
Parse.Cloud.beforeSave("VisitedLocation", function(request, response) {

  var coordinateKey = request.object.get("coordinateKey");
  console.log(coordinateKey + " 231231 ");
  response.success();

});