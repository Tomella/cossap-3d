import { BoreholesLoader } from "./boreholesloader";
declare var proj4;

export class BoreholesManager {
   boreholes;
   lines;

   constructor(public options: any) {

   }

   parse() {
      this.boreholes =  new BoreholesLoader(this.options);

      return this.boreholes.load().then(data => {
         if (!data || !data.length) {
            return null;
         }

         let lineMaterial = new THREE.LineBasicMaterial({color: 0xffaaaa, linewidth: 1});
         let lineGeom = new THREE.Geometry();
         let bbox = this.options.bbox;
         data.filter(hole => hole.lon > bbox[0] && hole.lon <= bbox[2] && hole.lat > bbox[1] && hole.lat <= bbox[3])
         .forEach(hole => {
            let coord = proj4("EPSG:4283", "EPSG:3857", [hole.lon, hole.lat]);
            let length = hole.length != null ? hole.length : 10;
            let elevation = hole.elevation < -90000 ? 0 : hole.elevation;

            lineGeom.vertices.push(new THREE.Vector3(
               coord[0],
               coord[1],
               elevation
            ));
            lineGeom.vertices.push(new THREE.Vector3(
               coord[0],
               coord[1],
               elevation - length
            ));
         });
         lineGeom.computeBoundingSphere();
         return this.lines = new THREE.LineSegments( lineGeom, lineMaterial );
      });
   }

   destroy() {

   }
}