
var canvas_width = 0;
var canvas_height = 0;

//canvas limits
var canvas_min_x = 0;
var canvas_max_x = 0;
var canvas_min_y = 0;
var canvas_max_y = 0;

//player starting position
var player_start_x = 200;
var player_start_y = 320;


//portion of the image with the player on it
var player_x_min_offset = 15;
var player_x_max_offset = -18;
var player_y_min_offset = 65;
var player_y_max_offset = -31;

//portion of the image with the enemy on it
var enemy_x_min_offset = 5;
var enemy_x_max_offset = -5;
var enemy_y_min_offset = 80;
var enemy_y_max_offset = -26;

//number of lives
var player_turns = 3;

//pauses the screen
var pause_play = false;

//move offset
var move_right = 100;
var move_left = -100;
var move_up = -83;
var move_down = 83;


var StatusEnum = {
    OK: 1,
    COLLIDED: 2,
    WON: 3,
    GAMEOVER: 4
}


window.onload = function(){
    canvas_width = this.ctx.canvas.width;
    canvas_height = this.ctx.canvas.height;
    canvas_min_y =  -40;
    canvas_max_y = 420;
    canvas_max_x = 500;
}

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
        ctx.canvas.width = ctx.canvas.width;
    }

};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    var enemy_img = Resources.get(this.sprite);
    ctx.drawImage(enemy_img, this.x, this.y);
    this.enemy_width = enemy_img.width;
    this.enemy_height = enemy_img.height;
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
    if(pause_play === false)
    this.status = StatusEnum.OK;
}

Player.prototype.update = function() {
    if(pause_play === false) {
        if(this.new_x < canvas_max_x && this.new_x > canvas_min_y){
            this.x =  this.new_x;
        }
        if(this.new_y < canvas_max_y && this.new_y > canvas_min_y){
            this.y = this.new_y;
            if(this.y + move_up < canvas_min_y){
                pause_play = true;
                //you win!
                this.score+=100;
                this.status = StatusEnum.WON;
                //reset position
                var _p = this;
                setTimeout(function(){
                    _p.status = StatusEnum.OK;
                    _p.resetposition();
                    pause_play = false;
                },1500);

            }
        }
    }
}

Player.prototype.render = function() {
    var player_img = Resources.get(this.sprite);
    ctx.drawImage(player_img, this.x, this.y);

    this.player_width = player_img.width;
    this.player_height = player_img.height;

    this.CheckCollisions();

};

Player.prototype.handleInput = function(e) {
    switch(e){
        case "up":
            this.new_y = this.y + move_up;
            break;
        case "down":
            this.new_y = this.y + move_down;
            break;
        case "left":
            this.new_x = this.x + move_left;
            break;
        case "right":
           this.new_x = this.x + move_right;
            break;
        default:
            break;
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];

for(var i = 0; i < 3; i++) {
    //put
    var perline = Math.floor(Math.random() * 1) + 2;
    var velocity = Math.floor(Math.random() * 100) + 150;
    for(var j = 0; j < perline; j++) {
        var _enemy = new Enemy(- j * (velocity + 40 * perline),60 + (83 * i),velocity);
        allEnemies.push(_enemy);
    }
}

// Place the player object in a variable called player
var player = new Player(player_start_x,player_start_y);


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


Player.prototype.CheckCollisions = function () {
    if(pause_play === false) {
        //get location of player
        var player_x_min = this.x + player_x_min_offset;
        var player_x_max = this.x + this.player_width + player_x_max_offset;
        var player_y_min = this.y + player_y_min_offset;
        var player_y_max = this.y + this.player_height + player_y_max_offset;

        //compare to locations of each enemy
        var collide = false;
        allEnemies.forEach(function(enemy) {
            //check if any overlaps
            if(collide === false) {
                var enemy_x_min = enemy.x + enemy_x_min_offset;
                var enemy_x_max = enemy.x + enemy.enemy_width + enemy_x_max_offset;
                var enemy_y_min = enemy.y + enemy_y_min_offset;
                var enemy_y_max = enemy.y + enemy.enemy_height + enemy_y_max_offset;

                var _player = [[player_x_min,player_x_max],[player_y_min, player_y_max]];
                var _enemy = [[enemy_x_min,enemy_x_max],[enemy_y_min, enemy_y_max]];

                var overlap = overlapping2D(_player,_enemy);
                if (overlap === true) {
                    collide = true;
                }
            }
        });

        if(collide === true) {

            //increase the number of mistakes
            this.mistakes++;

            if(this.mistakes < player_turns) {
                this.status = StatusEnum.COLLIDED;
                pause_play = true;
                var _p = this;
                setTimeout(function(){
                    _p.status = StatusEnum.OK;
                    _p.resetposition();
                    pause_play = false;
                },500);

            }
        }
    }
    this.drawHearts();

};

Player.prototype.drawHearts = function() {
    var image_heart = Resources.get('images/heart.png');
    image_heart.width = 30;
    image_heart.height = 51;


    if(this.mistakes === player_turns){
        //draw the game over
        pause_play = true;
        var image_gameover = Resources.get('images/gameover.png');
        ctx.drawImage(image_gameover, canvas_width/2 - image_gameover.width/2, canvas_height/2 - image_gameover.height/2);
        //ctx.drawImage(image_gameover, 200, 200);

    }
    else{
        if(this.status === StatusEnum.COLLIDED) {
            ctx.drawImage(Resources.get('images/x.png'), this.x, this.y);
        }
        if(this.status === StatusEnum.WON) {
            var image_win = Resources.get('images/win.png');
            ctx.drawImage(image_win, canvas_width/2 - image_win.width/2, canvas_height/2 - image_win.height/2);
        }

        var x_start = canvas_width - ((player_turns - this.mistakes) *  image_heart.width) - 10;

        for(var i = 0; i < (player_turns - this.mistakes); i++){
            ctx.drawImage(image_heart, x_start, 0, image_heart.width,image_heart.height);
            x_start += image_heart.width;
        }
    }

    //display score
    ctx.font = "20px Arial";
    ctx.lineWidth = 3;
    ctx.fillStyle = "#000";
    ctx.fillText("SCORE: " + this.score,10,40);

};

Player.prototype.resetposition = function() {
    //reset player position
    this.x = player_start_x;
    this.y = player_start_y;
    this.new_x = player_start_x;
    this.new_y = player_start_y;
};

//function to check if boxes are overlapping - from the internet
function overlapping1D(_player, _enemy) {
    return (_player[1] >= _enemy[0] && _enemy[1] >=  _player[0]);
}

function overlapping2D(_player, _enemy) {
    return overlapping1D(_player[0], _enemy[0]) &&
                           overlapping1D(_player[1], _enemy[1]);
}
