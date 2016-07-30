var canvas_width = 0;
var canvas_height = 0;

//canvas limits
var canvas_min_x = 0;
var canvas_max_x = 0;
var canvas_min_y = 0;
var canvas_max_y = 0;

//player starting position
var PLAYER_START_X = 200;
var PLAYER_START_Y = 320;


//portion of the image with the player on it
var PLAYER_X_MIN_OFFSET = 15;
var PLAYER_X_MAX_OFFSET = -18;
var PLAYER_Y_MIN_OFFSET = 65;
var PLAYER_Y_MAX_OFFSET = -31;

//portion of the image with the enemy on it
var ENEMY_X_MIN_OFFSET = 5;
var ENEMY_X_MAX_OFFSET = -5;
var ENEMY_Y_MIN_OFFSET = 80;
var ENEMY_Y_MAX_OFFSET = -26;

//number of lives
var PLAYER_TURNS = 3;

//highest score
var highest_score = 0;

//pauses the screen when player collides with enemies, wins or the game is over
var pause_play = false;

//move offset
var MOVE_RIGHT = 100;
var MOVE_LEFT = -100;
var MOVE_UP = -83;
var MOVE_DOWN = 83;


var StatusEnum = {
    OK: 1,
    COLLIDED: 2,
    WON: 3,
    GAMEOVER: 4
};

window.onload = function() {
    canvas_width = this.ctx.canvas.width;
    canvas_height = this.ctx.canvas.height;
    canvas_min_y =  -40;
    canvas_max_y = 420;
    canvas_max_x = 500;
    highest_score = getCookie('highest_score') * 1;
};


// Enemies our player must avoid
var Enemy = function(x, y, v) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.enemy_width = 0;
    this.enemy_height = 0;
    this.x = x - this.enemy_width;
    this.y = y;
    this.v = v;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    if(pause_play === false) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        //multiply by velocity incrementally
        this.x += dt * this.v;
        //go back to start when it goes offscreen
        if(this.x > canvas_width) {
            this.x = - this.enemy_width;
        }
        //empties the canvas including the score portion
        ctx.canvas.width = ctx.canvas.width;
    }
    this.CheckCollisions();
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    var enemy_img = Resources.get(this.sprite);
    ctx.drawImage(enemy_img, this.x, this.y);
    this.enemy_width = enemy_img.width;
    this.enemy_height = enemy_img.height;
};

