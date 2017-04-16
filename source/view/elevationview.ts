import { ElevationBroadcaster } from "../elevation/elevationbroadcaster";

/**
 * Take a event dispatcher that dispatches "overpoint" events
 * and returns a point. Display the point
 */
export class ElevationView {

   constructor(elevationBroadcaster: THREE.EventDispatcher, element: HTMLElement, projectionFn: Function =  projectionDefault) {
      let timer;
      let raycaster = new THREE.Raycaster();
      let down, sx, sy;

      elevationBroadcaster.addEventListener("overpoint", event => {
         let point = event.point;
         let transformed = projectionFn(point);

         element.innerHTML = "Approx Elev.: " + Math.round(transformed.z) +
                              "m Lng: " + transformed.x.toFixed(4) +
                              "° Lat: " + transformed.y.toFixed(4) +
                              "°";

         clearTimeout(timer);
         timer = setTimeout(() => {
            element.innerHTML = "";
         }, 4000);
      });
   }
}

function projectionDefault(point) {
   return point;
}