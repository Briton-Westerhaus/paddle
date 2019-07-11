var theGame;
var context;
var width;
var height;
var elev;
var speed;
var ballPos;
var interval;
var rect;
var bounces;
var bounceCount;
var bounceSound;
var myPaddle;

class paddle {

    constructor() {
        this.height = 150;
        this.width = 150;
        this.position = {
            x: width / 2,
            y: height / 2
        };

        this.position.x = width / 2;
        this.position.y = height / 2;
    }

    draw() {
        context.strokeStyle = "black";
        context.strokeRect(this.position.x - 75, this.position.y - 75, 150, 150);
        context.fillStyle = "rgb(200, 215, 255)";
        context.fillRect(this.position.x - 75, this.position.y - 75, 150, 150);
        context.beginPath();
        context.moveTo(this.position.x - 75, this.position.y);
        context.lineTo(this.position.x + 75, this.position.y);
        context.moveTo(this.position.x, this.position.y - 75);
        context.lineTo(this.position.x, this.position.y + 75);
        context.closePath();
        context.stroke();
        context.beginPath();
        context.arc(this.position.x, this.position.y, 10, 0, 2 * Math.PI);
        context.closePath();
        context.stroke();
        context.fill();
    }

    clear() {
        context.strokeStyle = "rgba(0, 0, 0, 0)";
        context.fillStyle = "white";
        context.fillRect(this.position.x - this.width / 2 - 1, this.position.y - this.height / 2 - 1, this.width + 2, this.height + 2);
    }
}

window.onload = function() {
    bounceCount = document.getElementById("BounceCount");
    bounceSound = document.getElementById("BounceSound");
    
    theGame = document.getElementById("theGame");
    width = window.innerWidth * .9;
    height = window.innerHeight * .8;
    theGame.width = width;
    theGame.height = height;

    context = theGame.getContext("2d");

    interval = null;

    document.addEventListener("keydown", function(evt) {
        if (evt.keyCode == 32) {  // Space bar
            if (interval) {
                window.clearInterval(interval);
                interval = false; // Paused
            } else 
            interval = window.setInterval(tick, 50);
        }
    });

    document.addEventListener("click", function(evt) {
        if (interval == null) {
            newGame();
            interval =  window.setInterval(tick, 50);
        }
    });

    document.addEventListener("mousemove", function(evt) {
        myPaddle.clear();
        myPaddle.position = getMousePos(theGame, evt);
        myPaddle.draw();
        drawBall(ballPos.x, ballPos.y, elev);
    });

    newGame();
}

function newGame(){
    if (myPaddle && myPaddle.position)
        myPaddle.clear();
    if (ballPos)
        clearBall(ballPos.x, ballPos.y, elev);
    bounceCount.innerHTML = bounces = 0;
    elev = 0;
    speed = {
        x: 0,
        y: 0,
        z: 10
    };

    myPaddle = new paddle();

    ballPos = {
        x: width / 2,
        y: height / 2
    };
}

function getMousePos(canvas, evt) {
    rect = canvas.getBoundingClientRect();
    return {
        x: Math.min(Math.max(evt.clientX - rect.left, 0 + 75), rect.width - 75),
        y: Math.min(Math.max(evt.clientY - rect.top, 0 + 75), rect.height - 75)
    };
}

function clearBall(x, y, elev) {
    context.clearRect(x - (10 + elev * .7), y - (10 + elev * .7), 20 + elev * 1.4, 20 + elev * 1.4);
}

function drawBall(x, y, elev) {
    var radius = 10 + elev * .7;
    var grd = context.createRadialGradient(x - radius / 4, y - radius / 4, radius / 10, x - radius / 4, y - radius / 4, radius);
    context.strokeStyle = "rgba(0, 0, 0, 0)";
    grd.addColorStop(0, "white");
    grd.addColorStop(1, "lightgray");
    context.fillStyle = grd;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
}

function lose() {
    window.clearInterval(interval);
    interval = null;
    alert("You lost!");
}

function tick() {
    clearBall(ballPos.x, ballPos.y, elev);
    myPaddle.draw();
    elev += speed.z;
    ballPos.x += speed.x;
    ballPos.y += speed.y;
    if (elev <= 0 && speed.z < 0) {
        if (Math.abs(myPaddle.position.x - ballPos.x) <= 75 && Math.abs(myPaddle.position.y - ballPos.y) <= 75) { //Bounce!
            speed.z = 0 - speed.z;
            if (ballPos.x == myPaddle.position.x)
                speed.x += Math.random() > .5 ? 1 : -1;
            else
                speed.x += Math.round((ballPos.x - myPaddle.position.x) / 3);
            if (ballPos.y == myPaddle.position.y)
                speed.y += Math.random() > .5 ? 1 : -1;
            else
                speed.y += Math.round((ballPos.y - myPaddle.position.y) / 3);
            bounces++;
            bounceCount.innerHTML = bounces;
            bounceSound.play();
        } else //Lost Game!
            lose();
    } else
        speed.z -= 1;
    if (ballPos.x <= 0) {
        ballPos.x = Math.abs(ballPos.x);
        speed.x = 0 - speed.x;
    } else if (ballPos.x >= rect.width) {
        ballPos.x = 2 * rect.width - ballPos.x;
        speed.x = 0 - speed.x;
    }

    if (ballPos.y <= 0) {
        ballPos.y = Math.abs(ballPos.y);
        speed.y = 0 - speed.y;
    } else if (ballPos.y >= rect.height) {
        ballPos.y = 2 * rect.height - ballPos.y;
        speed.y = 0 - speed.y;
    }
    drawBall(ballPos.x, ballPos.y, elev);

}