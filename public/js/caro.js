// Config
const cols = 16;
const rows = 16;
let board = Array.from({ length: rows }, () => Array(cols).fill(0));
const confetti = document.querySelector('.confetti');
const winnerName = document.querySelector('.title');
const turnX = document.querySelector('.turnX');
const turnO = document.querySelector('.turnO');

let currentPlayer = 'X'; // X or O
const directions = [
  { x: 0, y: 1 }, // top
  { x: 0, y: -1 }, // down
  { x: 1, y: 0 }, // right
  { x: -1, y: 0 }, //left
];

const directionsWin = [
  { x: 1, y: 0 }, // right -> left
  { x: 0, y: 1 }, // up -> down
  { x: 1, y: 1 }, // top-right -> bottom-left
  { x: 1, y: -1 }, // top-left -> bottom-right
];

const resetBoard = () => {
  board = Array.from({ length: rows }, () => Array(cols).fill(0));
};

const isDraw = () => {
  return board.every((row) => row.every((cell) => cell !== 0));
};

const cellClick = async (event) => {
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (board[row][col] === 0) {
    board[row][col] = currentPlayer;
    createBoardUI();
    const data = checkWin();

    if (data?.winner) {
      data.pos?.map((val) => {
        const tdWinner = document.querySelector(
          `td[data-row="${val.row}"][data-col="${val.col}"]`,
        );

        tdWinner.classList.add('winning');
      });

      confetti.classList.remove('hidden');

      winnerName.innerHTML = data.winner + ' win!!!!';
    }
    if (isDraw()) {
      alert('drawwwww');
    }
    if (currentPlayer === 'X') {
      currentPlayer = 'O';
      turnO.classList.add('btn-success');
      turnX.classList.remove('btn-danger');
    } else {
      currentPlayer = 'X';
      turnX.classList.add('btn-danger');
      turnO.classList.remove('btn-success');
    }
  }
};

const createBoardUI = () => {
  const table = document.getElementById('caro_gameTable');
  table.innerHTML = '';
  for (let i = 0; i < rows; i++) {
    let tr = document.createElement('tr');
    for (let j = 0; j < cols; j++) {
      let td = document.createElement('td');
      td.dataset.row = i;
      td.dataset.col = j;
      if (board[i][j] !== 0) {
        let elemt = document.createElement('div');
        elemt.innerHTML = board[i][j] || '';
        elemt.classList.add(board[i][j]?.toLowerCase() || '');
        td.appendChild(elemt);
      }
      td.addEventListener('click', cellClick);
      // td.addEventListener("mouseenter", cellEnter);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
};

const checkWin = () => {
  const countBalls = (row, col, x, y, value) => {
    let positions = [];
    while (
      row >= 0 &&
      row < rows &&
      col >= 0 &&
      col < cols &&
      board[row][col] === value
    ) {
      positions = [...positions, { row, col }];
      row += x;
      col += y;
    }
    return { positions };
  };

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (board[i][j] !== 0) {
        for (let { x, y } of directionsWin) {
          const { positions: pos1 } = countBalls(i, j, x, y, board[i][j]);

          // reverse
          const { positions: pos2 } = countBalls(
            i - x,
            j - y,
            -x,
            -y,
            board[i][j],
          );
          const positions = [...pos1, ...pos2];

          if (positions.length >= 5) {
            // Winner

            return { winner: board[i][j], pos: positions };
          }
        }
      }
    }
  }
  return null;
};

confetti.addEventListener('click', () => {
  confetti.classList.add('hidden');

  resetBoard();
  createBoardUI();
});

const init = () => {
  turnX.classList.add('btn-danger');
  createBoardUI();
};

init();
