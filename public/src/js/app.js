(function(){
  var app = angular.module('memoreez', ["ngRoute", "services", "firebase"]);

  app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.
                when('/home', {templateUrl: 'src/templates/home.html',   controller: 'IndexCtrl'}).
                when('/eventList', {templateUrl: 'src/templates/all-events.html',   controller: 'EventsCtrl'}).
                when('/event/:eventId', {templateUrl: 'src/templates/specific-event.html'}).
                when('/register/:eventId', {templateUrl: 'src/templates/register.html'}).
                when('/share/:eventId/:guestId', {templateUrl: 'src/templates/share-memory.html'}).
                when('/create/:eventName?', {templateUrl: 'src/templates/create-event.html',   controller: 'IndexCtrl'}).
                when('/memory/:eventId/:guestId', {templateUrl: 'src/templates/my-memories.html',   controller: 'MemoriesCtrl'}).
                when('/about', {templateUrl: 'src/templates/about.html',   controller: 'IndexCtrl'})
                .otherwise({redirectTo: '/home'});
  }]);

  app.controller('MemoriesCtrl', ['$scope', 'eventsFactory', 'guestFactory', 'memoriesFactory',
    function($scope, eventsFactory, guestFactory, memoriesFactory){
      console.log('we are being fired');
      $scope.guestList = guestFactory.getGuests($scope.memory);

      $scope.theMemories = memoriesFactory.getMemories($scope.memory);
      $scope.theMemories.$loaded().then(function(data){
        console.log("ahh, the memories!",$scope.theMemories, data);

      })


      console.log("scope.memory",$scope.memory);

      $scope.resolveMemories = function(eventId){
        console.log("eId", eventId);
        memoriesFactory.getMemories(eventId);

      }

      $scope.resolveGuest = function(guestId){
        angular.forEach($scope.guestList, function(obj, key){
          console.log(obj);
          if(obj.$id===guestId){
            console.log(obj.email);
            result = (obj.email)
          }
        });
        return result;
      }


  }])

  app.controller('SpecificEventCtrl', ['$scope', '$location', 'eventsFactory', 'guestFactory','$route','$routeParams', 'memoriesFactory',
    function($scope, $location, eventsFactory, guestFactory, $route, $routeParams, memoriesFactory){
      console.log('SpecificEventController');
      this.params = $routeParams;
      $scope.thisEvent = this.params.eventId;
      $scope.thisGuestId = this.params.guestId;

      console.log("params",this.params);
      $scope.eventInfo = eventsFactory.getEvent($scope.thisEvent);
      $scope.guestInfo = guestFactory.getGuests($scope.thisEvent);
      $scope.guestInfo.$loaded().then(function(data){
        console.log("GUEST INFO:", $scope.guestInfo, data);
      })

      $scope.errBack = function(e) {
        console.log('Reeeejected!', e);
      };

      // this.event
      $scope.hasMedia= function() {
        console.log('herer');
        var breturn= (window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia);

        if (breturn) {
          $scope.videoObj = { "video": true };
          $scope.video =  document.getElementById("video");
          $scope.canvas = document.getElementById("canvas")
          $scope.context = $scope.canvas.getContext("2d")
          $scope.myStream = null;

          if(window.navigator.getUserMedia) { // Standard
            window.navigator.getUserMedia($scope.videoObj, function(stream) {
                    $scope.video.src = stream;
                    $scope.video.play();
                    $scope.myStream = stream;
            }, $scope.errBack);
          } else if(window.navigator.webkitGetUserMedia) { // WebKit-prefixed
                  window.navigator.webkitGetUserMedia($scope.videoObj, function(stream){
                          $scope.video.src = window.URL.createObjectURL(stream);
                          $scope.video.play();
                          $scope.myStream = stream;
                  }, $scope.errBack);
          }
          else if(window.navigator.mozGetUserMedia) { // Firefox-prefixed
                  window.navigator.mozGetUserMedia($scope.videoObj, function(stream){
                          $scope.video.src = window.URL.createObjectURL(stream);
                          $scope.video.play();
                          $scope.myStream = stream;
                  }, $scope.errBack);
          };

        }


        return breturn;
      };

      $scope.takepic =     function takepic() {
        console.log('aaaa');
        if ($scope.myStream) {
          //console.log(myStream);
          $scope.context.drawImage($scope.video, 0, 0, 640, 480);
          // "image/webp" works in Chrome.
          // Other browsers will fall back to image/png.
          //document.querySelector('img').src = canvas.toDataURL('image/webp');
          //TODO jes fix this
          memoriesFactory.addMemory($scope.thisEvent, $scope.thisGuestId, $scope.canvas.toDataURL('image/webp'),'image','this is my awesome', false);
          //memoriesFactory.addMemory(eID, gID, thePic,'image','this is my awesome 2', false);
          //$scope.uploadPic(canvas.toDataURL('image/webp'))
          //console.log(canvas.toDataURL('image/webp'));
        }
      };

      $scope.uploadFile = function(element) {
        //console.log('bbbbb',element.files,arguments );
        var fd = new FormData();
          //Take the first selected file
          fd.append("file", element.files[0]);
          //console.log('ccccc',fd );

          $scope.theFile =  element.files[0];
          //scope.progressVisible = false
          console.log('file is here: ', $scope.theFile);

          var reader = new FileReader();

          reader.onload = function(readerEvt) {
              var binaryString = readerEvt.target.result;
              $scope.blobFile = "data:"+ $scope.theFile.type + ";base64,"+ btoa(binaryString);
              document.getElementById('myimg').src = $scope.blobFile;
              //console.log($scope.blobFile);

              memoriesFactory.addMemory($scope.thisEvent, $scope.thisGuestId, $scope.blobFile,'image','this is my awesome', false);
          };

          reader.readAsBinaryString($scope.theFile);

      };


  }]);

  app.controller('EventsCtrl', ['$scope', '$location','eventsFactory', 'guestFactory', 'memoriesFactory',
    function($scope, $location, eventsFactory, guestFactory, memoriesFactory){

    $scope.openSpecific = function(obj){
      console.log(obj);
      console.log(obj.item.$id);
    }

    $scope.goNext = function (hash) {
      console.log('HASH: ', hash);
      $location.path(hash);
    }

    $scope.list = eventsFactory.getEvents();
    // get a specific event
    //console.log(eventFactory.getEvent('-JgPDtrYrbLaMcZ61JkH'));
    //eventFactory.delEvent('-JgPTVAXNBh42iNSVoTF');
    //console.log();
    console.log($scope.list);

    var eID = '-JgU3UFT391NjFMzisGI', gID = '-JgUEMUe_GrzkXr4ShYu';
    var x = guestFactory.getGuests(eID);


    x.$loaded().then(function(){
      console.log('Guest has ' + x.length);
      if (x.length < 5 ) {
        guestFactory.addGuest(eID, 'me', 'me@me.com', '111', '1 main', 'msg', '').then(function(data) {
          console.log('.... data: ', data, data.key());
          gID = data.key();
        });
      }
    });


    $scope.hasMedia= function() {
      return (window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia);
      //return false;
    };

    $scope.uploadPic = function(thePic){
      memoriesFactory.addMemory(eID, gID, thePic,'image','this is my awesome 2', false);
    };

    $scope.uploadFile = function(element) {
      console.log('bbbbb',element.files,arguments );
      var fd = new FormData();
        //Take the first selected file
        fd.append("file", element.files[0]);
        console.log('ccccc',fd );

        $scope.theFile =  element.files[0];
        //scope.progressVisible = false
        console.log('file is here: ', $scope.theFile);

        var reader = new FileReader();

        reader.onload = function(readerEvt) {
            var binaryString = readerEvt.target.result;
            $scope.blobFile = "data:"+ $scope.theFile.type + ";base64,"+ btoa(binaryString);
            document.getElementById('myimg').src = $scope.blobFile;
            //console.log($scope.blobFile);

            memoriesFactory.addMemory(eID, gID, $scope.blobFile,'image','this is my awesome', false);
        };

        reader.readAsBinaryString($scope.theFile);

    };

    //
    var m = memoriesFactory.getMemories(eID);
        m.$loaded().then(function(){
      console.log('Event has  ' + m.length + " memories");
    })
  }]);

  app.controller('IndexCtrl', ['$scope', '$location', 'eventsFactory','$route','$routeParams','guestFactory', 
                               function($scope, $location, eventsFactory, $route, $routeParams, guestFactory){
    console.log('ROUTE INFO:', $route, $routeParams);
    this.$route = $route;
    this.$location = $location;
    console.log("route", $route);
    console.log("location", $location.path());
    if($location.path() === "/home"){
      console.log($location.path());
      $scope.showHome = false;
      //document.getElementById("navbar1").style.display="none";
    }else{
      console.log("not home");
      $scope.showHome=true;
      //document.getElementById("navbar1").style.display="block";
    }
    console.log("showHome", $scope.showHome);
    
    //jes home page stuff
    !$scope.eventName && $routeParams.eventName && ($scope.eventName = $routeParams.eventName);
    !$scope.eventName && ($scope.eventName = 'Party');
    
    $scope.createEvent = function(){
      console.log('-------', $scope.eventName)
      $location.path('/create/'+$scope.eventName);
    }

    //end

    /**
    *@summary will use ng-click to submit form, gets info from ng-models
    *@param eventName
    *@param orgName organizer's name
    *@param orgEmail organizer's email
    */
    $scope.submitEvent = function(){
      if($scope.eventName == undefined || $scope.orgName == undefined ||
        $scope.orgEmail== undefined){
        $scope.showAlert = true;
        console.log("");
      }else{
        console.log($scope.eventName, $scope.orgName, $scope.orgEmail);
        var p = eventsFactory.addEvent($scope.eventName, $scope.orgName, $scope.orgEmail);
        //jes redirect
        p.then(function(data){
          console.log('-----', data, data.key());
          var eventId = data.key();
          var g = guestFactory.addGuest(eventId, $scope.orgName, $scope.orgEmail, '', '', 'Organizor Created Event', '')
          g.then(function(gData){
            var guestId = gData.key();
            $location.path('/share/'+eventId+'/'+guestId);
          });
          
          
        })
        
      }


    }


  }]);
  app.directive('myMemories', function(){
    return{
      restrict: 'E',
      scope:{
        memory: "=info"
      },
      templateUrl: 'src/templates/my-memories.html'
    }
  });

  app.directive('myAttendee', function(){
    return{
      restrict: 'E',
      scope: true, // uses prototypical inheritence
      templateUrl: 'src/templates/all-guests.html'
    }
  });

    app.directive('allGuest', function(){
    return{
      restrict: 'E',
      scope: true, // uses prototypical inheritence
      templateUrl: 'src/templates/my-attendee.html'
    }
  });

  app.directive('createEvent', function(){
    return{
      restrict: 'E',
      templateUrl: 'src/templates/create-event.html'
    }
  })

  app.directive('allEvents', function(){
    return{
      restrict: 'E',
      scope: true,
      templateUrl: 'src/templates/all-events.html'
    }
  });

    app.directive('myMenu', function(){
    return{
      restrict: 'E',
      scope: true,
      templateUrl: 'src/templates/my-menu.html'
    }
  });
})();
