'use strict'
var gBoard;
const MINE_IMG = '<img src="img/mine.jpg">';
const GRAY_IMG = '<img src="img/gray.jpg">';
const FLAG_IMG = '<img src="img/red_flag.png">';
const SUNGLASSES_SMILEY_IMG = "img/sunglasses_smiley.jpg";
const DEAD_SMILEY = "img/dead.jpg";
const REG_SMILEY = "img/reg_smiley.jpg";
var gGameTimer;
var gState = {
    isGameOn: false,
    flippedCellsCount: 0,
    FlaggedMinesCount: 0,
    gameStartTime: 0,
}

var gLevel = {
    LEVEL: 'easy',
    SIZE: 4,
    MINES: 2,
}


function init() {
    reset();
    gBoard = buildBoard();
    renderBoard(gBoard);
    showBestScore();
}
function reset() {
    clearInterval(gGameTimer);
    gState.isGameOn = false;
    gState.FlaggedMinesCount = 0
    gState.gameStartTime = 0;
    gState.flippedCellsCount = 0;
    document.querySelector('.timer').style.visibility = 'hidden';
    document.querySelector('.smiley img').src = REG_SMILEY;
    document.querySelector('.game_over').style.visibility = 'hidden';
    document.querySelector('.victory').style.display = 'none';
    document.querySelector('.loss').style.display = 'none';
    document.querySelector('.level span').innerHTML = gLevel.LEVEL;
    document.querySelector('.mines span').innerHTML = gLevel.MINES;


}

function setLevel(boardSize, numOfMines, level) {
    gLevel.SIZE = boardSize;
    gLevel.MINES = numOfMines;
    gLevel.LEVEL = level;
    document.querySelector('.level span').innerHTML = gLevel.LEVEL;
    document.querySelector('.mines span').innerHTML = gLevel.MINES;
    init();

}
function showBestScore() {
    var bestTime = localStorage.getItem(gLevel.LEVEL);
    if (bestTime !== null) {
        document.querySelector('.best_time').innerHTML =
            `The best time for the ${gLevel.LEVEL} level is ${bestTime} seconds.`;
    } else {
        document.querySelector('.best_time').innerHTML = '';

    }
}
function getBestTime(level) {
    return +localStorage.getItem(level);

}

function setBestTimeIfBest(level, currGameDuration) {
    var savedBestTime = getBestTime(level);
    if (savedBestTime === 0 || currGameDuration < savedBestTime) {
        localStorage.setItem(level, currGameDuration);
    }
}


function buildBoard() {
    var board = [];
    var boardSize = gLevel.SIZE;

    for (var i = 0; i < boardSize; i++) {
        board.push([]);
        for (var j = 0; j < boardSize; j++) {
            board[i][j] =
                {
                    isMine: false,
                    numOfMinesInVicinity: 0, //CR: Not best var name
                    isFlagged: false,
                    isFlipped: false,
                };
        }
    }
    console.table(board);
    return board;
}



function renderBoard(board) {
    var strHtml = '';
    var elBoard = document.querySelector('.board');
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>\n';
        for (var j = 0; j < board.length; j++) {
            strHtml += `\t<td 
                onclick="cellClicked(this)" oncontextmenu="return cellFlagged(this);" 
                class="cell" id="cell${i}-${j}"><div>
               ${GRAY_IMG}</div>               
            </td>\n`;
        }
        strHtml += '</tr>\n';
    }
    elBoard.innerHTML = strHtml;
}



function cellClicked(elCell) {
    var coor = getCellCoord(elCell.id);
    var cell = gBoard[coor.i][coor.j];

    if (gState.gameStartTime === 0) startTheGame(elCell);

    if (cell.isFlagged) return;
    // CR: YOU CAN WRITE: if (!gState.isGameOn)
    if (gState.isGameOn === false) return;

    if (cell.isFlipped) return;
    if (cell.isMine) {
        mineFound(gBoard, elCell);
    } else if (cell.numOfMinesInVicinity > 0) {
        renderCell(elCell, cell.numOfMinesInVicinity);
        gState.flippedCellsCount++;
        cell.isFlipped = true;
    } else {
        expandShown(coor);
    }
    checkGameOver();
}



function startTheGame(elCell) {
    gState.isGameOn = true;
    gState.gameStartTime = Date.now();
    gGameTimer = setInterval(showGameDuration, 300);
    setMines(elCell, gBoard);
    setMinesNegsCount(gBoard);
    document.querySelector('.timer').style.visibility = 'visible';

}

function setMines(elCell, board) {
    var counter = 0;
    var coor = getCellCoord(elCell.id);
    while (counter < gLevel.MINES) {
        var i = Math.floor(Math.random() * board.length);
        var j = Math.floor(Math.random() * board.length);
        var cell = board[i][j];
        if (cell.isMine === false && !(coor.i === i && coor.j === j)) {
            cell.isMine = true;
            counter++;
        }
    }
}

