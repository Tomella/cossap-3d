export class RocksLoader {
   constructor(public options: any) {
   }
   // summary?zoom=${zoom}&xmin=${xmin}&xmax=${xmax}&ymin=${ymin}&ymax=${ymax}
   loadSummary(): Promise<GeoJSON.FeatureCollection<GeoJSON.Point>> {
      let options = this.options;
      let bbox = options.bbox;

      let location = this.options.template
                     .replace("${xmin}", bbox[0])
                     .replace("${ymin}", bbox[1])
                     .replace("${xmax}", bbox[2])
                     .replace("${ymax}", bbox[3])
                     .replace("${zoom}", options.zoom);
      let loader = new Elevation.HttpTextLoader(location);
      return loader.load().then(str => JSON.parse(str));
   }
}