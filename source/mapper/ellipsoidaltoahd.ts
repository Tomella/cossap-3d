/**
 * A very rough conversion from GDA94 ellipsoidal to
 * Australian Height Datum for large area views. It's aim is speed, not accuracy.
 * It's done by eyeballing the well heads on the map and is close enough.
 */
export class EllipsoidalToAhd {
   static zeroLat = -3123471;  // -27;
   static zeroLng = 14471533;  // 130;
   static rampLat = 0.0000285; // 3.1 Just  a rough approximation
   static rampLng = 0.0000182; // 2;

   toAhd(lng, lat, gda94Elev) {
      let deltaLat = lat -  EllipsoidalToAhd.zeroLat;
      let deltaLng = lng -  EllipsoidalToAhd.zeroLng;
      let dx = deltaLng * EllipsoidalToAhd.rampLng;
      let dy = deltaLat * EllipsoidalToAhd.rampLat;

      let elevation = gda94Elev - deltaLat * EllipsoidalToAhd.rampLat - deltaLng * EllipsoidalToAhd.rampLng - 10;
      return elevation;
   }

   async pointsToAhd(points) {
      return new Promise((resolve, reject) => {
         resolve(points.map(point => this.toAhd(point[0], point[1], point[2])));
      });
   }
}