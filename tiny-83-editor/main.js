const color = "#4b5a4b";
const bgColor = "#c9ddc9";

const gridWidth = 22;
const gridHeight = 14;

const myAddress = '0xaBF24cFEd50535790C1Cf3B1c706daB8395CFa5c';

const pixelCanvas = document.querySelector('.pixel-canvas');
const newButton = document.querySelector('.new-button');
const connectButton = document.querySelector('.connect-button')
const tipButton = document.querySelector('.tip-button')

let grid = [];
let web3 = null;
let currentAccount = null;

let isMouseDown = false;



function resetGrid() {
  grid = [];
  for (let i = 0; i < gridHeight; i++) {
    const row = [];
    for (let j = 0; j < gridWidth; j++) {
      row.push(false);
    }
    grid.push(row);
  }
}

function gridToPairOfUint160() {
  let gridR = grid.map((val, index) => [grid].map(row => row[index]).reverse());
  grid2R = gridR[0].map((val, index) => gridR.map(row => row[index]).reverse())[0];
  let leftPart = 0n;
  let rightPart = 0n;
  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      const power = BigInt(13 - i) + 14n * BigInt(j % 11);
      const diff = grid2R[i][j] ? (2n ** power) : 0n;
      if (j < 11) {
        leftPart += diff;
      } else {
        rightPart += diff;
      }
    }
  }
  leftCode = leftPart.toString();
  rightCode = rightPart.toString();
  let inputCode = document.getElementById("input-code");
  inputCode.value = `${leftCode}, ${rightCode}`;
}

function makeGrid() {
  resetGrid()
  while (pixelCanvas.firstChild) {
    pixelCanvas.removeChild(pixelCanvas.firstChild);
    }
  for (let i = 0; i < gridHeight; i++) {
    let gridRow = document.createElement('tr');
    pixelCanvas.appendChild(gridRow);
    for (let j = 0; j < gridWidth; j++) {
      let gridCell = document.createElement('td');
      gridCell.setAttribute("x", i);
      gridCell.setAttribute("y", j);
      gridRow.appendChild(gridCell);
      gridCell.addEventListener('mousedown', function() {
        this.style.backgroundColor = color;
        grid[this.getAttribute("x")][this.getAttribute("y")] = true;
        gridToPairOfUint160();
      })
     }
  }
}

pixelCanvas.addEventListener('mousedown', function(e) {
  isMouseDown = true;
  pixelCanvas.addEventListener('mouseup', function() {
    isMouseDown = false;
  });
  pixelCanvas.addEventListener('mouseleave', function() {
    isMouseDown = false;
  });

  pixelCanvas.addEventListener('mouseover', function(e) {
    if (isMouseDown) {
      if (e.target.tagName === 'TD') {
        e.target.style.backgroundColor = color;
        grid[e.target.getAttribute("x")][e.target.getAttribute("y")] = true;
        gridToPairOfUint160();
      }
    }
  });
});

newButton.addEventListener('click', function(e) {
  resetGrid();
  e.preventDefault();
  pixelCanvas.querySelectorAll('td').forEach(td => td.style.backgroundColor = bgColor);
  gridToPairOfUint160();
});

pixelCanvas.addEventListener('dblclick', e => {
  e.target.style.backgroundColor = bgColor;
  grid[e.target.getAttribute("x")][e.target.getAttribute("y")] = false;
  gridToPairOfUint160();
});

async function start() {
    const provider = await detectEthereumProvider();
    if (provider) {
        if (provider !== window.ethereum) {
            renderMessage('Do you have multiple wallets installed?');
        }
        web3 = new Web3(provider);
    } else {
        renderMessage("Please install the MetaMask extension and connect your wallet.");
    }
}

function connect() {
    ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(handleAccountsChanged)
        .catch((err) => {
            if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error.
                renderMessage('Connect to MetaMask.');
            } else {
                renderMessage(err);
            }
        });
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        renderMessage("MetaMask is locked or you haven't connected any account. Please connect to MetaMask.");
        $(".mint button").hide();
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        $(".mint button").show();
    }
}

connectButton.addEventListener('click', function() {
  if (window.ethereum == null) {
    return renderMessage('<div align="center">You need to install MetaMask or if on mobile use the browser in MetaMask app</div>')
  } else {
    ethereum.on('accountsChanged', handleAccountsChanged);
    setTimeout(connect, 500);
    start();
  }
  if(currentAccount) {
    renderMessage('<div align="center">Wallet Connected!</div>')
  }
})

tipButton.addEventListener('click', function() {
  if (!web3) {
    return renderMessage('<div align="center">You need to install MetaMask or if on mobile use the browser in MetaMask app</div>')
  } else {
    ethereum.enable().then(function () {
      web3.eth.sendTransaction({
        to: myAddress,
        from: currentAccount,
        value: Web3.utils.toWei(document.querySelector('.tip-amount').value, 'ether'),
      }, function (err, transactionHash) {
        if (err) return renderMessage('There was a problem: ' + err.message)
        renderMessage('Thanks for your generosity!')
      })
    });
  }
})

function renderMessage (message) {
  var messageEl = document.querySelector('.message')
  messageEl.innerHTML = message
}

$(document).ready(function () {
  makeGrid();
});
