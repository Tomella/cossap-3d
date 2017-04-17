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







function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
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
WorkerEvent.PARTICLES_LOADED = "particles.loaded";
WorkerEvent.PARTICLES_COMPLETE = "particles.complete";

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
        // console.log("Running surface worker");
        return restLoader.load().then(function (res) {
            // console.log("Loaded surface worker xyz");
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

function pointToEpsg3857(point) {
    return proj4("EPSG:4326", "EPSG:3857", [point[0], point[1]]);
}

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
        template_backup: "http://services.ga.gov.au/site_9/services/DEM_SRTM_1Second/MapServer/WCSServer?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage" +
            "&coverage=1&CRS=EPSG:3857&BBOX=${bbox}&FORMAT=GeoTIFF&RESX=${resx}&RESY=${resy}&RESPONSE_CRS=EPSG:3857&HEIGHT=${height}&WIDTH=${width}",
        template: "http://services.ga.gov.au/site_9/services/DEM_SRTM_1Second_over_Bathymetry_Topography/MapServer/WCSServer?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage" +
            "&coverage=1&CRS=EPSG:3857&BBOX=${bbox}&FORMAT=GeoTIFF&RESX=${resx}&RESY=${resy}&RESPONSE_CRS=EPSG:3857&HEIGHT=${height}&WIDTH=${width}",
        esriTemplate: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${bbox}&f=${format}&format=jpg&size=${size}",
        topoTemplate: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/export?bbox=${bbox}&f=image&format=jpg&size=${width},${height}",
        resolutionX: 60,
        imageWidth: 200,
        hiResX: 512,
        hiResImageWidth: 512,
        hiResTopoWidth: 512,
        opacity: 1,
        extent: new Elevation.Extent2d(1000000, -10000000, 20000000, -899000),
    },
    boreholes: {
        template: "http://dev.cossap.gadevs.ga/explorer-cossap-services/service/boreholes/features/${bbox}"
    },
    rocks: {
        dataUrl: "http://www.ga.gov.au/geophysics-rockpropertypub-gws/ga_rock_properties_wfs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ga_rock_properties_wfs:remanent_magnetisation,ga_rock_properties_wfs:scalar_results&maxFeatures=50&outputFormat=application%2Fgml%2Bxml%3B+version%3D3.2&featureID=${id}",
        baseUrl: "/explorer-cossap-services/service/rocks/",
        summaryService: "summary?zoom=${zoom}&xmin=${xmin}&xmax=${xmax}&ymin=${ymin}&ymax=${ymax}",
        featuresService: "features/",
        queryService: "query/",
        maxCount: 200000,
        workerLocation: "workers/target/broker.js",
        lithologyGroups: {
            "alkaline ultrabasic": { r: 220, g: 20, b: 60 },
            "argillaceous detrital sediment": { r: 0, g: 250, b: 154 },
            "fault / shear rock": { r: 84, g: 255, b: 159 },
            "feldspar- or lithic-rich arenite to rudite": { r: 255, g: 231, b: 186 },
            "high grade metamorphic rock": { r: 240, g: 255, b: 240 },
            "igneous": { r: 255, g: 182, b: 193 },
            "igneous felsic": { r: 193, g: 255, b: 193 },
            "igneous felsic intrusive": { r: 250, g: 235, b: 215 },
            "igneous felsic volcanic": { r: 255, g: 239, b: 219 },
            "igneous foid-bearing volcanic": { r: 238, g: 223, b: 204 },
            "igneous intermediate intrusive": { r: 205, g: 192, b: 176 },
            "igneous intermediate volcanic": { r: 222, g: 184, b: 135 },
            "igneous intrusive": { r: 255, g: 211, b: 155 },
            "igneous kimberlite": { r: 238, g: 197, b: 145 },
            "igneous lamprophyres": { r: 237, g: 145, b: 33 },
            "igneous mafic": { r: 255, g: 140, b: 0 },
            "igneous mafic intrusive": { r: 255, g: 127, b: 0 },
            "igneous mafic volcanic": { r: 238, g: 118, b: 0 },
            "igneous ultramafic": { r: 255, g: 128, b: 0 },
            "igneous ultramafic intrusive": { r: 255, g: 165, b: 75 },
            "igneous ultramafic volcanic": { r: 205, g: 133, b: 63 },
            "igneous volcanic": { r: 255, g: 218, b: 185 },
            "low grade metamorphic rock": { r: 238, g: 58, b: 140 },
            "meta-igneous": { r: 255, g: 110, b: 180 },
            "meta-igneous felsic": { r: 154, g: 255, b: 154 },
            "meta-igneous felsic volcanic": { r: 142, g: 56, b: 142 },
            "meta-igneous mafic": { r: 113, g: 113, b: 198 },
            "meta-igneous mafic volcanic": { r: 125, g: 158, b: 192 },
            "meta-igneous ultramafic": { r: 56, g: 142, b: 142 },
            "metamorphic": { r: 255, g: 131, b: 250 },
            "metamorphic protolith unknown": { r: 0, g: 238, b: 0 },
            "metasedimentary": { r: 216, g: 191, b: 216 },
            "metasedimentary carbonate": { r: 127, g: 255, b: 0 },
            "metasedimentary non-carbonate chemical or biochemical": { r: 255, g: 255, b: 224 },
            "metasedimentary siliciclastic": { r: 255, g: 255, b: 0 },
            "metasomatic": { r: 255, g: 0, b: 255 },
            "mineralisation": { r: 155, g: 48, b: 255 },
            "organic-rich rock": { r: 202, g: 225, b: 255 },
            "regolith": { r: 0, g: 191, b: 255 },
            "sedimentary": { r: 0, g: 245, b: 255 },
            "sedimentary carbonate": { r: 255, g: 215, b: 0 },
            "sedimentary non-carbonate chemical or biochemical": { r: 211, g: 211, b: 211 },
            "sedimentary siliciclastic": { r: 192, g: 192, b: 192 },
            "unknown": { r: 255, g: 255, b: 255 },
            "vein": { r: 0, g: 190, b: 140 }
        }
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

/**
 * A very rough conversion from GDA94 ellipsoidal to
 * Australian Height Datum for large area views. It's aim is speed, not accuracy.
 * It's done by eyeballing the well heads on the map and is close enough.
 */
var EllipsoidalToAhd = (function () {
    function EllipsoidalToAhd() {
    }
    EllipsoidalToAhd.prototype.toAhd = function (lng, lat, gda94Elev) {
        var deltaLat = lat - EllipsoidalToAhd.zeroLat;
        var deltaLng = lng - EllipsoidalToAhd.zeroLng;
        var dx = deltaLng * EllipsoidalToAhd.rampLng;
        var dy = deltaLat * EllipsoidalToAhd.rampLat;
        var elevation = gda94Elev - deltaLat * EllipsoidalToAhd.rampLat - deltaLng * EllipsoidalToAhd.rampLng;
        return elevation;
    };
    EllipsoidalToAhd.prototype.pointsToAhd = function (points) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        resolve(points.map(function (point) { return _this.toAhd(point[0], point[1], point[2]); }));
                    })];
            });
        });
    };
    return EllipsoidalToAhd;
}());
EllipsoidalToAhd.zeroLat = -3123471; // -27;
EllipsoidalToAhd.zeroLng = 14471533; // 130;
EllipsoidalToAhd.rampLat = 0.0000282; // 3.1 Just  a rough approximation
EllipsoidalToAhd.rampLng = 0.0000182; // 2;

