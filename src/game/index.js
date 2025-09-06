// Main game entry point
const { SPELLS } = require('../spells/spells');
const { ITEMS } = require('../items/items');

class Game {
  constructor() {
    this.spells = SPELLS;
    this.items = ITEMS;
    this.currentPlayer = 1; // 1 for white, 2 for black
    this.board = this.initializeBoard();
    this.playerState = {
      1: { spells: 3, items: 3, rageTurns: 0, extraMove: false, kingCanMoveLikeQueen: false },
      2: { spells: 3, items: 3, rageTurns: 0, extraMove: false, kingCanMoveLikeQueen: false }
    };
    this.capturedPieces = { 1: [], 2: [] };
    this.frozenSquares = [];
    this.barriers = [];
    this.invisiblePieces = [];
    this.tempCapturedPieces = [];
    this.moveHistory = [];
    this.gameStatus = 'active';
  }

  initializeBoard() {
    // Initialize an 8x8 chess board
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Set up pieces for player 1 (white)
    board[7][0] = { type: 'rook', owner: 1, symbol: '♖' };
    board[7][1] = { type: 'knight', owner: 1, symbol: '♘' };
    board[7][2] = { type: 'bishop', owner: 1, symbol: '♗' };
    board[7][3] = { type: 'queen', owner: 1, symbol: '♕' };
    board[7][4] = { type: 'king', owner: 1, symbol: '♔' };
    board[7][5] = { type: 'bishop', owner: 1, symbol: '♗' };
    board[7][6] = { type: 'knight', owner: 1, symbol: '♘' };
    board[7][7] = { type: 'rook', owner: 1, symbol: '♖' };
    
    // Pawns for player 1
    for (let i = 0; i < 8; i++) {
      board[6][i] = { type: 'pawn', owner: 1, symbol: '♙' };
    }
    
    // Set up pieces for player 2 (black)
    board[0][0] = { type: 'rook', owner: 2, symbol: '♜' };
    board[0][1] = { type: 'knight', owner: 2, symbol: '♞' };
    board[0][2] = { type: 'bishop', owner: 2, symbol: '♝' };
    board[0][3] = { type: 'queen', owner: 2, symbol: '♛' };
    board[0][4] = { type: 'king', owner: 2, symbol: '♚' };
    board[0][5] = { type: 'bishop', owner: 2, symbol: '♝' };
    board[0][6] = { type: 'knight', owner: 2, symbol: '♞' };
    board[0][7] = { type: 'rook', owner: 2, symbol: '♜' };
    
    // Pawns for player 2
    for (let i = 0; i < 8; i++) {
      board[1][i] = { type: 'pawn', owner: 2, symbol: '♟' };
    }
    
    return board;
  }

