const SPELLS = {
  Thunder_Spell: {
    name: "Thunder Spell",
    description: "Cast a bolt of thunder from the king in any direction. The thunder captures the first piece it hits, but it stops when it hits one of your pieces. After this spell is used, your turn is over.",
    condition: "Roll a 10 or higher.",
    effect: (game) => {
      const king = game.findKing(game.currentPlayer);
      if (!king) return "King not found";

      const direction = game.selectDirection();
      let position = { row: king.row + direction.row, col: king.col + direction.col };

      while (game.isOnBoard(position)) {
        const piece = game.getPieceAt(position.row, position.col);
        if (piece) {
          if (piece.owner === game.currentPlayer) {
            return "Thunder stopped at your piece";
          } else {
            game.capturePieceAt(position.row, position.col);
            game.endTurn();
            return "Opponent's piece has been struck";
          }
        }
        position.row += direction.row;
        position.col += direction.col;
      }
      return "Thunder struck nothing";
    }
  },

  Rage: {
    name: "Rage",
    description: "On your next 2 turns, you get to roll twice, and you use the higher roll.",
    condition: "Roll a 5 or higher.",
    effect: (game) => {
      game.playerState[game.currentPlayer].rageTurns = 2;
      return "Your next 2 rolls have been boosted.";
    }
  },

  Freeze: {
    name: "Freeze",
    description: "Freezes 4 squares in a square anywhere on the board. Lasts for 1 move for each player and any piece in the frozen area cannot move.",
    condition: "Roll a 10 or higher.",
    effect: (game) => {
      const freezeArea = game.selectFreezeArea(); // You must implement this logic
      game.frozenSquares = freezeArea;
      game.playerState[game.currentPlayer].freezeDuration = 2;
      return "The area has been frozen.";
      // 
    }
  },

  Necromancy: {
    name: "Necromancy",
    description: "Bring a piece back from the dead.",
    condition: "Roll a 15 or higher.",
    effect: (game) => {
      const graveyard = game.capturedPieces[game.currentPlayer];
      if (graveyard.length === 0) return "Graveyard is empty.";
      const revived = graveyard.pop();
      const emptySpot = game.findEmptySpot(revived); // Implement this logic
      if (!emptySpot) return "No space to revive the piece.";
      game.board[emptySpot.row][emptySpot.col] = revived;
      return `${revived.name} has been revived at (${emptySpot.row}, ${emptySpot.col}).`;
    }
  },

  Agility: {
    name: "Agility",
    description: "You can make 2 moves.",
    condition: "Roll an 11 or higher.",
    effect: (game) => {
      game.playerState[game.currentPlayer].extraMove = true;
      return "You may move twice this turn.";
    }
  },

  Fireball: {
    name: "Fireball",
    description: "Cast a fireball from the king that moves in a straight line. It captures the targeted piece and all adjacent pieces within 1 square. Fireball does not affect the king.",
    condition: "Roll a 15 or higher.",
    effect: (game) => {
      const fireballTarget = game.selectTarget(); // Implement user targeting logic
      const impactedSquares = game.getFireballImpactArea(fireballTarget); // Needs implementation
      for (const square of impactedSquares) {
        const piece = game.getPieceAt(square.row, square.col);
        if (piece && piece.type !== 'king') {
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
    effect: (game) => {
      game.playerState[game.currentPlayer].kingCanMoveLikeQueen = true;
      return "The King is empowered with the Queen's soul!";
    }
  }
};

module.exports = { SPELLS };