export class RocksParticles {
   private _count: number;
   private _points: THREE.Points;
   private geometry: THREE.BufferGeometry;
   private positions: Float32Array;
   private colors: Float32Array;
   private nextIndex;

   constructor(public extent: GeoJSON.FeatureCollection<GeoJSON.Point>, public zoom) {
      this.prepareCloud();
   }

   private prepareCloud() {
      this.nextIndex = 0;
      let particles = this.count;
      let geometry = this.geometry = new THREE.BufferGeometry();
      this.positions = new Float32Array(particles * 3);
      this.colors = new Float32Array(particles * 3);

      geometry.addAttribute("position", new THREE.BufferAttribute(this.positions, 3));
      geometry.addAttribute("color", new THREE.BufferAttribute(this.colors, 3));

      geometry.setDrawRange( 0, this.nextIndex );

      // Use the zoom to make the dots the "right" size
      let material = new THREE.PointsMaterial({ size: 80000 / Math.pow(2, this.zoom - 2), vertexColors: THREE.VertexColors });

      this._points = new THREE.Points(geometry, material);

      window["points"] = this.points;
   }

   add(points: {point, color, id}[]) {

      if (points && points.length) {
         let positions = this.geometry.attributes.position.array;
         let geometry = this.geometry;
         let colors = this.geometry.attributes.color.array;

         points.forEach(data => {
            let point = data.point;
            let color = data.color;
            let index = this.nextIndex * 3;

            colors[index] = color.r;
            colors[index + 1] = color.g;
            colors[index + 2] = color.b;
            positions[index] = point.x;
            positions[index + 1] = point.y;
            positions[index + 2] = point.z;

            this.nextIndex++;
         });
         this.geometry.setDrawRange( 0, this.nextIndex);
         this.geometry.attributes.color.needsUpdate = true;
         this.geometry.attributes.position.needsUpdate = true;
         this.geometry.computeVertexNormals();
         this.geometry.computeBoundingSphere();
      }
   }

   get points() {
      return this._points;
   }

   get count() {
      if (!this._count) {
         this._count = this.extent.features.reduce((accumulator, feature: GeoJSON.Feature<GeoJSON.Point>) => {
            return accumulator + feature.properties["count"];
         }, 0);
      }
      return this._count;
   }

}