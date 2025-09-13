// Turn Management System for Magical Chess
class TurnManager {
  constructor() {
    this.turnNumber = 1;
    this.currentPlayer = "white";
    this.turnStartTime = Date.now();
    this.actionsThisTurn = 0;
    this.maxActionsPerTurn = 3;
    this.turnHistory = [];
  }

  startNewTurn() {
    this.turnNumber++;
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
    this.turnStartTime = Date.now();
    this.actionsThisTurn = 0;
    this.recordTurnStart();
  }

  recordAction(actionType) {
    this.actionsThisTurn++;
    this.turnHistory.push({
      turn: this.turnNumber,
      player: this.currentPlayer,
      action: actionType,
      timestamp: Date.now()
    });
  }

  canPerformAction() {
    return this.actionsThisTurn < this.maxActionsPerTurn;
  }

  getTurnInfo() {
    return {
      turnNumber: this.turnNumber,
      currentPlayer: this.currentPlayer,
      actionsUsed: this.actionsThisTurn,
      actionsRemaining: this.maxActionsPerTurn - this.actionsThisTurn,
      turnDuration: Date.now() - this.turnStartTime
    };
  }

  recordTurnStart() {
    this.turnHistory.push({
      turn: this.turnNumber,
      player: this.currentPlayer,
      action: 'turn_start',
      timestamp: this.turnStartTime
    });
  }

  getTurnHistory() {
    return this.turnHistory;
  }

  reset() {
    this.turnNumber = 1;
    this.currentPlayer = "white";
    this.turnStartTime = Date.now();
    this.actionsThisTurn = 0;
    this.turnHistory = [];
  }
}
