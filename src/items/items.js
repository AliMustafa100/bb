const ITEMS = {
  Knife: {
    name: "Knife",
    description: "Stab a piece adjacent to the one using the knife. You can use this to capture your own. After this item is used, your turn is over.",
    effect: (game, piece) => {
      if (!piece) {
        return "No piece selected.";
      }
      if (game.isPieceAdjacent(piece)) {
        game.capturePiece(piece);
        game.endTurn();
        return "Stabbed";
      }
      return "No adjacent piece to stab.";
    }
  },

  Magic_Wand: {
    name: "Magic Wand",
    description: "Lets pieces other than the king use spells. Lasts until you use a spell.",
    effect: (game, piece) => {
      game.enableNonKingSpells();
      return "Spells Activated";
    }
  },
  
  Barrier: {
    name: "Barrier",
    description: "Place a barrier that covers one square. No pieces can move on or through the barrier.",
    effect: (game, piece, position) => {
      if (!position) {
        return "No position selected for barrier.";
      }
      if (game.placeBarrier(position)) {
        return "Barrier placed.";
      } else {
        return "Cannot place barrier at that position.";
      }
    }
  },

  Wontan: {
    name: "Wontan",
    description: "Smite an opponent's piece and capture it. Excludes king and queen.",
    condition: "Requires a 17 or higher.",
    effect: (game, piece, roll) => {
      if (!piece) {
        return "No piece selected";
      }
      
      if (piece.type === 'king' || piece.type === 'queen') {
        return "Cannot smite these pieces";
      }
      
      if (roll < 17) {
        return "Roll too low";
      }
      
      if (roll >= 17) {
        game.capturePiece(piece);
        return "Piece smited";
      }
    }
  },
  
  Ladder: {
    name: "Ladder",
    description: "Allows you to move your pieces over the piece with the ladder. Only you can use the ladder. You can only place the ladder on your own pieces.",
    effect: (game, piece) => {
      if (!piece) {
        return "No piece selected";
      }
      if (game.giveLadder(piece)) {
        return "Piece using ladder";
      } else {
        return "Cannot use ladder";
      }
    }
  },
  
  Fishing_Net: {
    name: "Fishing Net",
    description: "Temporarily capture a piece from the board for 3 turns, then return it to the spot it was taken from. If an opponent's piece is on the square that it returns to, it captures that piece. If your own piece is on its square, the piece does not return until the square is open or occupied by an opponent's piece. King is uncaptureable.",
    effect: (game, piece) => {
      if (!piece) {
        return "No piece selected";
      }
      if (piece.type === 'king') {
        return "Not able to capture king";
      } else {
        game.capturePieceTemp(piece, 3);
        return "Piece temporarily captured";
      }
    }
  },
  
  Invisibility_Potion: {
    name: "Invisibility Potion",
    description: "Make any one of your pieces 'invisible'. A piece has to perform a perception check before trying to capture the invisible piece.",
    condition: "Requires a 13 or higher.",
    effect: (game, piece, roll) => {
      if (!piece) {
        return "No piece selected";
      }
      if (roll >= 13) {
        game.makeInvisible(piece);
        return "Piece is invisible";
      } else {
        return "Roll too low";
      }
    }
  },
  
  Time_Machine: {
    name: "Time Machine",
    description: "Redo your previous move. Both players undo their most recent move, then you make a new move.",
    effect: (game) => {
      game.reverseMove();
      return "Moves undone";
    }
  },
  
  Skip: {
    name: "Skip",
    description: "End your turn without making a move.",
    effect: (game) => {
      game.endTurn();
      return "Move skipped";
    }
  },
  
  Lucky_Coin: {
    name: "Lucky Coin",
    description: "You and your opponent decide on a reward and a punishment, then flip a coin to decide which one happens.",
    effect: (game) => {
      // TODO: Implement coin flip logic
      return "Coin flip result: ???";
    }
  },
  
  Mana_Potion: {
    name: "Mana Potion",
    description: "Completely replenish 1 spell.",
    effect: (game) => {
      game.returnMana();
      return "Spell replenished.";
    }
  }
};

module.exports = { ITEMS };
