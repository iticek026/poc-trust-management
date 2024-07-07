abstract class EnvironmentObject {
  dimensions: Coordinates[];
  type: EnvironmentObjectType;
  collapsible: boolean;

  constructor(
    dimensions: Coordinates[],
    type: EnvironmentObjectType,
    collapsible: boolean
  ) {
    this.dimensions = dimensions;
    this.type = type;
    this.collapsible = collapsible;
  }
}
