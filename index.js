#!/usr/bin/env node
import chalk from "chalk";
import { createInterface } from "readline";

class Game {
  constructor() {
    this.rows = 3;
    this.columns = 3;
    this.cells = this.generate(this.columns, this.rows);
    this.play = true;
    this.turn = "X";
    this.count = 0;
    this.matchResult = "";
  }

  generate(col, row) {
    const result = [];
    for (let indexRow = 0; indexRow < row; indexRow++) {
      const row = [];
      for (let indexColumn = 0; indexColumn < col; indexColumn++) {
        row.push("_");
      }
      result.push(row);
    }

    return result;
  }

  checkWin(row, column) {
    let count = 0;
    //vertical
    for (let indexRow = 0; indexRow < this.cells.length; indexRow++) {
      count = this.cells[indexRow][column] === this.turn ? count + 1 : 0;
      if (count >= this.rows) {
        this.matchResult = this.turn;
        this.play = false;
        return true;
      }
    }

    //horizontal
    for (
      let indexColumn = 0;
      indexColumn < this.cells[row].length;
      indexColumn++
    ) {
      count = this.cells[row][indexColumn] === this.turn ? count + 1 : 0;
      if (count >= this.rows) {
        this.matchResult = this.turn;
        this.play = false;
        return true;
      }
    }

    //diagonal
    let indexRow = 0;
    let indexColumn = 0;
    while (indexRow < this.rows && indexColumn < this.columns) {
      count = this.cells[indexRow][indexColumn] === this.turn ? count + 1 : 0;
      if (count >= this.rows) {
        this.matchResult = this.turn;
        this.play = false;
        return true;
      }
      indexColumn++;
      indexRow++;
    }

    //anti-diagonal
    indexRow = 0;
    indexColumn = this.columns - 1;
    while (indexRow < this.rows && indexColumn < this.columns) {
      count = this.cells[indexRow][indexColumn] === this.turn ? count + 1 : 0;
      if (count >= this.rows) {
        this.matchResult = this.turn;
        this.play = false;
        return true;
      }
      indexColumn--;
      indexRow++;
    }
    return false;
  }

  put(row, column) {
    if (this.cells[row][column] !== "_") {
      throw new Error("Tu as déjà jouer ici !");
    }
    this.cells[row][column] = this.turn;
    const isWin = this.checkWin(row, column);
    if (isWin) {
      this.play = false;
      this.matchResult = this.turn;
    }
    this.turn = this.turn === "X" ? "O" : "X";
    this.count++;
    if (this.count >= this.rows * this.columns) {
      this.play = false;
      this.matchResult = "Raw";
    }
  }

  reset() {
    this.cells = this.generate(this.columns, this.rows);
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
    let result = `${chalk.blue("|%||0||1||2|")}\n`;
    for (let indexRows = 0; indexRows < cells.length; indexRows++) {
      const column = cells[indexRows];
      for (let indexColumns = 0; indexColumns < column.length; indexColumns++) {
        const cell = column[indexColumns];
        result += `${
          indexColumns === 0 ? chalk.cyan(`|${indexRows}|`) : ""
        }|${cell}|`;
      }
      result += "\n";
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
  let row = 0;
  let column = 0;
  render.question(
    `C'est au tour de ${game.turn}\n${chalk.cyan("Ligne(0-2)")} > `,
    (answer) => {
      if (answer === "q") {
        process.exit(0);
      }
      if (answer === "reset") {
        render.write("Le jeu à bien été réintialisé !\n");
        game.reset();
        render.renderTable(game.cells);
        return main();
      }

      row = parseInt(answer, 10);
      if (isNaN(row) || row > 2 || row < 0) {
        render.write(chalk.red("Ligne incorrect ! (0-2)\n"));
        return main();
      }

      render.question(`${chalk.blue("Colonne(0-2)")} > `, (answer) => {
        if (answer === "q") {
          process.exit(0);
        }
        if (answer === "reset") {
          game.reset();
          return main();
        }

        column = parseInt(answer, 10);
        if (isNaN(column) || column > 2 || column < 0) {
          render.write(chalk.red("Colonne incorrect ! (0-2)\n"));
          return main();
        }

        try {
          Graphic.clear();
          game.put(row, column);
          render.renderTable(game.cells);
        } catch (error) {
          render.write(error.message + "\n");
          render.write(error.stack + "\n");
          render.renderTable(game.cells);
          return main();
        }

        main();
      });
    }
  );
}