var ParticlesWorker = (function (_super) {
    __extends(ParticlesWorker, _super);
    function ParticlesWorker(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.startIndex = 0;
        _this.mapper = new EllipsoidalToAhd();
        return _this;
    }
    ParticlesWorker.prototype.load = function () {
        this.createBlocks();
    };
    ParticlesWorker.prototype.createBlocks = function () {
        var _this = this;
        var index = this.startIndex;
        var url = this.options.template + this.options.id + "?startIndex=" + index + "&maxCount=" + ParticlesWorker.BLOCK_SIZE;
        var loader = new Elevation.HttpTextLoader(url);
        loader.load().then(function (str) { return JSON.parse(str); }).then(function (featureCollection) {
            var features = featureCollection.features;
            var totalFeatures = featureCollection.totalFeatures;
            _this.dispatchEvent({
                type: WorkerEvent.PARTICLES_LOADED,
                data: _this.mapFeatures(features)
            });
            _this.startIndex += features.length;
            // Don't trust the figures.
            if (features.length && totalFeatures > _this.startIndex) {
                _this.createBlocks();
            }
            else {
                _this.dispatchEvent({
                    type: WorkerEvent.PARTICLES_COMPLETE,
                    data: { count: totalFeatures }
                });
            }
        });
    };
    ParticlesWorker.prototype.mapFeatures = function (features) {
        var _this = this;
        var bbox = this.options.bbox;
        var colorMap = Config.preferences.rocks.lithologyGroups;
        var unknown = colorMap.unknown;
        // We filter out those outside the bbox
        return features.filter(function (item) { return Elevation.positionWithinBbox(bbox, item.geometry.coordinates); }).map(function (feature) {
            var point = pointToEpsg3857(feature.geometry.coordinates);
            var color = colorMap[feature.properties["LITHOLOGYGROUP"]];
            color = color ? color : unknown;
            var response = {
                id: feature.id,
                point: {
                    x: point[0],
                    y: point[1],
                    z: _this.mapper.toAhd(point[0], point[1], feature.properties["SAMPLE_ELEVATION"] ? feature.properties["SAMPLE_ELEVATION"] : 0)
                },
                color: color
            };
            return response;
        });
    };
    return ParticlesWorker;
}(EventDispatcher));
ParticlesWorker.BLOCK_SIZE = 20000;

exports.SurfaceWorker = SurfaceWorker;
exports.ParticlesWorker = ParticlesWorker;
exports.WorkerEvent = WorkerEvent;
exports.Config = Config;

Object.defineProperty(exports, '__esModule', { value: true });

})));
