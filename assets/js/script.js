let isGameOver = false,
    isGameStarted = false;
let gameBoard = [[0,0,0],[0,0,0],[0,0,0]]; // 0 = empty, 'X', 'O'
let isPlayerBoth = false; // determine if the computer plays a move or not
let isPlayerX = true;
let moveArray = []; // maintain a list of moves to allow undos
let outputMsgEl = document.getElementById("output-msg");
let WSIP = 0; let SIDE = 0;

createGameTable();

displayOutput("Begin by choosing sides or simply making a move");

document.addEventListener("click", processClick);

function createGameTable() {
    const gameTable = document.getElementById("game-table");

    for (row=0; row < 3; row++) {
        createRow(gameTable, row);
        if (row < 2) {
            createRowDivider(gameTable);
        }
    }

    function createRow(element, row) {
        
        // create the row element itself
        let rowElement = document.createElement("div");
        rowElement.classList.add("row");
        rowElement.id = `row-${row}`;

        // add the cell elements to the row
        for (cell=0; cell <=4; cell++) {
            if (cell === 1 || cell === 3) {
                createCellDivider(rowElement);
            } else {
                let column = cell/2;
                createCell(rowElement, row, column);
            }
        }

        // append the row to the initial element
        element.append(rowElement);

        function createCell(element, row, col) {

            // create the cell itself
            let cellElement = document.createElement("div");
            cellElement.id = `cell-${row}-${col}`;
            cellElement.classList.add("cell");

            switch (col) {
                case 0:
                    cellElement.classList.add("left-cell");
                    break;
                case 1:
                    cellElement.classList.add("left-cell");
                    break;
                case 2:
                    cellElement.classList.add("left-cell");
                    break;
                default:
                    console.log("col error!");
            }

            // append the cell to the element
            element.append(cellElement);
        }

        function createCellDivider(element) {
            let divElement = document.createElement("div");
            divElement.classList.add("divider","col-divider");
            element.append(divElement);
        }
    }

    function createRowDivider(element) {
        let divElement = document.createElement("div");
        divElement.classList.add("divider","row-divider");

        element.append(divElement);
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
    if (event.target.id == "") {
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
        document.getElementById("play-X").disabled = true;
        document.getElementById("play-O").disabled = true;
        document.getElementById("play-both").disabled = true;
        document.getElementById("start-btn").disabled = true;
        document.getElementById("play-status").textContent = "I'm playing: ";

        // make sure the refresh button is enabled (undo will enable once a move has been made)
        document.getElementById("refresh").disabled = false;

        // set the isPlayerBoth flag
        isPlayerBoth = document.getElementById("play-both").checked;
        isPlayerBlack = isPlayerBoth || document.getElementById("play-X").checked;

        console.log(isPlayerBlack);

        // wait for the player to take their turn, whether they are X or both.
        displayNextTurn();
        return;
    }

    function processUndoClick() {
        undoMove();

        console.log(`Both: ${isPlayerBoth}, Black: ${isPlayerBlack}`);

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
                document.getElementById("play-X").disabled = false;
                document.getElementById("play-O").disabled = false;
                document.getElementById("play-both").disabled = false;
                document.getElementById("start-btn").disabled = false;
                document.getElementById("play-status").textContent = "I'll play: ";
            
                // make sure the undo and refresh buttons are enabled
                document.getElementById("undo").disabled = true;
                document.getElementById("refresh").disabled = true;
            }

            displayNextTurn();    
        }
    }
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
    document.getElementById("play-X").disabled = true;
    document.getElementById("play-O").disabled = true;
    document.getElementById("play-both").disabled = true;
    document.getElementById("start-btn").disabled = true;
    document.getElementById("play-status").textContent = "I'm playing: ";

    // make sure the undo and refresh buttons are enabled
    document.getElementById("undo").disabled = false;
    document.getElementById("refresh").disabled = false;

    let result = getGameStatus(gameBoard);

    if (result === "X" || result === "O") {
        displayWinner(result);
        isGameOver = true;
        return result;
    }

    if (result === "T") {
        displayTie();
        isGameOver = true;
        return result;
    }

    displayNextTurn();
    return false; // game is not yet over
}

