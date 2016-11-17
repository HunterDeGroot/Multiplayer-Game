// Config
var SNAKESPEED = 2;
const SNAKESTARTSIZE = 5;
const CUSHION = 5;
const UNITSIZE = 40;
const wallCollision = true;
var FIRSTPERSON = true;

// Window/board demensions
const WW = window.innerWidth;
const WH = window.innerHeight;
var width = WW - WW%UNITSIZE;
var height = WH - WH%UNITSIZE;
const RATIO = WW/WH;

// Direction constants
const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

// Globals
var scene;
var camera;
var renderer;
var snake;
var direction;
var food;
var score = 0;
var gameOver = false;
var material;
material = new THREE.MeshBasicMaterial({color: 0xffff, wireframe: false});
var scales1;
var scales2;
var hScales;
var eyeT;

// Start
function start(speed) {
    SNAKESPEED = parseInt(speed);
    init();
    render();
}

// Init
function init() {

    // Load images
    scales1 = THREE.ImageUtils.loadTexture('http://192.232.218.156/~hunter/img/s1.png');
    scales2 = THREE.ImageUtils.loadTexture('http://192.232.218.156/~hunter/img/s2.png');
    hScales = THREE.ImageUtils.loadTexture('http://192.232.218.156/~hunter/img/scales.jpg');
    eyeT = THREE.ImageUtils.loadTexture('http://192.232.218.156/~hunter/img/eye.jpg');

    // Setup scene
    setScene();

    // Add initial objects
    addFloor();
    initSnake();
    makeFood();
    $('#canvas').css('z-index', 2);
    $('#score').css('z-index', 3);
}

// Returns array of geometry vertices that are on a unit
function uGP(geometry) {
    var uGP = [geometry.vertices.length];
    for(var y = 0; y < geometry.vertices.length; y++) {
        var eaUnitPos = new THREE.Vector3(	geometry.vertices[y].x,
            geometry.vertices[y].y,
            geometry.vertices[y].z);
        uGP[y] = eaUnitPos;
    }
    return uGP;
}

// Place snake in top left corner of the board
function initSnake() {
    snake = [];
    direction = RIGHT;
    addHead();

    for( var i = SNAKESTARTSIZE - 2; i >= 0; i--) {

        // If last segment draw tail
        if(i == 0) 	geometry = new THREE.CylinderGeometry( UNITSIZE/2, 0, UNITSIZE,4,2);
        else		geometry = new THREE.CylinderGeometry( UNITSIZE/2, UNITSIZE/2, UNITSIZE,4,2);
        //texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

        // Alternate scales
        if(i % 2 == 0)	material = new THREE.MeshBasicMaterial({color: 0xf0ffff, wireframe: false});//material = new THREE.MeshLambertMaterial( { map: scales1 } );
        else			material = new THREE.MeshBasicMaterial({color: 0xf0fff, wireframe: false});//material = new THREE.MeshLambertMaterial( { map: scales2 } );
        var body = new THREE.Mesh(geometry, material);
        var m = getMoveVal(RIGHT)
        var r = 0.0;
        var rB = rBuff();
        //var uGP = uGP(geometry);
        var seg = {
            mesh: body,
            move: m,
            rotating: 1.1,
            pivot: new THREE.Vector3(0,0,0),
            unitPos: new THREE.Vector3(i * UNITSIZE,height - UNITSIZE,UNITSIZE/4),
            uGeoPos: uGP(geometry),
            rBuff: rB
        }
        seg.rotating -=1.1;
        scene.add(seg.mesh);
        seg.mesh.rotation.y += -Math.PI;
        seg.mesh.rotation.z += Math.PI/2;
        seg.mesh.position.x = i * UNITSIZE;
        seg.mesh.position.y = height - UNITSIZE;
        seg.mesh.position.z = UNITSIZE/4;
        snake.push(seg);
    }
}

