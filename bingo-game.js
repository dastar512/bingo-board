let urlParams = new URLSearchParams(window.location.search);
let seed = urlParams.get('seed')
let allCells = [
  'r1c1', 'r1c2', 'r1c3', 'r1c4', 'r1c5',
  'r2c1', 'r2c2', 'r2c3', 'r2c4', 'r2c5',
  'r3c1', 'r3c2', 'r3c3', 'r3c4', 'r3c5',
  'r4c1', 'r4c2', 'r4c3', 'r4c4', 'r4c5',
  'r5c1', 'r5c2', 'r5c3', 'r5c4', 'r5c5'
];
let diagonal1 = ['r1c1', 'r2c2', 'r3c3', 'r4c4', 'r5c5']
let diagonal2 = ['r5c1', 'r4c2', 'r3c3', 'r2c4', 'r1c5']

if (!seed) {
  seed = generateSeedString();
}

let mySeededRng = new Math.seedrandom('' + seed);

function randomizeBoard() {
  mySeededRng = new Math.seedrandom('' + seed); // this is inconsistent if you pass a number instead of a string

  let itemsOnTheBoard = [];

  for (let row = 1; row <= 5; row++) {
    for (let col = 1; col <= 5; col++) {
      if (row === 3 && col === 3) {
        //free space
        continue;
      }
      let chosen = false
      while (!chosen) {
        let itemNum = getSeededRandomInt(1, bingoItems.length) - 1;
        if (itemsOnTheBoard.indexOf(itemNum) < 0) {
          chosen = true;
          const chosenItem = bingoItems[itemNum]
          itemsOnTheBoard.push(itemNum);
          let cell = document.getElementById("r" + row + "c" + col + "-div");

          let spanElement = document.createElement("span");
          spanElement.innerText = chosenItem;
          cell.replaceChildren(spanElement);
        }
      }
    }
  }

  //set cells as marked if they returned to the same seed in a single session
  if (seed === sessionStorage.getItem('seed')) {
    let selectedArray = JSON.parse(sessionStorage.getItem('selectedCells') || '[]')
    selectedArray.forEach(cellId => toggleCell(cellId, true));
  } else {
    sessionStorage.setItem('seed', seed);
    sessionStorage.removeItem('selectedCells');
  }

  document.getElementById('seed-label').innerText = 'Seed: ' + seed;

}


function checkBingo() {
  let markedCells = document.querySelectorAll('.marked');
  if (markedCells.length < 5) {
    document.querySelectorAll('.bingo').forEach(ele => ele.classList.remove('bingo'));
    return;
  }
  let marked = [];
  let bingoWinners = [];

  markedCells.forEach(c => marked.push(c.id.split('-')[0]));
  //horizontal and vertical checks
  for (let i = 1; i <= 5; i++) {
    let horizontalCheck = marked.filter(id => id.indexOf('r' + i) >= 0);
    if (horizontalCheck.length >= 5) {
      bingoWinners = [...bingoWinners, ...horizontalCheck];
    }
    let verticalCheck = marked.filter(id => id.indexOf('c' + i) >= 0);
    if (verticalCheck.length >= 5) {
      bingoWinners = [...bingoWinners, ...verticalCheck];
    }
  }

  if (diagonal1.every(c => marked.includes(c))) {
    bingoWinners = [...bingoWinners, ...diagonal1];
  }


  if (diagonal2.every(c => marked.includes(c))) {
    bingoWinners = [...bingoWinners, ...diagonal2];
  }

  bingoWinners = [...new Set(bingoWinners)] || [];
  let nonWinners = allCells.filter(c => !bingoWinners.includes(c)) || [];

  document.querySelectorAll('.bingo').forEach(ele => {
    if (nonWinners.indexOf(ele.id.split('-')[0]) >= 0) ele.classList.remove('bingo');
  });
  bingoWinners.forEach(id => document.getElementById(id + '-td').classList.add('bingo'));
}


function toggleCell(event, skipSessionStorage = false) {
  let cell = document.getElementById(event);
  cell.classList.toggle('marked');
  let alreadySelected = JSON.parse(sessionStorage.getItem('selectedCells') || '[]');
  if (!skipSessionStorage) {
    if (cell.classList.contains('marked')) {
      sessionStorage.setItem('selectedCells', JSON.stringify([cell.id, ...alreadySelected]))
    } else {
      sessionStorage.setItem('selectedCells', JSON.stringify(alreadySelected.filter(c => c !== cell.id)))
    }
  }
  checkBingo();
}


function rerollBoard() {
  seed = generateSeedString();
  showModal();
  //randomizeBoard();
  document.querySelectorAll('.marked').forEach(ele => ele.classList.remove('marked'));
  document.querySelectorAll('.bingo').forEach(ele => ele.classList.remove('bingo'));
  document.getElementById('r3c3-td').classList.add('marked'); // free space
}

function generateSeedString() {
  let urlParams = new URLSearchParams(window.location.search);
  let seed = Math.round(Math.random() * new Date().getTime())
  urlParams.set('seed', seed);
  const url = new URL(window.location.href);
  url.searchParams.set('seed', seed);
  window.history.replaceState(null, null, url);
  return seed;
}


function getSeededRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(mySeededRng() * (max - min + 1)) + min;
}
