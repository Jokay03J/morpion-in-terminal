#!/usr/bin/env node
import { createInterface } from "readline";

class Game {
  constructor() {
    this.cells = new Array(9).fill("_");
    this.play = true;
    this.turn = "X";
    this.count = 0;
    this.matchResult = "";
  }

  checkWin() {
    const winPattern = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [6, 4, 2],
    ];

    for (
      let indexPatterns = 0;
      indexPatterns < winPattern.length;
      indexPatterns++
    ) {
      const patterns = winPattern[indexPatterns];
      let patternsIsValid = true;
      for (
        let indexPattern = 0;
        indexPattern < patterns.length;
        indexPattern++
      ) {
        const pattern = patterns[indexPattern];
        if (this.cells[pattern] !== this.turn) {
          patternsIsValid = false;
        }
      }
      if (patternsIsValid) {
        return true;
      }
    }

    return false;
  }

  put(index) {
    if (this.cells[index] !== "_") {
      throw new Error("Tu as déjà jouer ici !");
    }
    this.cells[index] = this.turn;
    const isWin = this.checkWin();
    if (isWin) {
      this.play = false;
      this.matchResult = this.turn;
    }
    this.turn = this.turn === "X" ? "O" : "X";
    this.count++;
    if (this.count >= this.cells.length) {
      this.play = false;
      this.matchResult = "Raw";
    }
  }

  reset() {
    this.cells = new Array(9).fill("_");
    this.play = true;
    this.turn = "X";
    this.count = 0;
    this.matchResult = "";
  }
}

class Graphic {
  constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  static clear() {
    console.clear();
  }

  write(str) {
    this.rl.write(str);
  }

  renderTable(cells) {
    let result = "|%||0||1||2|\n";
    for (let index = 0; index < cells.length; index++) {
      const cell = cells[index];
      if (index % 3 === 0) {
        result += `|${index / 3}||${cell}|`;
      } else {
        result += `|${cell}|`;
      }
      if (index === 2 || index === 5 || index === 8) {
        result += "\n";
      }
    }
    this.rl.write(result + "\n");
  }

  question(str, callback) {
    this.rl.question(str, callback);
  }
}

const game = new Game();
const render = new Graphic();

render.renderTable(game.cells);
main();

function main() {
  if (!game.play) {
    render.write(`Partie terminer !\nResultat: ${game.matchResult}\n`);
    process.exit(0);
  }
  render.question(
    `Vous devez choisir l'index de la case !\nC'est aux tour de ${game.turn}\n> `,
    (answer) => {
      if (answer === "q") {
        process.exit(0);
      }
      if (answer === "reset") {
        game.reset();
        return main();
      }

      if (!answer.match(/[0-8]/gm)) {
        render.write("Format incorrect !\n");
        return main();
      }

      try {
        Graphic.clear();
        game.put(parseInt(answer));
        render.renderTable(game.cells);
      } catch (error) {
        render.write(error.message + "\n");
        render.renderTable(game.cells);
        return main();
      }

      main();
    }
  );
}