// Init head
function addHead() {
    var hGeometry = new THREE.SphereGeometry(UNITSIZE/2);
    hGeometry.applyMatrix( new THREE.Matrix4().makeScale( 1.2, 1.7, 1.5 ) );
    //texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    material = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: false});//new THREE.MeshLambertMaterial( { map: hScales } );
    var head = new THREE.Mesh(hGeometry, material );
    geometry = new THREE.SphereGeometry(UNITSIZE/4);
    material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: false});//new THREE.MeshLambertMaterial( { map: eyeT } );

    // eyes
    var eye = new THREE.Mesh(geometry, material);
    eye.position.z = -UNITSIZE/3; eye.position.x = UNITSIZE/4;
    eye.position.y = UNITSIZE/3;
    eye.rotation.x = Math.PI/8;
    eye.rotation.y = Math.PI/2;
    head.add(eye)
    eye = new THREE.Mesh(geometry, material);
    eye.eulerOrder = "XZY";
    eye.position.z = -UNITSIZE/3; eye.position.x = -UNITSIZE/4;
    eye.position.y = UNITSIZE/3;
    eye.rotation.x = Math.PI/8;
    eye.rotation.z = Math.PI;
    eye.rotation.y = Math.PI/2;
    head.add(eye)
    var r = 0.0;
    var rB = rBuff();
    var uGP = [];
    var h = {
        mesh: head,
        move: getMoveVal(RIGHT),
        rotating: 1.1,
        pivot: new THREE.Vector3(0,0,0),
        unitPos: new THREE.Vector3((SNAKESTARTSIZE-1) * UNITSIZE,height - UNITSIZE,UNITSIZE/4),
        uGeoPos: uGP,
        rBuff: rB
    }
    h.rotating -= 1.1;
    scene.add(h.mesh);
    h.mesh.rotation.y += -Math.PI;
    h.mesh.rotation.z += Math.PI/2;
    h.mesh.position.x = (SNAKESTARTSIZE-1) * UNITSIZE;
    h.mesh.position.y = height - UNITSIZE;
    h.mesh.position.z = UNITSIZE/4;
    snake.push(h);
}

// Randomly place "food"
function makeFood() {
    var xR = Math.round(Math.random() * (width/UNITSIZE-1)) * UNITSIZE;
    var yR = Math.round(Math.random() * (height/UNITSIZE-1)) * UNITSIZE;

    // Relocate if spawned on snake
    if(collision( xR, yR, snake)) makeFood();
    else {
        geometry = new THREE.BoxGeometry(UNITSIZE, UNITSIZE, UNITSIZE/2, 1, 1, 1);
        material = new THREE.MeshBasicMaterial({color: 0xffff, wireframe: false});
        var r = 0.0;
        var rB = rBuff();
        var uGP = [];
        food = {
            mesh: new THREE.Mesh(geometry, material),
            move: getMoveVal(direction),
            rotating: 1.1,
            pivot: new THREE.Vector3(0,0,0),
            unitPos: new THREE.Vector3( xR,yR,UNITSIZE/4),
            uGeoPos: uGP,
            rBuff: rB
        }
        food.rotating -= 1.1;
        food.move.val = 0;
        scene.add(food.mesh);
        food.mesh.position.x = xR;
        food.mesh.position.y = yR;
        food.mesh.position.z = UNITSIZE/4;
        food.mesh.rotation.y = Math.PI;
        food.mesh.rotation.z = Math.PI/2;

        // Update score
        document.getElementById("score").innerHTML = "Score: " + score;
    }
}

