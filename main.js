var theGame;
var context;
var width;
var height;
var interval;
var rect;
var bounces;
var bounceCount;
var highScore;
var highScoreCount;
var bounceSound;
var myPaddle;
var myBall;
var myModal;

class modal {
    constructor(dialogText, buttons = []) {
        this.dialogText = dialogText;
        this.buttonTexts = [];
        this.buttons = [];
        
        this.container = document.createElement("div");
        this.container.className = "js-modal-dialog";
        document.getElementsByTagName('body')[0].appendChild(this.container);

        this.dialog = document.createElement("div");
        this.container.appendChild(this.dialog);

        this.textNode = document.createElement("p");
        this.textNode.innerHTML = dialogText;
        this.dialog.appendChild(this.textNode);

        buttons.forEach(function(item, index) {
            this.buttons.push(document.createElement("button"));
            this.buttonTexts.push(item.text);
            this.buttons[index].innerHTML = this.buttonTexts[index];
            this.buttons[index].style.marginLeft = (100 - (20 * buttons.length)) / (2 * buttons.length) + "%";
            this.buttons[index].style.marginRight = (100 - (20 * buttons.length)) / (2 * buttons.length) + "%";
            this.buttons[index].onclick= function() {
                myModal.hide(); //Is there a way to self-reference here?
                if (!!item.function)
                    item.function(); // This doesn't allow for parameters. Is that okay?
            };
            this.dialog.appendChild(this.buttons[index]);
        }, this);
    }

    show(dialogText = undefined, button1Text = undefined, button2Text = undefined, button3Text = undefined) {
        if (dialogText) {
            this.dialogText = dialogText;
            this.textNode.innerHTML = dialogText;
        }

        if (button1Text) {
            this.button1Text = button1Text;
            this.button1.innerHTML = button1Text;
        }

        if (button2Text) {
            this.button2Text = button2Text;
            this.button2.innerHTML = button2Text;
        }

        this.container.style.display = "block";
    }

    hide() {
        this.container.style.display = "none";
    }
}

class paddle { //Player controlled

    constructor(theHeight = 150, theWidth = 150) {
        this.height = theHeight;
        this.width = theWidth;
        
        // These are for convenience as they are used often.
        this.halfHeight = this.height / 2;
        this.halfWidth = this.width / 2;

        this.position = {
            x: width / 2,
            y: height / 2
        };

        this.position.x = width / 2;
        this.position.y = height / 2;
    }

    draw() {
        // Draws the paddle at the current user position
        context.strokeStyle = "black";
        context.strokeRect(this.position.x - this.halfWidth, this.position.y - this.halfHeight, this.width, this.height);
        context.fillStyle = "rgb(200, 215, 255)";
        context.fillRect(this.position.x - this.halfWidth, this.position.y - this.halfHeight, this.width, this.height);
        context.beginPath();
        context.moveTo(this.position.x - this.halfWidth, this.position.y);
        context.lineTo(this.position.x + this.halfWidth, this.position.y);
        context.moveTo(this.position.x, this.position.y - this.halfHeight);
        context.lineTo(this.position.x, this.position.y + this.halfHeight);
        context.closePath();
        context.stroke();
        context.beginPath();
        context.arc(this.position.x, this.position.y, 10, 0, 2 * Math.PI);
        context.closePath();
        context.stroke();
        context.fill();
    }

    clear() {
        //Clears the paddl so it can be drawn next
        context.strokeStyle = "rgba(0, 0, 0, 0)";
        context.fillStyle = "white";
        context.fillRect(this.position.x - this.width / 2 - 1, this.position.y - this.height / 2 - 1, this.width + 3, this.height + 3);
    }
}

class ball {

    constructor(baseRadius = 10, radiusMultiplier = .7) {
        this.position = {
            x: width / 2,
            y: height / 2,
            z: 0
        };

        this.speed = {
            x: 0,
            y: 0,
            z: 10
        }

        this.baseRadius = baseRadius;
        this.radiusMultiplier = radiusMultiplier;
    }

    radius() {
        return this.baseRadius + this.position.z * this.radiusMultiplier;
    }

    clear() {
        let radius = this.radius();
        context.clearRect(this.position.x - radius, this.position.y - radius, radius * 2, radius * 2);
    }

