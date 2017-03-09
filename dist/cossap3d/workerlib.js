(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Cossap3d = global.Cossap3d || {})));
}(this, (function (exports) { 'use strict';

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var SurfaceWorker = (function (_super) {
    __extends(SurfaceWorker, _super);
    function SurfaceWorker(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        return _this;
    }
    SurfaceWorker.prototype.load = function () {
        var _this = this;
        var restLoader = new Elevation.WcsXyzLoader(this.options);
        console.log("Running surface worker");
        return restLoader.load().then(function (res) {
            console.log("Loaded surface worker xyz");
            _this.dispatchEvent({
                type: SurfaceWorker.XYZ_LOADED,
                data: res
            });
            _this.dispatchEvent({
                type: SurfaceWorker.COLOR_LOADED,
                data: _this.createColors(res)
            });
            return null;
        });
    };
    SurfaceWorker.prototype.createColors = function (res) {
        var resolutionX = this.options.resolutionX;
        var resolutionY = this.options.resolutionY;
        // TODO: Some magic numbers. I need think about them. I think the gradient should stay the same.
        var maxDepth = this.options.maxDepth ? this.options.maxDepth : SurfaceWorker.DEFAULT_MAX_DEPTH;
        var maxElevation = this.options.maxElevation ? this.options.maxElevation : SurfaceWorker.DEFAULT_MAX_ELEVATION;
        var blue = new THREE.Lut("water", maxDepth);
        var lut = new THREE.Lut("land", maxElevation);
        blue.setMax(0);
        blue.setMin(-maxDepth);
        lut.setMax(Math.floor(maxElevation));
        lut.setMin(0);
        var index = 0;
        var count = 0;
        return res.map(function (item, i) {
            var color, z = item.z;
            if (z > 0) {
                color = lut.getColor(z);
            }
            else {
                color = blue.getColor(z);
            }
            return {
                x: i % resolutionX,
                y: Math.floor(i / resolutionX),
                r: color.r * 255,
                g: color.g * 255,
                b: color.b * 255,
                a: 255
            };
        });
    };
    return SurfaceWorker;
}(THREE.EventDispatcher));
SurfaceWorker.XYZ_LOADED = "xyz.loaded";
SurfaceWorker.COLOR_LOADED = "color.loaded";
SurfaceWorker.DEFAULT_MAX_DEPTH = 5000;
SurfaceWorker.DEFAULT_MAX_ELEVATION = 2200;

var Config = (function () {
    function Config() {
    }
    return Config;
}());
Config.preferences = {
    surfaceWorkerLocation: "workers/target/broker.js",
    showGrid: true,
    showBoreholes: true,
    scaling: 1,
    surface: {
        type: "esriElevation",
        header: {
            name: "Imagery over Victoria",
        },
        template: "http://services.ga.gov.au/site_9/services/DEM_SRTM_1Second_over_Bathymetry_Topography/MapServer/WCSServer?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage" +
            "&coverage=1&CRS=EPSG:3857&BBOX=${bbox}&FORMAT=GeoTIFF&RESX=${resx}&RESY=${resy}&RESPONSE_CRS=EPSG:3857&HEIGHT=${height}&WIDTH=${width}",
        esriTemplate: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${bbox}&f=${format}&format=jpg&size=${size}",
        topoTemplate: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/export?bbox=${bbox}&f=image&format=jpg&size=${width},${height}",
        resolutionX: 75,
        imageWidth: 256,
        hiResX: 700,
        hiResImageWidth: 2048,
        hiResTopoWidth: 512,
        opacity: 1,
        extent: new Elevation.Extent2d(1000000, -10000000, 20000000, -899000),
    },
    boreholes: {
        template: "http://dev.cossap.gadevs.ga/explorer-cossap-services/service/boreholes/features/${bbox}"
    },
    worldView: {
        axisHelper: {
            on: true,
            labels: {
                x: "",
                y: " North ",
                z: ""
            }
        }
    }
};

exports.SurfaceWorker = SurfaceWorker;
exports.Config = Config;

Object.defineProperty(exports, '__esModule', { value: true });

})));
