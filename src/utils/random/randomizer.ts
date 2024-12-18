import { Coordinates } from "../../logic/environment/coordinates";
import seedrandom from "seedrandom";

function randomizeValue(range: [number, number], rng: seedrandom.PRNG): number {
  const [start, end] = range;

  if (start > end) {
    throw new Error("Invalid range");
  }

  return rng() * (end - start + 1) + start;
}

function generateTimeBasedSeed(): string {
  return Date.now().toString();
}

export class Randomizer {
  private seed: string | undefined;
  private static instance: Randomizer | undefined = undefined;
  private rng: seedrandom.PRNG = seedrandom(generateTimeBasedSeed());

  public static getInstance() {
    if (this.instance === undefined) this.instance = new Randomizer();

    return this.instance;
  }

  setSeed(seed: string | null) {
    const randomSeed = generateTimeBasedSeed();
    this.seed = seed ?? randomSeed;
    this.rng = seedrandom(this.seed);
  }

  random(): number {
    return this.rng();
  }

  getSeed() {
    return this.seed;
  }

  randomizePosition(coordinates: Coordinates, range: [number, number]): Coordinates {
    const [start, end] = range;

    if (start > end) {
      throw new Error("Invalid range");
    }

    const x = randomizeValue(range, this.rng);
    const y = randomizeValue(range, this.rng);
    return new Coordinates(coordinates.x + x, coordinates.y + y);
  }

  shouldRandomize(threshold: number): boolean {
    return this.rng() < threshold;
  }
}

export const RandomizerInstance = Randomizer.getInstance();
