/*
 * Click balls
 * Created By Bruno Queiros
 * Version: 1.0.0
 * Release: 2012-05-17
 * Licensed under the MIT license
 */
var Game = function () {
    var width = 450,
        height = 500,
        position = [0, 0],
        blockSize = 15,
        numBalls, canvas, ctx, pause, fps, timeout, collision, collisionClick, drawScore, ball, radius, gameStatus;

    return {
        init: init,
        setRandomNumber: setRandomNumber,
        getWidth: getWidth
    }

    /**
     * initialize the game
     */
    function init() {
        var $canvas = $('#canvas');

        if ($canvas.length === 0) {
            $('body').append('<canvas id="canvas"></canvas>');
        }

        $canvas = $('#canvas');
        $canvas.attr('width', width);
        $canvas.attr('height', height);

        canvas = $canvas[0];
        ctx = canvas.getContext('2d');

        score = 0;
        fps = 250;
        collision = false;
        collisionClick = false;
        gameStatus = true;
        numBalls = 1;

        ball = Ball();
        radius = ball.getRadius();
        ball.createBall();

        events();
        gameLoop();
    }


    /**
     * Random number generating
     */
    function setRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    /**
     * Game loop
     */
    function gameLoop() {
        draw();

        // Checks if the user clicked on the target
        if (checkCollisionClick()) {
            collisionClick = false;
            fps *= 0.99;
            score++;

            // every 8 balls burst, is created a ball
            if (score % 8 === 0) {
                for (var i = 0; i < numBalls; i++) {
                    ball.createBall();
                }
            }
            ball.createBall();
        }

        // Checks whether the target has reached the end of the field
        if (checkCollision()) {
            gameOver();
            gameStatus = false;
            clearTimeout(timeout);
        } else {
            timeout = setTimeout(gameLoop, fps / 24);
        }
    }


    /**
     * restart game
     */
    function restartGame() {
        clearTimeout(timeout);
        init();
    }


    /**
     * pause game
     */
    function pauseGame() {
        if (pause) {
            pause = false;
            clearTimeout(timeout);
        } else {
            pause = true;
            timeout = setTimeout(gameLoop, fps / 24);
        }
    }


    /**
     * draw game
     */
    function draw() {
        ctx.clearRect(0, 0, width, height);
        ball.drawBall(ctx);

        drawScore();
        drawBorder();
        ctx.restore();
    }


    /**
     * draw border
     */
    function drawBorder() {
        var offset = blockSize / 2;
        var corners = [
            [offset, offset],
            [width - offset, offset],
            [width - offset, height - offset],
            [offset, height - offset]
        ];

        ctx.save();
        ctx.strokeStyle = '#4f7e92';
        ctx.lineWidth = blockSize;
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(corners[3][0], corners[3][1]);
        $.each(corners, function (idx, corner) {
            ctx.lineTo(corner[0], corner[1]);
        });
        ctx.stroke();
        ctx.restore();
    }


    /**
     * draw score
     */
    function drawScore() {
        ctx.save();
        ctx.font = 'bold 100px sans-serif';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        var centreX = width / 2;
        var centreY = width / 2;
        ctx.fillText(score.toString(), centreX, centreY - 10);
        ctx.restore();
    }


    /**
     * game over message
     */
    function gameOver() {
        ctx.save();
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        var centreX = width / 2;
        var centreY = width / 2;
        ctx.fillText('Ops, you lost... :(', centreX, centreY - 10);
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('click here to try again', centreX, centreY + 15);
        ctx.restore();
    }


    /**
     * Checks if the user clicked on the target
     */
    function checkCollisionClick() {
        var x = position[0],
            y = position[1];
        balls = ball.getBalls();

        $.each(balls, function (idx, ball) {
            if ((y > ball[1] - radius && y < ball[1] + radius) && (x > ball[0] - radius && x < ball[0] + radius)) {
                balls.splice(idx, 1); // remove ball of array
                collisionClick = true;
                position = [0, 0];
                return false;
            }
        });

        return collisionClick;
    }


    /**
     * Checks whether the target has reached the end of the field
     */
    function checkCollision() {
        balls = ball.getBalls();

        $.each(balls, function (idx, ball) {
            if (height <= ball[1] + radius) {
                collision = true;
            }
        });

        return collision;
    }


    /**
     * events
     */
    function events() {
        $(document).click(function (event) {
            position = [event.offsetX, event.offsetY];
            checkCollisionClick();

            if (!gameStatus) {
                gameStatus = true;
                init();
            }
        });

        $(document).keyup(function (event) {
            var key = event.which;
            /**
             * P: 80
             * R: 82
             */
            if (key == 82) {
                restartGame();
            } else if (key == 80) {
                pauseGame();
            }
        });
    }


    /**
     * get width of game
     */
    function getWidth() {
        return width;
    }
}


var Ball = function () {
    var balls = [],
        radius = 15;

    return {
        createBall: createBall,
        getBalls: getBalls,
        getRadius: getRadius,
        drawBall: drawBall
    }


    /**
     * create a new ball
     */
    function createBall() {
        var widthGame = game.getWidth();
        var x = game.setRandomNumber(widthGame - radius, radius * 2);
        balls.push([x, -15]);
    }


    /**
     * get balls array
     */
    function getBalls() {
        return balls;
    }


    /**
     * get ball radius
     */
    function getRadius() {
        return radius;
    }


    /**
     * draw ball
     */
    function drawBall(ctx) {
        $.each(balls, function (idx, ball) {
            ball[1]++;
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = '#924f4f';
            ctx.arc(ball[0], ball[1], radius, 0, Math.PI * 2, false);
            ctx.fill();
        });
    }
}

// Init game
var game = Game();
game.init();
