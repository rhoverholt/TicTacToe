let isGameStarted = false, isGameOver = false, isPlayerBoth = false, isPlayerX = true, isPlayerTurn = true,
    gameBoard = [[0,0,0],[0,0,0],[0,0,0]], // 0 = empty, 'X', 'O' = played
    moveArray = []; // maintain a list of moves so they can be undone as needed

createGameTable(); // create the HTML to display the game
displayOutput("Begin by choosing sides or simply making a move");

document.addEventListener("click", processClick);

function createGameTable() {
    const gameTable = document.getElementById("game-table");

    for (let row=0; row < 3; row++) {
        gameTable.append(createRow(row));
        if (row < 2) {
            gameTable.append(createRowDivider());
        }
    }

    function createRow(row) {
        
        // create the row element itself
        let rowElement = document.createElement("div");
        rowElement.classList.add("row");
        rowElement.id = `row-${row}`;

        // add the cell elements to the row
        for (let col=0; col < 3; col++) {
            rowElement.append(createCell(row, col));
            if (col < 2) {
                rowElement.append(createCellDivider());
            }
        }
        return rowElement;

        function createCell(row, col) {
            let cellElement = document.createElement("div");
            cellElement.id = `cell-${row}-${col}`;
            cellElement.classList.add("cell");
            return cellElement;
        }

        function createCellDivider() {
            let divElement = document.createElement("div");
            divElement.classList.add("divider","col-divider");
            return divElement;
        }
    }

    function createRowDivider(element) {
        let divElement = document.createElement("div");
        divElement.classList.add("divider","row-divider");
        return divElement;
    }
}

// Verify the click is a valid move
// Play the move.
// Determine if the game is over.
// If not, play the computer's move.
// Again determine if the game is over.
// Display message of game status showing who's move is next or who has won.
function processClick(event) {

    // ignore the click if it wasn't in a cell or button 
    if (event.target.id == "" || !isPlayerTurn) {
        return;
    }

    switch (event.target.id) {
        case "start-btn":
            processStartClick();
            return;
        case "undo":
            processUndoClick();
            return;
        case "refresh":
            window.location.reload();
            return;
    }

    // ignore the click if the game is over
    if (isGameOver) {
        return;
    }

    let element = document.getElementById(event.target.id);

    // ignore the click if it wasn't in a cell
    if (!(element.classList.contains("cell"))) {
        return;
    }

    // process the click that's in an empty cell
    if (element.textContent == "") {
        
        if (!isGameStarted) {
            isGameStarted = true;
            isPlayerBoth = false;
            isPlayerBlack = true;
            document.getElementById("play-X").checked = true;
        }

        processMove(element);

        if (!isGameOver && !isPlayerBoth) {
            playComputerMove(); // plays the move and ends via processMove()
        }

    } else {
        console.log(`Clicked cell (${element.id}) already contains '${element.textContent}'`);
    }

    function processStartClick() {

        // set the isPlayer flags
        isPlayerBoth = document.getElementById("play-both").checked;
        isPlayerBlack = isPlayerBoth || document.getElementById("play-X").checked;

        isGameStarted = true;

        if (document.getElementById("play-O").checked) {
            playComputerMove(); // plays the turn and ends via processMove
            return;
        }

        // disable the radio buttons and the Start Button, as the game has started:

        disableRadioButtons(true);

        // make sure the refresh button is enabled (undo will enable once a move has been made)
        document.getElementById("refresh").disabled = false;

        // set the isPlayerBoth flag
        isPlayerBoth = document.getElementById("play-both").checked;
        isPlayerBlack = isPlayerBoth || document.getElementById("play-X").checked;

        // wait for the player to take their turn, whether they are X or both.
        displayNextTurn(false);
        return;
    }

    function processUndoClick() {
        undoMove();

        if (!isPlayerBoth) { 
            // Need to undo two moves, the computer's and the player's
            // but if the player is black and the board board was full only the one move
            // needs to be undone...
            if (!isPlayerBlack ||
                (isPlayerBlack && (!isBlackTurn(gameBoard)))) {
                undoMove();
            }
        }

        function undoMove() {

            isGameOver = false;

            if (!moveArray.length) {
                displayOutput("There are no moves to undo!");
                return;
            }
    
            var [row, col] = moveArray.pop();
    
            document.getElementById(`cell-${row}-${col}`).textContent = "";
            gameBoard[row][col] = 0;

            if (!moveArray.length) { // no more moves to undo so disable the button
                disableRadioButtons(false);
            
                // make sure the undo and refresh buttons are enabled
                document.getElementById("undo").disabled = true;
                document.getElementById("refresh").disabled = true;
            }

            displayNextTurn(false);    
        }
    }
}

function disableRadioButtons(isDisable) {
    document.getElementById("play-X").disabled = isDisable;
    document.getElementById("play-O").disabled = isDisable;
    document.getElementById("play-both").disabled = isDisable;
    document.getElementById("start-btn").disabled = isDisable;
    document.getElementById("play-status").textContent = ((isDisable) ? "I'm playing: " : "I'll play");
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
    row = element.id[5]; // 'cell-R-C'
    col = element.id[7];

    moveArray.push([row,col]);
    gameBoard[row][col] = element.textContent;

    // disable the radio buttons and the Start Button, as a move has been made:
    disableRadioButtons(true);

    // make sure the undo and refresh buttons are enabled
    document.getElementById("undo").disabled = false;
    document.getElementById("refresh").disabled = false;

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
    document.getElementById("output-msg").textContent = text;
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
        
        let newBoard = copyBoard(myBoard);

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

            let newBoard = copyBoard(myBoard);

            let myResults = [];

            for(let row=0; row<3; row++) {
                let colArray = [];
                for(let col=0; col<3; col++) {
                    if (myBoard[row][col] === 0) {
                        // // create a copy of the board
                        // var newBoard = copyBoard(myBoard);
    
                        // now add my move to it
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

    function copyBoard(myBoard) {
        let rowArray = [];
        let row;
        let col;
        
        for (row=0; row<3; row++) {
            var colArray = [];
            for (col=0; col<3; col++) {
                colArray.push(myBoard[row][col]);
            }
            rowArray.push(colArray);
        }
        return rowArray;
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