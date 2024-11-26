import { Composite, Vector, Body } from "matter-js";
import { Coordinates } from "../../environment/coordinates";

export interface EntityInterface {
  /**
   * Gets the unique ID of the entity.
   *
   * @returns The entity ID.
   */
  getId(): number;

  /**
   * Gets the label assigned to the entity, if any.
   *
   * @returns The entity's label or undefined if not set.
   */
  getLabel(): string | undefined;

  /**
   * Stops the entity's movement by halting its physics body.
   */
  stopBody(): void;

  /**
   * Retrieves the Matter.js body of the entity.
   *
   * @returns The entity's Matter.js body.
   */
  getBody(): Body;

  /**
   * Gets the entity's initial body or composite configuration.
   *
   * @returns The initial body or composite.
   */
  getInitBody(): Body | Composite;

  /**
   * Retrieves the current position of the entity.
   *
   * @returns The entity's position as a Matter.Vector.
   */
  getPosition(): Matter.Vector;

  /**
   * Sets a new position for the entity.
   *
   * @param position - The new coordinates or vector for the position.
   */
  setPosition(position: Coordinates | Vector): void;
}
