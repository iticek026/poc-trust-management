import { CELL_SIZE } from "../../utils/consts";
import { EnvironmentGrid } from "../environment/environmentGrid";
import { EntityType } from "./interfaces/interfaces";

export class GridVisualizer {
  private grid: EnvironmentGrid;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private cellSize: number;

  constructor(grid: EnvironmentGrid, canvasId: string, cellSize: number = CELL_SIZE) {
    this.grid = grid;
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.adjustCanvasSize(this.canvas, grid.getWidth(), grid.getHeight(), cellSize);
    this.context = this.canvas.getContext("2d")!;
    this.cellSize = cellSize;
  }

  private cellColor(entity: EntityType): string {
    switch (entity) {
      case EntityType.ROBOT:
        return "green";
      case EntityType.OBSTACLE:
        return "black";
      default:
        return "white";
    }
  }

  private adjustCanvasSize(canvas: HTMLCanvasElement, gridWidth: number, gridHeight: number, cellSize: number) {
    canvas.width = gridWidth * cellSize;
    canvas.height = gridHeight * cellSize;
  }

  public drawGrid(): void {
    const gridData = this.grid.getGrid();
    const numRows = gridData.length;
    const numCols = gridData[0].length;

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const color = this.cellColor(gridData[row][col]);
        this.drawCell(col, row, color);
      }
    }

    this.drawGridLines(numRows, numCols);
  }

  private drawCell(x: number, y: number, color: string): void {
    this.context.fillStyle = color;
    this.context.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
  }

  private drawGridLines(numRows: number, numCols: number): void {
    this.context.strokeStyle = "gray";
    this.context.lineWidth = 0.5;

    for (let row = 0; row < numRows; row++) {
      this.context.beginPath();
      this.context.moveTo(0, row * this.cellSize);
      this.context.lineTo(numCols * this.cellSize, row * this.cellSize);
      this.context.stroke();
    }

    for (let col = 0; col < numCols; col++) {
      this.context.beginPath();
      this.context.moveTo(col * this.cellSize, 0);
      this.context.lineTo(col * this.cellSize, numRows * this.cellSize);
      this.context.stroke();
    }
  }
}
