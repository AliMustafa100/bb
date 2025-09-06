# Boards and Battles

A magical chess game where players can cast spells and use special items to gain an advantage in battle!

## 🎮 Features

- **Classic Chess Rules**: Full chess implementation with all standard pieces and moves
- **Magical Spells**: 7 unique spells that can be cast by kings
- **Special Items**: 11 powerful items that can be used by any piece
- **Dice-Based Mechanics**: Spells and items require dice rolls to succeed
- **Web Interface**: Beautiful, responsive web UI
- **Console Engine**: Full game engine that can run in Node.js

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Python 3 (for web server)

### Installation
1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Game

#### Web Interface (Recommended)
```bash
npm run web
# or
npm run dev
```
Then open your browser to: `http://localhost:8000`

#### Console Version
```bash
npm start
```

#### Run Tests
```bash
npm test
```

## 🎯 How to Play

### Basic Chess Rules
- Move pieces according to standard chess rules
- Capture the opponent's king to win
- Check and checkmate work as in regular chess

### Spells System
- **Only kings can cast spells**
- Each player starts with 3 spells per game
- Spells require dice rolls (d20) to succeed
- Failed spells still consume the spell slot

### Items System
- **Any piece can use items**
- Each player starts with 3 items per game
- Some items require dice rolls to succeed
- Items provide tactical advantages

## 📜 Spells

| Spell | Min Roll | Effect |
|-------|----------|---------|
| **Thunder Spell** | 10+ | Cast lightning in any direction, captures first enemy piece hit |
| **Rage** | 5+ | Next 2 turns: roll twice, use higher result |
| **Freeze** | 10+ | Freeze 4 squares for 1 move each |
| **Necromancy** | 15+ | Revive a captured piece |
| **Agility** | 11+ | Make 2 moves this turn |
| **Fireball** | 15+ | Cast fireball that captures target and adjacent pieces |
| **Queen's Soul** | 17+ | King moves like queen for 1 turn |

## 🛡️ Items

| Item | Min Roll | Effect |
|------|----------|---------|
| **Knife** | - | Stab adjacent piece (can target your own) |
| **Magic Wand** | - | Allow non-king pieces to cast spells |
| **Barrier** | - | Place barrier on empty square |
| **Wontan** | 17+ | Smite and capture opponent piece (not king/queen) |
| **Ladder** | - | Allow pieces to jump over ladder-equipped piece |
| **Fishing Net** | - | Temporarily capture piece for 3 turns |
| **Invisibility Potion** | 13+ | Make piece invisible (requires perception check to capture) |
| **Time Machine** | - | Undo last move for both players |
| **Skip** | - | End turn without moving |
| **Lucky Coin** | - | Flip coin for reward/punishment |
| **Mana Potion** | - | Replenish 1 spell |

## 🎲 Dice Mechanics

- **d20 System**: All rolls use a 20-sided die
- **Critical Success**: Rolling a 20 often provides enhanced effects
- **Failure**: Rolling below the minimum still consumes the spell/item

## 🏗️ Project Structure

```
boards-and-battles/
├── src/
│   ├── game/           # Core game logic
│   │   └── index.js    # Main game engine
│   ├── spells/         # Spell definitions
│   │   └── spells.js   # All spell effects
│   └── items/          # Item definitions
│       └── items.js    # All item effects
├── app/                # Web interface
│   ├── app.html        # Main HTML file
│   ├── app.css         # Styling
│   └── app.js          # Web game logic
├── test.js             # Simple test suite
├── package.json        # Project configuration
└── README.md          # This file
```

## 🎨 Web Interface Features

- **Responsive Design**: Works on desktop and mobile
- **Visual Feedback**: Highlights selected pieces and valid moves
- **Spell/Item UI**: Easy-to-use buttons for all spells and items
- **Game Status**: Clear indication of check, checkmate, etc.
- **Modern Styling**: Beautiful gradient backgrounds and animations

## 🔧 Development

### Adding New Spells
1. Edit `src/spells/spells.js`
2. Add new spell object with `name`, `description`, `condition`, and `effect`
3. Update the web interface in `app/app.js`

### Adding New Items
1. Edit `src/items/items.js`
2. Add new item object with `name`, `description`, and `effect`
3. Update the web interface in `app/app.js`

### Running Tests
```bash
npm test
```

## 🐛 Troubleshooting

### Web Interface Not Loading
- Make sure Python 3 is installed
- Check if port 8000 is available
- Try a different port: `python3 -m http.server 8080 --directory app`

### Console Version Issues
- Ensure Node.js is installed (v14+)
- Check that all dependencies are installed: `npm install`

### Spell/Item Not Working
- Verify the piece type (spells only work on kings)
- Check if you have spells/items remaining
- Ensure dice roll meets minimum requirement

## 📞 Support

For questions or issues:
- Email: mohammadali7477@gmail.com
- Check the game rules in the web interface
- Review the console output for error messages

## 🎉 Enjoy the Game!

Boards and Battles combines the strategic depth of chess with the excitement of magical combat. Use your spells and items wisely to outmaneuver your opponent and claim victory!

---

*May your dice roll high and your strategies be cunning!*
