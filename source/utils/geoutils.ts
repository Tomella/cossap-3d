declare var proj4;

export function featureToEpsg3857(feature: GeoJSON.Feature<GeoJSON.Point>): GeoJSON.Feature<GeoJSON.Point> {
   let point = feature.geometry.coordinates;
   feature.properties["point"] = [point[0], point[1]];
   feature.geometry.coordinates = pointToEpsg3857(point);
   return feature;
}

export function pointToEpsg3857(point) {
   return proj4("EPSG:4326", "EPSG:3857", [point[0], point[1]]);
}

export function bboxToEpsg3857(bbox) {
   let ll = pointToEpsg3857([bbox[0], bbox[1]]);
   let ur = pointToEpsg3857([bbox[2], bbox[3]]);
   return [ll[0], ll[1], ur[0], ur[1]];
}

export function longestSide(bbox: number[]): number {
   return Math.max(bbox[2] - bbox[0], bbox[3] - bbox[1]);
}