function setMinesNegsCount(board) {
    // CR: I dont like this 8 ifs, better use an inside loop next time
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) {
                continue;
            }
            var numOfSurrodingMines = 0;
            if (i >= 1 && board[i - 1][j].isMine === true) numOfSurrodingMines++;
            if (j >= 1 && board[i][j - 1].isMine === true) numOfSurrodingMines++;
            if (i >= 1 && j >= 1 && board[i - 1][j - 1].isMine === true) numOfSurrodingMines++;
            if (i >= 1 && j < board.length - 1 && board[i - 1][j + 1].isMine === true) numOfSurrodingMines++;
            if (i < board.length - 1 && j >= 1 && board[i + 1][j - 1].isMine === true) numOfSurrodingMines++;
            if (i < board.length - 1 && j < board.length - 1 && board[i + 1][j + 1].isMine === true) numOfSurrodingMines++;
            if (i < board.length - 1 && board[i + 1][j].isMine === true) numOfSurrodingMines++;
            if (j < board.length - 1 && board[i][j + 1].isMine === true) numOfSurrodingMines++;
            gBoard[i][j].numOfMinesInVicinity += numOfSurrodingMines;
        }
    }
}

function cellFlagged(elCell) {
    var coor = getCellCoord(elCell.id);
    var cell = gBoard[coor.i][coor.j];

    if (gState.gameStartTime === 0) startTheGame(elCell);
    if (gState.isGameOn === false) return
    if (cell.isFlipped) return;

    if (cell.isFlagged) {
        cell.isFlagged = false;
        renderCell(elCell, GRAY_IMG);
        if (cell.isMine) {
            gState.FlaggedMinesCount--;
        }

    } else {
        cell.isFlagged = true;
        renderCell(elCell, FLAG_IMG);
        if (cell.isMine) {
            gState.FlaggedMinesCount++;
        }
    }
    checkGameOver();
    return false;
}


function expandShown(coor) {
    // CR: Why use an array and not two loops?
    var coorOfNegCells = [[1, 1], [-1, -1], [0, 1], [0, -1], [1, 0], [-1, 0], [-1, 1], [1, -1]];
    for (var index = 0; index < coorOfNegCells.length; index++) {
        var cell = coorOfNegCells[index];
        var i = cell[0];
        var j = cell[1];
        revealProxOfMines(coor, i, j, gBoard);
    }
}
function revealProxOfMines(coor, diffI, diffJ, board) {
    for (var i = coor.i, j = coor.j; isInRange(i, j); i += (diffI), j += (diffJ)) {
        var cell = board[i][j];
        if (cell.isMine) {
            break;
        } else {
            if (cell.isFlipped === false) {
                cell.isFlipped = true;
                gState.flippedCellsCount++;
            }
            if (cell.numOfMinesInVicinity > 0) {
                setAndRenderCell(i, j, cell.numOfMinesInVicinity)
                break;
            } else if (cell.numOfMinesInVicinity === 0) {
                setAndRenderCell(i, j, '');
            }
        }
    }
}
function isInRange(i, j) {
    return (i >= 0 && j >= 0 && i < gBoard.length && j < gBoard.length);
}
function setAndRenderCell(i, j, gameElement) {
    var elCell = document.querySelector(`#cell${i}-${j}`);
    renderCell(elCell, gameElement);

}
function renderCell(elCell, gameElement) {
    elCell.innerHTML = gameElement;
}



function mineFound(board, elCell) {
    elCell.style.backgroundColor = 'red';
    onGameOver(false);
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) {
                setAndRenderCell(i, j, MINE_IMG)
            }
        }
    }
}

function showGameDuration() {
    var gameStartTime = gState.gameStartTime;
    var gameDuration = Date.now() - gameStartTime;
    gameDuration = (gameDuration / 1000).toFixed(2);
    document.querySelector('.timer span').innerText = gameDuration;
}


function getCellCoord(strCellId) {
    var coord = {};
    coord.i = +strCellId.substring(4, strCellId.lastIndexOf('-'));
    coord.j = +strCellId.substring(strCellId.lastIndexOf('-') + 1);
    return coord;
}

function checkGameOver() {
    if (gState.FlaggedMinesCount + gState.flippedCellsCount === gLevel.SIZE * gLevel.SIZE) {
        onGameOver(true);
    }

}

function onGameOver(isWin) {
    clearInterval(gGameTimer);
    var gameDuration = ((Date.now() - gState.gameStartTime) / 1000).toFixed(2);
    document.querySelector('.timer span').innerText = gameDuration;
    var elCell = document.querySelector('.game_over');
    elCell.style.visibility = 'visible';
    if (isWin) {
        document.querySelector('.smiley img').src = SUNGLASSES_SMILEY_IMG;
        elCell.querySelector('.victory').style.display = 'block';
        setBestTimeIfBest(gLevel.LEVEL, gameDuration);
        elCell.querySelector('.victory span').innerHTML = gameDuration;

    } else {
        elCell.querySelector('.loss').style.display = 'block';
        document.querySelector('.smiley img').src = DEAD_SMILEY;
    }
    gState.isGameOn = false;
}
