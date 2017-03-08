declare namespace Elevation {
   export class Event {
      type: string;
      data: any;
      target: any;
      constructor(type: string, data?: any, target?: any);
   }

   export class Extent2d {
      static AUSTRALIA: Extent2d;
      static WORLD: Extent2d;
      static REVERSE_WORLD: Extent2d;
      private _extent;
      constructor(lngMin?: number, latMin?: number, lngMax?: number, latMax?: number);
      readonly lngMin: number;
      readonly latMin: number;
      readonly lngMax: number;
      readonly latMax: number;
      set(extent: Extent2d): this;
      setFromPoints(points: GeoJSON.Position[]): this;
      expand(point: number[]): this;
      toBbox(): number[];
      clone(): Extent2d;
   }

   export class GeojsonElevationLoader extends Loader<GeoJSON.FeatureCollection<GeoJSON.Point>> {
      options: any;
      private childLoader;
      constructor(options: any);
      load(): Promise<GeoJSON.FeatureCollection<GeoJSON.Point>>;
      private calculateResolutionY(bbox, resolutionX, resolutionY?);
   }

   export class GridElevationLoader {
      options: any;
      private childLoader;
      constructor(options: any);
      load(): Promise<number[][]>;
   }

   export class PointElevationLoader {
      options: any;
      constructor(options: any);
      load(): Promise<GeoJSON.Position>;
   }

   export class TerrainLoader extends Loader<number[]> {
      options: any;
      constructor(options?: any);
      load(): Promise<number[]>;
      crossOrigin: any;
   }

   export class XyzElevationLoader extends Loader<any[]> {
      options: any;
      private childLoader;
      resolutionX: number;
      extent: Extent2d;
      constructor(options: any);
      load(): Promise<any[]>;
   }

   /**
    * Sometimes you want to reuse the so this caches it.
    * It can be placed in front of any loader so you might for instance
    * cache GeoJSON, XYZ data or at some point even a higher level format.
    */
   export class CachedLoader extends Loader<any> {
      options: any;
      data: any;
      loading: boolean;
      deferred: Promise<any>;
      constructor(options: any);
      load(): Promise<any>;
   }

   export class FileLoader extends Loader<any> {
      file: File;
      callback: Function;
      reader: FileReader;
      constructor(file: File, options: any, callback: Function);
      load(): Promise<any>;
   }

   export class HttpTextLoader extends Loader<any> {
      location: string;
      options: any;
      constructor(location: string, options?: any);
      load(): Promise<any>;
      crossOrigin: any;
   }

   export abstract class Loader<T> extends EventDispatcher {
      abstract load(): Promise<T>;
   }

   export class LinePusher {
      loader: Loader<string>;
      pipeline: Pipeline;
      lineBuffer: string[];
      constructor(loader: Loader<string>, pipeline: Pipeline);
      start(targetFn: Function): Promise<void>;
      private scanData(data);
   }

   export abstract class Pipeline extends EventDispatcher {
      constructor();
      abstract pipe(event: any): void;
      destroy(): void;
   }

   export class OpenStreetMapsLoader {
      options: any;
      private gridLoader;
      constructor(options: any);
      load(): Promise<number[][]>;
   }

   export class OsmGeoJsonLoader extends Loader<GeoJSON.FeatureCollection<any>> {
      options: any;
      private loader;
      constructor(options: any);
      load(): Promise<GeoJSON.FeatureCollection<any>>;
   }

   export class OsmUrlOptions {
      options: any;
      static defaultTemplate: string;
      constructor(options: any);
      readonly template: string;
      bbox: number[];
      readonly location: string;
   }

   export class Transection {
      serviceUrlTemplate: string;
      diagonal: number;
      extent: Extent2d;
      constructor(serviceUrlTemplate: string);
      getElevation(geometry: GeoJSON.LineString, buffer?: number): Promise<GeoJSON.LineString>;
      static calcSides(diagonal: number, ar: any): {
         y: number;
         x: number;
      };
   }

   export function immediateDefer(fn: Function): void;

   /**
    * Slightly modified for TypeScript. Also we want it in the domain
    * https://github.com/mrdoob/eventdispatcher.js/
    */
   export class EventDispatcher {
      listeners: any;
      addEventListener(type: string, listener: Function): void;
      hasEventListener(type: string, listener: Function): boolean;
      removeEventListener(type: string, listener: Function): void;
      dispatchEvent(event: Event): void;
      removeAllListeners(): void;
   }

   /**
    * Look here for inspiration as needed...
    * http://www.movable-type.co.uk/scripts/latlong.html
    *
    * and here
    * http://paulbourke.net/
    *
    * Between those descriptions we should be able to build most things.
    *
    */
   export let RADIANS_TO_METERS: number;
   export let METERS_TO_RADIANS: number;
   export function convertDegreesToRadians(num: number): number;
   export function convertRadiansToDegree(num: number): number;
   export function normalizeRadians(angle: any): any;
   export function expandBbox(bbox: number[], rawPoint: number[]): void;
   export function culledBbox(container: number[], subset: number[]): number[];
   /**
    * Given an array of points, create a bounding box that encompasses them all.
    * Optionally buffer the box by a proportion amount eg 0.05 represents a 5% further south, west east and north.
    * Keep in mind with this example that is 21% more area because it grows 5% in 4 directions.
    */
   export function createBboxFromPoints(coords: GeoJSON.Position[], buffer?: number): number[];
   /**
    * Buffer the box by a proportion amount eg 0.05 represents a 5% further south, west east and north.
    * Keep in mind with this example that is 21% more area because it grows 5% in 4 directions.
    * That is it is 10% wider and 10% higher.
    *
    */
   export function createBufferedBbox(bbox: number[], buffer: number): number[];
   /**
    * Test that a position is within the bounding box.
    */
   export function positionWithinBbox(bbox: number[], position: GeoJSON.Position): boolean;
   /**
    * Taken a few points make the line have more points, with each point along the line.
    */
   export function densify(line: GeoJSON.Position[], count: number): number[][];
   export function calculatePosition(pt: GeoJSON.Position, bearing: number, distance: number): GeoJSON.Position;
   export function calculateSegmentDetails(line: GeoJSON.Position[]): any[];
   /**
    * Tested and working OK.
    */
   export function calculateLineLength(points: GeoJSON.Position[]): number;
   export function calculateDistance(pt1: GeoJSON.Position, pt2: GeoJSON.Position): number;
   /**
    * Give a start point, a bearing give me the point that distance meters along the path
    */
   export function destination(from: GeoJSON.Position, distance: number, bearing: number): GeoJSON.Position;
   /**
    * Given two positions return the bearing from one to the other (source -> destination)
    */
   export function calculateBearing(source: GeoJSON.Position, destination: GeoJSON.Position): number;

   export class WcsGeoJsonLoader {
      options: any;
      constructor(options?: any);
      load(): Promise<GeoJSON.FeatureCollection<GeoJSON.Point>>;
   }

   export class WcsPathElevationLoader extends Loader<GeoJSON.FeatureCollection<GeoJSON.Point>> {
      options: any;
      constructor(options?: any);
      path: number[];
      load(): Promise<GeoJSON.FeatureCollection<GeoJSON.Point>>;
   }

   export class WcsPointElevationLoader extends Loader<number[]> {
      options: any;
      constructor(options?: any);
      point: number[];
      load(): Promise<number[]>;
   }

   export class WcsPointOptions {
      options: any;
      constructor(options?: any);
      readonly template: string;
      readonly point: number[];
      readonly bbox: number[];
      readonly extent: Extent2d;
      readonly location: any;
   }

   export class WcsTerrainLoader {
      options: any;
      constructor(options?: any);
      load(): Promise<number[]>;
   }

   export class WcsUrlOptions {
      options: any;
      constructor(options: any);
      resolutionY: number;
      readonly resolutionX: number;
      readonly template: string;
      readonly bbox: number[];
      readonly extent: Extent2d;
      readonly location: any;
   }

   export class WcsXyzLoader {
      options: any;
      constructor(options: any);
      load(): Promise<number[][]>;
   }
}