class ChessGame {
  constructor() {
    this.board = this.initializeBoard();
    this.currentPlayer = "white";
    this.selectedSquare = null;
    this.moveHistory = [];
    this.gameStatus = "active";
    this.enPassantTarget = null;
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true },
    };
    this.kingPositions = { white: [7, 4], black: [0, 4] };
    
    // Add spell and item tracking
    this.playerSpells = { white: 3, black: 3 };
    this.playerItems = { white: 3, black: 3 };
    this.selectedSpell = null;
    this.selectedItem = null;

    this.createBoard();
    this.createSpellAndItemUI();
    this.updateUI();
  }

  initializeBoard() {
    return [
      ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
      ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
      ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
    ];
  }

  createSpellAndItemUI() {
    const gameContainer = document.querySelector('.game-container');
    
    // Create spells section
    const spellsSection = document.createElement('div');
    spellsSection.className = 'spells-section';
    spellsSection.innerHTML = `
      <h3>Spells (${this.playerSpells[this.currentPlayer]})</h3>
      <div class="spells-grid">
        <button class="spell-btn" data-spell="Thunder_Spell">Thunder Spell</button>
        <button class="spell-btn" data-spell="Rage">Rage</button>
        <button class="spell-btn" data-spell="Freeze">Freeze</button>
        <button class="spell-btn" data-spell="Necromancy">Necromancy</button>
        <button class="spell-btn" data-spell="Agility">Agility</button>
        <button class="spell-btn" data-spell="Fireball">Fireball</button>
        <button class="spell-btn" data-spell="Queens_Soul">Queen's Soul</button>
      </div>
    `;
    
    // Create items section
    const itemsSection = document.createElement('div');
    itemsSection.className = 'items-section';
    itemsSection.innerHTML = `
      <h3>Items (${this.playerItems[this.currentPlayer]})</h3>
      <div class="items-grid">
        <button class="item-btn" data-item="Knife">Knife</button>
        <button class="item-btn" data-item="Magic_Wand">Magic Wand</button>
        <button class="item-btn" data-item="Barrier">Barrier</button>
        <button class="item-btn" data-item="Wontan">Wontan</button>
        <button class="item-btn" data-item="Ladder">Ladder</button>
        <button class="item-btn" data-item="Fishing_Net">Fishing Net</button>
        <button class="item-btn" data-item="Invisibility_Potion">Invisibility Potion</button>
        <button class="item-btn" data-item="Time_Machine">Time Machine</button>
        <button class="item-btn" data-item="Skip">Skip</button>
        <button class="item-btn" data-item="Lucky_Coin">Lucky Coin</button>
        <button class="item-btn" data-item="Mana_Potion">Mana Potion</button>
      </div>
    `;
    
    // Insert after the chess board
    const chessBoard = document.getElementById('chessBoard');
    chessBoard.parentNode.insertBefore(spellsSection, chessBoard.nextSibling);
    chessBoard.parentNode.insertBefore(itemsSection, spellsSection.nextSibling);
    
    // Add event listeners
    this.addSpellAndItemListeners();
  }

  addSpellAndItemListeners() {
    // Spell buttons
    document.querySelectorAll('.spell-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const spellName = e.target.dataset.spell;
        this.castSpell(spellName);
      });
    });
    
    // Item buttons
    document.querySelectorAll('.item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemName = e.target.dataset.item;
        this.useItem(itemName);
      });
    });
  }

  castSpell(spellName) {
    if (this.playerSpells[this.currentPlayer] <= 0) {
      alert('No spells remaining!');
      return;
    }
    
    // Check if selected piece is a king
    if (!this.selectedSquare) {
      alert('Please select your king to cast a spell!');
      return;
    }
    
    const piece = this.board[this.selectedSquare.row][this.selectedSquare.col];
    const isKing = piece === '♔' || piece === '♚';
    
    if (!isKing) {
      alert('Only kings can cast spells!');
      return;
    }
    
    // Simulate spell casting
    const roll = Math.floor(Math.random() * 20) + 1;
    const minRoll = this.getMinRollForSpell(spellName);
    
    if (roll < minRoll) {
      alert(`Spell failed! Rolled ${roll}, needed ${minRoll}+.`);
    } else {
      this.playerSpells[this.currentPlayer]--;
      alert(`Spell cast successfully! ${spellName} effect applied.`);
      this.updateSpellAndItemUI();
    }
  }

  useItem(itemName) {
    if (this.playerItems[this.currentPlayer] <= 0) {
      alert('No items remaining!');
      return;
    }
    
    if (!this.selectedSquare) {
      alert('Please select a piece to use an item!');
      return;
    }
    
    // Simulate item usage
    const roll = Math.floor(Math.random() * 20) + 1;
    this.playerItems[this.currentPlayer]--;
    alert(`Item used! ${itemName} effect applied.`);
    this.updateSpellAndItemUI();
  }

  getMinRollForSpell(spellName) {
    const spellRolls = {
      'Thunder_Spell': 10,
      'Rage': 5,
      'Freeze': 10,
      'Necromancy': 15,
      'Agility': 11,
      'Fireball': 15,
      'Queens_Soul': 17
    };
    return spellRolls[spellName] || 10;
  }

  updateSpellAndItemUI() {
    // Update spell count
    const spellsSection = document.querySelector('.spells-section h3');
    spellsSection.textContent = `Spells (${this.playerSpells[this.currentPlayer]})`;
    
    // Update item count
    const itemsSection = document.querySelector('.items-section h3');
    itemsSection.textContent = `Items (${this.playerItems[this.currentPlayer]})`;
    
    // Disable buttons if no spells/items remaining
    document.querySelectorAll('.spell-btn').forEach(btn => {
      btn.disabled = this.playerSpells[this.currentPlayer] <= 0;
    });
    
    document.querySelectorAll('.item-btn').forEach(btn => {
      btn.disabled = this.playerItems[this.currentPlayer] <= 0;
    });
  }

  createBoard() {
    const boardElement = document.getElementById("chessBoard");
    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = "square";
        square.dataset.row = row;
        square.dataset.col = col;

        if ((row + col) % 2 === 0) {
          square.classList.add("light");
        } else {
          square.classList.add("dark");
        }

        square.addEventListener("click", (e) =>
          this.handleSquareClick(row, col)
        );
        boardElement.appendChild(square);
      }
    }
    this.updateBoardDisplay();
  }

  updateBoardDisplay() {
    const squares = document.querySelectorAll(".square");
    squares.forEach((square) => {
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      const piece = this.board[row][col];

      square.innerHTML = "";
      square.classList.remove("selected", "valid-move", "in-check");

      if (piece) {
        const pieceElement = document.createElement("span");
        pieceElement.className = "piece";
        pieceElement.textContent = piece;

        if (this.isWhitePiece(piece)) {
          pieceElement.classList.add("white-piece");
        } else {
          pieceElement.classList.add("black-piece");
        }

        square.appendChild(pieceElement);
      }
    });
  }

  handleSquareClick(row, col) {
    if (this.gameStatus !== "active" && this.gameStatus !== "check") return;

    if (this.selectedSquare) {
      if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
        this.selectedSquare = null;
        this.clearHighlights();
      } else if (
        this.isValidMove(
          this.selectedSquare.row,
          this.selectedSquare.col,
          row,
          col
        )
      ) {
        this.makeMove(
          this.selectedSquare.row,
          this.selectedSquare.col,
          row,
          col
        );
        this.selectedSquare = null;
        this.clearHighlights();
      } else {
        this.selectNewPiece(row, col);
      }
    } else {
      this.selectNewPiece(row, col);
    }
  }

  selectNewPiece(row, col) {
    const piece = this.board[row][col];
    if (piece && this.isPieceOwnedByCurrentPlayer(piece)) {
      this.selectedSquare = { row, col };
      this.highlightSquare(row, col);
      this.highlightValidMoves(row, col);
    }
  }

  isPieceOwnedByCurrentPlayer(piece) {
    return (
      (this.currentPlayer === "white" && this.isWhitePiece(piece)) ||
      (this.currentPlayer === "black" && !this.isWhitePiece(piece))
    );
  }

  isWhitePiece(piece) {
    return ["♔", "♕", "♖", "♗", "♘", "♙"].includes(piece);
  }

  highlightSquare(row, col) {
    const square = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    square.classList.add("selected");
  }

  highlightValidMoves(row, col) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.isValidMove(row, col, r, c)) {
          const square = document.querySelector(
            `[data-row="${r}"][data-col="${c}"]`
          );
          square.classList.add("valid-move");
        }
      }
    }
  }

  clearHighlights() {
    document.querySelectorAll(".square").forEach((square) => {
      square.classList.remove("selected", "valid-move");
    });
  }

  isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    if (!piece) return false;

    // Can't capture own piece
    const targetPiece = this.board[toRow][toCol];
    if (targetPiece && this.isPieceOwnedByCurrentPlayer(targetPiece))
      return false;

    // Check piece-specific movement rules
    if (!this.isPieceMoveValid(piece, fromRow, fromCol, toRow, toCol))
      return false;

    // Check if move would leave king in check
    return !this.wouldMoveLeaveKingInCheck(fromRow, fromCol, toRow, toCol);
  }

  isPieceMoveValid(piece, fromRow, fromCol, toRow, toCol) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    switch (piece.toLowerCase()) {
      case "♙":
      case "♟": // Pawn
        return this.isPawnMoveValid(
          piece,
          fromRow,
          fromCol,
          toRow,
          toCol,
          rowDiff,
          colDiff
        );
      case "♖":
      case "♜": // Rook
        return this.isRookMoveValid(
          fromRow,
          fromCol,
          toRow,
          toCol,
          rowDiff,
          colDiff
        );
      case "♗":
      case "♝": // Bishop
        return this.isBishopMoveValid(
          fromRow,
          fromCol,
          toRow,
          toCol,
          absRowDiff,
          absColDiff
        );
      case "♕":
      case "♛": // Queen
        return (
          this.isRookMoveValid(
            fromRow,
            fromCol,
            toRow,
            toCol,
            rowDiff,
            colDiff
          ) ||
          this.isBishopMoveValid(
            fromRow,
            fromCol,
            toRow,
            toCol,
            absRowDiff,
            absColDiff
          )
        );
      case "♘":
      case "♞": // Knight
        return (
          (absRowDiff === 2 && absColDiff === 1) ||
          (absRowDiff === 1 && absColDiff === 2)
        );
      case "♔":
      case "♚": // King
        return this.isKingMoveValid(
          piece,
          fromRow,
          fromCol,
          toRow,
          toCol,
          absRowDiff,
          absColDiff
        );
      default:
        return false;
    }
  }

  isPawnMoveValid(piece, fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    const isWhite = this.isWhitePiece(piece);
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    // Forward move
    if (colDiff === 0 && rowDiff === direction) {
      return !this.board[toRow][toCol];
    }

    // Initial two-square move
    if (colDiff === 0 && rowDiff === 2 * direction && fromRow === startRow) {
      return (
        !this.board[toRow][toCol] &&
        !this.board[fromRow + direction][fromCol]
      );
    }

    // Capture move
    if (Math.abs(colDiff) === 1 && rowDiff === direction) {
      return this.board[toRow][toCol] && !this.isPieceOwnedByCurrentPlayer(this.board[toRow][toCol]);
    }

    return false;
  }

  isRookMoveValid(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    return (
      (rowDiff === 0 && colDiff !== 0) ||
      (colDiff === 0 && rowDiff !== 0)
    ) && this.isPathClear(fromRow, fromCol, toRow, toCol);
  }

  isBishopMoveValid(fromRow, fromCol, toRow, toCol, absRowDiff, absColDiff) {
    return absRowDiff === absColDiff && this.isPathClear(fromRow, fromCol, toRow, toCol);
  }

  isKingMoveValid(
    piece,
    fromRow,
    fromCol,
    toRow,
    toCol,
    absRowDiff,
    absColDiff
  ) {
    // Normal king move
    if (absRowDiff <= 1 && absColDiff <= 1) {
      return true;
    }

    // Castling
    return this.canCastle(piece, fromRow, fromCol, toRow, toCol);
  }

  isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = fromRow === toRow ? 0 : (toRow - fromRow) / Math.abs(toRow - fromRow);
    const colStep = fromCol === toCol ? 0 : (toCol - fromCol) / Math.abs(toCol - fromCol);

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.board[currentRow][currentCol]) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }

  canCastle(piece, fromRow, fromCol, toRow, toCol) {
    const isWhite = this.isWhitePiece(piece);
    const color = isWhite ? "white" : "black";
    const isKingside = toCol > fromCol;

    if (!this.castlingRights[color][isKingside ? "kingside" : "queenside"]) {
      return false;
    }

    const rookCol = isKingside ? 7 : 0;
    const rook = this.board[fromRow][rookCol];
    if (!rook || !this.isPieceOwnedByCurrentPlayer(rook)) {
      return false;
    }

    // Check if squares between king and rook are empty
    const startCol = Math.min(fromCol, rookCol) + 1;
    const endCol = Math.max(fromCol, rookCol);
    for (let col = startCol; col < endCol; col++) {
      if (this.board[fromRow][col]) {
        return false;
      }
    }

    // Check if king is in check or would pass through check
    const kingStep = isKingside ? 1 : -1;
    for (let col = fromCol; col !== toCol; col += kingStep) {
      if (this.isSquareUnderAttack(fromRow, col, color)) {
        return false;
      }
    }

    return true;
  }

  makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];

    // Handle castling
    if (this.isKingMoveValid(piece, fromRow, fromCol, toRow, toCol) && Math.abs(toCol - fromCol) === 2) {
      this.handleCastling(fromRow, fromCol, toRow, toCol);
    } else {
      // Normal move
      this.board[toRow][toCol] = piece;
      this.board[fromRow][fromCol] = "";
    }

    // Update king position
    if (piece === "♔") {
      this.kingPositions.white = [toRow, toCol];
    } else if (piece === "♚") {
      this.kingPositions.black = [toRow, toCol];
    }

    // Update castling rights
    this.updateCastlingRights(piece, fromRow, fromCol, toRow, toCol);

    // Check for pawn promotion
    if ((piece === "♙" && toRow === 0) || (piece === "♟" && toRow === 7)) {
      this.board[toRow][toCol] = this.isWhitePiece(piece) ? "♕" : "♛";
    }

    // Record move
    this.moveHistory.push({
      piece: piece,
      fromRow: fromRow,
      fromCol: fromCol,
      toRow: toRow,
      toCol: toCol,
      capturedPiece: capturedPiece,
    });

    // Switch players
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
    
    // Update spell and item UI for new player
    this.updateSpellAndItemUI();

    // Check game status
    this.checkGameStatus();
    this.updateUI();
  }

  handleCastling(fromRow, fromCol, toRow, toCol) {
    const isKingside = toCol > fromCol;
    const rookFromCol = isKingside ? 7 : 0;
    const rookToCol = isKingside ? toCol - 1 : toCol + 1;
    const rook = this.board[fromRow][rookFromCol];

    // Move king
    this.board[toRow][toCol] = this.board[fromRow][fromCol];
    this.board[fromRow][fromCol] = "";

    // Move rook
    this.board[fromRow][rookToCol] = rook;
    this.board[fromRow][rookFromCol] = "";
  }

  updateCastlingRights(piece, fromRow, fromCol, toRow, toCol) {
    const isWhite = this.isWhitePiece(piece);
    const color = isWhite ? "white" : "black";

    if (piece === "♔" || piece === "♚") {
      this.castlingRights[color].kingside = false;
      this.castlingRights[color].queenside = false;
    } else if (piece === "♖" || piece === "♜") {
      if (fromCol === 0) {
        this.castlingRights[color].queenside = false;
      } else if (fromCol === 7) {
        this.castlingRights[color].kingside = false;
      }
    }
  }

  wouldMoveLeaveKingInCheck(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];

    // Make temporary move
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = "";

    // Check if king is in check
    const isWhite = this.isWhitePiece(piece);
    const kingPosition = isWhite ? this.kingPositions.white : this.kingPositions.black;
    const isInCheck = this.isSquareUnderAttack(kingPosition[0], kingPosition[1], isWhite ? "white" : "black");

    // Undo move
    this.board[fromRow][fromCol] = piece;
    this.board[toRow][toCol] = capturedPiece;

    return isInCheck;
  }

  isSquareUnderAttack(row, col, defendingColor) {
    const attackingColor = defendingColor === "white" ? "black" : "white";
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && this.isPieceOwnedByCurrentPlayer(piece) === (attackingColor === "white")) {
          if (this.canPieceAttackSquare(piece, r, c, row, col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  canPieceAttackSquare(piece, fromRow, fromCol, toRow, toCol) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    switch (piece.toLowerCase()) {
      case "♙":
      case "♟": // Pawn
        const isWhite = this.isWhitePiece(piece);
        const direction = isWhite ? -1 : 1;
        return Math.abs(colDiff) === 1 && rowDiff === direction;
      case "♖":
      case "♜": // Rook
        return (
          (rowDiff === 0 && colDiff !== 0) ||
          (colDiff === 0 && rowDiff !== 0)
        ) && this.isPathClear(fromRow, fromCol, toRow, toCol);
      case "♗":
      case "♝": // Bishop
        return absRowDiff === absColDiff && this.isPathClear(fromRow, fromCol, toRow, toCol);
      case "♕":
      case "♛": // Queen
        return (
          this.canPieceAttackSquare("♖", fromRow, fromCol, toRow, toCol) ||
          this.canPieceAttackSquare("♗", fromRow, fromCol, toRow, toCol)
        );
      case "♘":
      case "♞": // Knight
        return (
          (absRowDiff === 2 && absColDiff === 1) ||
          (absRowDiff === 1 && absColDiff === 2)
        );
      case "♔":
      case "♚": // King
        return absRowDiff <= 1 && absColDiff <= 1;
      default:
        return false;
    }
  }

  checkGameStatus() {
    const isWhite = this.currentPlayer === "white";
    const kingPosition = isWhite ? this.kingPositions.white : this.kingPositions.black;
    
    if (this.isSquareUnderAttack(kingPosition[0], kingPosition[1], isWhite ? "white" : "black")) {
      if (this.hasValidMoves()) {
        this.gameStatus = "check";
      } else {
        this.gameStatus = "checkmate";
      }
    } else if (!this.hasValidMoves()) {
      this.gameStatus = "stalemate";
    } else {
      this.gameStatus = "active";
    }
  }

  hasValidMoves() {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && this.isPieceOwnedByCurrentPlayer(piece)) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              if (this.isValidMove(row, col, toRow, toCol)) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  updateUI() {
    const currentPlayerElement = document.getElementById("currentPlayer");
    const gameStatusElement = document.getElementById("gameStatus");

    currentPlayerElement.textContent = this.currentPlayer;

    switch (this.gameStatus) {
      case "check":
        gameStatusElement.textContent = `${this.currentPlayer} is in check!`;
        gameStatusElement.className = "game-status check";
        break;
      case "checkmate":
        gameStatusElement.textContent = `Checkmate! ${this.currentPlayer === "white" ? "Black" : "White"} wins!`;
        gameStatusElement.className = "game-status checkmate";
        break;
      case "stalemate":
        gameStatusElement.textContent = "Stalemate! It's a draw!";
        gameStatusElement.className = "game-status stalemate";
        break;
      default:
        gameStatusElement.textContent = "Game in progress";
        gameStatusElement.className = "game-status";
    }

    this.updateBoardDisplay();
  }

  resetGame() {
    this.board = this.initializeBoard();
    this.currentPlayer = "white";
    this.selectedSquare = null;
    this.moveHistory = [];
    this.gameStatus = "active";
    this.kingPositions = { white: [7, 4], black: [0, 4] };
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true },
    };
    
    // Reset spells and items
    this.playerSpells = { white: 3, black: 3 };
    this.playerItems = { white: 3, black: 3 };
    
    this.updateUI();
    this.updateSpellAndItemUI();
  }
}

function initializeChessGame() {
  const game = new ChessGame();
  
  document.getElementById("resetButton").addEventListener("click", () => {
    game.resetGame();
  });
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", initializeChessGame);