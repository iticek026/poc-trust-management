// Define collision categories
const CATEGORY_SENSOR = 0x0001; // 1
const CATEGORY_COLLAPSIBLE = 0x0002; // 2
const CATEGORY_BORDER = 0x0003; // 2
const CATEGORY_DETECTABLE = 0x0004; // 4
const CATEGORY_UNDETECTABLE = 0x0005; // 5
const CELL_SIZE = 30;
const SCALE_MAP = 0.5;

const OBJECT_WIDTH_IN_TILES = 3;
const OBJECT_HEIGTH_IN_TILES = 3;

export {
  CATEGORY_SENSOR,
  CATEGORY_COLLAPSIBLE,
  CATEGORY_DETECTABLE,
  CATEGORY_BORDER,
  CELL_SIZE,
  SCALE_MAP,
  OBJECT_WIDTH_IN_TILES,
  OBJECT_HEIGTH_IN_TILES,
  CATEGORY_UNDETECTABLE,
};
