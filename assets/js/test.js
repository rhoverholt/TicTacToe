document.getElementById("start-btn").addEventListener("click", () => {
  console.log(document.querySelector('input[name="play-side"]:checked').value);
});

let winningCombinations = [];

// vertical options:
winningCombinations.push(
  ...[0, 1, 2].map((col) => [
    [0, col],
    [1, col],
    [2, col],
  ])
);

//horizontal
winningCombinations.push(
  ...[0, 1, 2].map((row) => [
    [row, 0],
    [row, 1],
    [row, 2],
  ])
);

// diagonal
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
);

console.log(winningCombinations);
