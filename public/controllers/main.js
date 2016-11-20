var mainApp = angular.module("mainApp", []);

mainApp.controller("MainCtrl", function ($http) {
    var app = this;
    var url = "http://104.236.118.111:3000";

    app.saveProduct = function (newProduct) {
        $http.post(url + "/add", {name: newProduct}).success(function () {
        });
    };
});

mainApp.controller("EngineCtrl", function ($http) {

    var url = "http://104.236.118.111:3000";
    var loadLock = false;
    var killLock = false;
    var updateLock = false;

    basicScene = new BasicScene();

    function loadPlayers() {
        if(!loadLock) {
            loadLock = true;
            $http.get(url).success(function (users) {
                basicScene.players = users;
                loadLock = false;
            });
        }
    };

    function checkKill() {

        if (basicScene.user.kill == true) {
            basicScene.user.kill = false;

            if(!killLock) {
                killLock = true;
                $http.post(url + "/kill","").success(function (r) {
                    basicScene.user.kill = false;
                    var len = ids.length;
                    for (var i = 4; i < 4 + len; i++) {
                        var obj = basicScene.scene.children[i];
                        basicScene.scene.remove(obj);
                    }

                    ids = [];
                    basicScene.users = [];
                    basicScene.players = [];
                    killLock = false;
                });
            }
        }
    };

    function saveUser(playerId, x, y, rot) {
        if(!updateLock) {
            updateLock = true;
            $http.post(url + "/update", {playerId: playerId, x: x, y: y, rot: rot}).success(function () {
                updateLock = false;
            });
        }
    };

    function animate() {
        basicScene.frame();
        loadPlayers();
        setTimeout(checkKill(), 200);
        saveUser(basicScene.user.id, basicScene.user.mesh.position.x, basicScene.user.mesh.position.z, basicScene.user.mesh.rotation.y);
        loadOtherPlayers();
        requestAnimationFrame(animate);
    }

    animate();
});