// Move snake each loop
function animate() {

    // Check more when the snake is in unit space
    var check = (snake[0].mesh.position.x % UNITSIZE == 0) &&
        (snake[0].mesh.position.y % UNITSIZE == 0);
    if(check) {
        // Update directions
        for (var i = snake.length - 1; i > 0; i--) {
            snake[i].move = snake[i-1].move;
            snake[i].rotating = snake[i-1].rotating;
            snake[i].pivot = snake[i-1].pivot;
            snake[i].rBuff = snake[i-1].rBuff;
            snake[i].unitPos = new THREE.Vector3(snake[i].mesh.position.x,snake[i].mesh.position.y,snake[i].mesh.position.z);
        }
        if(direction != snake[0].move.dir && oppDir(direction) != snake[0].move.dir) {
            var next = getMoveVal(direction);
            var oldRot = snake[0].rotating;
            var rot = 1.0;
            if(snake[0].move.lat) {
                if(snake[0].move.val == next.val)
                    rot = -1;
            } else if(snake[0].move.val != next.val)
                rot = -1;
            snake[0].rotating = rot;

            var rB = rBuff();
            rB.r = oldRot;
            rB.pivot = snake[0].pivot;
            //snake[0].rBuff = rB;

            // Update pivot for turn
            snake[0].pivot = new THREE.Vector3(0,0,0);
            switch (snake[0].move.dir) {
                case UP:
                    snake[0].pivot.x = snake[0].mesh.position.x + rot * UNITSIZE/2;
                    snake[0].pivot.y = snake[0].mesh.position.y - UNITSIZE/2;
                    break;
                case DOWN:
                    snake[0].pivot.x = snake[0].mesh.position.x - rot * UNITSIZE/2;
                    snake[0].pivot.y = snake[0].mesh.position.y + UNITSIZE/2;
                    break;
                case LEFT:
                    snake[0].pivot.x = snake[0].mesh.position.x + UNITSIZE/2;
                    snake[0].pivot.y = snake[0].mesh.position.y + rot * UNITSIZE/2;
                    break;
                case RIGHT:
                    snake[0].pivot.x = snake[0].mesh.position.x - UNITSIZE/2;
                    snake[0].pivot.y = snake[0].mesh.position.y - rot * UNITSIZE/2;
                    break;
            }

            snake[0].unitPos = new THREE.Vector3(snake[0].mesh.position.x,snake[0].mesh.position.y,snake[0].mesh.position.z);
            snake[0].move = next;

            snake[1].rotating += snake[0].rotating;
            snake[1].pivot = snake[0].pivot;
        } else {
            snake[0].rotating = 0;
        }

        // Food collision
        if(collision(food.mesh.position.x, food.mesh.position.y, snake.slice(0,1))) {
            grow();
        }

        // Self collision
        for(var y = 0; y < snake.length; y++) {
            if(collision(snake[0].mesh.position.x,snake[0].mesh.position.y,snake.slice(1,snake.length)))
                gameOver = true;
        }

        // Handle out of bounds
        outOfBounds()

        if(gameOver) {
            alert("Score was "+score+"!");
            window.location.reload();
        }

        if(collision(food.mesh.position.x, food.mesh.position.y, snake.slice(0,1))) grow();
    }

    moveSnake();

    // Update camera
    if(FIRSTPERSON) {
        camera.position.x = snake[0].mesh.position.x;
        camera.position.y = snake[0].mesh.position.y;
        camera.position.x -= Math.sin(snake[0].mesh.rotation.z)*5*UNITSIZE;
        camera.position.y -= Math.cos(snake[0].mesh.rotation.z)*5*UNITSIZE;
        camera.lookAt(snake[0].mesh.position);
    }
}

// Returns animation val for each segment
function getMoveVal(dir) {

    var nMove = {
        lat: true,
        val: SNAKESPEED,
        dir: dir
    };

    switch (dir) {
        case UP:
            nMove.lat = false;
            break;
        case DOWN:
            nMove.lat = false;
            nMove.val =  -SNAKESPEED;
            break;
        case LEFT:
            nMove.val =  -SNAKESPEED;
            break;
    }

    return nMove;
}

// Returns an empty rotation buffer
function rBuff() {
    var rBuff = {
        pivot: new THREE.Vector3(0,0,0),
        r: 0
    }
    return rBuff;
}

// Game Loop
var exp = 1;
function render() {
    requestAnimationFrame(render);
    if(!gameOver)animate();
    renderer.render(scene, camera);
};

// Return true if (x,y) are the coords to an element in array
function collision(x ,y ,array, ex) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].mesh.position.x == x && array[i].mesh.position.y == y && i != ex)
            return true;
    }
    return false;
}

