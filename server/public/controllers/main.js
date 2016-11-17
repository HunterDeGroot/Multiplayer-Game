var mainApp = angular.module("mainApp", []);

mainApp.controller("MainCtrl", function ($http) {
    var app = this;
    var url = "http://localhost:3000";

    app.saveProduct = function (newProduct) {
        $http.post(url + "/add", {name:newProduct}).success(function () {
        });
    };
});

mainApp.controller("EngineCtrl", function ($http) {

    var url = "http://localhost:3000";

    var lock = false;
    basicScene = new BasicScene();

    function loadPlayers() {
        $http.get(url).success(function (users) {
            basicScene.players = users;
        });
    };

    function saveUser (playerId,x,y,rot) {
        $http.post(url + "/update", {playerId:playerId, x:x, y:y, rot: rot}).success(function () {
            loadPlayers();
        });
        lock = false;
    };

    function animate() {
        if(lock == false) {
            console.log(basicScene.user.id)
            saveUser(basicScene.user.id,basicScene.user.mesh.position.x,basicScene.user.mesh.position.z, basicScene.user.mesh.rotation.y);
            requestAnimationFrame(animate);
            setTimeout( loadOtherPlayers(), 0, 200 );
             loadOtherPlayers();
            basicScene.frame();
        }
    }
    animate();
});