    draw() {
        let radius = this.radius();
        let grd = context.createRadialGradient(this.position.x - radius / 4, this.position.y - radius / 4, radius / 10, this.position.x - radius / 4, this.position.y - radius / 4, radius);
        context.strokeStyle = "rgba(0, 0, 0, 0)";
        grd.addColorStop(0, "white");
        grd.addColorStop(1, "lightgray");
        context.fillStyle = grd;
        context.beginPath();
        context.arc(this.position.x, this.position.y, radius, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
    }
}

window.onload = function() {
    bounceCount = document.getElementById("BounceCount");
    highScoreCount = document.getElementById("HighScoreCount");
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
            if (interval) { //Pause
                window.clearInterval(interval);
                interval = false; // Paused
            } else // Play
                interval = window.setInterval(tick, 50);
        }
    });

    document.addEventListener("mousemove", function(evt) {
        myPaddle.clear();
        myPaddle.position = getMousePos(theGame, evt);
        myPaddle.draw();
        myBall.draw();;
    });

    myModal = new modal(
        "New Game?",
        [{
            text: "Yes",
            function: newGame   
        },
        {
            text: "No",
            function: null
        }]
    );
}

function newGame(){
    // Sets positions and sets the score to 0

    bounceSound.muted = false;

    if (myPaddle && myPaddle.position)
        myPaddle.clear();
    if (myBall && myBall.position)
        myBall.clear();
    bounceCount.innerHTML = bounces = 0;
    if (!highScore)
        highScoreCount.innerHTML = highScore = 0;

    myPaddle = new paddle();
    myBall = new ball();

    interval =  window.setInterval(tick, 50);
}

function getMousePos(canvas, evt) {
    rect = canvas.getBoundingClientRect();
    return { // Bounds the cursor position so the paddle will not be outside of the play area
        x: Math.min(Math.max(evt.clientX - rect.left, 0 + myPaddle.halfWidth), rect.width - myPaddle.halfWidth),
        y: Math.min(Math.max(evt.clientY - rect.top, 0 + myPaddle.halfHeight), rect.height - myPaddle.halfHeight)
    };
}

function lose() {
    window.clearInterval(interval);
    interval = null;
    myModal.show("You lose!<br />Your score: " + bounces + "<br />Play again?");
}

function tick() {
    myBall.clear();
    myPaddle.draw();
    myBall.position.z += myBall.speed.z;
    myBall.position.x += myBall.speed.x;
    myBall.position.y += myBall.speed.y;
    if (myBall.position.z <= 0 && myBall.speed.z < 0) {
        if (Math.abs(myPaddle.position.x - myBall.position.x) <= myPaddle.halfWidth && Math.abs(myPaddle.position.y - myBall.position.y) <= myPaddle.halfHeight) { //Bounce!
            myBall.speed.z = 0 - myBall.speed.z;
            if (myBall.position.x == myPaddle.position.x)
                myBall.speed.x += Math.random() > .5 ? 1 : -1;
            else
                myBall.speed.x += Math.round((myBall.position.x - myPaddle.position.x) / 3);
            if (myBall.position.y == myPaddle.position.y)
                myBall.speed.y += Math.random() > .5 ? 1 : -1;
            else
                myBall.speed.y += Math.round((myBall.position.y - myPaddle.position.y) / 3);
            bounces++;
            bounceCount.innerHTML = bounces;
            if (bounces > highScore) {
                highScore = bounces;
                highScoreCount.innerHTML = highScore;
            }
            bounceSound.play();
        } else //Lost Game!
            lose();
    } else
        myBall.speed.z -= 1;
    if (myBall.position.x <= 0) {
        myBall.position.x = Math.abs(myBall.position.x);
        myBall.speed.x = 0 - myBall.speed.x;
    } else if (myBall.position.x >= rect.width) {
        myBall.position.x = 2 * rect.width - myBall.position.x;
        myBall.speed.x = 0 - myBall.speed.x;
    }

    if (myBall.position.y <= 0) {
        myBall.position.y = Math.abs(myBall.position.y);
        myBall.speed.y = 0 - myBall.speed.y;
    } else if (myBall.position.y >= rect.height) {
        myBall.position.y = 2 * rect.height - myBall.position.y;
        myBall.speed.y = 0 - myBall.speed.y;
    }
    myBall.draw();

}