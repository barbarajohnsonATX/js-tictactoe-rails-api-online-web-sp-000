// Code your JavaScript / jQuery solution here

const winCombinations =  [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [6,4,2]
];

var turn = 0
var currentGame = 0;


$(document).ready(function() {
    attachListeners();
});


//Returns the token of the player whose turn it is, 
//'X' when the turn variable is even and 'O' when it is odd.
function player() {
   return turn % 2 === 0 ? "X" : "O";
}

//Invokes player() and adds the returned string ('X' or 'O') 
//to the clicked square on the game board.
function updateState(token) {
    $(token).text(player());
}

//Accepts a string and adds it to the div#message element in the DOM.
function setMessage(msg) {
    $('#message').html(msg);
}

//Returns true if the current board contains any winning combinations 
//(three X or O tokens in a row, vertically, horizontally, or diagonally). Otherwise, returns false.
//If there is a winning combination on the board, checkWinner() should invoke setMessage(), 
//passing in the appropriate string based on who won: 'Player X Won!' or 'Player O Won!'
//<td data-x="0" data-y="0"></td>
function checkWinner(){
    var board = {};
    var winner = false;

    $('td').text((cell, token) => board[cell] = token);
    //debugger

    winCombinations.forEach(function(combo) {
        if (board[combo[0]] !== "" && board[combo[0]] === board[combo[1]] && board[combo[1]] === board[combo[2]]) {
            setMessage(`Player ${board[combo[0]]} Won!`);
            return winner = true;
        }
    });

  return winner;
}

//Increments the turn variable by 1.
//Invokes the updateState() function, passing it the element that was clicked.
//Invokes checkWinner() to determine whether the move results in a winning play.
function doTurn(cell) {
    updateState(cell);
    turn++;
    if (checkWinner()) {
        saveGame();
        resetGame();
    } else if (turn === 9) {
        setMessage("Tie game.");
        saveGame();
        resetGame();
    }
}

function clearBoard() {
    turn = 0;
    currentGame = 0;
    $("td").empty();
  }


//Attaches the appropriate event listeners to the squares of the game board as well as for the button#save, button#previous, and button#clear elements.
//When a user clicks on a square on the game board, the event listener should invoke doTurn() and pass it the element that was clicked.
//NOTE: attachListeners() must be invoked inside either a $(document).ready() (jQuery) or a window.onload = () => {} (vanilla JavaScript). Otherwise, a number of the tests will fail (not to mention that your game probably won't function in the browser).
//When you name your save and previous functions, make sure to call them something like saveGame() and previousGames(). If you call them save() and previous() you may run into problems with the test suite.
function attachListeners() {
    $('td').click(function() {
        if (!$.text(this) && !checkWinner()) {
            debugger
            doTurn(this);
          }
    })
    $('#save').click(function(e) {
        saveGame();
      });
    $('#previous').click(function(e) {
       previousGames();
     });
    $('#clear').click(function(e) {
       clearBoard();
       $('#message').empty();
     });
}

function resetGame() {
    currentGame = 0;
    turn = 0;

    $('td').empty();
    setMessage('');
  }


function saveGame() {
    var state = [];
    var gameData = {state: state};
    $('td').text((cell, token) => {state.push(token);
    });
    if (currentGame) {
      $.ajax({
        type: 'PATCH',
        url: `/games/${currentGame}`,
        data: gameData
      });
    } else {
      $.post('/games', gameData, function(game) {
        currentGame = game.data.id;
        $('#games').append(`<button id="gameid-${game.data.id}">${game.data.id}</button><br>`);
        $("#gameid-" + game.data.id).on('click', () => reloadGame(game.data.id));
      });
    }
  }

  function previousGames() {
    $("div#games").html('');
    $.get('/games', function(games) {
      if (games.data.length > 0) {
        games.data.forEach(function(game){
          var id = game["id"];
          var button = '<button id="game-' + id + '">' + id + '</button>'
          $("div#games").append(button);
          $(`#game-${id}`).on('click', () => loadGame(id));
        });
      }
    })
  }

  function loadGame(id){
    $.get(`/games/${id}`, function(game) {
      let state = game.data.attributes.state
      let cells = document.querySelectorAll("td")
      currentGame = id;
      turn = state.join("").length;
      debugger
      var i = 0;
      cells.forEach(function(cell) {
        cell.innerHTML = state[i];
        i++;
      })
    })
  }
