// Magical Chess Game with Spells and Items - One Roll Per Turn
class MagicalChessGame {
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
    
    // Magical game state
    this.spells = this.initializeSpells();
    this.items = this.initializeItems();
    this.playerState = {
      white: { rageTurns: 0, extraMove: false, kingCanMoveLikeQueen: false, freezeDuration: 0 },
      black: { rageTurns: 0, extraMove: false, kingCanMoveLikeQueen: false, freezeDuration: 0 }
    };
    this.frozenSquares = [];
    this.barriers = [];
    this.capturedPieces = { white: [], black: [] };
    this.currentDiceRoll = null;
    this.hasRolledThisTurn = false; // NEW: Track if dice has been rolled this turn
    this.spellsUsedThisTurn = 0;
    this.itemsUsedThisTurn = 0;
    this.selectedSpell = null;
    this.selectedItem = null;

    this.createBoard();
    this.createSpellsUI();
    this.createItemsUI();
    this.updateUI();
    this.setupEventListeners();
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

  initializeSpells() {
    return {
      Thunder_Spell: {
        name: "Thunder Spell",
        description: "Cast a bolt of thunder from the king in any direction. The thunder captures the first piece it hits.",
        condition: "Roll a 10 or higher.",
        minRoll: 10,
        effect: (game) => {
          const king = game.findKing(game.currentPlayer);
          if (!king) return "King not found";
          
          const enemyPieces = game.findEnemyPieces();
          if (enemyPieces.length === 0) return "No enemy pieces to target";
          
          const randomPiece = enemyPieces[Math.floor(Math.random() * enemyPieces.length)];
          game.capturePieceAt(randomPiece.row, randomPiece.col);
          return "Thunder struck an enemy piece!";
        }
      },
      Rage: {
        name: "Rage",
        description: "On your next 2 turns, you get to roll twice, and you use the higher roll.",
        condition: "Roll a 5 or higher.",
        minRoll: 5,
        effect: (game) => {
          game.playerState[game.currentPlayer].rageTurns = 2;
          return "Your next 2 rolls have been boosted.";
        }
      },
      Freeze: {
        name: "Freeze",
        description: "Freezes 4 squares in a square anywhere on the board. Lasts for 1 move for each player.",
        condition: "Roll a 10 or higher.",
        minRoll: 10,
        effect: (game) => {
          const centerRow = 3;
          const centerCol = 3;
          game.frozenSquares = [
            {row: centerRow, col: centerCol},
            {row: centerRow, col: centerCol + 1},
            {row: centerRow + 1, col: centerCol},
            {row: centerRow + 1, col: centerCol + 1}
          ];
          game.playerState[game.currentPlayer].freezeDuration = 2;
          return "The center area has been frozen.";
        }
      },
      Necromancy: {
        name: "Necromancy",
        description: "Bring a piece back from the dead.",
        condition: "Roll a 15 or higher.",
        minRoll: 15,
        effect: (game) => {
          const graveyard = game.capturedPieces[game.currentPlayer];
          if (graveyard.length === 0) return "Graveyard is empty.";
          
          const revived = graveyard.pop();
          const emptySpot = game.findEmptySpot();
          if (!emptySpot) return "No space to revive the piece.";
          
          game.board[emptySpot.row][emptySpot.col] = revived;
          return `${revived} has been revived at (${emptySpot.row}, ${emptySpot.col}).`;
        }
      },
      Agility: {
        name: "Agility",
        description: "You can make 2 moves.",
        condition: "Roll an 11 or higher.",
        minRoll: 11,
        effect: (game) => {
          game.playerState[game.currentPlayer].extraMove = true;
          return "You may move twice this turn.";
        }
      },
      Fireball: {
        name: "Fireball",
        description: "Cast a fireball that captures the targeted piece and all adjacent pieces within 1 square.",
        condition: "Roll a 15 or higher.",
        minRoll: 15,
        effect: (game) => {
          const enemyPieces = game.findEnemyPieces();
          if (enemyPieces.length === 0) return "No enemy pieces to target";
          
          const target = enemyPieces[Math.floor(Math.random() * enemyPieces.length)];
          const impactedSquares = game.getFireballImpactArea(target);
          
          for (const square of impactedSquares) {
            const piece = game.getPieceAt(square.row, square.col);
            if (piece && piece !== "♚" && piece !== "♔") {
              game.capturePieceAt(square.row, square.col);
            }
          }
          return "The fireball has landed, and enemies have burned!";
        }
      },
      Queens_Soul: {
        name: "Queen's Soul",
        description: "Allows the king to move as if it was a queen for 1 turn.",
        condition: "Roll a 17 or higher.",
        minRoll: 17,
        effect: (game) => {
          game.playerState[game.currentPlayer].kingCanMoveLikeQueen = true;
          return "The King is empowered with the Queen's soul!";
        }
      }
    };
  }

