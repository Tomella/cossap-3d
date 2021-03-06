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
        var bbox = this.parseBbox("[" + UrlParameters.parameters().bbox + "]");
        var width = bbox[2] - bbox[0];
        var height = bbox[3] - bbox[1];
        // What about the duffer that puts it around the wrong way?
        if (width < 0) {
            var temp = bbox[2];
            bbox[2] = bbox[0];
            bbox[0] = temp;
            width = Math.abs(width);
        }
        if (height < 0) {
            var temp = bbox[3];
            bbox[3] = bbox[1];
            bbox[1] = temp;
            height = Math.abs(height);
        }
        var centerX = (bbox[2] + bbox[0]) * 0.5;
        var centerY = (bbox[3] + bbox[1]) * 0.5;
        var halfwit = Storage.MIN_SIDE_LENGTH * 0.5;
        // What about the duffer who puts in the same lat or lng?
        if (width < Storage.MIN_SIDE_LENGTH) {
            bbox[0] = centerX - halfwit;
            bbox[2] = centerX + halfwit;
        }
        if (height < Storage.MIN_SIDE_LENGTH) {
            bbox[1] = centerY - halfwit;
            bbox[3] = centerY + halfwit;
        }
        this.bbox = bbox;
    };
    Storage.prototype.parseBbox = function (bboxStr) {
        if (bboxStr) {
            try {
                var parts = JSON.parse(bboxStr);
                if (Array.isArray(parts) && parts.every(function (num) { return !isNaN(num); }) && parts.length === 4) {
                    return parts;
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
Storage.MIN_SIDE_LENGTH = 0.004;
Storage.BBOX_KEY = "cossap3d.bbox";
Storage.BBOX_EVENT = "bbox.change";
Storage.STATE_KEY = "cossap3d.state";

/**
 * Literal bindings between UI and Javascript friendly accessors.
 */
var Bind = (function () {
    function Bind() {
    }
    return Bind;
}());
// Keep all the DOM stuff together. Make the abstraction to the HTML here
Bind.dom = {
    target: document.getElementById("target"),
    message: document.getElementById("messageBus"),
    body: document.body,
    elevationView: document.getElementById("intersection"),
    verticalExaggeration: document.getElementById("verticalExaggeration"),
    verticalExaggerationView: document.getElementById("verticalExaggerationValue"),
    surfaceOpacity: document.getElementById("surfaceOpacity"),
    showHideBoreholes: document.getElementById("showHideBoreholes"),
    surfaceMaterialRadio: document.getElementsByName("surfaceMaterialRadio"),
    invalidParameter: document.getElementById("invalidParameter"),
    showHideRocks: document.getElementById("showHideRocks"),
    serviceIsDead: document.getElementById("serviceIsDead")
};

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
            var holes = data.filter(function (hole) { return hole.lon > bbox[0] && hole.lon <= bbox[2] && hole.lat > bbox[1] && hole.lat <= bbox[3]; });
            if (_this.options.elevationLookup) {
                var coords_1 = holes.map(function (hole) { return proj4("EPSG:4283", "EPSG:3857", [hole.lon, hole.lat, hole.elevation]); });
                return _this.options.elevationLookup(coords_1).then(function (elevations) {
                    coords_1.forEach(function (coord, index) {
                        var elevation = elevations[index];
                        var hole = holes[index];
                        var length = hole.length != null ? hole.length : 10;
                        lineGeom.vertices.push(new THREE.Vector3(coord[0], coord[1], elevation));
                        lineGeom.vertices.push(new THREE.Vector3(coord[0], coord[1], elevation - length));
                    });
                    lineGeom.computeBoundingSphere();
                    return _this.lines = new THREE.LineSegments(lineGeom, lineMaterial);
                });
            }
            holes.forEach(function (hole) {
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

var CossapCameraPositioner = (function (_super) {
    __extends(CossapCameraPositioner, _super);
    function CossapCameraPositioner() {
        return _super.call(this) || this;
    }
    CossapCameraPositioner.prototype.position = function (z, radius, center) {
        return {
            x: center.x,
            y: center.y - 2 * radius,
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

var ElevationBroadcaster = (function (_super) {
    __extends(ElevationBroadcaster, _super);
    function ElevationBroadcaster(element) {
        var _this = _super.call(this) || this;
        _this.element = element;
        var timer;
        var raycaster = new THREE.Raycaster();
        var down, sx, sy;
        element.addEventListener("mousemove", function (event) {
            // Do nothing if we do not have a mesh.
            if (!_this.mesh || !_this.world.camera) {
                return;
            }
            var cX = event.offsetX;
            var cY = event.offsetY;
            var mouse = new THREE.Vector2();
            event.preventDefault();
            mouse.x = (cX / element.clientWidth) * 2 - 1;
            mouse.y = -(cY / element.clientHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, _this.world.camera);
            var intersects = raycaster.intersectObject(_this.mesh);
            if (intersects.length > 0) {
                var feature = intersects[0];
                var point = feature.point;
                point.z /= _this.world.dataContainer.scale.z;
                _this.dispatchEvent({
                    type: ElevationBroadcaster.OVER_POINT,
                    point: point
                });
            }
        });
        return _this;
    }
    ElevationBroadcaster.prototype.setMesh = function (mesh) {
        this.mesh = mesh;
    };
    ElevationBroadcaster.prototype.setWorld = function (world) {
        this.world = world;
    };
    return ElevationBroadcaster;
}(THREE.EventDispatcher));
ElevationBroadcaster.OVER_POINT = "overpoint";

var ElevationLookup = (function () {
    function ElevationLookup(mesh) {
        this.mesh = mesh;
        if (!mesh) {
            this.callbacks = [];
        }
    }
    ElevationLookup.prototype.setWorld = function (world) {
        this.world = world;
    };
    ElevationLookup.prototype.setMesh = function (mesh) {
        this.mesh = mesh;
        if (this.callbacks) {
            this.callbacks.forEach(function (callback) {
                callback(mesh);
            });
            this.callbacks = null;
        }
    };
    ElevationLookup.prototype.intersect = function (point) {
        var _this = this;
        if (this.mesh) {
            return new Promise(function (resolve, reject) {
                resolve(getIntersection(_this.mesh, point));
            });
        }
        else {
            return new Promise(function (resolve, reject) {
                _this.callbacks.push(function (mesh) {
                    console.log("Calling back");
                    resolve(getIntersection(mesh, point));
                });
            });
        }
    };
    ElevationLookup.prototype.lookup = function (point) {
        var _this = this;
        if (this.mesh) {
            return new Promise(function (resolve, reject) {
                resolve(getElevation(_this.mesh, point, _this.world));
            });
        }
        else {
            return new Promise(function (resolve, reject) {
                _this.callbacks.push(function (mesh) {
                    console.log("Calling back");
                    resolve(getElevation(mesh, point, _this.world));
                });
            });
        }
    };
    ElevationLookup.prototype.lookupPoints = function (points) {
        var _this = this;
        if (this.mesh) {
            return new Promise(function (resolve, reject) {
                resolve(points.map(function (point) { return getElevation(_this.mesh, point, _this.world); }));
            });
        }
        else {
            return new Promise(function (resolve, reject) {
                _this.callbacks.push(function (mesh) {
                    console.log("Calling back");
                    resolve(points.map(function (point) { return getElevation(_this.mesh, point, _this.world); }));
                });
            });
        }
    };
    return ElevationLookup;
}());
function getIntersection(mesh, point) {
    var raycaster = new THREE.Raycaster();
    var origin = new THREE.Vector3(point[0], point[1], 50000);
    var direction = new THREE.Vector3(0, 0, -1);
    raycaster.set(origin, direction);
    var result = raycaster.intersectObject(mesh);
    return result.length ? result[0] : null;
}
function getElevation(mesh, point, world) {
    var intersection = getIntersection(mesh, point);
    var z = intersection ? intersection.point.z : 0;
    return z / world.dataContainer.scale.z;
}

/**
 * Take a event dispatcher that dispatches "overpoint" events
 * and returns a point. Display the point
 */
var ElevationView = (function () {
    function ElevationView(elevationBroadcaster, element, projectionFn) {
        if (projectionFn === void 0) { projectionFn = projectionDefault; }
        var timer;
        var raycaster = new THREE.Raycaster();
        var down, sx, sy;
        elevationBroadcaster.addEventListener("overpoint", function (event) {
            var point = event.point;
            var transformed = projectionFn(point);
            element.innerHTML = "Approx Elev.: " + Math.round(transformed.z) +
                "m Lng: " + transformed.x.toFixed(4) +
                "° Lat: " + transformed.y.toFixed(4) +
                "°";
            clearTimeout(timer);
            timer = setTimeout(function () {
                element.innerHTML = "";
            }, 4000);
        });
    }
    return ElevationView;
}());
function projectionDefault(point) {
    return point;
}

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
        var elevation = gda94Elev - deltaLat * EllipsoidalToAhd.rampLat - deltaLng * EllipsoidalToAhd.rampLng - 10;
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
EllipsoidalToAhd.rampLat = 0.0000285; // 3.1 Just  a rough approximation
EllipsoidalToAhd.rampLng = 0.0000182; // 2;

var MessageDispatcher = (function () {
    function MessageDispatcher(element, dispatcher) {
        this.element = element;
        var timer;
        var clear = function () {
            element.innerHTML = "";
            element.classList.remove("log", "warn", "error", "success");
            element.classList.add("hide");
        };
        var logger = function (event) {
            clearTimeout(timer);
            element.innerHTML = event.data;
            element.classList.remove("hide", "log", "warn", "error", "success");
            element.classList.add(event.type);
            timer = setTimeout(function () {
                clear();
            }, event.duration);
        };
        dispatcher.addEventListener("log", logger);
        dispatcher.addEventListener("warn", logger);
        dispatcher.addEventListener("error", logger);
        dispatcher.addEventListener("success", logger);
    }
    MessageDispatcher.prototype.clear = function () {
    };
    return MessageDispatcher;
}());

/**
 * This is the bridge between the UI and the model
 */
var Mappings = (function () {
    function Mappings(factory, dom) {
        this.factory = factory;
        this.dom = dom;
        this._surfaceMaterialSelect = "image";
        this._materials = {};
        this._radioMap = {};
        this.mapVerticalExagerate();
        this.mapSurfaceOpacity();
        this.mapShowHideBoreholes();
        this.mapShowHideRocks();
        this.mapSurfaceMaterialRadio();
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
    Mappings.prototype.mapSurfaceOpacity = function () {
        var _this = this;
        var element = this.dom.surfaceOpacity;
        element.addEventListener("change", function () {
            _this._materials[_this._surfaceMaterialSelect].on(+element.value);
        });
    };
    Object.defineProperty(Mappings.prototype, "rocks", {
        set: function (rocks) {
            this._rocks = rocks;
            if (rocks) {
                rocks.visible = this.dom.showHideRocks.checked;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Mappings.prototype, "boreholes", {
        set: function (boreholes) {
            this._boreholes = boreholes;
            if (boreholes)
                boreholes.visible = this.dom.showHideBoreholes.checked;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Mappings.prototype, "messageDispatcher", {
        set: function (dispatcher) {
            if (this._messageDispatcher) {
                this._messageDispatcher.clear();
            }
            this._messageDispatcher = new MessageDispatcher(this.dom.message, dispatcher);
        },
        enumerable: true,
        configurable: true
    });
    Mappings.prototype.addMaterial = function (detail) {
        var _this = this;
        var name = detail.name;
        var material = this._materials[name];
        var keys = Object.keys(this._materials);
        if (!material || detail.priority > material.priority) {
            Object.keys(this._materials).forEach(function (key) {
                _this._materials[key].off();
            });
            this._materials[name] = detail;
            this._radioMap[name].disabled = false;
        }
        if (this._materials[this._surfaceMaterialSelect]) {
            this._materials[this._surfaceMaterialSelect].on(+this.dom.surfaceOpacity.value);
        }
    };
    Mappings.prototype.hasMaterial = function (name) {
        return !!this._materials[name];
    };
    Mappings.prototype.mapSurfaceMaterialRadio = function () {
        var _this = this;
        var elements = Array.from(this.dom.surfaceMaterialRadio);
        elements.forEach(function (element) {
            element.addEventListener("change", function (event) {
                var name = event.target.value;
                _this._surfaceMaterialSelect = name;
                var details = _this._materials[name];
                var opacity = +_this.dom.surfaceOpacity.value;
                Object.keys(_this._materials).forEach(function (key) {
                    _this._materials[key].off();
                });
                details.on(opacity);
            });
            _this._radioMap[element.value] = element;
        });
    };
    Mappings.prototype.mapShowHideBoreholes = function () {
        var _this = this;
        var element = this.dom.showHideBoreholes;
        element.addEventListener("change", function () {
            if (_this._boreholes) {
                _this._boreholes.visible = _this.dom.showHideBoreholes.checked;
            }
            
        });
    };
    Mappings.prototype.mapShowHideRocks = function () {
        var _this = this;
        var element = this.dom.showHideRocks;
        element.addEventListener("change", function () {
            if (_this._rocks) {
                _this._rocks.visible = _this.dom.showHideRocks.checked;
            }
            
        });
    };
    Mappings.prototype.dead = function () {
        var element = this.dom.serviceIsDead;
        element.classList.remove("hide");
    };
    return Mappings;
}());

/**
 * A convenience singleton to convey messages around the system.
 * Typically the view will grab a handle on this and propogate
 * the messages to the UI. Because it is a singleton anything can
 * grab a handle and start spitting out messages.
 *
 * Neither the consumer or the emitter is aware of each other so
 * it should stay nicely decoupled (and it is highly cohesive).
 *
 * There is nothing stopping multiple listeners from grabbing this
 * so for example it could be grabbed by a logger and the
 * message be logged somewhere.
 */
var MessageBus = (function (_super) {
    __extends(MessageBus, _super);
    function MessageBus() {
        var _this = _super.call(this) || this;
        if (MessageBus.instance) {
            throw new Error("Use the static instance property. Do not create a new on");
        }
        return _this;
    }
    MessageBus.prototype.clear = function () {
        this.dispatchEvent({
            type: "clear"
        });
    };
    MessageBus.prototype.success = function (message, duration) {
        if (duration === void 0) { duration = 10000; }
        this.dispatchEvent({
            type: "success",
            data: message,
            duration: duration
        });
    };
    MessageBus.prototype.log = function (message, duration) {
        if (duration === void 0) { duration = 10000; }
        this.dispatchEvent({
            type: "log",
            data: message,
            duration: duration
        });
    };
    MessageBus.prototype.warn = function (message, duration) {
        if (duration === void 0) { duration = 10000; }
        this.dispatchEvent({
            type: "warn",
            data: message,
            duration: duration
        });
    };
    MessageBus.prototype.error = function (message, duration) {
        if (duration === void 0) { duration = 10000; }
        this.dispatchEvent({
            type: "error",
            data: message,
            duration: duration
        });
    };
    return MessageBus;
}(THREE.EventDispatcher));
MessageBus.instance = new MessageBus();

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

var RocksParticlesLauncher = (function (_super) {
    __extends(RocksParticlesLauncher, _super);
    function RocksParticlesLauncher(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        return _this;
    }
    RocksParticlesLauncher.prototype.since = function () {
        return Date.now() - this.startMilli;
    };
    RocksParticlesLauncher.prototype.parse = function () {
        var _this = this;
        this.startMilli = Date.now();
        var worker = new Worker(this.options.workerLocation);
        console.log("started worker: " + this.options.workerLocation);
        worker.addEventListener("message", function (message) {
            var data = message.data;
            _this.dispatchEvent(data);
            if (data.type === WorkerEvent.PARTICLES_COMPLETE) {
                worker.terminate();
            }
        });
        worker.postMessage(Object.assign({ type: "particles" }, this.options));
    };
    return RocksParticlesLauncher;
}(THREE.EventDispatcher));

var TextSprite = (function () {
    function TextSprite(options) {
        this.options = options;
    }
    TextSprite.prototype.make = function (message) {
        var parameters = this.options;
        var parms = Object.assign({
            fontface: "Arial",
            fontsize: 14,
            padding: 12,
            rounding: 0,
            borderThickness: 2,
            borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
            backgroundColor: { r: 255, g: 255, b: 255, a: 1 }
        }, parameters ? parameters : {});
        var scale = this.options.scale;
        var canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.width = 24 + message.length * 5;
        canvas.height = 48;
        var context = canvas.getContext("2d");
        context.font = parms.fontsize + "px " + parms.fontface;
        // get size data (height depends only on font size)
        var metrics = context.measureText(message);
        var textWidth = metrics.width;
        // background color
        context.fillStyle = "rgba(" + parms.backgroundColor.r + "," + parms.backgroundColor.g + ","
            + parms.backgroundColor.b + "," + parms.backgroundColor.a + ")";
        // border color
        context.strokeStyle = "rgba(" + parms.borderColor.r + "," + parms.borderColor.g + ","
            + parms.borderColor.b + "," + parms.borderColor.a + ")";
        context.lineWidth = parms.borderThickness;
        this.roundRect(context, parms.borderThickness / 2, parms.borderThickness / 2, textWidth + parms.borderThickness, parms.fontsize * 1.4 + parms.borderThickness, parms.rounding);
        // 1.4 is extra height factor for text below baseline: g,j,p,q.
        // text color
        context.fillStyle = "rgba(0, 0, 0, 1.0)";
        context.fillText(message, parms.borderThickness, parms.fontsize + parms.borderThickness);
        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        var spriteMaterial = new THREE.SpriteMaterial({
            map: texture
        });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(scale * 25, scale * 15, 1); // scale * 1);
        return sprite;
    };
    // function for drawing rounded rectangles
    TextSprite.prototype.roundRect = function (ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    };
    return TextSprite;
}());

var RocksContainer = (function (_super) {
    __extends(RocksContainer, _super);
    function RocksContainer(feature, options) {
        var _this = _super.call(this) || this;
        _this.feature = feature;
        _this.options = options;
        _this.container = new THREE.Object3D();
        _this.id = feature.id;
        var zoom = _this.zoom = +_this.id.split("/")[0];
        _this.widthFactor = 3000 / Math.pow(2, zoom);
        _this.createCluster();
        return _this;
    }
    RocksContainer.prototype.optionalParticles = function () {
        var _this = this;
        // Bail out if we have been told to.
        if (this.options.summaryOnly) {
            return;
        }
        var launcher = new RocksParticlesLauncher({
            bbox: this.options.bbox,
            id: this.id,
            template: this.options.baseUrl + this.options.featuresService,
            workerLocation: this.options.workerLocation
        });
        launcher.addEventListener(WorkerEvent.PARTICLES_LOADED, function (event) {
            _this.dispatchEvent(event);
        });
        launcher.addEventListener(WorkerEvent.PARTICLES_COMPLETE, function (event) {
            // Sometimes we do not create them
            if (_this.cluster)
                _this.cluster.visible = false;
            _this.dispatchEvent(event);
        });
        launcher.parse();
    };
    RocksContainer.prototype.createCluster = function () {
        var _this = this;
        // Use the canonical EPSG:3857 point
        var xy = this.feature.geometry.coordinates;
        var count = this.count;
        var widthFactor = this.widthFactor;
        var zoom = this.zoom;
        var container = this.container;
        if (this.options.elevationLookup) {
            this.options.elevationLookup.intersect(xy).then(function (intersection) {
                if (intersection) {
                    _this.cluster = createCluster(xy, intersection.point.z);
                }
                _this.optionalParticles();
            });
        }
        else {
            this.cluster = createCluster(xy, 2000);
            this.optionalParticles();
        }
        function createCluster(xy, z) {
            var group = new THREE.Object3D();
            var texture = new THREE.TextureLoader().load("resources/imgs/red_brick.jpg");
            var material = new THREE.MeshPhongMaterial({
                map: texture,
                side: THREE.DoubleSide
            });
            var radius = widthFactor * (100 + Math.pow(count, 0.45));
            var object = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, radius * 1.2, 20), material);
            object.rotation.x = Math.PI / 2;
            object.position.set(xy[0], xy[1], z);
            var sprite = new TextSprite({ scale: 150000000 / Math.pow(zoom, 5.5), borderColor: { r: 255, g: 255, b: 255, a: 1 }, rounding: 1, fontsize: 14 });
            var text = sprite.make(count.toLocaleString());
            // text.material.map.image.addEventListener("mouseover", event => {
            //    console.log(event);
            // });
            text.position.set(xy[0], xy[1], z + radius * 0.6);
            group.add(text);
            group.add(object);
            container.add(group);
            return group;
        }
    };
    Object.defineProperty(RocksContainer.prototype, "count", {
        get: function () {
            return this.feature.properties["count"];
        },
        enumerable: true,
        configurable: true
    });
    RocksContainer.prototype.create = function () {
        return this.container;
    };
    return RocksContainer;
}(THREE.EventDispatcher));
RocksContainer.PARTICLES_LOADED = WorkerEvent.PARTICLES_LOADED;
RocksContainer.PARTICLES_COMPLETE = WorkerEvent.PARTICLES_COMPLETE;

var RocksLoader = (function () {
    function RocksLoader(options) {
        this.options = options;
    }
    // summary?zoom=${zoom}&xmin=${xmin}&xmax=${xmax}&ymin=${ymin}&ymax=${ymax}
    RocksLoader.prototype.loadSummary = function () {
        var options = this.options;
        var bbox = options.bbox;
        var location = this.options.template
            .replace("${xmin}", bbox[0])
            .replace("${ymin}", bbox[1])
            .replace("${xmax}", bbox[2])
            .replace("${ymax}", bbox[3])
            .replace("${zoom}", options.zoom);
        var loader = new Elevation.HttpTextLoader(location);
        return loader.load().then(function (str) { return JSON.parse(str); });
    };
    return RocksLoader;
}());

var RocksParticles = (function () {
    function RocksParticles(extent, zoom) {
        this.extent = extent;
        this.zoom = zoom;
        this.prepareCloud();
    }
    RocksParticles.prototype.prepareCloud = function () {
        this.nextIndex = 0;
        var particles = this.count;
        var geometry = this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(particles * 3);
        this.colors = new Float32Array(particles * 3);
        geometry.addAttribute("position", new THREE.BufferAttribute(this.positions, 3));
        geometry.addAttribute("color", new THREE.BufferAttribute(this.colors, 3));
        geometry.setDrawRange(0, this.nextIndex);
        // Use the zoom to make the dots the "right" size
        var material = new THREE.PointsMaterial({ size: 80000 / Math.pow(2, this.zoom - 2), vertexColors: THREE.VertexColors });
        this._points = new THREE.Points(geometry, material);
        window["points"] = this.points;
    };
    RocksParticles.prototype.add = function (points) {
        var _this = this;
        if (points && points.length) {
            var positions_1 = this.geometry.attributes.position.array;
            var geometry = this.geometry;
            var colors_1 = this.geometry.attributes.color.array;
            points.forEach(function (data) {
                var point = data.point;
                var color = data.color;
                var index = _this.nextIndex * 3;
                colors_1[index] = color.r;
                colors_1[index + 1] = color.g;
                colors_1[index + 2] = color.b;
                positions_1[index] = point.x;
                positions_1[index + 1] = point.y;
                positions_1[index + 2] = point.z;
                _this.nextIndex++;
            });
            this.geometry.setDrawRange(0, this.nextIndex);
            this.geometry.attributes.color.needsUpdate = true;
            this.geometry.attributes.position.needsUpdate = true;
            this.geometry.computeVertexNormals();
            this.geometry.computeBoundingSphere();
        }
    };
    Object.defineProperty(RocksParticles.prototype, "points", {
        get: function () {
            return this._points;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RocksParticles.prototype, "count", {
        get: function () {
            if (!this._count) {
                this._count = this.extent.features.reduce(function (accumulator, feature) {
                    return accumulator + feature.properties["count"];
                }, 0);
            }
            return this._count;
        },
        enumerable: true,
        configurable: true
    });
    return RocksParticles;
}());

function featureToEpsg3857(feature) {
    var point = feature.geometry.coordinates;
    feature.properties["point"] = [point[0], point[1]];
    feature.geometry.coordinates = pointToEpsg3857(point);
    return feature;
}
function pointToEpsg3857(point) {
    return proj4("EPSG:4326", "EPSG:3857", [point[0], point[1]]);
}

function longestSide(bbox) {
    return Math.max(bbox[2] - bbox[0], bbox[3] - bbox[1]);
}

/**
 * Shows rock properties. All layers are contained in a single THREE.Object3d
 * and this manages them.
 * It loads up a summary,
 * Creates a container
 * Draws spheres representing each of the cells or tiles,
 * For any counts below a threshold, it goes off and fetches them.
 * As each tile shows up it draws the points and hides the sphere.
 */
var RocksManager = (function () {
    function RocksManager(options) {
        this.options = options;
        var degrees = longestSide(options.bbox);
        this.zoom = Math.ceil(Math.log(RocksManager.CELL_ZERO_DEGREES / degrees)) + 3;
    }
    RocksManager.prototype.parse = function () {
        var _this = this;
        var bbox = this.options.bbox;
        var rocks = new RocksLoader({
            template: this.options.baseUrl + this.options.summaryService,
            zoom: this.zoom,
            bbox: bbox
        });
        return rocks.loadSummary().then(function (data) {
            if (data && data.features && data.features.length) {
                _this.rocksParticles = new RocksParticles(data, _this.zoom);
                var count = _this.rocksParticles.count;
                var original = _this.options;
                var options_1 = {
                    summaryOnly: count > original.maxCount,
                    bbox: original.bbox,
                    baseUrl: original.baseUrl,
                    workerLocation: original.workerLocation,
                    queryService: original.queryService,
                    featuresService: original.featuresService,
                    elevationLookup: original.elevationLookup
                };
                if (options_1.summaryOnly) {
                    MessageBus.instance.warn("Fetching rocks summary only. Too many points to render!");
                }
                _this.containers = data.features.map(function (feature) { return new RocksContainer(featureToEpsg3857(feature), options_1); });
                _this.container = new THREE.Object3D();
                _this.container.add(_this.rocksParticles.points);
                _this.containers.forEach(function (container) {
                    container.addEventListener(RocksContainer.PARTICLES_LOADED, function (particlesEvent) {
                        _this.rocksParticles.add(particlesEvent.data);
                    });
                    container.addEventListener(RocksContainer.PARTICLES_COMPLETE, function (particlesEvent) {
                        MessageBus.instance.log("Removing rocks properties marker as all samples fetched", 4000);
                    });
                    _this.container.add(container.create());
                });
                return _this.container;
            }
            else {
                console.log("rocks.load");
                console.log(data);
                return null;
            }
        });
    };
    RocksManager.prototype.destroy = function () {
    };
    return RocksManager;
}());
RocksManager.CELL_ZERO_DEGREES = 180;

var SurfaceEvent = (function () {
    function SurfaceEvent() {
    }
    return SurfaceEvent;
}());
SurfaceEvent.METADATA_LOADED = "metadata.loaded";
SurfaceEvent.SURFACE_LOADED = "surface.loaded";
SurfaceEvent.SURFACE_ELEVATION = "surface.elevation";
SurfaceEvent.MATERIAL_LOADED = "material.loaded";
SurfaceEvent.SURFACE_CHANGED = "surface.changed";

var Layer = (function (_super) {
    __extends(Layer, _super);
    function Layer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Layer;
}(THREE.EventDispatcher));

var LayerSwitch = (function () {
    function LayerSwitch(name, layer, material, priority) {
        if (priority === void 0) { priority = 0; }
        this.name = name;
        this.layer = layer;
        this.material = material;
        this.priority = priority;
    }
    LayerSwitch.prototype.on = function (opacity) {
        if (opacity === void 0) { opacity = 1; }
        this.layer.switch(this.name, opacity);
    };
    LayerSwitch.prototype.off = function () {
        this.layer.visible = false;
    };
    return LayerSwitch;
}());

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
        });
        parser.addEventListener(Explorer3d.WcsEsriImageryParser.TEXTURE_LOADED_EVENT, function (event) {
            _this.dispatchEvent({ type: SurfaceEvent.MATERIAL_LOADED, data: new LayerSwitch("image", _this, _this.materials.image) });
        });
        return parser.parse().then(function (data) {
            _this.surface = data;
            Explorer3d.Logger.log(seconds$2() + ": We have shown the document");
            setTimeout(function () {
                _this.fetchMaterials();
                _this.fetchWireframeMaterial();
            });
            return data;
        }).catch(function (err) {
            Explorer3d.Logger.error("We failed in the simple example");
            Explorer3d.Logger.error(err);
            throw err;
        });
    };
    Surface.prototype.fetchWireframeMaterial = function () {
        this.materials.wireframe = new THREE.MeshBasicMaterial({
            color: 0xeeeeee,
            transparent: true,
            opacity: 0.7,
            wireframe: true
        });
        this.dispatchEvent({ type: SurfaceEvent.MATERIAL_LOADED, data: new LayerSwitch("wireframe", this, this.materials.wireframe) });
    };
    Surface.prototype.fetchMaterials = function () {
        var points = this.surface.geometry.vertices;
        var resolutionX = this.options.resolutionX;
        this.materials.image = this.surface.material;
    };
    Object.defineProperty(Surface.prototype, "visible", {
        set: function (on) {
            this.surface.visible = on;
        },
        enumerable: true,
        configurable: true
    });
    Surface.prototype.switch = function (name, opacity) {
        this.surface.visible = true;
        this.surface.material = this.materials[name];
        this.surface.material.opacity = opacity;
        this.surface.material.needsUpdate = true;
    };
    return Surface;
}(Layer));
function seconds$2() {
    return (Date.now() % 100000) / 1000;
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

var SurfaceLauncher = (function (_super) {
    __extends(SurfaceLauncher, _super);
    function SurfaceLauncher(options) {
        var _this = _super.call(this, options) || this;
        _this.materials = {};
        _this.switches = [];
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
        var heapMapState;
        var geometryState;
        this.createImageMaterial();
        this.createTopoMaterial(options);
        worker.addEventListener("message", function (message) {
            var data = message.data;
            if (data.type === WorkerEvent.XYZ_LOADED) {
                // console.log("WorkerEvent.XYZ_LOADED: " + this.since());
                _this.completeGeometry(geometryState.geometry);
                _this.checkComplete();
            }
            else if (data.type === WorkerEvent.XYZ_BLOCK) {
                // console.log("WorkerEvent.XYZ_BLOCK: " + this.since());
                _this.extendGeometry(geometryState, data.data);
            }
            else if (data.type === WorkerEvent.COLOR_BLOCK) {
                // console.log("WorkerEvent.COLOR_BLOCK: " + this.since());
                _this.extendHeatmapMaterial(heapMapState, options, data.data);
            }
            else if (data.type === WorkerEvent.COLOR_LOADED) {
                // console.log("WorkerEvent.COLOR_LOADED: " + this.since());
                _this.completeHeatmapMaterial(heapMapState.mask, options);
            }
        });
        worker.postMessage(options);
        heapMapState = this.prepareHeatMapMaterial(options);
        geometryState = this.prepareGeometry();
    };
    SurfaceLauncher.prototype.prepareGeometry = function () {
        console.log("createGeometry start: " + this.since());
        var resolutionX = this.options.resolutionX;
        var resolutionY = this.options.resolutionY;
        var geometry = new THREE.PlaneGeometry(resolutionX, resolutionY, resolutionX - 1, resolutionY - 1);
        return {
            geometry: geometry,
            count: 0
        };
    };
    SurfaceLauncher.prototype.extendGeometry = function (state, res) {
        var geometry = state.geometry;
        var count = state.count;
        res.forEach(function (xyz) {
            var vertice = geometry.vertices[count++];
            vertice.z = xyz.z;
            vertice.x = xyz.x;
            vertice.y = xyz.y;
        });
        state.count = count;
    };
    SurfaceLauncher.prototype.completeGeometry = function (geometry) {
        console.log("createGeometry compute start: " + this.since());
        geometry.computeBoundingSphere();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        this.geometry = geometry;
        console.log("createGeometry end: " + this.since());
    };
    SurfaceLauncher.prototype.prepareHeatMapMaterial = function (options) {
        console.log("createHeatmapMaterial start: " + this.since());
        var mask = document.createElement("canvas");
        mask.width = options.resolutionX;
        mask.height = options.resolutionY;
        var context = mask.getContext("2d");
        var id = context.createImageData(1, 1);
        var d = id.data;
        return { mask: mask, context: context, id: id, d: d };
    };
    SurfaceLauncher.prototype.extendHeatmapMaterial = function (_a, options, res) {
        var mask = _a.mask, context = _a.context, id = _a.id, d = _a.d;
        // console.log("createHeatmapMaterial continue: " + this.since());
        res.forEach(function (_a) {
            var x = _a.x, y = _a.y, r = _a.r, g = _a.g, b = _a.b, a = _a.a;
            d[0] = r;
            d[1] = g;
            d[2] = b;
            d[3] = a;
            context.putImageData(id, x, y);
        });
    };
    SurfaceLauncher.prototype.completeHeatmapMaterial = function (mask, options) {
        var texture = new THREE.Texture(mask);
        texture.needsUpdate = true;
        var opacity = options.opacity ? options.opacity : 1;
        var material = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide
        });
        this.materials.heatmap = material;
        this.pushMaterialLoadedEvent(new LayerSwitch("heatmap", this, material));
        console.log("createHeatmapMaterial end: " + this.since());
    };
    SurfaceLauncher.prototype.pushMaterialLoadedEvent = function (data) {
        var _this = this;
        if (data) {
            this.switches.push(data);
        }
        if (this.surface) {
            this.switches.forEach(function (data) { return _this.dispatchEvent({ type: SurfaceEvent.MATERIAL_LOADED, data: data }); });
            this.switches = [];
        }
    };
    SurfaceLauncher.prototype.checkComplete = function () {
        if (this.materialComplete && this.geometry) {
            this.createMesh();
            this.dispatchEvent({
                type: SurfaceEvent.SURFACE_LOADED,
                data: this.surface
            });
            this.pushMaterialLoadedEvent();
        }
    };
    SurfaceLauncher.prototype.createTopoMaterial = function (data) {
        var self = this;
        this.materials.topo = new Explorer3d.WmsMaterial({
            template: this.options.topoTemplate,
            width: data.width,
            height: data.height,
            transparent: true,
            bbox: data.bbox,
            opacity: 0.7,
            onLoad: function () {
                self.pushMaterialLoadedEvent(new LayerSwitch("topo", self, self.materials.topo));
            }
        });
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
        var material = this.materials.image = new THREE.MeshPhongMaterial({
            map: loader.load(url, function (event) {
                _this.materialComplete = true;
                _this.pushMaterialLoadedEvent(new LayerSwitch("image", _this, material));
                _this.checkComplete();
            }),
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide
        });
        console.log("createImageMaterial end: " + this.since());
    };
    SurfaceLauncher.prototype.createMesh = function () {
        this.surface = new THREE.Mesh(this.geometry, this.materials.image);
    };
    return SurfaceLauncher;
}(Surface));

var SurfaceManager = (function (_super) {
    __extends(SurfaceManager, _super);
    function SurfaceManager(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.THRESHOLD_WIDTH = 1000; // 1km needed for hi res.
        _this.lastSurfaceName = "image";
        return _this;
    }
    SurfaceManager.prototype.parse = function () {
        var _this = this;
        this.loadHiresOn = true;
        this.surface = new Surface(this.options);
        // console.log("options1");
        // console.log(this.options);
        this.surface.addEventListener(Explorer3d.WcsEsriImageryParser.BBOX_CHANGED_EVENT, function (event) {
            _this.dispatchEvent(event);
            var data = event.data;
            var side = longestSide(data.bbox);
            _this.loadHiresOn = side > _this.THRESHOLD_WIDTH;
            if (_this.loadHiresOn) {
                _this.loadHiRes(data);
            }
        });
        this.surface.addEventListener(SurfaceEvent.MATERIAL_LOADED, function (event) {
            _this.dispatchEvent(event);
        });
        return this.surface.parse().then(function (data) {
            if (!_this.loadHiresOn) {
                _this.dispatchEvent({
                    type: SurfaceEvent.SURFACE_ELEVATION,
                    data: data
                });
            }
            return data;
        }).catch(function (err) {
            Explorer3d.Logger.error(err);
            throw err;
        });
    };
    SurfaceManager.prototype.loadHiRes = function (data) {
        // console.log(data);
        var _this = this;
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
        this.hiResSurface.addEventListener(SurfaceEvent.MATERIAL_LOADED, function (event) {
            // Set the priority higher than lo-res
            event.data.priority = 1;
            _this.dispatchEvent(event);
        });
        // this.hiResSurface = new Surface(options);
        this.hiResSurface.addEventListener(SurfaceEvent.SURFACE_LOADED, function (event) {
            _this.dispatchEvent({
                type: SurfaceEvent.SURFACE_ELEVATION,
                data: event.data
            });
            _this.dispatchEvent(event);
        });
        this.hiResSurface.parse();
    };
    return SurfaceManager;
}(THREE.EventDispatcher));

var View = (function () {
    function View(bbox, options) {
        this.bbox = bbox;
        this.options = options;
        if (bbox) {
            this.draw();
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
        this.messageBus = MessageBus.instance;
        this.messageBus.log("Loading...");
        var options = Object.assign({}, this.options.surface);
        var bbox = this.bbox;
        // Grab ourselves a world factory
        var viewOptions = this.options.worldView;
        viewOptions.cameraPositioner = new CossapCameraPositioner();
        var factory = this.factory = new Explorer3d.WorldFactory(this.options.target, viewOptions);
        this.mappings = new Mappings(factory, Bind.dom);
        this.mappings.messageDispatcher = this.messageBus;
        var ll = proj4("EPSG:4326", "EPSG:3857", [bbox[0], bbox[1]]);
        var ur = proj4("EPSG:4326", "EPSG:3857", [bbox[2], bbox[3]]);
        options.bbox = ll;
        options.bbox.push(ur[0]);
        options.bbox.push(ur[1]);
        options.imageHeight = Math.round(options.imageWidth * (options.bbox[3] - options.bbox[1]) / (options.bbox[2] - options.bbox[0]));
        this.elevationLookup = new ElevationLookup();
        this.surface = new SurfaceManager(options);
        this.surface.addEventListener(SurfaceEvent.SURFACE_LOADED, function (event) {
            _this.messageBus.log("Loaded Hi Res surface", 4000);
            _this.factory.extend(event.data, false);
        });
        this.surface.addEventListener(SurfaceEvent.SURFACE_ELEVATION, function (event) {
            _this.messageBus.log("Loaded elevation details", 4000);
            _this.elevationLookup.setWorld(factory.state.world);
            _this.elevationLookup.setMesh(event.data);
            var elevationBroadcaster = new ElevationBroadcaster(Bind.dom.target);
            elevationBroadcaster.setWorld(factory.state.world);
            elevationBroadcaster.setMesh(event.data);
            _this.elevationView = new ElevationView(elevationBroadcaster, Bind.dom.elevationView, function (vector3) {
                var point = proj4("EPSG:3857", "EPSG:4326", [vector3.x, vector3.y]);
                return new THREE.Vector3(point[0], point[1], vector3.z);
            });
        });
        this.surface.addEventListener(SurfaceEvent.MATERIAL_LOADED, function (event) {
            var data = event.data;
            _this.messageBus.log("Loaded " + data.name + " surface", 4000);
            _this.mappings.addMaterial(data);
        });
        this.surface.parse().then(function (surface) {
            // We got back a document so transform and show.
            _this.factory.show(surface);
            _this.fetchBoreholes(bbox);
            _this.fetchRocks(bbox);
        }).catch(function (err) {
            // If we can't get a surface we may as well give up because that is the 3D part.
            _this.mappings.dead();
        });
    };
    View.prototype.fetchRocks = function (bbox) {
        var _this = this;
        this.rocks = new RocksManager(Object.assign({ bbox: bbox, elevationLookup: this.elevationLookup }, this.options.rocks));
        this.rocks.parse().then(function (data) {
            _this.mappings.rocks = data;
            if (data) {
                _this.factory.extend(data, false);
                _this.messageBus.log("Rocks loading...", 4000);
            }
            // window["larry"] = this.factory;
        }).catch(function (err) {
            console.log("ERror rocks");
            console.log(err);
        });
    };
    View.prototype.fetchBoreholes = function (bbox) {
        var _this = this;
        var options = Object.assign({ bbox: bbox }, this.options.boreholes);
        // We only want to massage boreholes to match surface if zoomed in tightly as it is expensive.
        if (bbox[3] - bbox[1] < 0.001 && bbox[2] - bbox[0] < 0.001) {
            options.elevationLookup = function (points) { return _this.elevationLookup.lookupPoints(points); };
        }
        else {
            var ellipsoidalToAhd_1 = new EllipsoidalToAhd();
            options.elevationLookup = function (points) { return ellipsoidalToAhd_1.pointsToAhd(points); };
        }
        this.boreholes = new BoreholesManager(options);
        this.boreholes.parse().then(function (data) {
            if (data) {
                _this.messageBus.log("Boreholes complete", 4000);
                _this.mappings.boreholes = data;
                _this.factory.extend(data, false);
            }
        }).catch(function (err) {
            console.log("ERror boReholes");
            console.log(err);
        });
    };
    View.prototype.destroy = function () {
    };
    return View;
}());

/**
 * The bootstrap function starts the application.
 */
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