// Moves snake and checks out of bounds cases
function moveSnake() {
    for (var i = 0; i < snake.length; i++) {
        if(snake[i].rotating){

            // rotating here didn't have time to do rotation algorithm
            var r = snake[i].rotating;
            var rSig = r/Math.abs(r);
            var thet = Math.PI/2;

            if(i == 0)
                snake[i].mesh.rotation.z += 2*SNAKESPEED*snake[i].rotating*thet/UNITSIZE/2;
            else
                snake[i].mesh.rotation.z += SNAKESPEED*snake[i].rotating*thet/UNITSIZE/2;

            // if(rSig > 0) {
// 				if(Math.abs(snake[i].mesh.rotation.z) % Math.PI <= Math.PI/2 && Math.abs(snake[i].mesh.rotation.z)) {
// 					snake[i].mesh.geometry.vertices[11].x =  UNITSIZE/2 - (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// 					//snake[i].mesh.geometry.vertices[11].y =  UNITSIZE/2 - (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// 					snake[i].mesh.geometry.vertices[1].x =  UNITSIZE/2 - (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// // 					//snake[i].mesh.geometry.vertices[1].y = UNITSIZE/2 - (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(-2*snake[i].mesh.rotation.z);
// 				} else {
// 					snake[i].mesh.geometry.vertices[11].x =  UNITSIZE/2 + (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// 					//snake[i].mesh.geometry.vertices[11].y = -UNITSIZE/2 + (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// 					snake[i].mesh.geometry.vertices[1].x =  UNITSIZE/2 + (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// // 					//snake[i].mesh.geometry.vertices[1].y = UNITSIZE/2 - (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// 				}
// 			} else {
// 				if(Math.abs(snake[i].mesh.rotation.z) % Math.PI <= Math.PI/2 && Math.abs(snake[i].mesh.rotation.z)) {
// 					snake[i].mesh.geometry.vertices[11].x =  UNITSIZE/2 - (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// 					//snake[i].mesh.geometry.vertices[11].y =  UNITSIZE/2 - (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// 					snake[i].mesh.geometry.vertices[1].x =  UNITSIZE/2 - (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// // 					//snake[i].mesh.geometry.vertices[1].y = UNITSIZE/2 - (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(-2*snake[i].mesh.rotation.z);
// 				} else {
// 					snake[i].mesh.geometry.vertices[11].x =  UNITSIZE/2 + (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// 					//snake[i].mesh.geometry.vertices[11].y = -UNITSIZE/2 + (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// 					snake[i].mesh.geometry.vertices[1].x =  UNITSIZE/2 + (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// // 					//snake[i].mesh.geometry.vertices[1].y = UNITSIZE/2 - (UNITSIZE/(2*Math.sqrt(2))) * Math.sin(2*snake[i].mesh.rotation.z);
// 				}
// 			}
//
// 			snake[i].mesh.geometry.verticesNeedUpdate = true;

            // if(snake[i].rBuff.r && Math.abs(snake[i].rotating) >= UNITSIZE/2) {
// 				if(i==0)console.log("buffed: "+ snake[i].rotating);
// 				//buffRot(i);
// 				normRot(i);
// 			} else {
// 				if(i==0)console.log("didnt: "+ snake[i].rotating);
// 				normRot(i);
// 			}
        }
        //else
        if(snake[i].move.lat)
            snake[i].mesh.position.x += snake[i].move.val;
        else
            snake[i].mesh.position.y += snake[i].move.val;
    }
}