function displayNextTurn() {

    let nextTurn = ((isBlackTurn(gameBoard)) ? 'X' : 'O');

    displayOutput(`It's now ${nextTurn}'s turn.`);
}


function displayWinner(winner){
    displayOutput(`Game Over - ${winner} Wins!`);
}

function displayTie() {
    displayOutput("Game Over - It's a tie!");
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
        return new Promise((resolve) => setTimeout(resolve, time));
      }
      
    sleep(500).then(() => {
          // Do something after the sleep!

        let bestMove = whereShouldIPlay(gameBoard); // returns [row, col, X/O/T]

        processMove(document.getElementById(`cell-${bestMove[0]}-${bestMove[1]}`));
    })
        
        // returns the row, col. X/O/T where we want to move
        // assumes that we need to make a move...the game is not yet over!
    function whereShouldIPlay(myBoard) {
        
        let newBoard = copyBoard(myBoard);

        let whoseTurn = (isBlackTurn(myBoard) ? 'X' : 'O');
        let oppsTurn = (whoseTurn === 'X') ? 'O' : 'X';

        // create a result array for the results of all possible moves
        let myResults = [];

        // check all possible moves
        for (let row = 0; row < 3; row++) {
            let colArray = [];
            for (let col = 0; col < 3; col++) {
                if (myBoard[row][col] === 0) {
                    // // create a copy of the board
                    // var newBoard = copyBoard(myBoard);

                    // now add my move to it
                    newBoard[row][col] = whoseTurn;
                    let playResult = getGameStatus(newBoard);

                    if (!playResult) { // No winner is yet found 
                        // recursively determine the best result by playing that move
                        playResult = whoWins(newBoard); 
                    }
                    colArray.push(playResult);
                    newBoard[row][col] = 0; // reset to the original board
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

    // This is easy mode -- it randomly guesses whether a play would result in W, O or T.
    // input - a board situation
    // output - a list of the results from playing in each cell
    function HIDEprojectBoardResults(myBoard) {

        let results = [];

        // check all possible moves
        for (row = 0; row < 3; row++) {
            results.push(myBoard[row]);
            for (col = 0; col < 3; col++) {
                if (results[row][col] === 0) {
                    switch (Math.floor(Math.random() * 3)) {
                        case 0:
                            results[row][col] = 'X';
                            break;
                        case 1:
                            results[row][col] = 'O';
                            break;
                        default:
                            results[row][col] = 'T';
                            break;
                    }
                } else {
                    results[row][col] = 0; // cannot play here, as it was already played
                }
            }
        }
        return results;
    }

    // This is hard mode -- it cannot be beaten!
    // input - a board situation
    // output - a list of the results from playing in each cell
    function projectBoardResults(myBoard) {

        // // First, check to see if the game is over, and if so, return the result
        // let result = getGameStatus(myBoard);
        
        // if (result !== false) {
        //     return result; // no need to look further, the game is over
        // }

        let whoseTurn = (isBlackTurn(myBoard) ? 'X' : 'O');
        let oppsTurn = (whoseTurn === 'X') ? 'O' : 'X';

        // create a result array for the results of all possible moves
        let myResults = [];

        // check all possible moves
        for (row = 0; row < 3; row++) {
            let colArray = [];
            for (col = 0; col < 3; col++) {

//                colArray.push(myBoard[row][col]);

                // if I can move here, try it out and see what happens
                if (myBoard[row][col] === 0) {
                    // create a copy of the board

                    var newBoard = copyBoard(myBoard);

                    // now add my move to it
                    newBoard[row][col] = whoseTurn;
                    let playResult = getGameStatus(newBoard);

                    if (!playResult) { // No winner is yet found

                        // recursively determine the best result by playing that move
                        playResult = whoWins(newBoard); 
                    }

                    colArray.push(playResult[2]);
                } else { // move not allowed
                    colArray.push(0);
                }

                myResults.push(colArray);
            }
        }

        return myResults;
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