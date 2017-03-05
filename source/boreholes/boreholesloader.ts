declare var Elevation;

// Given a bbox, return a 2d grid with the same x, y coordinates plus a z-coordinate as returned by the 1d TerrainLoader.
export class BoreholesLoader {
   private childLoader;

   constructor(public options: any) {
   }

   load(): Promise<any[]> {
      let options = this.options;
      let location = this.options.template.replace("${bbox}", this.options.bbox.join(","));
      let loader = new Elevation.HttpTextLoader(location);
      return loader.load().then(str => JSON.parse(str));
   }
}
