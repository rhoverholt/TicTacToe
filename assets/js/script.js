
const emptyM = 0, xM = 'X', oM = 'O'; // These are the possible cell contents, empty, X or O. 

let isGameStarted = false, isGameOver = false, isPlayerBoth = false, isPlayerX = true, isPlayerTurn = true,
    gameBoard = [[emptyM,emptyM,emptyM],[emptyM,emptyM,emptyM],[emptyM,emptyM,emptyM]],
    moveStack = []; // maintain a list of moves so they can be undone as needed

const gameTable = document.getElementById("game-table");
const playXEl = document.getElementById("play-X");
const playOEl = document.getElementById("play-O");
const playBothEl = document.getElementById("play-both");
const startBtnEl = document.getElementById("start-btn");
const undoBtnEl = document.getElementById("undo");
const refreshBtnEl = document.getElementById("refresh");
const playStatusEl = document.getElementById("play-status");
const outputMsgEl = document.getElementById("output-msg")

const headerInputEls = [playXEl, playOEl, playBothEl, startBtnEl];

// Setup button event listeners
[["start-btn", processStartClick], ["undo", processUndoClick],["refresh", () => window.location.reload()]]
    .forEach( ([id, fun]) => 
        document.getElementById(id).addEventListener("click", fun));

createGameTable(); // create the HTML to display the game and the cell event listeners

displayOutput("Begin by choosing sides or simply making a move");

function createGameTable() {
    
    for (let row=0; row < 3; row++) {
        // create the row element itself
        let rowEl = appendDiv( gameTable, `row-${row}`, (row === 1) ? ["row", "mid-row"] : ["row"]);

        // add the cell elements, and their event listeners, to the row
        for (let col=0; col < 3; col++) {
            appendDiv( rowEl, `cell-${row}-${col}`, (col === 1) ? ["cell", "mid-col"] : ["cell"])
                .addEventListener("click", processCellClick);
        }
    }

    // define the function that creates the divs, providing the id and classes given.
    function appendDiv(parent, id, classes = []) {
        const child = document.createElement("div");
        child.id = (id) ? id : "";
        classes.forEach((item) => child.classList.add(item));
        return parent.appendChild(child); // returns the child element
    }
}

// Verify the click is a valid move
// Play the move.
// Determine if the game is over.
// If not, play the computer's move.
function processCellClick(event) {

    // ignore the click if it wasn't the player's turn
    if (!isPlayerTurn || isGameOver) return;

    let element = document.getElementById(event.target.id);

    // ignore the click if the cell has already been played in
    if (element.textContent) {
        console.log(`Clicked cell (${element.id}) already contains '${element.textContent}'`);
        return;
    }

    // process the click that's in an empty cell

    // Allow this to start the game if needed
    if (!isGameStarted) {
        if (!startNewGame(false)) return; //false parameters means start button was not pressed, false return means invalid user click.
    }

    // Play the move for the click!
    processMove(element);

    if (!isGameOver && !isPlayerBoth) {
        playComputerMove(); // plays the move and ends via processMove()
    }
}

function startNewGame(wasButtonClicked) {
    const gameType = document.querySelector('input[name="play-side"]:checked').value;

    if (gameType === 'O' && !wasButtonClicked) return false; // the game has not been started!

    isPlayerBlack = !(gameType === 'O');
    isPlayerBoth = (gameType === 'Both');    
    isGameStarted = true;

    // disable the Header input, as a move has been made:
    disableHeaderInput(true);

    // enable the undo and refresh buttons
    undoBtnEl.disabled = false;
    refreshBtnEl.disabled = false;

    return true; // the game has been started!
}

function processStartClick() {

    startNewGame(true);

    if (playOEl.checked) {
        playComputerMove(); // plays the turn and ends via processMove
        return;
    }

    // wait for the player to take their turn, whether they are X or both.
    displayNextTurn(false);
    return;
}

