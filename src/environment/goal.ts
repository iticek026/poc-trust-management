class Goal extends EnvironmentObject {
  constructor(dimensions: Coordinates[]) {
    super(dimensions, EnvironmentObjectType.COLLECTABLE, true);
  }
}