  initializeItems() {
    return {
      Knife: {
        name: "Knife",
        description: "Stab a piece adjacent to the one using the knife. You can use this to capture your own.",
        effect: (game) => {
          const enemyPieces = game.findEnemyPieces();
          if (enemyPieces.length === 0) return "No enemy pieces to target";
          
          const target = enemyPieces[Math.floor(Math.random() * enemyPieces.length)];
          game.capturePieceAt(target.row, target.col);
          return "Stabbed an enemy piece!";
        }
      },
      Magic_Wand: {
        name: "Magic Wand",
        description: "Lets pieces other than the king use spells. Lasts until you use a spell.",
        effect: (game) => {
          game.enableNonKingSpells();
          return "Spells Activated";
        }
      },
      Barrier: {
        name: "Barrier",
        description: "Place a barrier that covers one square. No pieces can move on or through the barrier.",
        effect: (game) => {
          const emptySpot = game.findEmptySpot();
          if (!emptySpot) return "No space to place barrier.";
          
          game.barriers.push(emptySpot);
          return "Barrier placed.";
        }
      },
      Wontan: {
        name: "Wontan",
        description: "Smite an opponents piece and capture it. Excludes king and queen.",
        condition: "Requires a 17 or higher.",
        minRoll: 17,
        effect: (game, roll) => {
          if (roll < 17) return "Roll too low";
          
          const enemyPieces = game.findEnemyPieces();
          const validTargets = enemyPieces.filter(p => p.piece !== "♚" && p.piece !== "♛");
          
          if (validTargets.length === 0) return "No valid targets";
          
          const target = validTargets[Math.floor(Math.random() * validTargets.length)];
          game.capturePieceAt(target.row, target.col);
          return "Piece smited!";
        }
      },
      Ladder: {
        name: "Ladder",
        description: "Allows you to move your pieces over the piece with the ladder. Only you can use the ladder.",
        effect: (game) => {
          return "Ladder effect activated for this turn.";
        }
      },
      Fishing_Net: {
        name: "Fishing Net",
        description: "Temporarily capture a piece from the board for 3 turns, then return it.",
        effect: (game) => {
          const enemyPieces = game.findEnemyPieces();
          if (enemyPieces.length === 0) return "No enemy pieces to capture";
          
          const target = enemyPieces[Math.floor(Math.random() * enemyPieces.length)];
          if (target.piece === "♚" || target.piece === "♔") return "Cannot capture king";
          
          game.capturePieceTemp(target, 3);
          return "Piece temporarily captured.";
        }
      },
      Invisibility_Potion: {
        name: "Invisibility Potion",
        description: "Make any one of your pieces 'invisible'. A piece has to perform a perception check before trying to capture the invisible piece.",
        condition: "Requires a 13 or higher.",
        minRoll: 13,
        effect: (game, roll) => {
          if (roll < 13) return "Roll too low";
          
          const ownPieces = game.findOwnPieces();
          if (ownPieces.length === 0) return "No pieces to make invisible";
          
          return "A piece has been made invisible.";
        }
      },
      Time_Machine: {
        name: "Time Machine",
        description: "Redo your previous move. Both players undo their most recent move, then you make a new move.",
        effect: (game) => {
          if (game.moveHistory.length < 2) return "Not enough moves to undo";
          
          game.reverseMove();
          return "Moves undone";
        }
      },
      Skip: {
        name: "Skip",
        description: "End your turn without making a move.",
        effect: (game) => {
          game.endTurnManually();
          return "Turn ended";
        }
      },
      Lucky_Coin: {
        name: "Lucky Coin",
        description: "You and your opponent decide on a reward and a punishment, then flip a coin to decide which one happens.",
        effect: (game) => {
          const coinFlip = Math.random() > 0.5;
          return coinFlip ? "Heads! Good fortune!" : "Tails! Bad luck!";
        }
      },
      Mana_Potion: {
        name: "Mana Potion",
        description: "Completely replenish 1 spell.",
        effect: (game) => {
          game.spellsUsedThisTurn = Math.max(0, game.spellsUsedThisTurn - 1);
          return "Spell replenished.";
        }
      }
    };
  }