function processUndoClick() {
    undoMove();

    if (isPlayerBoth) return; // only need to return the 1 move if the player is playing both Xs and Os

    // As long as black hadn't just played in the 9th cell, and thus it remains black's turn after just one undo...
    if (!(isPlayerBlack && isBlackTurn(gameBoard))) undoMove();

    function undoMove() {

        if (!moveStack.length) { // no more moves to undo so start over
            window.location.reload();
            return; // Just to make it obvious.
        }

        isGameOver = false;

        let [row, col] = moveStack.pop();

        if (!moveStack.length) { // no more moves to undo so start over
            window.location.reload();
            return; // Just to make it obvious.
        }

        document.getElementById(`cell-${row}-${col}`).textContent = "";
        gameBoard[row][col] = 0;

        displayNextTurn(false);    
    }
}

function disableHeaderInput(isDisable) {
    headerInputEls.forEach((btn) => btn.disabled = isDisable);
    playStatusEl.textContent = ((isDisable) ? "I'm playing: " : "I'll play");
}

// Place a move in the given element
// Give a message on screen showing who won or who's turn is next.
function processMove(element) {

    if (isBlackTurn(gameBoard)) {
        element.textContent = "X";
    } else {
        element.textContent = "O";
    }

    // update the gameBoard
    let row = element.id[5]; // 'cell-R-C'
    let col = element.id[7];

    moveStack.push([row,col]);
    gameBoard[row][col] = element.textContent;

    displayNextTurn(getGameStatus(gameBoard));
    return false; // game is not yet over
}

function displayNextTurn(gameStatus) {

    if ([false, "T", "X", "O"].indexOf(gameStatus) === -1) { // if gameStatus is an invalid value...something other than null, T, X, or O
        console.log("gameStatus ERROR!");
        return;
    }

    if (!gameStatus) { // the game is not yet over
        displayOutput(`It's now ${((isBlackTurn(gameBoard)) ? 'X' : 'O')}'s turn.`);
    } else if (gameStatus ==="T") {
        displayOutput("Game Over - It's a tie!");
    } else { // gameStatus must be X or O
        displayOutput(`Game Over - ${gameStatus} Wins!`);
    }

    isGameOver = (gameStatus ? true : false);
}

function displayOutput(text) {
    outputMsgEl.textContent = text;
}

// Returns X, O, T, or False based on winner or not over
function getGameStatus(board) {
    // use gameBoard to determine the current status

    // check for a vertical winner
    for (let col=0; col < 3; col++) {
        if (!(board[0][col] === 0)) {
            // no possible winner if it's empty!
            if (board[0][col] === board[1][col]
            && board[0][col] === board[2][col]) {
                return board[0][col]; // they won!
            }
        }
    }

    // check for a horizontal winner
    for (let row=0; row < 3; row++) {
        if (!(board[row][0] === 0)) {
            // no possible winner if it's empty!
            if (board[row][0] === board[row][1]
            && board[row][0] === board[row][2]) {
                return board[row][0]; // they won!
            }
        }
    }

    // check for diagonal winners
    if (!(board[1][1] === 0)) {
        // if the middle is empty, no diagonal win is possible
        if ((board[1][1] === board[0][0] && board[1][1] === board[2][2])
            // above checks the first diagonal
          || (board[1][1] === board[0][2] && board[1][1] === board[2][0])) {
            // above checks the second diagonal -- if either were successful...
            return board[1][1]; // they won!
        }
    } else {
        return false; // can skip next part, as we know there is a move left!
    }

    // if all moves have been made it's a tie, otherwise return false
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row][col] === 0) {
                return false; // no result yet!
            }
        }
    }
    return "T"; // this is the only option left!
}