// Normally rotate segment
function normRot(i) {
    var r = snake[i].rotating;
    var rSig = r/Math.abs(r);
    var thet = Math.PI/2;
    var buff = snake[i].rBuff.r;
    if(i == 0 || buff)
        snake[i].mesh.rotation.z += SNAKESPEED*rSig*thet/UNITSIZE/2;
    snake[i].mesh.rotation.z += SNAKESPEED*rSig*thet/UNITSIZE/2;

    var n = -1*rSig;
    if(snake[i].move.lat) n = 1*rSig;

    var s = Math.sin(n*SNAKESPEED*thet*r/UNITSIZE);
    var c = Math.cos(n*SNAKESPEED*thet*r/UNITSIZE);
    var uX = snake[i].unitPos.x - snake[i].pivot.x;
    var uY = snake[i].unitPos.y - snake[i].pivot.y;

    var mDX = uX * c - uX * s;
    var mDY = uY * s + uY * c;
    snake[i].mesh.position.x = mDX;
    snake[i].mesh.position.y = mDY;
    snake[i].mesh.position.x += snake[i].pivot.x;
    snake[i].mesh.position.y += snake[i].pivot.y;

    if(i) {
        for(var y = 0; y < snake[i].uGeoPos.length; y++) {
            snake[i].mesh.geometry.dynamic = true;
            var unitWorld = new THREE.Vector3(	snake[i].uGeoPos[y].y + snake[i].unitPos.x,
                snake[i].uGeoPos[y].x + snake[i].unitPos.y,
                0);

            var gS = Math.sin(n*SNAKESPEED*thet*r/UNITSIZE);
            var gC = Math.cos(n*SNAKESPEED*thet*r/UNITSIZE);
            var gUX = unitWorld.x - snake[i].pivot.x;
            var gUY = unitWorld.y - snake[i].pivot.y;
            var gDX = (gUX * gC - gUX * gS);
            var gDY = (gUY * gS + gUY * gC);

            gDX += snake[i].pivot.x;
            gDY += snake[i].pivot.y;

            snake[i].mesh.geometry.vertices[y].x = gDY - snake[i].mesh.position.y;
            snake[i].mesh.geometry.vertices[y].y = gDX - snake[i].mesh.position.x;
        }
        snake[i].mesh.geometry.verticesNeedUpdate = true;
    }
    snake[i].rotating+=rSig;
}

// Rotate segment with buffer
function buffRot(i) {
    var r = snake[i].rBuff.r;
    var rSig = r/Math.abs(r);
    var thet = Math.PI/2;
    snake[i].mesh.rotation.z += SNAKESPEED*rSig*thet/UNITSIZE/2;
    var n = -1*rSig;
    if(snake[i].move.lat) n = 1*rSig;

    var s = Math.sin(n*SNAKESPEED*thet*r/UNITSIZE);
    var c = Math.cos(n*SNAKESPEED*thet*r/UNITSIZE);
    var uX = snake[i].unitPos.x - snake[i].rBuff.pivot.x;
    var uY = snake[i].unitPos.y - snake[i].rBuff.pivot.y;
    snake[i].mesh.position.x = uX * c - uX * s;
    snake[i].mesh.position.y = uY * s + uY * c;
    snake[i].mesh.position.x += snake[i].rBuff.pivot.x;
    snake[i].mesh.position.y += snake[i].rBuff.pivot.y;
    snake[i].rotating+=Math.sign(snake[i].rotating);
    snake[i].rBuff
}

function move(i) {
    var rSig = r/Math.abs(r);
    var thet = Math.PI/2;
    if(!i) snake[i].mesh.rotation.z += SNAKESPEED*rSig*thet/UNITSIZE/2;
    snake[i].mesh.rotation.z += SNAKESPEED*rSig*thet/UNITSIZE/2;
    var n = -1*rSig;
    if(snake[i].move.lat) n = 1*rSig;

    var s = Math.sin(n*SNAKESPEED*thet*r/UNITSIZE);
    var c = Math.cos(n*SNAKESPEED*thet*r/UNITSIZE);
    var uX = snake[i].unitPos.x - snake[i].pivot.x;
    var uY = snake[i].unitPos.y - snake[i].pivot.y;
    snake[i].mesh.position.x = uX * c - uX * s;
    snake[i].mesh.position.y = uY * s + uY * c;
    snake[i].mesh.position.x += snake[i].pivot.x;
    snake[i].mesh.position.y += snake[i].pivot.y;
    snake[i].rotating+=rSig;
}

// Adds segment to snake
function grow() {
    scene.remove(food.mesh);
    geometry = new THREE.CylinderGeometry( UNITSIZE/2, UNITSIZE/2, UNITSIZE,4,2);
    //texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    if(snake.length % 2 == 0)	material = new THREE.MeshBasicMaterial({color: 0xf0fff, wireframe: false});//new THREE.MeshLambertMaterial( { map: scales1 } );
    else			material = new THREE.MeshBasicMaterial({color: 0xf0ffff, wireframe: false});//new THREE.MeshLambertMaterial( { map: scales2 } );
    food.mesh = new THREE.Mesh(geometry, material);
    scene.add(food.mesh);
    food.mesh.position.x = snake[snake.length-1].mesh.position.x;
    food.mesh.position.y = snake[snake.length-1].mesh.position.y;
    food.mesh.position.z = UNITSIZE/4;
    food.mesh.rotation.y += -Math.PI;
    food.mesh.rotation.z += snake[snake.length-1].mesh.rotation.z;
    score++;
    snake.push(food);
    var temp = snake[snake.length-1].mesh;
    snake[snake.length-1].mesh = snake[snake.length-2].mesh;
    snake[snake.length-2].mesh = temp;
    makeFood();
}

