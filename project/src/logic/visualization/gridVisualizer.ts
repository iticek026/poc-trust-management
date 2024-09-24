import { CELL_SIZE } from "../../utils/consts";
import { EntityType } from "../common/interfaces/interfaces";
import { EnvironmentGrid } from "../visualization/environmentGrid";
import { ChangedCell } from "./interfaces";

export class GridVisualizer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private gridLinesCanvas!: HTMLCanvasElement;
  private gridLinesContext!: CanvasRenderingContext2D;
  private cellSize: number;

  constructor(grid: EnvironmentGrid, canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d")!;
    const cellSize = this.canvas.getAttribute("cell-size");

    this.cellSize = parseInt(this.canvas.getAttribute("cell-size") ?? `${CELL_SIZE}`, 10);

    const gridWidth = grid.getWidth();
    const gridHeight = grid.getHeight();

    this.adjustCanvasSize(this.canvas, gridWidth, gridHeight, this.cellSize);
    this.createGridLinesCanvas(gridWidth, gridHeight, this.cellSize);
    this.drawGrid();
  }

  private createGridLinesCanvas(gridWidth: number, gridHeight: number, cellSize: number) {
    this.gridLinesCanvas = document.createElement("canvas");
    this.gridLinesCanvas.width = gridWidth * cellSize;
    this.gridLinesCanvas.height = gridHeight * cellSize;
    this.gridLinesContext = this.gridLinesCanvas.getContext("2d")!;

    this.drawGridLines(this.gridLinesContext, gridWidth, gridHeight);
  }

  private adjustCanvasSize(canvas: HTMLCanvasElement, gridWidth: number, gridHeight: number, cellSize: number) {
    canvas.width = gridWidth * cellSize;
    canvas.height = gridHeight * cellSize;
  }

  private cellColor(entity: EntityType): string {
    switch (entity) {
      case EntityType.ROBOT:
        return "green";
      case EntityType.OBSTACLE:
        return "black";
      case EntityType.PATH:
        return "blue";
      case EntityType.EXPLORED:
        return "yellow";
      default:
        return "white";
    }
  }

  private drawGridLines(context: CanvasRenderingContext2D, numCols: number, numRows: number): void {
    context.strokeStyle = "gray";
    context.lineWidth = 0.5;

    for (let row = 0; row <= numRows; row++) {
      context.beginPath();
      context.moveTo(0, row * this.cellSize);
      context.lineTo(numCols * this.cellSize, row * this.cellSize);
      context.stroke();
    }

    for (let col = 0; col <= numCols; col++) {
      context.beginPath();
      context.moveTo(col * this.cellSize, 0);
      context.lineTo(col * this.cellSize, numRows * this.cellSize);
      context.stroke();
    }
  }

  private drawGrid(): void {
    this.context.drawImage(this.gridLinesCanvas, 0, 0);
  }

  public updateCells(changedCells: ChangedCell[]): void {
    for (const cell of changedCells) {
      const color = this.cellColor(cell.type);
      this.drawCell(cell.x, cell.y, color);

      this.redrawGridLinesForCell(cell.x, cell.y);
    }
  }

  private drawCell(x: number, y: number, color: string): void {
    this.context.fillStyle = color;
    this.context.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
  }

  private redrawGridLinesForCell(x: number, y: number): void {
    this.context.strokeStyle = "gray";
    this.context.lineWidth = 0.5;

    this.context.beginPath();
    this.context.moveTo(x * this.cellSize, y * this.cellSize);
    this.context.lineTo((x + 1) * this.cellSize, y * this.cellSize);
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo((x + 1) * this.cellSize, y * this.cellSize);
    this.context.lineTo((x + 1) * this.cellSize, (y + 1) * this.cellSize);
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo((x + 1) * this.cellSize, (y + 1) * this.cellSize);
    this.context.lineTo(x * this.cellSize, (y + 1) * this.cellSize);
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo(x * this.cellSize, (y + 1) * this.cellSize);
    this.context.lineTo(x * this.cellSize, y * this.cellSize);
    this.context.stroke();
  }
}