Enemy.prototype.CheckCollisions = function () {
    if(pause_play === false) {
        //get location of player
        var player_x_min = player.x + PLAYER_X_MIN_OFFSET;
        var player_x_max = player.x + player.player_width + PLAYER_X_MAX_OFFSET;
        var player_y_min = player.y + PLAYER_Y_MIN_OFFSET;
        var player_y_max = player.y + player.player_height + PLAYER_Y_MAX_OFFSET;

        //get location of enemy
        var enemy_x_min = this.x + ENEMY_X_MIN_OFFSET;
        var enemy_x_max = this.x + this.enemy_width + ENEMY_X_MAX_OFFSET;
        var enemy_y_min = this.y + ENEMY_Y_MIN_OFFSET;
        var enemy_y_max = this.y + this.enemy_height + ENEMY_Y_MAX_OFFSET;

        var _player = [[player_x_min,player_x_max],[player_y_min, player_y_max]];
        var _enemy = [[enemy_x_min,enemy_x_max],[enemy_y_min, enemy_y_max]];

        //check if they overlap
        var overlap = this.overlapping2D(_player,_enemy);
        if (overlap === true) {
            //increase the number of mistakes
            player.mistakes++;

            if(player.mistakes < PLAYER_TURNS) {
                player.status = StatusEnum.COLLIDED;
                pause_play = true;
                setTimeout(function() {
                    player.status = StatusEnum.OK;
                    player.resetposition();
                    pause_play = false;
                },500);
            }
        }
    }
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(x,y) {
    this.sprite = 'images/char-boy.png';
    this.player_width = 0;
    this.player_height = 0;
    this.x = x;
    this.y = y;
    this.new_x = x;
    this.new_y = y;
    this.mistakes = 0;
    //score
    this.score = 0;
    this.status = StatusEnum.OK;
};

Player.prototype.update = function() {
    if(pause_play === false) {
        //check if player will go off the canvas
        if(this.new_x < canvas_max_x && this.new_x > canvas_min_y) {
            this.x =  this.new_x;
        }
        if(this.new_y < canvas_max_y && this.new_y > canvas_min_y) {
            this.y = this.new_y;
            //check if player is on the top
            if(this.y + MOVE_UP < canvas_min_y) {
                pause_play = true;
                //you win!
                this.score+=1;
                this.status = StatusEnum.WON;
                //check is current score is the new highest
                if(highest_score < this.score) {
                    highest_score = this.score;
                    setCookie('highest_score',highest_score,365);
                }
                //reset position
                var _p = this;
                setTimeout(function() {
                    _p.status = StatusEnum.OK;
                    _p.resetposition();
                    pause_play = false;
                },1000);

            }
        }
    }
};

Player.prototype.render = function() {
    var player_img = Resources.get(this.sprite);
    ctx.drawImage(player_img, this.x, this.y);

    this.player_width = player_img.width;
    this.player_height = player_img.height;
    //draw the hearts, score, etc.
    this.drawHearts();
};

Player.prototype.handleInput = function(e) {
    switch(e) {
        case 'up':
            this.new_y = this.y + MOVE_UP;
            break;
        case 'down':
            this.new_y = this.y + MOVE_DOWN;
            break;
        case 'left':
            this.new_x = this.x + MOVE_LEFT;
            break;
        case 'right':
           this.new_x = this.x + MOVE_RIGHT;
            break;
        default:
            break;
    }
};

Player.prototype.drawHearts = function() {
    var image_heart = Resources.get('images/Heart.png');
    //resize the heart image
    image_heart.width = 30;
    image_heart.height = 51;

    if(this.mistakes === PLAYER_TURNS) {
        //game over
        this.status = StatusEnum.GAMEOVER;
        pause_play = true;
        var image_gameover = Resources.get('images/gameover.png');
        ctx.drawImage(image_gameover, canvas_width/2 - image_gameover.width/2, canvas_height/2 - image_gameover.height/2);
    }
    else{
        if(this.status === StatusEnum.COLLIDED) {
            //display the X when player collides with an enemy
            ctx.drawImage(Resources.get('images/x.png'), this.x, this.y);
        }
        if(this.status === StatusEnum.WON) {
            //display 'YOU WIN!!!' when user reaches top
            var image_win = Resources.get('images/win.png');
            ctx.drawImage(image_win, canvas_width/2 - image_win.width/2, canvas_height/2 - image_win.height/2);
        }

        //draw the hearts/turns left
        var x_start = canvas_width - ((PLAYER_TURNS - this.mistakes) *  image_heart.width) - 10;
        for(var i = 0; i < (PLAYER_TURNS - this.mistakes); i++) {
            ctx.drawImage(image_heart, x_start, 5, image_heart.width,image_heart.height);
            x_start += image_heart.width;
        }
    }

    //display score
    ctx.font = '20px Arial';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#000';
    ctx.fillText('SCORE: ' + this.score,10,40);
    ctx.fillText('HIGHEST: ' + highest_score,10,15);


};

Player.prototype.resetposition = function() {
    //reset player position
    this.x = PLAYER_START_X;
    this.y = PLAYER_START_Y;
    this.new_x = PLAYER_START_X;
    this.new_y = PLAYER_START_Y;
};

Player.prototype.restart = function() {
    //reset game values
    this.x = PLAYER_START_X;
    this.y = PLAYER_START_Y;
    this.new_x = PLAYER_START_X;
    this.new_y = PLAYER_START_Y;
    this.mistakes = 0;
    this.score = 0;
    this.status = StatusEnum.OK;
    //change the velocity of the enemies
    allEnemies.forEach(function (_enemy) {
        _enemy.v = Math.floor(Math.random() * 150) + 200;
    });
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
for(var i = 0; i < 3; i++) {
    //put out 1-2 bugs per line
    var perline = Math.floor(Math.random() * 1) + 2;
    for(var j = 0; j < perline; j++) {
        //randomize the velocity
        var velocity = Math.floor(Math.random() * 150) + 200;
        var _enemy = new Enemy(- j * (velocity + 40 * perline),60 + (83 * i),velocity);
        allEnemies.push(_enemy);
    }
}

// Place the player object in a variable called player
var player = new Player(PLAYER_START_X,PLAYER_START_Y);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

document.addEventListener('click', function(e) {
    //check if game over
    if(player.status === StatusEnum.GAMEOVER) {
        //restart game
        player.restart();
        pause_play = false;
    }
    else{
        var restart = window.confirm('Are you sure you want to restart the game?');
        if(restart === true) {
            player.restart();
        }
    }
});


//code copied from the internet
//===================================================

//function to check if boxes are overlapping
Enemy.prototype.overlapping1D = function(_player, _enemy) {
    return (_player[1] >= _enemy[0] && _enemy[1] >=  _player[0]);
};

Enemy.prototype.overlapping2D = function(_player, _enemy) {
    return this.overlapping1D(_player[0], _enemy[0]) &&
                           this.overlapping1D(_player[1], _enemy[1]);
};

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = 'expires='+ d.toUTCString();
    document.cookie = cname + '=' + cvalue + '; ' + expires;
};

function getCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return '';
};

