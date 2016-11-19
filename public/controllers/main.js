var mainApp = angular.module("mainApp", []);

mainApp.controller("MainCtrl", function ($http) {
    var app = this;
    var url = "http://104.236.118.111:3000";

    app.saveProduct = function (newProduct) {
        $http.post(url + "/add", {name:newProduct}).success(function () {
        });
    };
});

mainApp.controller("EngineCtrl", function ($http) {

    var url = "http://104.236.118.111:3000";

    var lock = false;
    basicScene = new BasicScene();

    function loadPlayers() {
        console.log(basicScene.user.kill);
        if(basicScene.user.kill == true) {
            $http.get(url+"/kill").success(function (r) {
                console.log(r);
            });
            basicScene.user.kill = false;
            var len = ids.length;
            for (var i = 4; i < 4+len; i++) {
                var obj = basicScene.scene.children[i];
                basicScene.scene.remove(obj);
            }
            console.log(basicScene.scene.children.length);
            console.log(len);

            ids = [];
            basicScene.users = [];
            basicScene.players = [];
        }

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
            saveUser(basicScene.user.id,basicScene.user.mesh.position.x,basicScene.user.mesh.position.z, basicScene.user.mesh.rotation.y);
            requestAnimationFrame(animate);
            setTimeout( loadOtherPlayers(), 0, 200 );
             loadOtherPlayers();
            basicScene.frame();
        }
    }
    animate();
});