export class ModelExtender {
  public assignArrayToThis(thisObject: any, key: string, Class, inheritedObject) {
    if (inheritedObject && inheritedObject[key]) {
      thisObject[key] = inheritedObject[key].map(obj => {
        return new Class(obj);
      })
    }
  }
}
