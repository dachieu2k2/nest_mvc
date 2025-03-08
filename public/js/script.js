// 'Idle' || 'Moving'
const gameState = "Idle";

// Config
const type = "small"; // small | normal
const smallSwaps = 3;
const cols = 9;
const rows = 9;
let board = Array.from({ length: rows }, () => Array(cols).fill(0));
let previewBalls = [];
const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
let selectedBall = null;
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

const randomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};

const spawnBallsInit = (numberSwaps) => {
  // check vacant positions
  let emptySpace = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const previewBall = previewBalls.find(
        (val) => val.row === i && val.col === j
      );
      // previewBall is not a vacant position.
      if (board[i][j] === 0 && !previewBall) {
        emptySpace = [...emptySpace, { row: i, col: j }];
      }
    }
  }

  // Check preview balls and change it to normal
  for (let i = 0; i < previewBalls.length; i++) {
    // check position was moved by another ball?
    if (board[previewBalls[i].row][previewBalls[i].col].color) {
      // spawn new position
      let index = Math.floor(Math.random() * emptySpace.length);

      let position = emptySpace[index];
      emptySpace = emptySpace.filter((_, i) => i !== index);

      board[position.row][position.col] = {
        type: "normal",
        color: randomColor(),
      };
    } else {
      board[previewBalls[i].row][previewBalls[i].col] = {
        type: "normal",
        color: previewBalls[i].color,
      };
    }
  }
  previewBalls.length > 0 && checkWin();
  previewBalls = [];

  const previewBallsNumber = numberSwaps - 3;

  if (emptySpace.length < 3) {
    alert("you lose!!!");
    resetBoard();
    spawnBallsInit(16);
    createBoardUI();

    return;
  }

  // spawn points
  for (let k = 0; k < previewBallsNumber; k++) {
    let index = Math.floor(Math.random() * emptySpace.length);

    let position = emptySpace[index];
    emptySpace = emptySpace.filter((_, i) => i !== index);

    board[position.row][position.col] = {
      type: "normal",
      color: randomColor(),
    };
  }
  // spawn preview points
  for (let k = 0; k < 3; k++) {
    let index = Math.floor(Math.random() * emptySpace.length);
    let position = emptySpace[index];
    emptySpace = emptySpace.filter((_, i) => i !== index);
    previewBalls = [
      ...previewBalls,
      {
        row: position.row,
        col: position.col,
        type: "small",
        color: randomColor(),
      },
    ];
  }
};

