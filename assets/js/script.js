const emptyM = 0,
  xM = "X",
  oM = "O"; // These are the possible cell contents, empty, X or O.

let isGameStarted = false,
  isGameOver = false,
  isPlayerBoth = false,
  isPlayerX = true,
  isPlayerTurn = true,
  gameBoard = [
    [emptyM, emptyM, emptyM],
    [emptyM, emptyM, emptyM],
    [emptyM, emptyM, emptyM],
  ],
  moveStack = []; // maintain a list of moves so they can be undone as needed

const gameTable = document.getElementById("game-table"),
  playXEl = document.getElementById("play-X"),
  playOEl = document.getElementById("play-O"),
  playBothEl = document.getElementById("play-both"),
  startBtnEl = document.getElementById("start-btn"),
  undoBtnEl = document.getElementById("undo"),
  refreshBtnEl = document.getElementById("refresh"),
  playStatusEl = document.getElementById("play-status"),
  outputMsgEl = document.getElementById("output-msg");

const headerInputEls = [playXEl, playOEl, playBothEl, startBtnEl];

const winningCombinations = [0, 1, 2].map((col) => [
  [0, col],
  [1, col],
  [2, col],
]); // all vertical combinations
winningCombinations.push(
  ...[0, 1, 2].map((row) => [
    [row, 0],
    [row, 1],
    [row, 2],
  ])
); // add horizontal combinations
winningCombinations.push(
  [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  [
    [0, 2],
    [1, 1],
    [2, 0],
  ]
); // add the diagonal combinations

[
  ["start-btn", processStartClick],
  ["undo", processUndoClick],
  ["refresh", () => window.location.reload()],
].forEach(
  ([id, fun]) => document.getElementById(id).addEventListener("click", fun) // Setup event listeners for each of the listed buttons.
);

createGameTable(); // create the HTML to display the game and the cell event listeners

outputMsgEl.textContent = "Begin by choosing sides or simply making a move";

function createGameTable() {
  for (let row = 0; row < 3; row++) {
    let rowEl = appendDiv(
      gameTable,
      `row-${row}`,
      row === 1 ? ["row", "mid-row"] : ["row"] // middle rows get borders so also need the 'mid-row' class.
    ); // add the row elements to the DOM

    for (let col = 0; col < 3; col++) {
      appendDiv(
        rowEl,
        `cell-${row}-${col}`,
        col === 1 ? ["cell", "mid-col"] : ["cell"] // middle columns get borders so also need the 'mid-col' class.
      ).addEventListener("click", processCellClick); // add an event listener to the returned cell element
    }
  }

  function appendDiv(parent, id, classes = []) {
    const child = document.createElement("div");
    child.id = id;
    classes.forEach((item) => child.classList.add(item));
    return parent.appendChild(child); // adds the new div to the DOM
  }

  function processCellClick() {
    if (!isPlayerTurn || isGameOver || this.textContent) return; // ignore illegal clicks

    if (!isGameStarted && !startNewGame(false)) return; // try to start a new game as needed, return if invalid

    processMove(this); // Play the move for the click!

    if (!isGameOver && !isPlayerBoth) {
      playComputerMove(); // plays the move and ends via processMove()
    }
  }
}

function startNewGame(wasButtonClicked) {
  const gameType = document.querySelector(
    'input[name="play-side"]:checked'
  ).value;

  if (gameType === oM && !wasButtonClicked) return false; // the game has not been started, O must wait on X to go first

  isPlayerX = !(gameType === oM); // set to true when X or Both are clicked
  isPlayerBoth = gameType === "Both";
  isGameStarted = true;

  disableHeaderInput(true); // disable the Header input, as a move has been made:

  undoBtnEl.disabled = false; // enable the undo and refresh buttons
  refreshBtnEl.disabled = false;

  return true; // the game has been started!
}

function processStartClick() {
  startNewGame(true);

  if (playOEl.checked) return playComputerMove(); // plays the turn and ends via processMove

  displayNextTurn(false); // wait for the player to take their turn, whether they are X or both.
}

function processUndoClick() {
  undoMove(); // this is usually the computer's move that is undone, but when it was the players move it's the only one to undo.

  if (
    !isPlayerBoth || // no second move to undo when the player plays both sides!
    !(isPlayerX && isXsTurn(gameBoard)) // this is necessary to prevent a second undo when X played in the last space (so no computer move) and then undoes that move
  )
    undoMove(); // now undo the player's move as the previous was the computer's.

  function undoMove() {
    if (moveStack.length < 2) return window.location.reload(); // with 0 or only 1 move to undo, just restart the game.

    isGameOver = false;

    let [row, col] = moveStack.pop();

    document.getElementById(`cell-${row}-${col}`).textContent = ""; // undo the move on the screen
    gameBoard[row][col] = 0; // undo the move in the virtual game board

    displayNextTurn(false);
  }
}

function disableHeaderInput(isDisable) {
  headerInputEls.forEach((btn) => (btn.disabled = isDisable));
  playStatusEl.textContent = isDisable ? "I'm playing: " : "I'll play";
}

function processMove(element) {
  element.textContent = isXsTurn(gameBoard) ? "X" : "O";

  let row = element.id[5]; // 'cell-R-C' R is 6th, C is 8th so 5, 7
  let col = element.id[7]; // this array notation is usable on strings.

  moveStack.push([row, col]); // keep up with moves so we can undo as needed
  gameBoard[row][col] = element.textContent; // make the move in our virtual game board

  displayNextTurn(getGameStatus(gameBoard)); // display board status
}

function displayNextTurn(gameStatus) {
  outputMsgEl.textContent = !gameStatus
    ? `It's now ${isXsTurn(gameBoard) ? "X" : "O"}'s turn.` // display next turn when game's not over
    : gameStatus === "T"
    ? "Game Over - It's a tie!" // display a tie as needed
    : `Game Over - ${gameStatus} Wins!`; // display the winner when the game is over and it's not a tie.

  isGameOver = gameStatus !== false;
}

// Returns X, O, T, or False based on winner or not over
function getGameStatus(board) {
  // if a winning combination is found, return which side won.
  let resultsArray;
  for (combo of winningCombinations) {
    resultsArray = combo.map(([row, col]) => board[row][col]);
    if (resultsArray.every((val) => val && val === resultsArray[0]))
      return resultsArray[0];
  }

  // if all moves have been made it's a tie, otherwise return false as not over
  for (row of board) {
    for (cell of row) {
      if (!cell) {
        return false; // at least one move remains, it's not a tie yet.
      }
    }
  }
  return "T"; // this is the only option left!
}

function playComputerMove() {
  function sleep(time) {
    isPlayerTurn = false;
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  // It feels annoying for the computer to move immediately!
  sleep(500).then(() => {
    // Do something after the sleep!

    let bestMove = whereShouldIPlay(gameBoard); // returns [row, col, X/O/T]
    isPlayerTurn = true;
    processMove(document.getElementById(`cell-${bestMove[0]}-${bestMove[1]}`));
  });

  // returns the row, col. X/O/T where we want to move
  // assumes that we need to make a move...the game is not yet over!
  function whereShouldIPlay(myBoard) {
    let newBoard = myBoard.map((row) => row.map((cell) => cell)); // make a true copy, not just a new pointer to the same memory.
    // let newBoard = JSON.parse(JSON.stringify(myBoard)); // make a true copy, not just a new pointer to the same memory.

    let whoseTurn = isXsTurn(myBoard) ? xM : oM;

    let myResults = []; // create a result array for the results of all possible moves

    // check all possible moves
    for (let row = 0; row < 3; row++) {
      let colArray = [];
      for (let col = 0; col < 3; col++) {
        if (myBoard[row][col] === emptyM) {
          newBoard[row][col] = whoseTurn; // pretend to go here and see what happens.
          let playResult = getGameStatus(newBoard); // does going here end the game?

          if (!playResult) {
            // No winner is yet found -- it didn't end the game
            playResult = whereShouldIPlay(newBoard)[2]; // recursively pretend to play every possible move to see what happens
          }
          colArray.push(playResult);
          newBoard[row][col] = emptyM; // remove my move from it
        } else {
          // move not allowed
          colArray.push(emptyM);
        }
      }
      myResults.push(colArray);
    }

    return chooseBestResult(myResults, whoseTurn); // [row, col, X/O/T]
  }

  // resultsArray has 3 rows of 3 columns, each being with 0 (already played), X, O, or T
  // where X, O, T is the result from playing there
  // mySide says whether I'm X or O
  // Output: [row, col, X/O/T]
  function chooseBestResult(resultArray, mySide) {
    let winArray = []; // store all the result array moves that resulted in me winning
    let loseArray = []; // store all the result array moves that resulted in me losing
    let tieArray = []; // store all the result array moves that resulted in a tie

    otherSide = mySide === xM ? oM : xM;

    // cycle through all the results and select the best
    for (row in resultArray) {
      for (col in resultArray[row]) {
        switch (resultArray[row][col]) {
          case 0:
            break; // move already played
          case mySide:
            winArray.push([row, col]);
            break;
          case "T":
            tieArray.push([row, col]);
            break;
          default:
            loseArray.push([row, col]);
        }
      }
    }

    return winArray.length > 0
      ? [...randomCell(winArray), mySide] // if there's a winner, return a random winner
      : tieArray.length > 0
      ? [...randomCell(tieArray), "T"] // since no winner, return a random Tie if possible
      : [...randomCell(loseArray), otherSide]; // No other option...return a random loser.

    function randomCell(cells) {
      return cells[Math.floor(Math.random() * cells.length)];
    }
  }
}

function isXsTurn(board) {
  // examine the board to see who's turn it must be

  // count the number of moves played (e.g. where the cell is not empty)
  let moves = board.reduce(
    (prev, col) =>
      prev +
      col.reduce((prevRow, cell) => prevRow + (cell !== emptyM ? 1 : 0), 0),
    0
  );

  return moves % 2 === 0; //return true if 0, 2, 4, 6, 8 moves have been played.
}
