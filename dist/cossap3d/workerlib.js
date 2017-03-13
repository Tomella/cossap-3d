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

var EventDispatcher = (function () {
    function EventDispatcher() {
    }
    EventDispatcher.prototype.addEventListener = function (type, listener) {
        if (this.listeners === undefined)
            this.listeners = {};
        var listeners = this.listeners;
        if (listeners[type] === undefined) {
            listeners[type] = [];
        }
        if (listeners[type].indexOf(listener) === -1) {
            listeners[type].push(listener);
        }
    };
    EventDispatcher.prototype.hasEventListener = function (type, listener) {
        if (this.listeners === undefined)
            return false;
        var listeners = this.listeners;
        if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {
            return true;
        }
        return false;
    };
    EventDispatcher.prototype.removeEventListener = function (type, listener) {
        if (this.listeners === undefined)
            return;
        var listenerArray = this.listeners[type];
        if (listenerArray !== undefined) {
            this.listeners[type] = listenerArray.filter(function (existing) { return listener !== existing; });
        }
    };
    EventDispatcher.prototype.dispatchEvent = function (event) {
        var _this = this;
        var listeners = this.listeners;
        if (listeners === undefined)
            return;
        var array = [];
        var listenerArray = listeners[event.type];
        if (listenerArray !== undefined) {
            event.target = this;
            listenerArray.forEach(function (listener) { return listener.call(_this, event); });
        }
    };
    EventDispatcher.prototype.removeAllListeners = function () {
        this.listeners = undefined;
    };
    return EventDispatcher;
}());

var WorkerEvent = (function () {
    function WorkerEvent() {
    }
    return WorkerEvent;
}());
WorkerEvent.XYZ_LOADED = "xyz.loaded";
WorkerEvent.XYZ_BLOCK = "xyz.block";
WorkerEvent.COLOR_LOADED = "color.loaded";
WorkerEvent.COLOR_BLOCK = "color.block";

var SurfaceWorker = (function (_super) {
    __extends(SurfaceWorker, _super);
    function SurfaceWorker(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        return _this;
    }
    SurfaceWorker.prototype.load = function () {
        var _this = this;
        var options = Object.assign({}, this.options, {}, { template: this.options.template + "&store=false" });
        var restLoader = new Elevation.WcsXyzLoader(this.options);
        console.log("Running surface worker");
        return restLoader.load().then(function (res) {
            console.log("Loaded surface worker xyz");
            _this.createBlocks(res);
            return null;
        });
    };
    SurfaceWorker.prototype.createBlocks = function (res) {
        var _this = this;
        var block = [];
        res.forEach(function (item, i) {
            if (block.length === SurfaceWorker.BLOCK_SIZE) {
                _this.dispatchEvent({
                    type: WorkerEvent.XYZ_BLOCK,
                    data: block
                });
                block = [];
            }
            block.push(item);
        });
        if (block.length) {
            this.dispatchEvent({
                type: WorkerEvent.XYZ_BLOCK,
                data: block
            });
        }
        this.dispatchEvent({
            type: WorkerEvent.XYZ_LOADED
        });
        this.createColors(res);
    };
    SurfaceWorker.prototype.createColors = function (res) {
        var _this = this;
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
        var length = res.length;
        var buffer = [];
        res.forEach(function (item, i) {
            if (buffer.length === SurfaceWorker.BLOCK_SIZE) {
                _this.dispatchEvent({
                    type: WorkerEvent.COLOR_BLOCK,
                    data: buffer
                });
                buffer = [];
            }
            var color, z = item.z;
            if (z > 0) {
                color = lut.getColor(z);
            }
            else {
                color = blue.getColor(z);
            }
            buffer.push({
                x: i % resolutionX,
                y: Math.floor(i / resolutionX),
                r: color.r * 255,
                g: color.g * 255,
                b: color.b * 255,
                a: 255
            });
        });
        if (buffer.length) {
            this.dispatchEvent({
                type: WorkerEvent.COLOR_BLOCK,
                data: buffer
            });
        }
        this.dispatchEvent({
            type: WorkerEvent.COLOR_LOADED
        });
    };
    return SurfaceWorker;
}(EventDispatcher));
SurfaceWorker.DEFAULT_MAX_DEPTH = 5000;
SurfaceWorker.DEFAULT_MAX_ELEVATION = 2200;
SurfaceWorker.BLOCK_SIZE = 2000;

/**
 * Javascript container for all things to do with configuration.
 */
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
        hiResX: 600,
        hiResImageWidth: 3000,
        hiResTopoWidth: 512,
        opacity: 1,
        extent: new Elevation.Extent2d(1000000, -10000000, 20000000, -899000),
    },
    boreholes: {
        template: "http://dev.cossap.gadevs.ga/explorer-cossap-services/service/boreholes/features/${bbox}"
    },
    rocks: {
        dataUrl: "http://www.ga.gov.au/geophysics-rockpropertypub-gws/ga_rock_properties_wfs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ga_rock_properties_wfs:remanent_magnetisation,ga_rock_properties_wfs:scalar_results&maxFeatures=50&outputFormat=application%2Fgml%2Bxml%3B+version%3D3.2&featureID=${id}",
        url: "/explorer-cossap-services/service/rocks/",
        summaryService: "summary?zoom=${zoom}&xmin=${xmin}&xmax=${xmax}&ymin=${ymin}&ymax=${ymax}",
        maxCount: 300000,
        circumferance: 40000000 // Roughly, we don't care that much.
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
exports.WorkerEvent = WorkerEvent;
exports.Config = Config;

Object.defineProperty(exports, '__esModule', { value: true });

})));