const heuristic = (a, b) => {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const aStar = (start, end) => {
  // console.log(start, end);

  const hx = heuristic(start, end);
  const gx = 0;
  const fx = gx + hx;
  const parent = null;
  let openList = [{ start, gx, fx, hx, parent }];

  const closedSet = new Set();

  while (openList.length > 0) {
    openList = openList.sort((a, b) => a.fx - b.fx);

    let [current, ...rest] = openList; // choose fx min
    openList = rest;

    const key = `${current.start.row},${current.start.col}`;

    // transfer to closedSet list
    closedSet.add(key);

    // if node is destination, end loop
    if (current.start.row === end.row && current.start.col === end.col) {
      console.log("Founded");

      let path = [];
      while (current) {
        path.push(current.start);
        current = current.parent;
      }
      // path.map((val) => {
      //   board[val.row][val.col] = {
      //     type: "normal",
      //     color: "gray",
      //   };
      // });
      // createBoardUI();

      return path.reverse();

      // return openList;
    }

    // if not, calculate gx, fx for neighbors
    for (let { x, y } of directions) {
      // neighbor
      const neighbor = {
        row: current.start.row + x,
        col: current.start.col + y,
      };
      //   console.log(current.start, x, y);

      const neighborKey = `${neighbor.row},${neighbor.col}`;

      // console.log(neighborKey);
      if (closedSet.has(neighborKey)) {
        continue; // Skip
      }

      if (
        neighbor.row >= 0 &&
        neighbor.row < rows &&
        neighbor.col >= 0 &&
        neighbor.col < cols &&
        board[neighbor.row][neighbor.col] === 0 &&
        !closedSet.has(neighborKey)
      ) {
        const gx = current.gx + 1;
        const hx = heuristic(neighbor, end);
        const fx = gx + hx;
        const parent = current;
        if (fx < current.fx) {
          //   openList.push({ start: neighbor, fx, gx, hx });
          openList = [...openList, { start: neighbor, fx, gx, hx, parent }];

          // board[neighbor.row][neighbor.col] = {
          //   type: "normal",
          //   color: "cyan",
          // };
          // await sleep(100);
          // createBoardUI();
        }

        const found = openList.find(
          (val) => neighborKey === `${val.start.row},${val.start.col}`
        );
        if (!found) {
          openList = [...openList, { start: neighbor, fx, gx, hx, parent }];
          // board[neighbor.row][neighbor.col] = {
          //   type: "normal",
          //   color: "black",
          // };
          // await sleep(100);
          // createBoardUI();
        }
      }
    }
  }
  return false;
};

const cellClick = async (event) => {
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (selectedBall && board[row][col] === 0) {
    const rowStart = parseInt(selectedBall.dataset.row);
    const colStart = parseInt(selectedBall.dataset.col);
    const color = selectedBall.dataset.color;
    const type = selectedBall.dataset.type;
    // console.log(selectedBall);

    const start = { row: rowStart, col: colStart };
    const end = { row, col };
    // pathfinding
    const path = aStar(start, end);
    // console.log("pathfinding", path);
    if (path.length >= 1) {
      // moving
      let prev = { row: rowStart, col: colStart };
      for (let { row, col } of path) {
        // console.log("pathfinding", row, col);
        board[prev.row][prev.col] = 0;
        board[row][col] = {
          color: color,
          type: type,
        };
        prev = { row, col };
        await sleep(10);
        createBoardUI();
      }
      // Check win
      // checkWin();

      // Swap new Ball
      spawnBallsInit(3);
      createBoardUI();
    }
  }

  if (selectedBall) {
    selectedBall.classList.remove("selected");
  }

  if (
    event.target.children.length > 0 &&
    event.target.children[0].className.includes("ball")
  ) {
    selectedBall = event.target.children[0];
  } else if (
    event.target.tagName === "DIV" &&
    event.target.className.includes("ball")
  ) {
    selectedBall = event.target;
  } else {
    selectedBall = null;
  }
  // console.log(event);

  if (selectedBall) {
    selectedBall.classList.add("selected");
  }
  //   let selectedCell = null;
};

const createBoardUI = () => {
  const table = document.getElementById("gameTable");
  table.innerHTML = "";
  for (let i = 0; i < rows; i++) {
    let tr = document.createElement("tr");
    for (let j = 0; j < cols; j++) {
      let td = document.createElement("td");
      td.dataset.row = i;
      td.dataset.col = j;
      td.dataset.color = board[i][j].color;
      td.dataset.type = board[i][j].type;
      if (board[i][j] !== 0) {
        let ball = document.createElement("div");
        ball.classList.add("ball");
        board[i][j].type === "small" && ball.classList.add("small");

        ball.style.backgroundColor = board[i][j].color;
        ball.dataset.row = i;
        ball.dataset.col = j;
        ball.dataset.color = board[i][j].color;
        ball.dataset.type = board[i][j].type;
        td.appendChild(ball);
      }
      // add previewball
      const previewBall = previewBalls.find(
        (val) => val.row === i && val.col === j
      );
      if (previewBall) {
        let ball = document.createElement("div");
        ball.classList.add("small");
        ball.style.backgroundColor = previewBall.color;
        ball.dataset.color = previewBall.color;
        ball.dataset.type = previewBall.type;
        ball.dataset.row = i;
        ball.dataset.col = j;
        td.appendChild(ball);
      }

      td.addEventListener("click", cellClick);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
};

const checkWin = () => {
  const countBalls = (row, col, x, y, color) => {
    let positions = [];
    while (
      row >= 0 &&
      row < rows &&
      col >= 0 &&
      col < cols &&
      board[row][col].color === color
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
          const { positions: pos1 } = countBalls(i, j, x, y, board[i][j].color);

          // reverse
          const { positions: pos2 } = countBalls(
            i - x,
            j - y,
            -x,
            -y,
            board[i][j].color
          );
          const positions = [...pos1, ...pos2];

          if (positions.length >= 5) {
            for (let { row, col } of positions) {
              board[row][col] = 0;
            }
            return;
          }
        }
      }
    }
  }
};

const countBallsHelper = (row, col, x, y, color, boardHelper) => {
  let positions = [];
  while (
    row >= 0 &&
    row < rows &&
    col >= 0 &&
    col < cols &&
    boardHelper[row][col] !== 0 &&
    boardHelper[row][col].color === color
  ) {
    positions = [...positions, { row, col }];
    row += x;
    col += y;
  }
  return { positions };
};
const aStarHelper = (start, color) => {
  const fx = 0;
  let openList = [{ start, fx }];

  const closedSet = new Set();

  // find all position can visit
  while (openList.length > 0) {
    // console.log(openList);

    let [current, ...rest] = openList;
    openList = rest;

    const key = `${current.start.row},${current.start.col}`;

    if (closedSet.has(key)) {
      continue;
    }

    // transfer to closedSet list
    closedSet.add(key);

    // find neighbor
    for (let { x, y } of directions) {
      const neighbor = {
        row: current.start.row + x,
        col: current.start.col + y,
      };

      if (
        neighbor.row < 0 ||
        neighbor.row >= rows ||
        neighbor.col < 0 ||
        neighbor.col >= cols ||
        board[neighbor.row][neighbor.col] !== 0
      ) {
        // console.log(neighbor);

        continue; // Skip if it out size of matrix and exist
      }

      openList = [...openList, { start: neighbor, fx: 0 }];

      // console.log(closedSet);
    }
  }
  const newData = Array.from(closedSet).map((point) =>
    point.split(",").map(Number)
  );
  newData.forEach((val) => {
    const [row, col] = val;
    // console.log(row, col);

    // check win get fx priority points
    let maxPoints = -Infinity;
    for (let { x, y } of directionsWin) {
      // Cannot move myself
      if (start.row === row && start.col === col) {
        continue;
      }
      let fakeBoardHelper = (() =>
        board.map((row) =>
          row.map((cell) => (typeof cell === "object" ? { ...cell } : cell))
        ))();
      // simulate moving
      fakeBoardHelper[start.row][start.col] = 0;
      fakeBoardHelper[row][row] = {
        type: "normal",
        color: color,
      };

      const { positions: pos1 } = countBallsHelper(
        row,
        col,
        x,
        y,
        color,
        fakeBoardHelper
      );
      // reverse
      const { positions: pos2 } = countBallsHelper(
        row - x,
        col - y,
        -x,
        -y,
        color,
        fakeBoardHelper
      );
      const positions = [...pos1, ...pos2];
      // console.log(row, col, positions, pos1, pos2);

      if (positions.length > maxPoints) {
        maxPoints = positions.length;
      }
      delete fakeBoardHelper;
    }
    // find 5 points
    openList = [
      ...openList,
      {
        start: { row, col },
        fx: maxPoints, // fx fireeeee!!!!!!!!!
      },
    ];
  });
  openList = openList.sort((a, b) => b.fx - a.fx);

  return openList[0];
};

const helper = () => {
  // the best move
  let arrBestMovePoints = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (board[i][j] !== 0) {
        // Ball available
        const bestMove = aStarHelper({ row: i, col: j }, board[i][j].color);
        arrBestMovePoints = [
          ...arrBestMovePoints,
          { ...bestMove, start: { row: i, col: j }, end: bestMove.start },
        ];
      }
    }
  }
  // console.log(arrBestMovePoints.sort((a, b) => b.fx - a.fx));

  return arrBestMovePoints.sort((a, b) => b.fx - a.fx)[0];
};

const turnOnHelper = (start, end) => {
  const startTd = document.querySelector(
    `td[data-row="${start.row}"][data-col="${start.col}"]`
  );

  const endTd = document.querySelector(
    `td[data-row="${end.row}"][data-col="${end.col}"]`
  );
  startTd.classList.add("helper");
  endTd.classList.add("helper");
};

const buttonHelper = document.getElementById("buttonHelp");
buttonHelper.addEventListener("click", () => {
  const data = helper();

  if (data) {
    turnOnHelper(data?.start, data?.end);
  }
});

const init = () => {
  spawnBallsInit(16);
  // console.log(board);
  // console.log(aStar({ col: 0, row: 0 }, { col: 8, row: 8 }));
  // aStarHelper({ row: 1, col: 1 }, "yellow");
  // createBoardUI();
  createBoardUI();

  // turnOnHelper({ row: 1, col: 3 }, { row: 5, col: 6 });
  // console.log(board);
};

init();
