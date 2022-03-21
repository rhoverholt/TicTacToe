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

[
  ["start-btn", processStartClick],
  ["undo", processUndoClick],
  ["refresh", () => window.location.reload()],
].forEach(
  ([id, fun]) => document.getElementById(id).addEventListener("click", fun) // Setup event listeners for each of the listed buttons.
);

createGameTable(); // create the HTML to display the game and the cell event listeners

displayOutput("Begin by choosing sides or simply making a move");

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
    console.log(
      `Clicked cell (${element.id}) already contains '${element.textContent}'`
    );
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
  const gameType = document.querySelector(
    'input[name="play-side"]:checked'
  ).value;

  if (gameType === oM && !wasButtonClicked) return false; // the game has not been started!

  isPlayerX = !(gameType === oM);
  isPlayerBoth = gameType === "Both";
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

  // As long as X hadn't just played in the 9th cell, and thus it remains X's turn after just one undo...
  if (!(isPlayerX && isXsTurn(gameBoard))) undoMove();

  function undoMove() {
    if (!moveStack.length) {
      // no more moves to undo so start over
      window.location.reload();
      return; // Just to make it obvious.
    }

    isGameOver = false;

    let [row, col] = moveStack.pop();

    if (!moveStack.length) {
      // no more moves to undo so start over
      window.location.reload();
      return; // Just to make it obvious.
    }

    document.getElementById(`cell-${row}-${col}`).textContent = "";
    gameBoard[row][col] = 0;

    displayNextTurn(false);
  }
}

function disableHeaderInput(isDisable) {
  headerInputEls.forEach((btn) => (btn.disabled = isDisable));
  playStatusEl.textContent = isDisable ? "I'm playing: " : "I'll play";
}

// Place a move in the given element
// Give a message on screen showing who won or who's turn is next.
function processMove(element) {
  if (isXsTurn(gameBoard)) {
    element.textContent = "X";
  } else {
    element.textContent = "O";
  }

  // update the gameBoard
  let row = element.id[5]; // 'cell-R-C'
  let col = element.id[7];

  moveStack.push([row, col]);
  gameBoard[row][col] = element.textContent;

  displayNextTurn(getGameStatus(gameBoard));
  return false; // game is not yet over
}

function displayNextTurn(gameStatus) {
  // if ([false, "T", "X", "O"].indexOf(gameStatus) === -1) {
  //   // if gameStatus is an invalid value...something other than null, T, X, or O
  //   console.log("gameStatus ERROR!");
  //   return;
  // }

  if (!gameStatus) {
    // the game is not yet over
    displayOutput(`It's now ${isXsTurn(gameBoard) ? "X" : "O"}'s turn.`);
  } else if (gameStatus === "T") {
    displayOutput("Game Over - It's a tie!");
  } else {
    // gameStatus must be X or O
    displayOutput(`Game Over - ${gameStatus} Wins!`);
  }

  isGameOver = gameStatus ? true : false;
}

function displayOutput(text) {
  outputMsgEl.textContent = text;

  isGameOver = gameStatus ? true : false;
}

function displayOutput(text) {
  document.getElementById("output-msg").textContent = text;
}

// Returns X, O, T, or False based on winner or not over
function getGameStatus(board) {
  // use gameBoard to determine the current status

  // check for a vertical winner
  for (let col = 0; col < 3; col++) {
    if (!(board[0][col] === 0)) {
      // no possible winner if it's empty!
      if (board[0][col] === board[1][col] && board[0][col] === board[2][col]) {
        return board[0][col]; // they won!
      }
    }
  }

  // check for a horizontal winner
  for (let row = 0; row < 3; row++) {
    if (!(board[row][0] === 0)) {
      // no possible winner if it's empty!
      if (board[row][0] === board[row][1] && board[row][0] === board[row][2]) {
        return board[row][0]; // they won!
      }
    }
  }

  // check for diagonal winners
  if (!(board[1][1] === 0)) {
    // if the middle is empty, no diagonal win is possible
    if (
      (board[1][1] === board[0][0] && board[1][1] === board[2][2]) ||
      // above checks the first diagonal
      (board[1][1] === board[0][2] && board[1][1] === board[2][0])
    ) {
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

    // create a result array for the results of all possible moves
    let myResults = [];

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
    for (row = 0; row < 3; row++) {
      for (col = 0; col < 3; col++) {
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
