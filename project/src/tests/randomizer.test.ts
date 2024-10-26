import { Coordinates } from "../logic/environment/coordinates";
import { Randomizer } from "../utils/random/randomizer";

describe("Randomizer", () => {
  const randomizer = new Randomizer();

  beforeEach(() => {
    randomizer.setSeed(null);
  });

  test("should return a random position", () => {
    const coordinates = { x: 0, y: 0 } as Coordinates;
    const randomizedPosition = randomizer.randomizePosition(coordinates, [0, 10]);
    expect(randomizedPosition).not.toEqual(coordinates);
  });

  test("should return a same position because of seed", () => {
    const coordinates = { x: 0, y: 0 } as Coordinates;

    randomizer.setSeed("test");
    const randomizedPosition1 = randomizer.randomizePosition(coordinates, [0, 10]);
    const randomizedPosition2 = randomizer.randomizePosition(coordinates, [0, 10]);

    const randomizer2 = new Randomizer();
    randomizer2.setSeed("test");

    const randomizedPosition3 = randomizer2.randomizePosition(coordinates, [0, 10]);
    const randomizedPosition4 = randomizer2.randomizePosition(coordinates, [0, 10]);
    expect(randomizedPosition1).toEqual(randomizedPosition3);
    expect(randomizedPosition2).toEqual(randomizedPosition4);
  });

  test("should return a same random number because of seed", () => {
    randomizer.setSeed("test");
    const number1 = randomizer.random();
    const number2 = randomizer.random();

    const randomizer2 = new Randomizer();
    randomizer2.setSeed("test");
    const number3 = randomizer2.random();
    const number4 = randomizer2.random();

    expect(number1).toEqual(number3);
    expect(number2).toEqual(number4);
  });

  test("should return a different random number", () => {
    const number1 = randomizer.random();
    const number2 = randomizer.random();
    expect(number1).not.toEqual(number2);
  });
});