// Handles out of bounds cases
function outOfBounds() {
    for (var i = 0; i < snake.length; i++) {
        if(snake[i].move.lat) {
            if(snake[i].move.val > 0 && snake[i].mesh.position.x == width - UNITSIZE) {
                //snake[i].mesh.position.x = 0;
                gameOver = true;}
            else if(snake[i].move.val < 0 && snake[i].mesh.position.x == 0) {
                //snake[i].mesh.position.x = width - UNITSIZE;
                gameOver = true;}
        } else {
            if(snake[i].move.val > 0 && snake[i].mesh.position.y == height - UNITSIZE) {
                //snake[i].mesh.position.y = 0;
                gameOver = true;}
            else if(snake[i].move.val < 0 && snake[i].mesh.position.y == 0) {
                //snake[i].mesh.position.y = height - UNITSIZE;
                gameOver = true;}
        }
    }
}

// Returns opposite direction
function oppDir(dir) {
    if(dir == UP) return DOWN;
    else if(dir == DOWN) return UP;
    else if(dir == LEFT) return RIGHT;
    else if(dir == RIGHT) return LEFT;
}

// Adds floor to scene
function addFloor() {

    var texture = THREE.ImageUtils.loadTexture('http://192.232.218.156/~hunter/img/tile.jpg');
    texture.repeat.set( width/UNITSIZE/2, height/UNITSIZE/2);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: false});
    // var material = new THREE.MeshLambertMaterial( { map: texture } );
    var board = new THREE.Mesh( new THREE.PlaneGeometry( width, height ), material );
    board.position.x = (width - UNITSIZE)/2;
    board.position.y = (height - UNITSIZE)/2;
    scene.add(board);
}

// Scene setup
function setScene() {
    var canvas = $("#canvas")[0];
    renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);
    setCam();
    scene = new THREE.Scene();
    scene.add(camera);
    addLight();
}

// Camera setup
function setCam() {
    var fov = 75;
    camera = new THREE.PerspectiveCamera(fov, RATIO, 1, 10000);

    if(FIRSTPERSON) {
        camera.eulerOrder = "ZXY";
        camera.position.y = height - UNITSIZE;
        camera.position.z = 3 * UNITSIZE;
        camera.up = new THREE.Vector3(0, 0, 1);
        camera.lookAt(new THREE.Vector3(10000,0,0));
    } else {
        camera.position.x = (width - UNITSIZE)/2;
        camera.position.y = (height - UNITSIZE)/2;
        camera.position.z = (height/2+UNITSIZE
            )/Math.cos(Math.PI*fov/180/2);
    }
}

// Light setup
function addLight() {
    var ambientLight = new THREE.AmbientLight(0x666666);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);
}

// Callback function references the event target and adds the 'swipe' class to it
function swipeLeft(event) {
    // if(FIRSTPERSON) {
// 			if( 		direction == UP)		direction = LEFT;
// 			else if( 	direction == DOWN)		direction = RIGHT;
// 			else if( 	direction == LEFT)		direction = DOWN;
// 			else if( 	direction == RIGHT)		direction = UP;
// 		}
// 		else
    if (direction != RIGHT)
        direction = LEFT;
}

function swipeRight(event) {
    // if(FIRSTPERSON) {
// 		if( 		direction == UP)		direction = RIGHT;
// 		else if( 	direction == DOWN)		direction = LEFT;
// 		else if( 	direction == LEFT)		direction = UP;
// 		else if( 	direction == RIGHT)		direction = DOWN;
// 	}
// 	else
    if (direction != LEFT)
        direction = RIGHT;
}

function swipeDown(event) {
    if(direction != UP && !FIRSTPERSON) direction = DOWN;
}