  findKing(player) {
    const kingSymbol = player === 1 ? '♔' : '♚';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.symbol === kingSymbol) {
          return { ...piece, row, col };
        }
      }
    }
    return null;
  }

  getPieceAt(row, col) {
    if (row < 0 || row >= 8 || col < 0 || col >= 8) return null;
    return this.board[row][col];
  }

  isOnBoard(position) {
    return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8;
  }

  capturePieceAt(row, col) {
    const piece = this.board[row][col];
    if (piece) {
      this.capturedPieces[piece.owner].push(piece);
      this.board[row][col] = null;
    }
  }

  endTurn() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.updatePlayerState();
  }

  updatePlayerState() {
    // Update rage turns
    if (this.playerState[this.currentPlayer].rageTurns > 0) {
      this.playerState[this.currentPlayer].rageTurns--;
    }
    
    // Reset extra move
    this.playerState[this.currentPlayer].extraMove = false;
    
    // Reset king queen movement
    this.playerState[this.currentPlayer].kingCanMoveLikeQueen = false;
  }

  selectDirection() {
    // This would be implemented with user input
    // For now, return a random direction
    const directions = [
      { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
      { row: 0, col: -1 }, { row: 0, col: 1 },
      { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  selectFreezeArea() {
    // This would be implemented with user input
    // For now, return a random 2x2 area
    const startRow = Math.floor(Math.random() * 6);
    const startCol = Math.floor(Math.random() * 6);
    return [
      { row: startRow, col: startCol },
      { row: startRow, col: startCol + 1 },
      { row: startRow + 1, col: startCol },
      { row: startRow + 1, col: startCol + 1 }
    ];
  }

  findEmptySpot(piece) {
    // Find an empty spot to revive a piece
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (!this.board[row][col]) {
          return { row, col };
        }
      }
    }
    return null;
  }

  selectTarget() {
    // This would be implemented with user input
    // For now, return a random position
    return {
      row: Math.floor(Math.random() * 8),
      col: Math.floor(Math.random() * 8)
    };
  }

  getFireballImpactArea(target) {
    const impacted = [target];
    const directions = [
      { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
      { row: 0, col: -1 }, { row: 0, col: 1 },
      { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
    ];
    
    for (const dir of directions) {
      const newRow = target.row + dir.row;
      const newCol = target.col + dir.col;
      if (this.isOnBoard({ row: newRow, col: newCol })) {
        impacted.push({ row: newRow, col: newCol });
      }
    }
    
    return impacted;
  }

  // Item-related methods
  isPieceAdjacent(piece) {
    // This would check if there's an adjacent piece to stab
    return true; // Placeholder
  }

  capturePiece(piece) {
    // Remove piece from board and add to captured pieces
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] === piece) {
          this.capturePieceAt(row, col);
          return;
        }
      }
    }
  }

  enableNonKingSpells() {
    // Enable spells for non-king pieces
    this.playerState[this.currentPlayer].nonKingSpellsEnabled = true;
  }

  placeBarrier(position) {
    if (this.isOnBoard(position) && !this.board[position.row][position.col]) {
      this.barriers.push(position);
      return true;
    }
    return false;
  }

  giveLadder(piece) {
    // Give ladder ability to piece
    piece.hasLadder = true;
    return true;
  }

  capturePieceTemp(piece, turns) {
    // Temporarily capture piece
    this.tempCapturedPieces.push({
      piece: piece,
      turnsLeft: turns,
      originalPosition: this.findPiecePosition(piece)
    });
    this.removePieceFromBoard(piece);
  }

  makeInvisible(piece) {
    this.invisiblePieces.push(piece);
  }

  reverseMove() {
    // Reverse the last move
    if (this.moveHistory.length > 0) {
      const lastMove = this.moveHistory.pop();
      this.board[lastMove.fromRow][lastMove.fromCol] = lastMove.piece;
      this.board[lastMove.toRow][lastMove.toCol] = lastMove.capturedPiece;
    }
  }

  returnMana() {
    // Replenish a spell
    this.playerState[this.currentPlayer].spells++;
  }

  findPiecePosition(piece) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] === piece) {
          return { row, col };
        }
      }
    }
    return null;
  }

  removePieceFromBoard(piece) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] === piece) {
          this.board[row][col] = null;
          return;
        }
      }
    }
  }

  rollDice() {
    return Math.floor(Math.random() * 20) + 1;
  }

  castSpell(spellName) {
    const spell = this.spells[spellName];
    if (!spell) return "Spell not found.";
    
    if (this.playerState[this.currentPlayer].spells <= 0) {
      return "No spells remaining.";
    }
    
    const roll = this.rollDice();
    const minRoll = this.getMinRollForSpell(spellName);
    
    if (roll < minRoll) {
      return `Spell failed! Rolled ${roll}, needed ${minRoll}+.`;
    }
    
    this.playerState[this.currentPlayer].spells--;
    const result = spell.effect(this);
    
    return `Spell cast successfully! ${result}`;
  }

  useItem(itemName, piece = null, roll = null) {
    const item = this.items[itemName];
    if (!item) return "Item not found.";
    
    if (this.playerState[this.currentPlayer].items <= 0) {
      return "No items remaining.";
    }
    
    this.playerState[this.currentPlayer].items--;
    const result = item.effect(this, piece, roll);
    
    return `Item used! ${result}`;
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

  getBoardState() {
    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      playerState: this.playerState,
      gameStatus: this.gameStatus,
      capturedPieces: this.capturedPieces
    };
  }

  start() {
    console.log('Welcome to Boards and Battles!');
    console.log('Game initialized with spells and items.');
    console.log('Current board state:', this.getBoardState());
  }
}

// Export for use in other modules
module.exports = { Game };

// Start the game if this file is run directly
if (require.main === module) {
  const game = new Game();
  game.start();
} 