function playComputerMove() {


    function sleep (time) {
        isPlayerTurn = false;
        return new Promise((resolve) => setTimeout(resolve, time));
      }
      
    sleep(500).then(() => {
          // Do something after the sleep!

        let bestMove = whereShouldIPlay(gameBoard); // returns [row, col, X/O/T]
        isPlayerTurn = true;
        processMove(document.getElementById(`cell-${bestMove[0]}-${bestMove[1]}`));
    })
        
        // returns the row, col. X/O/T where we want to move
        // assumes that we need to make a move...the game is not yet over!
    function whereShouldIPlay(myBoard) {
 
        let newBoard = JSON.parse(JSON.stringify(myBoard))

        let whoseTurn = (isBlackTurn(myBoard) ? 'X' : 'O');

        // create a result array for the results of all possible moves
        let myResults = [];

        // check all possible moves
        for (let row = 0; row < 3; row++) {
            let colArray = [];
            for (let col = 0; col < 3; col++) {
                if (myBoard[row][col] === 0) {
                    // add my move to it
                    newBoard[row][col] = whoseTurn;
                    let playResult = getGameStatus(newBoard);

                    if (!playResult) { // No winner is yet found 
                        // recursively determine the best result by playing that move
                        playResult = whoWins(newBoard); 
                    }
                    colArray.push(playResult);
                    newBoard[row][col] = 0; // remove my move from it
                } else { // move not allowed
                    colArray.push(0);
                }
            }
            myResults.push(colArray);
        }

        return chooseBestResult(myResults, whoseTurn); // [row, col, X/O/T]

        // A move has been played, but the game is not over
        // given this board, who will win with best play by both?
        // Returns X, O, T
        function whoWins(myBoard) {
            let whoseTurn = (isBlackTurn(myBoard) ? 'X' : 'O');

            let newBoard = JSON.parse(JSON.stringify(myBoard));

            let myResults = [];

            for(let row=0; row<3; row++) {
                let colArray = [];
                for(let col=0; col<3; col++) {
                    if (myBoard[row][col] === 0) {
                        // add my move to the board
                        newBoard[row][col] = whoseTurn;
                        playResult = getGameStatus(newBoard);
                            
                        if (!playResult) { // No winner is yet found 
                            // recursively determine the best result by playing that move
                            playResult = whoWins(newBoard); // asking about a board with fewer available plays
                        }
                        colArray.push(playResult);
                        newBoard[row][col] = 0; // reset to the original board
                    } else { // move not allowed
                        colArray.push(0);
                    }
                }
                myResults.push(colArray);
            }
            return chooseBestResult(myResults, whoseTurn)[2];
        }
    }

    // resultsArray has 3 rows of 3 columns, each being with 0 (already played), X, O, or T
    // where X, O, T is the result from playing there
    // mySide says whether I'm X or O
    // Output: [row, col, X/O/T]
    function chooseBestResult(resultArray, mySide) {
 
        let winArray = [];
        let loseArray = [];
        let tieArray = [];

        otherSide = (mySide === 'X') ? 'O' : 'X';

        // cycle through all the results and select the best
        for (row=0; row < 3; row++) {
            for (col=0; col < 3; col++) {
                switch (resultArray[row][col]) {
                    case 0:
                        break; // move already played
                    case mySide:
                        winArray.push([row, col]);
                        break;
                    case 'T':
                        tieArray.push([row, col]);
                        break;
                    default:
                        loseArray.push([row, col]);
                }
            }
        }

        // If we can win, play a winning move!
        if (winArray.length > 0) {
            randomIndex = Math.floor(Math.random()*winArray.length);
            winArray[randomIndex].push(mySide);
            return (winArray[randomIndex]);
        }

        // else...if we can tie, play a tieing move
        if (tieArray.length > 0) {
            randomIndex = Math.floor(Math.random()*tieArray.length);
            tieArray[randomIndex].push("T");
            return (tieArray[randomIndex]);
        }

        // else...play a losing move
        if (loseArray.length > 0) {
            randomIndex = Math.floor(Math.random()*loseArray.length);
            loseArray[randomIndex].push(otherSide);
            return (loseArray[randomIndex]);
        }
        console.log("You should never see this...");
    }
}

function isBlackTurn(board) {
    // examine the board to see who's turn it must be

    let moves = 0;

    for (row=0; row < 3; row++) {
        for (col = 0; col < 3; col++) {
            // add one to moves if a play has been made in this cell
            if (board[row][col] !== 0) {
                moves++;
            }
        }
    }
    return ((moves % 2) === 0); //return true if 0, 2, 4, 6, 8 moves have been played.
}