function swipeUp(event) {
    if(direction != DOWN && !FIRSTPERSON) direction = UP;
}

// this code allows swipeUP/DOWN jquery mobile functions to work
$(document).ready(function() {
    var supportTouch = $.support.touch, scrollEvent = "touchmove scroll", touchStartEvent = supportTouch ? "touchstart" : "mousedown", touchStopEvent = supportTouch ? "touchend" : "mouseup", touchMoveEvent = supportTouch ? "touchmove" : "mousemove";
    $.event.special.swipeupdown = {
        setup : function() {
            var thisObject = this;
            var $this = $(thisObject);
            $this.bind(touchStartEvent, function(event) {
                var data = event.originalEvent.touches ? event.originalEvent.touches[0] : event, start = {
                    time : (new Date).getTime(),
                    coords : [data.pageX, data.pageY],
                    origin : $(event.target)
                }, stop;

                function moveHandler(event) {
                    if (!start) {
                        return;
                    }
                    var data = event.originalEvent.touches ? event.originalEvent.touches[0] : event;
                    stop = {
                        time : (new Date).getTime(),
                        coords : [data.pageX, data.pageY]
                    };
                    // prevent scrolling
                    if (Math.abs(start.coords[1] - stop.coords[1]) > 10) {
                        event.preventDefault();
                    }
                }


                $this.bind(touchMoveEvent, moveHandler).one(touchStopEvent, function(event) {
                    $this.unbind(touchMoveEvent, moveHandler);
                    if (start && stop) {
                        if (stop.time - start.time < 1000 && Math.abs(start.coords[1] - stop.coords[1]) > 30 && Math.abs(start.coords[0] - stop.coords[0]) < 75) {
                            start.origin.trigger("swipeupdown").trigger(start.coords[1] > stop.coords[1] ? "swipeup" : "swipedown");
                        }
                    }
                    start = stop = undefined;
                });
            });
        }
    };
    $.each({
        swipedown : "swipeupdown",
        swipeup : "swipeupdown"
    }, function(event, sourceEvent) {
        $.event.special[event] = {
            setup : function() {
                $(this).bind(sourceEvent, $.noop);
            }
        };
    });});

// listens for swipes
$(document).ready(function() {

    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, false);
    $("#canvas").on("swipeleft", swipeLeft);

    $("#canvas").on("swiperight", swipeRight);

    $("#canvas").on("swipedown", swipeDown);

    $("#canvas").on("swipeup", swipeUp);

    $("#canvas").on("tap", function(event) {
        if(FIRSTPERSON) {
            if( event.pageX < WW/2 ) {
                if( 		direction == UP)		direction = LEFT;
                else if( 	direction == DOWN)		direction = RIGHT;
                else if( 	direction == LEFT)		direction = DOWN;
                else if( 	direction == RIGHT)		direction = UP;
            } else {
                if(			direction == UP)		direction = RIGHT;
                else if( 	direction == DOWN)		direction = LEFT;
                else if( 	direction == LEFT)		direction = UP;
                else if( 	direction == RIGHT)		direction = DOWN;
            }
        }
    });
});

// Keyboard controls
$(document).keydown(function(e) {
    var key = e.which;

    // Up arrow
    if (key == "38" && direction != DOWN) {
        if(!FIRSTPERSON) direction = UP;
    }
    // Down arrow
    else if (key == "40" && direction != UP) {
        if(!FIRSTPERSON) direction = DOWN;
    }
    // Left arrow
    else if (key == "37") {
        if(FIRSTPERSON) {
            if( 		direction == UP)		direction = LEFT;
            else if( 	direction == DOWN)		direction = RIGHT;
            else if( 	direction == LEFT)		direction = DOWN;
            else if( 	direction == RIGHT)		direction = UP;
        }
        else if (direction != RIGHT)
            direction = LEFT;
    }
    // Right arrow
    else if (key == "39") {
        if(FIRSTPERSON) {
            if( 		direction == UP)		direction = RIGHT;
            else if( 	direction == DOWN)		direction = LEFT;
            else if( 	direction == LEFT)		direction = UP;
            else if( 	direction == RIGHT)		direction = DOWN;
        }
        else if (direction != LEFT)
            direction = RIGHT;
    }
});