  setupEventListeners() {
    const rollDiceButton = document.getElementById('rollDiceButton');
    if (rollDiceButton) {
      rollDiceButton.addEventListener('click', () => {
        this.rollDice();
      });
    }

    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.resetGame();
      });
    }
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

  createSpellsUI() {
    const spellsGrid = document.getElementById("spellsGrid");
    spellsGrid.innerHTML = "";

    Object.entries(this.spells).forEach(([key, spell]) => {
      const spellCard = document.createElement("div");
      spellCard.className = "spell-card";
      spellCard.dataset.spell = key;
      
      spellCard.innerHTML = `
        <div class="spell-name">${spell.name}</div>
        <div class="spell-description">${spell.description}</div>
        <div class="spell-condition">${spell.condition}</div>
      `;
      
      spellCard.addEventListener("click", () => this.selectSpell(key));
      spellsGrid.appendChild(spellCard);
    });
  }

  createItemsUI() {
    const itemsGrid = document.getElementById("itemsGrid");
    itemsGrid.innerHTML = "";

    Object.entries(this.items).forEach(([key, item]) => {
      const itemCard = document.createElement("div");
      itemCard.className = "item-card";
      itemCard.dataset.item = key;
      
      itemCard.innerHTML = `
        <div class="item-name">${item.name}</div>
        <div class="item-description">${item.description}</div>
        ${item.condition ? `<div class="item-condition">${item.condition}</div>` : ''}
      `;
      
      itemCard.addEventListener("click", () => this.selectItem(key));
      itemsGrid.appendChild(itemCard);
    });
  }

  selectSpell(spellKey) {
    if (this.spellsUsedThisTurn >= 3) return;
    
    if (this.selectedSpell === spellKey) {
      this.selectedSpell = null;
    } else {
      this.selectedSpell = spellKey;
      this.selectedItem = null;
    }
    this.updateSpellsUI();
    this.updateItemsUI();
    this.updateDiceButton();
  }

  selectItem(itemKey) {
    if (this.itemsUsedThisTurn >= 3) return;
    
    if (this.selectedItem === itemKey) {
      this.selectedItem = null;
    } else {
      this.selectedItem = itemKey;
      this.selectedSpell = null;
    }
    this.updateSpellsUI();
    this.updateItemsUI();
    this.updateDiceButton();
  }

  updateDiceButton() {
    const diceButton = document.getElementById('rollDiceButton');
    
    // Check if dice can be rolled
    const canRoll = !this.hasRolledThisTurn && (this.selectedSpell || this.selectedItem);
    
    if (canRoll) {
      diceButton.style.display = 'block';
      diceButton.disabled = false;
      diceButton.textContent = this.selectedSpell ? 
        `Roll for ${this.selectedSpell.replace(/_/g, ' ')}` : 
        `Roll for ${this.selectedItem.replace(/_/g, ' ')}`;
    } else if (this.hasRolledThisTurn) {
      diceButton.style.display = 'block';
      diceButton.disabled = true;
      diceButton.textContent = 'Already rolled this turn';
    } else {
      diceButton.style.display = 'none';
      diceButton.disabled = false;
    }
  }

  updateSpellsUI() {
    document.querySelectorAll(".spell-card").forEach(card => {
      card.classList.remove("selected", "disabled");
      const spellKey = card.dataset.spell;
      
      if (this.selectedSpell === spellKey) {
        card.classList.add("selected");
      }
      
      if (this.spellsUsedThisTurn >= 3 || this.hasRolledThisTurn) {
        card.classList.add("disabled");
      }
    });
  }

  updateItemsUI() {
    document.querySelectorAll(".item-card").forEach(card => {
      card.classList.remove("selected", "disabled");
      const itemKey = card.dataset.item;
      
      if (this.selectedItem === itemKey) {
        card.classList.add("selected");
      }
      
      if (this.itemsUsedThisTurn >= 3 || this.hasRolledThisTurn) {
        card.classList.add("disabled");
      }
    });
  }

  rollDice() {
    // Prevent multiple rolls per turn
    if (this.hasRolledThisTurn) {
      this.showDiceResult("Already rolled this turn!", 'failure');
      return;
    }

    // Handle Rage spell (roll twice, take higher)
    let roll;
    if (this.playerState[this.currentPlayer].rageTurns > 0) {
      const roll1 = Math.floor(Math.random() * 20) + 1;
      const roll2 = Math.floor(Math.random() * 20) + 1;
      roll = Math.max(roll1, roll2);
      this.playerState[this.currentPlayer].rageTurns--;
      
      const diceResult = document.getElementById("diceResult");
      diceResult.textContent = `🎲 Rage Roll: ${roll1}, ${roll2} → ${roll}`;
    } else {
      roll = Math.floor(Math.random() * 20) + 1;
      
      const diceResult = document.getElementById("diceResult");
      diceResult.textContent = `🎲 Rolled: ${roll}`;
    }
    
    this.currentDiceRoll = roll;
    this.hasRolledThisTurn = true; // Mark that dice has been rolled
    
    diceResult.className = "dice-result show";
    
    // Update UI to show dice has been used
    this.updateDiceButton();
    this.updateSpellsUI();
    this.updateItemsUI();
    
    // Auto-use selected spell/item
    if (this.selectedSpell) {
      setTimeout(() => {
        const result = this.useSpell(this.selectedSpell);
        this.showDiceResult(result, this.currentDiceRoll >= this.spells[this.selectedSpell].minRoll ? 'success' : 'failure');
      }, 1000);
    } else if (this.selectedItem) {
      setTimeout(() => {
        const result = this.useItem(this.selectedItem);
        const item = this.items[this.selectedItem];
        const success = !item.minRoll || this.currentDiceRoll >= item.minRoll;
        this.showDiceResult(result, success ? 'success' : 'failure');
      }, 1000);
    }
    
    return roll;
  }

  showDiceResult(message, type = '') {
    const diceResult = document.getElementById('diceResult');
    diceResult.textContent = message;
    diceResult.className = `dice-result show ${type}`;
    
    setTimeout(() => {
      diceResult.classList.remove('show');
    }, 3000);
  }

  useSpell(spellKey) {
    if (this.spellsUsedThisTurn >= 3) return "Maximum spells used this turn";
    
    const spell = this.spells[spellKey];
    if (!spell) return "Spell not found";
    
    if (this.currentDiceRoll === null) {
      return "Please roll dice first";
    }
    
    if (spell.minRoll && this.currentDiceRoll < spell.minRoll) {
      return `Roll too low. Need ${spell.minRoll} or higher.`;
    }
    
    const result = spell.effect(this);
    this.spellsUsedThisTurn++;
    this.selectedSpell = null;
    this.updateSpellsUI();
    this.updateDiceButton();
    
    return result;
  }

  useItem(itemKey) {
    if (this.itemsUsedThisTurn >= 3) return "Maximum items used this turn";
    
    const item = this.items[itemKey];
    if (!item) return "Item not found";
    
    let result;
    if (item.minRoll && this.currentDiceRoll) {
      result = item.effect(this, this.currentDiceRoll);
    } else {
      result = item.effect(this);
    }
    
    this.itemsUsedThisTurn++;
    this.selectedItem = null;
    this.updateItemsUI();
    this.updateDiceButton();
    
    return result;
  }

  // Helper methods for magical effects
  findKing(player) {
    const kingSymbol = player === "white" ? "♔" : "♚";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] === kingSymbol) {
          return { row, col, piece: kingSymbol };
        }
      }
    }
    return null;
  }

  findEnemyPieces() {
    const pieces = [];
    const enemySymbols = this.currentPlayer === "white" ? 
      ["♜", "♞", "♝", "♛", "♚", "♟"] : 
      ["♖", "♘", "♗", "♕", "♔", "♙"];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (enemySymbols.includes(piece)) {
          pieces.push({ row, col, piece });
        }
      }
    }
    return pieces;
  }

  findOwnPieces() {
    const pieces = [];
    const ownSymbols = this.currentPlayer === "white" ? 
      ["♖", "♘", "♗", "♕", "♔", "♙"] : 
      ["♜", "♞", "♝", "♛", "♚", "♟"];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (ownSymbols.includes(piece)) {
          pieces.push({ row, col, piece });
        }
      }
    }
    return pieces;
  }

  findEmptySpot() {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (!this.board[row][col] && !this.isSquareFrozen(row, col) && !this.isSquareBarrier(row, col)) {
          return { row, col };
        }
      }
    }
    return null;
  }

  capturePieceAt(row, col) {
    const piece = this.board[row][col];
    if (piece) {
      this.capturedPieces[this.currentPlayer].push(piece);
      this.board[row][col] = "";
    }
  }

  capturePieceTemp(piece, turns) {
    this.capturePieceAt(piece.row, piece.col);
  }

  getFireballImpactArea(target) {
    const squares = [target];
    const { row, col } = target;
    
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          squares.push({ row: newRow, col: newCol });
        }
      }
    }
    return squares;
  }

  getPieceAt(row, col) {
    return this.board[row][col];
  }

  isSquareFrozen(row, col) {
    return this.frozenSquares.some(square => square.row === row && square.col === col);
  }

  isSquareBarrier(row, col) {
    return this.barriers.some(barrier => barrier.row === row && barrier.col === col);
  }

  endTurnManually() {
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
    this.spellsUsedThisTurn = 0;
    this.itemsUsedThisTurn = 0;
    this.currentDiceRoll = null;
    this.hasRolledThisTurn = false; // Reset dice roll for new turn
    this.selectedSpell = null;
    this.selectedItem = null;
    this.updateUI();
    this.updateDiceButton();
  }

  reverseMove() {
    if (this.moveHistory.length < 2) return;
    
    const lastMove = this.moveHistory.pop();
    const secondLastMove = this.moveHistory.pop();
    
    this.board[lastMove.from[0]][lastMove.from[1]] = lastMove.piece;
    this.board[lastMove.to[0]][lastMove.to[1]] = lastMove.captured;
    
    this.board[secondLastMove.from[0]][secondLastMove.from[1]] = secondLastMove.piece;
    this.board[secondLastMove.to[0]][secondLastMove.to[1]] = secondLastMove.captured;
    
    this.updateBoardDisplay();
  }

  enableNonKingSpells() {
    return "Non-king spells enabled";
  }

  updateBoardDisplay() {
    const squares = document.querySelectorAll(".square");
    squares.forEach((square) => {
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      const piece = this.board[row][col];

      square.innerHTML = "";
      square.classList.remove("selected", "valid-move", "in-check", "frozen", "barrier");

      if (this.isSquareFrozen(row, col)) {
        square.classList.add("frozen");
      }
      if (this.isSquareBarrier(row, col)) {
        square.classList.add("barrier");
      }

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

  isWhitePiece(piece) {
    return ["♔", "♕", "♖", "♗", "♘", "♙"].includes(piece);
  }

  handleSquareClick(row, col) {
    if (this.gameStatus !== "active" && this.gameStatus !== "check") return;

    if (this.selectedSquare) {
      if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
        this.selectedSquare = null;
        this.clearHighlights();
      } else if (this.isValidMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
        this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
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

  highlightSquare(row, col) {
    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    square.classList.add("selected");
  }

  highlightValidMoves(row, col) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.isValidMove(row, col, r, c)) {
          const square = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
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

    if (this.isSquareFrozen(toRow, toCol) || this.isSquareBarrier(toRow, toCol)) return false;

    const targetPiece = this.board[toRow][toCol];
    if (targetPiece && this.isPieceOwnedByCurrentPlayer(targetPiece)) return false;

    if (!this.isPieceMoveValid(piece, fromRow, fromCol, toRow, toCol)) return false;

    return !this.wouldMoveLeaveKingInCheck(fromRow, fromCol, toRow, toCol);
  }

  isPieceMoveValid(piece, fromRow, fromCol, toRow, toCol) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    if ((piece === "♔" || piece === "♚") && this.playerState[this.currentPlayer].kingCanMoveLikeQueen) {
      return this.isRookMoveValid(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) ||
             this.isBishopMoveValid(fromRow, fromCol, toRow, toCol, absRowDiff, absColDiff);
    }

    switch (piece.toLowerCase()) {
      case "♙":
      case "♟":
        return this.isPawnMoveValid(piece, fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
      case "♖":
      case "♜":
        return this.isRookMoveValid(fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
      case "♗":
      case "♝":
        return this.isBishopMoveValid(fromRow, fromCol, toRow, toCol, absRowDiff, absColDiff);
      case "♕":
      case "♛":
        return this.isRookMoveValid(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) ||
               this.isBishopMoveValid(fromRow, fromCol, toRow, toCol, absRowDiff, absColDiff);
      case "♔":
      case "♚":
        return this.isKingMoveValid(piece, fromRow, fromCol, toRow, toCol, absRowDiff, absColDiff);
      case "♘":
      case "♞":
        return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);
      default:
        return false;
    }
  }

  isPawnMoveValid(piece, fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    const isWhite = this.isWhitePiece(piece);
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    if (colDiff === 0 && !this.board[toRow][toCol]) {
      if (rowDiff === direction) return true;
      if (fromRow === startRow && rowDiff === 2 * direction) return true;
    }

    if (Math.abs(colDiff) === 1 && rowDiff === direction) {
      if (this.board[toRow][toCol]) return true;
      if (this.enPassantTarget && toRow === this.enPassantTarget.row && toCol === this.enPassantTarget.col) {
        return true;
      }
    }

    return false;
  }

  isRookMoveValid(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    if (rowDiff !== 0 && colDiff !== 0) return false;
    return this.isPathClear(fromRow, fromCol, toRow, toCol);
  }

  isBishopMoveValid(fromRow, fromCol, toRow, toCol, absRowDiff, absColDiff) {
    if (absRowDiff !== absColDiff) return false;
    return this.isPathClear(fromRow, fromCol, toRow, toCol);
  }

  isKingMoveValid(piece, fromRow, fromCol, toRow, toCol, absRowDiff, absColDiff) {
    if (absRowDiff <= 1 && absColDiff <= 1) return true;

    if (absRowDiff === 0 && absColDiff === 2) {
      return this.canCastle(piece, fromRow, fromCol, toRow, toCol);
    }

    return false;
  }

  isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.board[currentRow][currentCol]) return false;
      if (this.isSquareFrozen(currentRow, currentCol) || this.isSquareBarrier(currentRow, currentCol)) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }

  canCastle(piece, fromRow, fromCol, toRow, toCol) {
    const isWhite = this.isWhitePiece(piece);
    const color = isWhite ? "white" : "black";
    const isKingside = toCol > fromCol;

    if (!this.castlingRights[color][isKingside ? "kingside" : "queenside"]) return false;
    if (this.isSquareUnderAttack(fromRow, fromCol, color)) return false;

    const step = isKingside ? 1 : -1;
    for (let col = fromCol + step; col !== toCol + step; col += step) {
      if (this.board[fromRow][col]) return false;
      if (this.isSquareUnderAttack(fromRow, col, color)) return false;
      if (this.isSquareFrozen(fromRow, col) || this.isSquareBarrier(fromRow, col)) return false;
    }

    return true;
  }

  makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];

    if ((piece === "♙" || piece === "♟") && !capturedPiece && Math.abs(toCol - fromCol) === 1) {
      this.board[fromRow][toCol] = "";
    }

    if ((piece === "♔" || piece === "♚") && Math.abs(toCol - fromCol) === 2) {
      const isKingside = toCol > fromCol;
      const rookFromCol = isKingside ? 7 : 0;
      const rookToCol = isKingside ? 5 : 3;
      this.board[fromRow][rookToCol] = this.board[fromRow][rookFromCol];
      this.board[fromRow][rookFromCol] = "";
    }

    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = "";

    if (piece === "♔" || piece === "♚") {
      this.kingPositions[this.currentPlayer] = [toRow, toCol];
    }

    if ((piece === "♙" && toRow === 0) || (piece === "♟" && toRow === 7)) {
      this.board[toRow][toCol] = this.isWhitePiece(piece) ? "♕" : "♛";
    }

    this.enPassantTarget = null;
    if ((piece === "♙" || piece === "♟") && Math.abs(toRow - fromRow) === 2) {
      this.enPassantTarget = { row: (fromRow + toRow) / 2, col: toCol };
    }

    this.updateCastlingRights(piece, fromRow, fromCol, toRow, toCol);

    this.moveHistory.push({
      from: [fromRow, fromCol],
      to: [toRow, toCol],
      piece,
      captured: capturedPiece,
    });

    // Reset turn state and switch players
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
    this.spellsUsedThisTurn = 0;
    this.itemsUsedThisTurn = 0;
    this.currentDiceRoll = null;
    this.hasRolledThisTurn = false; // Reset dice roll for new turn
    this.selectedSpell = null;
    this.selectedItem = null;

    this.checkGameStatus();
    this.updateBoardDisplay();
    this.updateUI();
    this.updateDiceButton();
  }

  updateCastlingRights(piece, fromRow, fromCol, toRow, toCol) {
    if (piece === "♔") {
      this.castlingRights.white.kingside = false;
      this.castlingRights.white.queenside = false;
    } else if (piece === "♚") {
      this.castlingRights.black.kingside = false;
      this.castlingRights.black.queenside = false;
    }

    if (piece === "♖" || (fromRow === 7 && fromCol === 0)) this.castlingRights.white.queenside = false;
    if (piece === "♖" || (fromRow === 7 && fromCol === 7)) this.castlingRights.white.kingside = false;
    if (piece === "♜" || (fromRow === 0 && fromCol === 0)) this.castlingRights.black.queenside = false;
    if (piece === "♜" || (fromRow === 0 && fromCol === 7)) this.castlingRights.black.kingside = false;

    if (toRow === 7 && toCol === 0) this.castlingRights.white.queenside = false;
    if (toRow === 7 && toCol === 7) this.castlingRights.white.kingside = false;
    if (toRow === 0 && toCol === 0) this.castlingRights.black.queenside = false;
    if (toRow === 0 && toCol === 7) this.castlingRights.black.kingside = false;
  }

  wouldMoveLeaveKingInCheck(fromRow, fromCol, toRow, toCol) {
    const originalPiece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];
    const originalKingPos = [...this.kingPositions[this.currentPlayer]];
    
    this.board[toRow][toCol] = originalPiece;
    this.board[fromRow][fromCol] = "";

    if (originalPiece === "♔" || originalPiece === "♚") {
      this.kingPositions[this.currentPlayer] = [toRow, toCol];
    }

    const kingPos = this.kingPositions[this.currentPlayer];
    const inCheck = this.isSquareUnderAttack(kingPos[0], kingPos[1], this.currentPlayer);

    this.board[fromRow][fromCol] = originalPiece;
    this.board[toRow][toCol] = capturedPiece;
    this.kingPositions[this.currentPlayer] = originalKingPos;

    return inCheck;
  }

  isSquareUnderAttack(row, col, defendingColor) {
    const attackingColor = defendingColor === "white" ? "black" : "white";

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece) {
          const pieceColor = this.isWhitePiece(piece) ? "white" : "black";
          if (pieceColor === attackingColor) {
            if (this.canPieceAttackSquare(piece, r, c, row, col)) {
              return true;
            }
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
        return rowDiff === -1 && absColDiff === 1;
      case "♟":
        return rowDiff === 1 && absColDiff === 1;
      case "♖":
      case "♜":
        return (rowDiff === 0 || colDiff === 0) && this.isPathClear(fromRow, fromCol, toRow, toCol);
      case "♗":
      case "♝":
        return absRowDiff === absColDiff && this.isPathClear(fromRow, fromCol, toRow, toCol);
      case "♕":
      case "♛":
        return (rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) && this.isPathClear(fromRow, fromCol, toRow, toCol);
      case "♔":
      case "♚":
        return absRowDiff <= 1 && absColDiff <= 1;
      case "♘":
      case "♞":
        return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);
      default:
        return false;
    }
  }

  checkGameStatus() {
    const kingPos = this.kingPositions[this.currentPlayer];
    const inCheck = this.isSquareUnderAttack(kingPos[0], kingPos[1], this.currentPlayer);

    if (this.hasValidMoves()) {
      this.gameStatus = inCheck ? "check" : "active";
    } else {
      this.gameStatus = inCheck ? "checkmate" : "stalemate";
    }
  }

  hasValidMoves() {
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = this.board[fromRow][fromCol];
        if (piece && this.isPieceOwnedByCurrentPlayer(piece)) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
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
    const statusElement = document.getElementById("gameStatus");

    if (currentPlayerElement) {
      currentPlayerElement.textContent = this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
    }

    if (statusElement) {
      switch (this.gameStatus) {
        case "check":
          statusElement.textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} is in check!`;
          statusElement.className = "game-status check";
          break;
        case "checkmate":
          statusElement.textContent = `Checkmate! ${this.currentPlayer === "white" ? "Black" : "White"} wins!`;
          statusElement.className = "game-status checkmate";
          break;
        case "stalemate":
          statusElement.textContent = "Stalemate! It's a draw!";
          statusElement.className = "game-status stalemate";
          break;
        default:
          statusElement.textContent = "Game in progress";
          statusElement.className = "game-status";
      }
    }

    this.updateSpellsUI();
    this.updateItemsUI();
  }

  resetGame() {
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
    
    this.frozenSquares = [];
    this.barriers = [];
    this.capturedPieces = { white: [], black: [] };
    this.currentDiceRoll = null;
    this.hasRolledThisTurn = false; // Reset dice roll state
    this.spellsUsedThisTurn = 0;
    this.itemsUsedThisTurn = 0;
    this.selectedSpell = null;
    this.selectedItem = null;
    this.playerState = {
      white: { rageTurns: 0, extraMove: false, kingCanMoveLikeQueen: false, freezeDuration: 0 },
      black: { rageTurns: 0, extraMove: false, kingCanMoveLikeQueen: false, freezeDuration: 0 }
    };

    this.clearHighlights();
    this.updateBoardDisplay();
    this.updateUI();
    this.updateDiceButton();
    
    const diceResult = document.getElementById("diceResult");
    if (diceResult) diceResult.textContent = "";
  }
}

// Initialize game when page loads
let game;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeMagicalChessGame);
} else {
  initializeMagicalChessGame();
}

function initializeMagicalChessGame() {
  setTimeout(() => {
    game = new MagicalChessGame();
  }, 100);
}