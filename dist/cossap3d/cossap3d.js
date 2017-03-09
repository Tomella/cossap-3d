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

var query = function () {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
        }
        else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
        }
        else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();
var UrlParameters = (function () {
    function UrlParameters() {
    }
    UrlParameters.parameters = function () {
        return query;
    };
    return UrlParameters;
}());

var Storage = (function (_super) {
    __extends(Storage, _super);
    function Storage() {
        var _this = _super.call(this) || this;
        _this.parseParameters();
        _this.prepareEvents();
        return _this;
    }
    Object.defineProperty(Storage.prototype, "state", {
        get: function () {
            try {
                return JSON.parse(localStorage.getItem(Storage.STATE_KEY));
            }
            catch (e) {
                localStorage.removeItem(Storage.STATE_KEY);
                return null;
            }
        },
        set: function (state) {
            if (state) {
                localStorage.setItem(Storage.STATE_KEY, JSON.stringify(state));
            }
            else {
                localStorage.removeItem(Storage.STATE_KEY);
            }
        },
        enumerable: true,
        configurable: true
    });
    Storage.prototype.parseParameters = function () {
        this.bbox = this.parseBbox("[" + UrlParameters.parameters().bbox + "]");
    };
    Storage.prototype.parseBbox = function (bboxStr) {
        if (bboxStr) {
            try {
                var parts = JSON.parse(bboxStr);
                if (Array.isArray(parts) && parts.every(function (num) { return !isNaN(num); }) && parts.length === 4) {
                    // We don't range check but we do check ll < ur.
                    if (parts[0] < parts[2] && parts[1] < parts[3]) {
                        return parts;
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        return null;
    };
    Storage.prototype.prepareEvents = function () {
        var self = this;
        window.addEventListener("storage", dispatch);
        function dispatch(evt) {
            if (evt.key === Storage.BBOX_KEY) {
                if (self.bbox && !evt.newValue) {
                    self.bbox = null;
                    self.dispatchEvent({
                        type: Storage.BBOX_EVENT
                    });
                }
                else {
                    var oldBbox = self.bbox;
                    var bbox = self.parseBbox(evt.newValue);
                    self.bbox = bbox;
                    if (!bbox || bbox.length !== 4) {
                        self.dispatchEvent({
                            type: Storage.BBOX_EVENT,
                            bbox: null
                        });
                    }
                    else if (oldBbox[0] !== bbox[0] ||
                        oldBbox[1] !== bbox[1] ||
                        oldBbox[2] !== bbox[2] ||
                        oldBbox[3] !== bbox[3]) {
                        self.dispatchEvent({
                            type: Storage.BBOX_EVENT,
                            bbox: bbox
                        });
                    }
                }
            }
        }
    };
    return Storage;
}(THREE.EventDispatcher));
Storage.BBOX_KEY = "cossap3d.bbox";
Storage.BBOX_EVENT = "bbox.change";
Storage.STATE_KEY = "cossap3d.state";

var CossapCameraPositioner = (function (_super) {
    __extends(CossapCameraPositioner, _super);
    function CossapCameraPositioner() {
        return _super.call(this) || this;
    }
    CossapCameraPositioner.prototype.position = function (z, radius, center) {
        return {
            x: center.x,
            y: center.y - 0.5 * radius,
            z: center.z + 2 * radius
        };
    };
    CossapCameraPositioner.prototype.up = function (z, radius, center) {
        return {
            x: 0,
            y: 0,
            z: 1
        };
    };
    return CossapCameraPositioner;
}(Explorer3d.CameraPositioner));

var Mappings = (function (_super) {
    __extends(Mappings, _super);
    function Mappings(factory, dom) {
        var _this = _super.call(this) || this;
        _this.factory = factory;
        _this.dom = dom;
        _this.mapVerticalExagerate();
        _this.mapSurfaceOpacity();
        _this.mapShowHideBoreholes();
        _this.mapSurfaceMaterialRadio();
        return _this;
    }
    Mappings.prototype.mapVerticalExagerate = function () {
        var element = this.dom.verticalExaggeration;
        var view = this.dom.verticalExaggerationView;
        // We'll attach something to change vertical exaggeration now.
        var verticalExaggerate = new Explorer3d.VerticalExaggerate(this.factory).onChange(function () {
            Explorer3d.Logger.log("We have a trigger to vertical exaggerate");
            verticalExaggerate.set(+element.value);
            view.innerHTML = element.value;
        });
        element.addEventListener("change", function () {
            verticalExaggerate.set(+element.value);
            view.innerHTML = element.value;
        });
    };
    Object.defineProperty(Mappings.prototype, "surface", {
        set: function (surface) {
            var opacity = this.dom.surfaceOpacity.value;
            console.log("Setting opacity to " + opacity);
            this._surface = surface;
            if (surface)
                surface.material.opacity = opacity;
        },
        enumerable: true,
        configurable: true
    });
    Mappings.prototype.mapSurfaceOpacity = function () {
        var _this = this;
        var element = this.dom.surfaceOpacity;
        element.addEventListener("change", function () {
            if (_this._surface) {
                _this._surface.material.opacity = _this.dom.surfaceOpacity.value;
            }
            _this.dom.surfaceOpacity.blur();
        });
    };
    Object.defineProperty(Mappings.prototype, "boreholes", {
        set: function (boreholes) {
            this._boreholes = boreholes;
            if (boreholes)
                boreholes.visible = this.dom.showHideBoreholes.checked;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Mappings.prototype, "material", {
        get: function () {
            return this.dom.surfaceMaterialSelect.value;
        },
        set: function (mat) {
            this.dom.surfaceMaterialSelect.value = mat;
        },
        enumerable: true,
        configurable: true
    });
    Mappings.prototype.mapSurfaceMaterialRadio = function () {
        var elements = Array.from(this.dom.surfaceMaterialRadio);
        var self = this;
        elements.forEach(function (element) {
            element.addEventListener("change", eventHandler);
        });
        function eventHandler(event) {
            self.dispatchEvent({ type: "material.changed", name: event.target.value });
        }
        
    };
    Mappings.prototype.mapShowHideBoreholes = function () {
        var _this = this;
        var element = this.dom.showHideBoreholes;
        element.addEventListener("change", function () {
            if (_this._boreholes)
                _this._boreholes.visible = _this.dom.showHideBoreholes.checked;
        });
    };
    return Mappings;
}(THREE.EventDispatcher));

var Bind = (function () {
    function Bind() {
    }
    return Bind;
}());
// Keep all the DOM stuff together. Make the abstraction to the HTML here
Bind.dom = {
    target: document.getElementById("target"),
    body: document.body,
    verticalExaggeration: document.getElementById("verticalExaggeration"),
    verticalExaggerationView: document.getElementById("verticalExaggerationValue"),
    surfaceOpacity: document.getElementById("surfaceOpacity"),
    showHideBoreholes: document.getElementById("showHideBoreholes"),
    surfaceMaterialRadio: document.getElementsByName("surfaceMaterialRadio"),
    invalidParameter: document.getElementById("invalidParameter")
};

var Surface = (function (_super) {
    __extends(Surface, _super);
    function Surface(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.materials = {};
        return _this;
    }
    Surface.prototype.parse = function () {
        var _this = this;
        var parser = new Explorer3d.WcsEsriImageryParser(this.options);
        parser.addEventListener(Explorer3d.WcsEsriImageryParser.BBOX_CHANGED_EVENT, function (event) {
            // Careful here. The event name
            _this.dispatchEvent(event);
            var data = event.data;
            _this.bbox = data.bbox;
            _this.aspectRatio = data.aspectRatio;
            _this.fetchTopoMaterial(data);
        });
        parser.addEventListener(Explorer3d.WcsEsriImageryParser.TEXTURE_LOADED_EVENT, function (event) {
            _this.dispatchEvent(event);
        });
        return parser.parse().then(function (data) {
            _this.surface = data;
            Explorer3d.Logger.log(seconds$1() + ": We have shown the document");
            setTimeout(function () {
                _this.fetchWireframeMaterial();
                _this.fetchMaterials();
            });
            return data;
        }).catch(function (err) {
            Explorer3d.Logger.error("We failed in the simple example");
            Explorer3d.Logger.error(err);
        });
    };
    Surface.prototype.fetchTopoMaterial = function (data) {
        this.materials.topo = new Explorer3d.WmsMaterial({
            template: this.options.topoTemplate,
            width: data.width,
            height: data.height,
            transparent: true,
            bbox: data.bbox,
            opacity: 0.7
        });
    };
    Surface.prototype.fetchWireframeMaterial = function () {
        this.materials.wireframe = new THREE.MeshBasicMaterial({
            color: 0xeeeeee,
            transparent: true,
            opacity: 0.7,
            wireframe: true
        });
    };
    Surface.prototype.fetchMaterials = function () {
        var points = this.surface.geometry.vertices;
        var resolutionX = this.options.resolutionX;
        this.materials.image = this.surface.material;
        this.materials.heatmap = new Explorer3d.ElevationMaterial({
            resolutionX: resolutionX,
            resolutionY: points.length / resolutionX,
            data: points,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });
    };
    Surface.prototype.switchSurface = function (name) {
        var opacity = this.surface.material.opacity;
        this.surface.visible = true;
        this.surface.material = this.materials[name];
        this.surface.material.opacity = opacity;
        this.surface.material.needsUpdate = true;
    };
    return Surface;
}(THREE.EventDispatcher));
Surface.META_DATA_LOADED = Explorer3d.WcsEsriImageryParser.BBOX_CHANGED_EVENT;
Surface.TEXTURE_LOADED_EVENT = Explorer3d.WcsEsriImageryParser.TEXTURE_LOADED_EVENT;
function seconds$1() {
    return (Date.now() % 100000) / 1000;
}

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

var SurfaceLauncher = (function (_super) {
    __extends(SurfaceLauncher, _super);
    function SurfaceLauncher(options) {
        var _this = _super.call(this, options) || this;
        _this.materials = {};
        _this.materialComplete = false;
        return _this;
    }
    SurfaceLauncher.prototype.since = function () {
        return Date.now() - this.startMilli;
    };
    SurfaceLauncher.prototype.parse = function () {
        var _this = this;
        this.startMilli = Date.now();
        var worker = new Worker(Config.preferences.surfaceWorkerLocation);
        var geometry, material;
        var width = this.options.hiResTopoWidth ? this.options.hiResTopoWidth : 512;
        var height = Math.floor(width * this.options.resolutionY / this.options.resolutionX);
        var extent = this.options.extent;
        var options = {
            type: "surface",
            extentBbox: this.options.extent.toBbox(),
            bbox: this.options.bbox,
            template: this.options.template,
            resolutionX: this.options.resolutionX,
            resolutionY: this.options.resolutionY,
            width: width,
            height: height
        };
        worker.addEventListener('message', function (message) {
            var data = message.data;
            if (data.type === "xyz.loaded") {
                _this.createGeometry(options, data.data).then(function (geom) {
                    _this.geometry = geom;
                    _this.checkComplete();
                });
                
            }
            else if (data.type === "color.loaded") {
                _this.createHeatmapMaterial(options, data.data);
            }
        });
        worker.postMessage(options);
        this.createImageMaterial();
        this.fetchTopoMaterial(options);
    };
    SurfaceLauncher.prototype.checkComplete = function () {
        if (this.materialComplete && this.geometry) {
            this.createMesh();
            this.dispatchEvent({
                type: Explorer3d.WcsEsriImageryParser.TEXTURE_LOADED_EVENT,
                data: this.surface
            });
        }
    };
    SurfaceLauncher.prototype.createImageMaterial = function () {
        var _this = this;
        console.log("createImageMaterial start: " + this.since());
        var url = this.options.esriTemplate
            .replace("${bbox}", this.options.bbox)
            .replace("${format}", "Image")
            .replace("${size}", this.options.imageWidth + "," + this.options.imageHeight);
        var loader = new THREE.TextureLoader();
        loader.crossOrigin = "";
        var opacity = this.options.opacity ? this.options.opacity : 1;
        var material = new THREE.MeshPhongMaterial({
            map: loader.load(url, function (event) {
                _this.materialComplete = true;
                _this.checkComplete();
            }),
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide
        });
        this.materials.image = material;
        console.log("createImageMaterial end: " + this.since());
    };
    SurfaceLauncher.prototype.createHeatmapMaterial = function (options, res) {
        console.log("createHeatmapMaterial start: " + this.since());
        var self = this;
        var mask = document.createElement("canvas");
        mask.width = options.resolutionX;
        mask.height = options.resolutionY;
        var context = mask.getContext("2d");
        var id = context.createImageData(1, 1);
        var d = id.data;
        var count = 0;
        fillColor();
        function fillColor() {
            setTimeout(function () {
                if (count >= res.length) {
                    complete();
                    return;
                }
                do {
                    var item = res[count++];
                    if (count > res.length) {
                        break;
                    }
                    drawPixel(item);
                } while (count % 1000);
                fillColor();
            }, 5);
        }
        function complete() {
            var texture = new THREE.Texture(mask);
            texture.needsUpdate = true;
            var opacity = options.opacity ? options.opacity : 1;
            var material = new THREE.MeshPhongMaterial({
                map: texture,
                transparent: true,
                opacity: opacity,
                side: THREE.DoubleSide
            });
            self.materials.heatmap = material;
            console.log("createHeatmapMaterial end: " + self.since());
        }
        function drawPixel(item) {
            d[0] = item.r;
            d[1] = item.g;
            d[2] = item.b;
            d[3] = item.a;
            context.putImageData(id, item.x, item.y);
        }
    };
    SurfaceLauncher.prototype.createMesh = function () {
        this.surface = new THREE.Mesh(this.geometry, this.materials.image);
    };
    SurfaceLauncher.prototype.createGeometry = function (options, res) {
        var self = this;
        console.log("createGeometry start: " + this.since());
        var resolutionX = this.options.resolutionX;
        var resolutionY = res.length / resolutionX;
        var geometry = new THREE.PlaneGeometry(resolutionX, resolutionY, resolutionX - 1, resolutionY - 1);
        var bbox = this.options.bbox;
        return new Promise(function (resolve, reject) {
            var count = 0;
            if (res.length) {
                processBlock();
            }
            else {
                reject("No data");
            }
            function processBlock() {
                setTimeout(function () {
                    if (count >= res.length) {
                        cleanUp();
                        return;
                    }
                    do {
                        var vertice = geometry.vertices[count];
                        var xyz = res[count++];
                        if (count > res.length) {
                            break;
                        }
                        vertice.z = xyz.z;
                        vertice.x = xyz.x;
                        vertice.y = xyz.y;
                    } while (count % 1000);
                    processBlock();
                }, 5);
                function cleanUp() {
                    geometry.computeBoundingSphere();
                    geometry.computeFaceNormals();
                    geometry.computeVertexNormals();
                    resolve(geometry);
                    console.log("createGeometry end: " + self.since());
                }
            }
        });
    };
    SurfaceLauncher.prototype.switchSurface = function (name) {
        var opacity = this.surface.material.opacity;
        this.surface.visible = true;
        this.surface.material = this.materials[name];
        this.surface.material.opacity = opacity;
        this.surface.material.needsUpdate = true;
    };
    return SurfaceLauncher;
}(Surface));

var SurfaceManager = (function (_super) {
    __extends(SurfaceManager, _super);
    function SurfaceManager(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.lastSurfaceName = "image";
        return _this;
    }
    SurfaceManager.prototype.parse = function () {
        var _this = this;
        this.surface = new Surface(this.options);
        console.log("options1");
        console.log(this.options);
        this.surface.addEventListener(Surface.META_DATA_LOADED, function (event) {
            _this.dispatchEvent(event);
            _this.loadHiRes(event.data);
        });
        return this.surface.parse().then(function (data) {
            return data;
        }).catch(function (err) {
            Explorer3d.Logger.error("We failed in the simple example");
            Explorer3d.Logger.error(err);
        });
    };
    SurfaceManager.prototype.loadHiRes = function (data) {
        var _this = this;
        console.log(data);
        var aspectRatio = data.width / data.height;
        var width, height, imageWidth, imageHeight;
        if (aspectRatio > 1) {
            imageWidth = this.options.hiResImageWidth;
            imageHeight = Math.round(this.options.hiResImageWidth / aspectRatio);
            width = this.options.hiResX;
            height = Math.round(this.options.hiResX / aspectRatio);
        }
        else {
            imageWidth = Math.round(this.options.hiResImageWidth * aspectRatio);
            imageHeight = this.options.hiResImageWidth;
            height = this.options.hiResX;
            width = Math.round(this.options.hiResX * aspectRatio);
        }
        var options = Object.assign({}, this.options, {
            bbox: data.bbox,
            template: this.options.template,
            loadImage: true,
            resolutionX: width,
            resolutionY: height,
            imageWidth: imageWidth,
            imageHeight: imageHeight
        });
        this.hiResSurface = new SurfaceLauncher(options);
        // this.hiResSurface = new Surface(options);
        this.hiResSurface.addEventListener(Surface.TEXTURE_LOADED_EVENT, function (event) {
            var data = event.data;
            _this.transitionToHiRes(data);
            _this.dispatchEvent({ type: SurfaceManager.HIRES_LOADED, data: data });
        });
        this.hiResSurface.parse();
    };
    SurfaceManager.prototype.transitionToHiRes = function (data) {
        var loRes = this.surface.surface;
        var opacity = loRes.material.opacity;
        console.log("Running loRes = " + opacity);
        loRes.visible = false;
    };
    SurfaceManager.prototype.switchSurface = function (name) {
        var actor;
        if (!this.hiResSurface || !this.hiResSurface.surface) {
            actor = this.surface;
        }
        else {
            if (name === "wireframe") {
                actor = this.surface;
                this.hiResSurface.surface.visible = false;
            }
            else {
                actor = this.hiResSurface;
                this.surface.surface.visible = false;
            }
            this.dispatchEvent({ type: SurfaceManager.SURFACE_CHANGED, data: actor.surface });
        }
        actor.switchSurface(name);
        return actor;
    };
    return SurfaceManager;
}(THREE.EventDispatcher));
SurfaceManager.HIRES_LOADED = "surfacemanager.hires.loaded";
SurfaceManager.SURFACE_CHANGED = "surfacemanager.surface.changed";

// Given a bbox, return a 2d grid with the same x, y coordinates plus a z-coordinate as returned by the 1d TerrainLoader.
var BoreholesLoader = (function () {
    function BoreholesLoader(options) {
        this.options = options;
    }
    BoreholesLoader.prototype.load = function () {
        var options = this.options;
        var location = this.options.template.replace("${bbox}", this.options.bbox.join(","));
        var loader = new Elevation.HttpTextLoader(location);
        return loader.load().then(function (str) { return JSON.parse(str); });
    };
    return BoreholesLoader;
}());

var BoreholesManager = (function () {
    function BoreholesManager(options) {
        this.options = options;
    }
    BoreholesManager.prototype.parse = function () {
        var _this = this;
        this.boreholes = new BoreholesLoader(this.options);
        return this.boreholes.load().then(function (data) {
            if (!data || !data.length) {
                return null;
            }
            var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffaaaa, linewidth: 1 });
            var lineGeom = new THREE.Geometry();
            var bbox = _this.options.bbox;
            data.filter(function (hole) { return hole.lon > bbox[0] && hole.lon <= bbox[2] && hole.lat > bbox[1] && hole.lat <= bbox[3]; })
                .forEach(function (hole) {
                var coord = proj4("EPSG:4283", "EPSG:3857", [hole.lon, hole.lat]);
                var length = hole.length != null ? hole.length : 10;
                var elevation = hole.elevation < -90000 ? 0 : hole.elevation;
                lineGeom.vertices.push(new THREE.Vector3(coord[0], coord[1], elevation));
                lineGeom.vertices.push(new THREE.Vector3(coord[0], coord[1], elevation - length));
            });
            lineGeom.computeBoundingSphere();
            return _this.lines = new THREE.LineSegments(lineGeom, lineMaterial);
        });
    };
    BoreholesManager.prototype.destroy = function () {
    };
    return BoreholesManager;
}());

var View = (function () {
    function View(bbox, options) {
        var _this = this;
        this.bbox = bbox;
        this.options = options;
        if (bbox) {
            this.draw();
            this.mappings = new Mappings(this.factory, Bind.dom);
            this.mappings.addEventListener("material.changed", function (event) {
                _this.surface.switchSurface(event["name"]);
            });
        }
        else {
            this.die();
        }
    }
    View.prototype.die = function () {
        Bind.dom.invalidParameter.classList.remove("hide");
    };
    View.prototype.draw = function () {
        var _this = this;
        var options = Object.assign({}, this.options.surface);
        var bbox = this.bbox;
        // Grab ourselves a world factory
        var viewOptions = this.options.worldView;
        viewOptions.cameraPositioner = new CossapCameraPositioner();
        var factory = this.factory = new Explorer3d.WorldFactory(this.options.target, viewOptions);
        var ll = proj4("EPSG:4326", "EPSG:3857", [bbox[0], bbox[1]]);
        var ur = proj4("EPSG:4326", "EPSG:3857", [bbox[2], bbox[3]]);
        options.bbox = ll;
        options.bbox.push(ur[0]);
        options.bbox.push(ur[1]);
        options.imageHeight = Math.round(options.imageWidth * (options.bbox[3] - options.bbox[1]) / (options.bbox[2] - options.bbox[0]));
        this.surface = new SurfaceManager(options);
        this.surface.addEventListener(SurfaceManager.HIRES_LOADED, function (event) {
            var surface = event.data;
            _this.mappings.surface = surface;
            _this.factory.extend(surface, false);
        });
        this.surface.addEventListener(SurfaceManager.SURFACE_CHANGED, function (event) {
            var surface = event.data;
            _this.mappings.surface = surface;
        });
        this.surface.parse().then(function (surface) {
            _this.mappings.surface = surface;
            _this.boreholes = new BoreholesManager(Object.assign({ bbox: bbox }, _this.options.boreholes));
            _this.boreholes.parse().then(function (data) {
                if (data) {
                    _this.mappings.boreholes = data;
                    _this.factory.extend(data, false);
                }
            }).catch(function (err) {
                console.log("ERror boReholes");
                console.log(err);
            });
            // We got back a document so transform and show.
            _this.factory.show(surface);
        });
    };
    View.prototype.destroy = function () {
    };
    return View;
}());

var view = null;
if (!Promise && !!ES6Promise) {
    window["Promise"] = ES6Promise;
}
function bootstrap() {
    var storage, bbox;
    try {
        storage = new Storage();
        bbox = storage.bbox;
        if (!bbox) {
            die("Where is the valid bounding box?");
        }
    }
    catch (e) {
        die("That's not a valid bounding box!");
    }
    // let domBind = new DomBind(document.body);
    proj4.defs("EPSG:4283", "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs");
    drawView(bbox);
    storage.addEventListener(Storage.BBOX_EVENT, function (evt) {
        drawView(storage.bbox);
    });
}
function die(text) {
    drawView(null);
}
function drawView(bbox) {
    if (view) {
        view.destroy();
        view = null;
    }
    view = new View(bbox, createOptions());
}
function createOptions() {
    return Object.assign(Config.preferences, {
        target: Bind.dom.target
    });
}

exports.bootstrap = bootstrap;

Object.defineProperty(exports, '__esModule', { value: true });

})));
