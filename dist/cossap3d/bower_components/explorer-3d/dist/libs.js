if (typeof Object.assign != 'function') {
  Object.assign = function (target, varArgs) { // .length of function is 2
    'use strict';
    if (target == null) { // TypeError if undefined or null
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) { // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}
/** For some reason the typescript transpiler is leaving this out so here it is as a hack. */
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};

var Promise = (this && this.Promise) || this.ES6Promise;

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.Explorer3d = global.Explorer3d || {})));
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

var Pusher = (function (_super) {
    __extends(Pusher, _super);
    function Pusher() {
        var _this = _super.call(this) || this;
        _this.complete = false;
        return _this;
    }
    return Pusher;
}(EventDispatcher));

var EventNames = (function () {
    function EventNames() {
    }
    return EventNames;
}());
EventNames.names = [
    "bstones",
    "borders",
    "complete",
    "header",
    "vertices",
    "faces",
    "lines",
    "properties"
];

function atom(atm) {
    var parts = atm.split(/\s+/g);
    var length = parts.length;
    var response = {
        get xyz() {
            return [this.x, this.y, this.z];
        }
    };
    parts.forEach(function (item, i) {
        switch (i) {
            case 0: break;
            case 1:
                response.index = parseInt(item) - 1;
                break;
            case 2:
                response.vertexId = parseFloat(item) - 1;
                break;
            case 3:
                response.properties = [];
            // Fall through to populate
            default:
                response.properties.push(item);
        }
    });
    return response;
}

function border(border) {
    var parts = border.split(/\s+/g);
    return {
        id: +parts[1] - 1,
        vertices: [
            +parts[2] - 1,
            +parts[3] - 1
        ]
    };
}

function bstone(bstone) {
    var parts = bstone.split(/\s+/g);
    return parseInt(parts[1]) - 1;
}

// We are zero based, GoCad is 1 based
// We are zero based, GoCad is 1 based
function face(face) {
    var parts = face.split(/\s+/g);
    var length = parts.length;
    var response = {
        get abc() {
            return [this.a, this.b, this.c];
        }
    };
    if (length === 4) {
        response.a = parseInt(parts[1]) - 1;
        response.b = parseFloat(parts[2]) - 1;
        response.c = parseFloat(parts[3]) - 1;
    }
    return response;
}

function vertex(vrtx, projectionFn, zDirection) {
    var parts = vrtx.split(/\s+/g);
    var length = parts.length;
    var zSign = zDirection ? zDirection : 1;
    var coord = [];
    var response = {
        get xyz() {
            return [this.x, this.y, this.z];
        },
        get all() {
            var data = [this.x, this.y, this.z];
            if (this.properties) {
                this.properties.forEach(function (item) {
                    data.push(item);
                });
            }
            return data;
        }
    };
    parts.forEach(function (item, i) {
        switch (i) {
            case 0: break;
            case 1:
                response.index = +item - 1;
                break;
            case 2:
                coord[0] = +item;
                // response.x = parseFloat(item);
                break;
            case 3:
                coord[1] = +item;
                // response.y = parseFloat(item);
                break;
            case 4:
                response.z = +item * zSign;
                break;
            case 5:
                response.properties = [];
            // Fall through to populate
            default:
                response.properties.push(item);
        }
    });
    if (projectionFn) {
        coord = projectionFn(coord);
    }
    response.x = coord[0];
    response.y = coord[1];
    return response;
}

var Event = (function () {
    function Event(type, data, target) {
        this.type = type;
        this.data = data;
        this.target = target;
    }
    return Event;
}());

var Box = (function () {
    function Box(min, max) {
        this.min = min;
        this.max = max;
    }
    return Box;
}());

var Vector3 = (function () {
    function Vector3(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Vector3;
}());

var BoxFactory = (function () {
    function BoxFactory() {
    }
    BoxFactory.fromVertices = function (vertices) {
        if (vertices === void 0) { vertices = []; }
        var box;
        vertices.forEach(function (vertex) {
            box = BoxFactory.expand(box, vertex);
        });
        return box;
    };
    BoxFactory.expand = function (box, vertex) {
        if (box === void 0) { box = new Box(new Vector3(Infinity, Infinity, Infinity), new Vector3(-Infinity, -Infinity, -Infinity)); }
        box.min.x = Math.min(box.min.x, vertex[0]);
        box.min.y = Math.min(box.min.y, vertex[1]);
        box.min.z = Math.min(box.min.z, vertex[2]);
        box.max.x = Math.max(box.max.x, vertex[0]);
        box.max.y = Math.max(box.max.y, vertex[1]);
        box.max.z = Math.max(box.max.z, vertex[2]);
        return box;
    };
    BoxFactory.toThreeBox3 = function (box) {
        return new THREE.Box3(new THREE.Vector3(box.min.x, box.min.y, box.min.z), new THREE.Vector3(box.max.x, box.max.y, box.max.z));
    };
    return BoxFactory;
}());

var VectorFactory = (function () {
    function VectorFactory() {
    }
    VectorFactory.subVectors = function (a, b) {
        return new Vector3(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    };
    VectorFactory.cross = function (v, w) {
        var vx = v.x, vy = v.y, vz = v.z;
        var wx = w.x, wy = w.y, wz = w.z;
        var x = vy * wz - vz * wy;
        var y = vz * wx - vx * wz;
        var z = vx * wy - vy * wx;
        return new Vector3(x, y, z);
    };
    VectorFactory.normalize = function (v) {
        return VectorFactory.divideScalar(v, VectorFactory.calcLength(v));
    };
    VectorFactory.calcLength = function (v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    };
    VectorFactory.divideScalar = function (v, scalar) {
        return VectorFactory.multiplyScalar(v, 1 / scalar);
    };
    VectorFactory.multiplyScalar = function (v, scalar) {
        if (isFinite(scalar)) {
            v.x *= scalar;
            v.y *= scalar;
            v.z *= scalar;
        }
        else {
            v.x = 0;
            v.y = 0;
            v.z = 0;
        }
        return v;
    };
    return VectorFactory;
}());

var FaceFactory = (function () {
    function FaceFactory() {
    }
    FaceFactory.computeNormal = function (face, vertices) {
        var a = vertices[face[0]];
        var b = vertices[face[1]];
        var c = vertices[face[2]];
        var cb = VectorFactory.subVectors(c, b);
        var ab = VectorFactory.subVectors(a, b);
        cb = VectorFactory.cross(cb, ab);
        VectorFactory.normalize(cb);
        face[3] = cb;
    };
    return FaceFactory;
}());

var Type = (function () {
    function Type() {
        this.type = "Type";
        this.isValid = false;
    }
    return Type;
}());

var TSurf = (function (_super) {
    __extends(TSurf, _super);
    function TSurf() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "TSurf";
        _this.vertices = [];
        _this.faces = [];
        _this.bstones = [];
        _this.borders = [];
        return _this;
    }
    return TSurf;
}(Type));

var CoordinateSystem = (function () {
    function CoordinateSystem() {
        this.isValid = true;
        this.typeMap = {
            AXIS_NAME: split,
            AXIS_UNIT: split
        };
    }
    return CoordinateSystem;
}());
function split(val) {
    return val.split(/\s+/g).map(function (str) {
        return str.replace(/\"/g, "");
    });
}

var StatePusher = (function (_super) {
    __extends(StatePusher, _super);
    function StatePusher() {
        var _this = _super.call(this) || this;
        _this.state = 0;
        return _this;
    }
    return StatePusher;
}(Pusher));

function isDataLine(line) {
    line = line.trim();
    return isNonEmpty(line) && line.indexOf("#") !== 0;
}
function isNonEmpty(line) {
    return line.trim().length !== 0;
}

var CoordinateSystemPusher = (function (_super) {
    __extends(CoordinateSystemPusher, _super);
    function CoordinateSystemPusher() {
        var _this = _super.call(this) || this;
        _this.coordinateSystem = new CoordinateSystem();
        _this.validHeader = false;
        return _this;
    }
    Object.defineProperty(CoordinateSystemPusher.prototype, "obj", {
        get: function () {
            return this.coordinateSystem;
        },
        enumerable: true,
        configurable: true
    });
    CoordinateSystemPusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsurf pusher");
        }
        switch (this.state) {
            case 0:
                return this.hasBlock(line);
            case 1:
                return this.pushData(line);
        }
    };
    CoordinateSystemPusher.prototype.hasBlock = function (line) {
        line = line.trim();
        if (line.length) {
            if (line !== "GOCAD_ORIGINAL_COORDINATE_SYSTEM") {
                this.complete = true;
                this.coordinateSystem.isValid = false;
                // Reject line
                return false;
            }
            else {
                this.state++;
            }
        }
        return true;
    };
    CoordinateSystemPusher.prototype.pushData = function (line) {
        if (isDataLine(line)) {
            if (line !== "END_ORIGINAL_COORDINATE_SYSTEM") {
                var index = line.indexOf(" ");
                if (index > 0) {
                    var name = line.substring(0, index);
                    var rest = line.substring(index).trim();
                    var mapper = this.coordinateSystem.typeMap[name] ? this.coordinateSystem.typeMap[name] : function (val) { return val; };
                    this.coordinateSystem[name] = mapper(rest);
                }
            }
            else {
                this.coordinateSystem.typeMap = null;
                this.complete = true;
            }
        }
        return true;
    };
    return CoordinateSystemPusher;
}(StatePusher));

function flowThru(val) {
    return val;
}

var Logger = (function () {
    function Logger() {
    }
    Logger.noop = function () { };
    
    Object.defineProperty(Logger, "level", {
        set: function (value) {
            var num = parseInt(value);
            num = num === NaN ? 0 : num;
            if (!Logger._broken) {
                Logger.log = console.log;
                try {
                    Logger.log("Setting log level");
                }
                catch (e) {
                    Logger._broken = true;
                }
            }
            if (Logger._broken) {
                Logger.log = num >= 64 ? function (main) { console.log(main); } : Logger.noop;
                Logger.info = num >= 32 ? function (main) { console.info(main); } : Logger.noop;
                Logger.warn = num >= 16 ? function (main) { console.warn(main); } : Logger.noop;
                Logger.log = num >= 8 ? function (main) { console.log(main); } : Logger.noop;
            }
            else {
                // We get to keep line numbers if we do it this way.
                Logger.log = num >= 64 ? console.log : Logger.noop;
                Logger.info = num >= 32 ? console.info : Logger.noop;
                Logger.warn = num >= 16 ? console.warn : Logger.noop;
                Logger.error = num >= 8 ? console.error : Logger.noop;
            }
        },
        enumerable: true,
        configurable: true
    });
    return Logger;
}());
Logger.LOG_ALL = 64;
Logger.LOG_INFO = 32;
Logger.LOG_WARN = 16;
Logger.LOG_ERROR = 8;
Logger.LOG_NOTHING = 0;
Logger._broken = false;
Logger.log = Logger.noop;
Logger.error = Logger.noop;
Logger.info = Logger.noop;
Logger.warn = Logger.noop;

function toBool(val) {
    return "true" === val;
}

function toColor(val) {
    if (val) {
        var parts = val.trim().split(/\s+/g);
        if (parts.length === 1) {
            if (parts[0].indexOf("#") === 0) {
                return parseInt("0x" + parts[0].substring(1));
            }
        }
        return parseFloat(parts[0]) * 255 * 256 * 256 + parseFloat(parts[1]) * 255 * 256 + parseFloat(parts[2]) * 255;
    }
    return null;
}

var Header = (function () {
    function Header() {
        this.values = {};
        this.typeMap = {
            ivolmap: toBool,
            imap: toBool,
            parts: toBool,
            mesh: toBool,
            cn: toBool,
            border: toBool,
            "*solid*color": toColor
        };
    }
    return Header;
}());

var HeaderPusher = (function (_super) {
    __extends(HeaderPusher, _super);
    function HeaderPusher() {
        var _this = _super.call(this) || this;
        _this.header = new Header();
        return _this;
    }
    Object.defineProperty(HeaderPusher.prototype, "obj", {
        get: function () {
            return this.header;
        },
        enumerable: true,
        configurable: true
    });
    HeaderPusher.prototype.push = function (line) {
        if (!isDataLine(line)) {
            return true;
        }
        line = line.trim();
        if (line.indexOf("}") === 0) {
            this.postLoad();
        }
        else {
            var parts = line.split(":");
            if (parts.length === 2) {
                var mapper = this.header.typeMap[parts[0]];
                mapper = mapper ? mapper : flowThru;
                this.header.values[parts[0]] = mapper(parts[1]);
            }
            else {
                Logger.warn("That doesn't look like a pair: " + line);
            }
        }
        return true;
    };
    HeaderPusher.prototype.postLoad = function () {
        this.complete = true;
        var header = this.header;
        header.name = header.values["name"];
        header.solidColor = header.values["*solid*color"];
        header.solidColor = header.solidColor ? header.solidColor : 0xeeeeee;
        header.typeMap = null;
    };
    return HeaderPusher;
}(Pusher));

var TSurfPusher = (function (_super) {
    __extends(TSurfPusher, _super);
    /**
     * We come in here on the next line
     */
    function TSurfPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.tsurf = new TSurf();
        _this.zSign = 1;
        _this.readTface = false;
        _this.verticesBuffer = [];
        _this.facesBuffer = [];
        _this.bordersBuffer = [];
        _this.bstonesBuffer = [];
        return _this;
    }
    Object.defineProperty(TSurfPusher.prototype, "obj", {
        get: function () {
            return this.tsurf;
        },
        enumerable: true,
        configurable: true
    });
    TSurfPusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsurf pusher");
        }
        switch (this.state) {
            case 0:
                return this.waitForHead(line);
            case 1:
                return this.loadHeader(line);
            case 2:
                return this.loadCs(line);
            case 3:
                return this.waitForTface(line);
            case 4:
                return this.processToEnd(line);
        }
    };
    TSurfPusher.prototype.waitForHead = function (line) {
        // Gobble up comments and blank lines
        if (line.startsWith("HEADER")) {
            if (line.indexOf("{") === -1) {
                this.complete = true;
            }
            else {
                this.headerPusher = new HeaderPusher();
            }
            this.state++;
        }
        return true;
    };
    TSurfPusher.prototype.loadHeader = function (line) {
        this.headerPusher.push(line);
        if (this.headerPusher.complete) {
            this.tsurf.header = this.headerPusher.obj;
            this.csPusher = new CoordinateSystemPusher();
            this.state++;
        }
        return true;
    };
    TSurfPusher.prototype.loadCs = function (line) {
        this.csPusher.push(line);
        if (this.csPusher.complete) {
            if (this.csPusher.obj.isValid) {
                this.tsurf.coordinateSystem = this.csPusher.obj;
                this.zSign = this.tsurf.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
            }
            this.state++;
            this.dispatchEvent(new Event("header", this.tsurf));
        }
        return true;
    };
    TSurfPusher.prototype.waitForTface = function (line) {
        if (!line.indexOf("TFACE")) {
            this.state++;
        }
        return true;
    };
    TSurfPusher.prototype.processToEnd = function (line) {
        line = line.trim();
        if (line === "END") {
            this.complete = true;
            this.state = 99;
            this.flushVertices();
            this.flushFaces();
            this.flushBstones();
            this.flushBorders();
            this.tsurf.vertices = [];
            this.dispatchEvent(new Event("complete", {
                header: this.tsurf.header,
                coordinateSystem: this.tsurf.coordinateSystem,
                bbox: this.tsurf.bbox
            }));
        }
        else {
            var tsurf = this.tsurf;
            var index = line.indexOf("VRTX");
            if (index === 0 || index === 1) {
                var v = vertex(line, this.projectionFn, this.zSign);
                tsurf.vertices[v.index] = v.all;
                this.tsurf.bbox = BoxFactory.expand(this.tsurf.bbox, v.all);
                this.checkVertices(v.all); // Got to hang on to vertices for easy lookup
            }
            else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                var a = atom(line);
                this.checkVertices(tsurf.vertices[a.index] = tsurf.vertices[a.vertexId]); // Got to hang on to vertices for easy lookup
            }
            else if (line.indexOf("TRGL") === 0) {
                var next = face(line).abc;
                FaceFactory.computeNormal(next, this.tsurf.vertices);
                // tsurf.faces.push(next); // We don't need faces anymore now that we are event driven
                this.checkFaces(next);
            }
            else if (line.indexOf("BSTONE") === 0) {
                var bs = bstone(line);
                // tsurf.bstones.push(bs); // We don't need bstones anymore now that we are event driven
                this.checkBstones(bs);
            }
            else if (line.indexOf("BORDER") === 0) {
                var b = border(line);
                // tsurf.borders[b.id] = [b.vertices[0], b.vertices[1]]; // We don't need borders anymore now that we are event driven
                this.checkBorders([b.vertices[0], b.vertices[1]]);
            }
        }
        return true;
    };
    TSurfPusher.prototype.checkVertices = function (vertex$$1) {
        this.verticesBuffer.push(vertex$$1);
        if (this.verticesBuffer.length >= TSurfPusher.PAGE_SIZE) {
            this.flushVertices();
        }
    };
    TSurfPusher.prototype.flushVertices = function () {
        this.verticesBuffer = this.flush("vertices", this.verticesBuffer);
    };
    TSurfPusher.prototype.checkFaces = function (face$$1) {
        this.facesBuffer.push(face$$1);
        if (this.facesBuffer.length >= TSurfPusher.PAGE_SIZE) {
            this.flushFaces();
        }
    };
    TSurfPusher.prototype.flushFaces = function () {
        this.facesBuffer = this.flush("faces", this.facesBuffer);
    };
    TSurfPusher.prototype.checkBorders = function (face$$1) {
        this.bordersBuffer.push(face$$1);
        if (this.bordersBuffer.length >= TSurfPusher.PAGE_SIZE) {
            this.flushBorders();
        }
    };
    TSurfPusher.prototype.flushBorders = function () {
        this.bordersBuffer = this.flush("borders", this.bordersBuffer);
    };
    TSurfPusher.prototype.checkBstones = function (face$$1) {
        this.bstonesBuffer.push(face$$1);
        if (this.bstonesBuffer.length >= TSurfPusher.PAGE_SIZE) {
            this.flushBstones();
        }
    };
    TSurfPusher.prototype.flushBstones = function () {
        this.bstonesBuffer = this.flush("bstones", this.bstonesBuffer);
    };
    TSurfPusher.prototype.flush = function (name, arr) {
        if (arr.length) {
            this.dispatchEvent(new Event(name, arr));
        }
        return [];
    };
    return TSurfPusher;
}(StatePusher));
TSurfPusher.PAGE_SIZE = 64 * 1024;

function segment(seg) {
    var parts = seg.split(/\s+/g);
    return [
        parseInt(parts[1]) - 1,
        parseInt(parts[2]) - 1
    ];
}

var PLineHeader = (function (_super) {
    __extends(PLineHeader, _super);
    function PLineHeader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PLineHeader;
}(Header));

var PLineHeaderPusher = (function (_super) {
    __extends(PLineHeaderPusher, _super);
    function PLineHeaderPusher() {
        return _super.call(this) || this;
    }
    Object.defineProperty(PLineHeaderPusher.prototype, "obj", {
        get: function () {
            return this.plineHeader;
        },
        enumerable: true,
        configurable: true
    });
    PLineHeaderPusher.prototype.push = function (line) {
        var accepted = _super.prototype.push.call(this, line);
        if (this.complete) {
            this.complete = true;
            this.plineHeader = Object.assign(new PLineHeader(), this.header);
            this.plineHeader.typeMap = null;
            this.plineHeader.paintedVariable = this.plineHeader.values["*painted*variable"];
            var color = this.plineHeader.values["*line*color"];
            this.plineHeader.color = color ? toColor(color) : 0x0000ff;
        }
        return accepted;
    };
    return PLineHeaderPusher;
}(HeaderPusher));

var PLine = (function (_super) {
    __extends(PLine, _super);
    function PLine() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "PLine";
        _this.vertices = [];
        _this.lines = [];
        return _this;
    }
    return PLine;
}(Type));

var PLinePusher = (function (_super) {
    __extends(PLinePusher, _super);
    /**
     * We come in here on the next line
     */
    function PLinePusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.pline = new PLine();
        _this.verticesBuffer = [];
        _this.segmentsBuffer = [];
        return _this;
    }
    Object.defineProperty(PLinePusher.prototype, "obj", {
        get: function () {
            return this.pline;
        },
        enumerable: true,
        configurable: true
    });
    PLinePusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsolid pusher");
        }
        switch (this.state) {
            case 0:
                return this.expectHeader(line);
            case 1:
                return this.pushHeader(line);
            case 2:
                return this.pushCs(line);
            case 3:
                return this.expectIline(line);
            case 4:
                return this.pushData(line);
        }
        return true;
    };
    PLinePusher.prototype.expectHeader = function (line) {
        line = line.trim();
        if (!line.startsWith("HEADER")) {
            return true;
        }
        if (!line || line.indexOf("{") === -1) {
            this.complete = true;
            return true;
        }
        this.child = new PLineHeaderPusher();
        this.state++;
        return true;
    };
    PLinePusher.prototype.pushHeader = function (line) {
        var accepted = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.pline.header = this.child.obj;
            this.child = new CoordinateSystemPusher();
        }
        return accepted;
    };
    PLinePusher.prototype.pushCs = function (line) {
        var response = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            if (this.child.isValid) {
                this.pline.coordinateSystem = this.child.obj;
                this.zSign = this.pline.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
            }
            this.dispatchEvent(new Event("header", this.pline));
        }
        return response;
    };
    PLinePusher.prototype.expectIline = function (line) {
        if (line.startsWith("ILINE")) {
            this.state++;
        }
        return true;
    };
    PLinePusher.prototype.pushData = function (line) {
        if (line === void 0) { line = ""; }
        line = line.trim();
        if (!line) {
            return true;
        }
        var pline = this.pline;
        if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
            var v = vertex(line, this.projectionFn, this.zSign);
            this.verticesBuffer[v.index] = v.all;
            pline.bbox = BoxFactory.expand(pline.bbox, v.all);
        }
        else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            var a = atom(line);
            var v = this.verticesBuffer[a.vertexId];
            this.verticesBuffer[a.index] = v;
        }
        else if (line.indexOf("SEG") === 0) {
            var seg = segment(line);
            this.segmentsBuffer.push(this.verticesBuffer[seg[0]]);
            this.segmentsBuffer.push(this.verticesBuffer[seg[1]]);
            this.checkSegments();
        }
        else if (line.indexOf("ILINE") === 0 || line.indexOf("END") === 0) {
            this.complete = line.indexOf("END") === 0;
            // The segments never go backwards and we are using the index.
            this.verticesBuffer = [];
            if (this.complete) {
                this.flushSegments();
                this.dispatchEvent(new Event("complete", {
                    header: pline.header,
                    coordinateSystem: pline.coordinateSystem,
                    bbox: pline.bbox
                }));
            }
        }
        return true;
    };
    PLinePusher.prototype.checkSegments = function () {
        if (this.segmentsBuffer.length >= PLinePusher.PAGE_SIZE) {
            this.flushSegments();
        }
    };
    PLinePusher.prototype.flushSegments = function () {
        // They are just pairs of vertices, nothing special
        this.segmentsBuffer = this.flush("vertices", this.segmentsBuffer);
    };
    PLinePusher.prototype.flush = function (name, arr) {
        if (arr.length) {
            this.dispatchEvent(new Event(name, arr));
        }
        return [];
    };
    return PLinePusher;
}(StatePusher));
PLinePusher.PAGE_SIZE = 32 * 1024;

var TSolid = (function (_super) {
    __extends(TSolid, _super);
    function TSolid() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "TSolid";
        _this.vertices = [];
        _this.tetras = [];
        return _this;
    }
    return TSolid;
}(Type));

function tetra(tetra) {
    var parts = tetra.split(/\s+/g);
    return [
        parseInt(parts[1]),
        parseInt(parts[2]),
        parseInt(parts[3]),
        parseInt(parts[4])
    ];
}

var TSolidPusher = (function (_super) {
    __extends(TSolidPusher, _super);
    function TSolidPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.tsolid = new TSolid();
        return _this;
    }
    Object.defineProperty(TSolidPusher.prototype, "obj", {
        get: function () {
            return this.tsolid;
        },
        enumerable: true,
        configurable: true
    });
    TSolidPusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsolid pusher");
        }
        switch (this.state) {
            case 0:
                return this.expectHeader(line);
            case 1:
                return this.pushHeader(line);
            case 2:
                return this.pushCs(line);
            case 3:
                return this.expectTvolume(line);
            case 4:
                return this.pushData(line);
        }
        return true;
    };
    TSolidPusher.prototype.expectHeader = function (line) {
        if (line.startsWith("HEADER")) {
            this.child = new HeaderPusher();
            this.state++;
        }
        return true;
    };
    TSolidPusher.prototype.pushHeader = function (line) {
        var response = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.tsolid.header = this.child.obj;
            this.child = new CoordinateSystemPusher();
        }
        return response;
    };
    TSolidPusher.prototype.pushCs = function (line) {
        var response = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.tsolid.coordinateSystem = this.child.obj;
            this.zSign = this.tsolid.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
        }
        return response;
    };
    TSolidPusher.prototype.expectTvolume = function (line) {
        if (line.startsWith("TVOLUME")) {
            this.state++;
        }
        return true;
    };
    TSolidPusher.prototype.pushData = function (line) {
        line = line.trim();
        if (line === "END") {
            if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                var v = vertex(line, this.projectionFn, this.zSign);
                this.tsolid.vertices[v.index] = v.all;
            }
            else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                var a = atom(line);
                this.tsolid.vertices[a.index] = this.tsolid.vertices[a.vertexId];
            }
            else if (line.indexOf("TETRA") === 0) {
                this.tsolid.tetras.push(tetra(line));
            }
        }
        else {
            this.complete = true;
        }
        return true;
    };
    return TSolidPusher;
}(StatePusher));

var VSet = (function (_super) {
    __extends(VSet, _super);
    function VSet() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "VSet";
        _this.vertices = [];
        return _this;
    }
    return VSet;
}(Type));

var VSetHeader = (function (_super) {
    __extends(VSetHeader, _super);
    function VSetHeader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VSetHeader;
}(Header));

var VSetHeaderPusher = (function (_super) {
    __extends(VSetHeaderPusher, _super);
    function VSetHeaderPusher() {
        return _super.call(this) || this;
    }
    Object.defineProperty(VSetHeaderPusher.prototype, "obj", {
        get: function () {
            return this.vsetHeader;
        },
        enumerable: true,
        configurable: true
    });
    VSetHeaderPusher.prototype.push = function (line) {
        var accepted = _super.prototype.push.call(this, line);
        if (this.complete) {
            this.complete = true;
            this.vsetHeader = Object.assign(new VSetHeader(), this.header);
            this.vsetHeader.color = toColor(this.vsetHeader.values["*atoms*color"]);
        }
        return accepted;
    };
    return VSetHeaderPusher;
}(HeaderPusher));

var VSetPusher = (function (_super) {
    __extends(VSetPusher, _super);
    /**
     * We come in here on the next line
     */
    function VSetPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.verticesBuffer = [];
        _this.vset = new VSet();
        return _this;
    }
    Object.defineProperty(VSetPusher.prototype, "obj", {
        get: function () {
            return this.vset;
        },
        enumerable: true,
        configurable: true
    });
    VSetPusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsolid pusher");
        }
        switch (this.state) {
            case 0:
                return this.expectHeader(line);
            case 1:
                return this.pushHeader(line);
            case 2:
                return this.pushCs(line);
            case 3:
                return this.pushData(line);
        }
        return true;
    };
    VSetPusher.prototype.expectHeader = function (line) {
        if (line === void 0) { line = ""; }
        line = line.trim();
        if (!line.startsWith("HEADER")) {
            return true;
        }
        if (line.indexOf("{") === -1) {
            this.complete = true;
        }
        this.child = new VSetHeaderPusher();
        this.state++;
        return true;
    };
    VSetPusher.prototype.pushHeader = function (line) {
        if (line === void 0) { line = ""; }
        var accepted = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.vset.header = this.child.obj;
            this.child = new CoordinateSystemPusher();
            this.zSign = 1;
            this.dispatchEvent(new Event("header", this.vset));
        }
        return accepted;
    };
    VSetPusher.prototype.pushCs = function (line) {
        var response = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.vset.coordinateSystem = this.child.obj;
            this.zSign = this.vset.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
        }
        return response;
    };
    VSetPusher.prototype.pushData = function (line) {
        if (line === void 0) { line = ""; }
        line = line.trim();
        if (line) {
            if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                var v = vertex(line, this.projectionFn, this.zSign);
                this.vset.bbox = BoxFactory.expand(this.vset.bbox, v.all);
                this.checkVertices(v.all);
            }
            else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                var a = atom(line);
                this.checkVertices(this.vset.vertices[a.vertexId]);
            }
            else if (line.startsWith("END") && !line.startsWith("END_")) {
                this.complete = true;
                this.flushVertices();
                this.dispatchEvent(new Event("complete", {
                    header: this.vset.header,
                    coordinateSystem: this.vset.coordinateSystem,
                    bbox: this.vset.bbox
                }));
            }
        }
        return true;
    };
    VSetPusher.prototype.checkVertices = function (vertex$$1) {
        this.verticesBuffer.push(vertex$$1);
        if (this.verticesBuffer.length >= VSetPusher.PAGE_SIZE) {
            this.flushVertices();
        }
    };
    VSetPusher.prototype.flushVertices = function () {
        this.verticesBuffer = this.flush("vertices", this.verticesBuffer);
    };
    VSetPusher.prototype.flush = function (name, arr) {
        if (arr.length) {
            this.dispatchEvent(new Event(name, arr));
        }
        return [];
    };
    return VSetPusher;
}(StatePusher));
VSetPusher.PAGE_SIZE = 64 * 1024;

var Unknown = (function (_super) {
    __extends(Unknown, _super);
    function Unknown() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "Unknown";
        return _this;
    }
    return Unknown;
}(Type));

var UnknownPusher = (function (_super) {
    __extends(UnknownPusher, _super);
    /**
     * We come in here on the next line
     */
    function UnknownPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.unknown = new Unknown();
        return _this;
    }
    Object.defineProperty(UnknownPusher.prototype, "obj", {
        get: function () {
            return this.unknown;
        },
        enumerable: true,
        configurable: true
    });
    UnknownPusher.prototype.push = function (line) {
        if (line.trim() === "END") {
            this.complete = true;
        }
        return true;
    };
    return UnknownPusher;
}(Pusher));

var TypeFactory = (function () {
    function TypeFactory() {
        this.isValid = false;
    }
    return TypeFactory;
}());

var TypeFactoryPusher = (function (_super) {
    __extends(TypeFactoryPusher, _super);
    function TypeFactoryPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.typeFactory = new TypeFactory();
        return _this;
    }
    Object.defineProperty(TypeFactoryPusher.prototype, "obj", {
        get: function () {
            return this.type.obj;
        },
        enumerable: true,
        configurable: true
    });
    TypeFactoryPusher.prototype.push = function (line) {
        var accepted = true;
        if (this.type) {
            accepted = this.type.push(line);
            this.complete = this.type.complete;
        }
        else {
            accepted = this.create(line);
        }
        return accepted;
    };
    TypeFactoryPusher.prototype.create = function (line) {
        var _this = this;
        line = line.trim();
        var parts = line.split(/\s+/g);
        this.typeFactory.isValid = parts.length === 3
            && parts[0] === "GOCAD"
            && (parts[2] === "1.0" || parts[2] === "1");
        if (this.typeFactory.isValid) {
            this.typeFactory.version = parts[2];
            if (parts[1] === "TSurf") {
                this.type = new TSurfPusher(this.projectionFn);
            }
            else if (parts[1] === "PLine") {
                this.type = new PLinePusher(this.projectionFn);
            }
            else if (parts[1] === "TSolid") {
                this.type = new TSolidPusher(this.projectionFn);
            }
            else if (parts[1] === "VSet") {
                this.type = new VSetPusher(this.projectionFn);
            }
            else {
                this.type = new UnknownPusher(this.projectionFn);
            }
        }
        var self = this;
        EventNames.names.forEach(function (name) { return _this.type.addEventListener(name, eventHandler); });
        return this.typeFactory.isValid;
        function eventHandler(event) {
            Logger.log("TFP: " + event.type);
            self.dispatchEvent(event);
        }
    };
    return TypeFactoryPusher;
}(Pusher));

var Document = (function () {
    function Document() {
        this.types = [];
    }
    return Document;
}());

var GocadDocument = (function (_super) {
    __extends(GocadDocument, _super);
    function GocadDocument() {
        var _this = _super.call(this) || this;
        _this.types = [];
        return _this;
    }
    return GocadDocument;
}(Document));

var DocumentPusher = (function (_super) {
    __extends(DocumentPusher, _super);
    function DocumentPusher(options, proj4) {
        var _this = _super.call(this) || this;
        _this.proj4 = proj4;
        _this.eventHandler = function (event) {
            Logger.log("DP: " + event.type);
            _this.dispatchEvent(event);
        };
        // They can pick a projection but if the app hasn't loaded the proj4 library we don't do anything as well
        if (options && options.from && options.to && options.from !== options.to && proj4) {
            proj4.defs("EPSG:3112", "+proj=lcc +lat_1=-18 +lat_2=-36 +lat_0=0 +lon_0=134 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
            _this.projectionFn = function reproject(from, to) {
                return function (coords) {
                    return proj4(from, to, [coords[0], coords[1]]);
                };
            }(options.from, options.to);
        }
        else {
            _this.projectionFn = passThru;
        }
        _this.document = new GocadDocument();
        _this.typefactorypusher = _this.createTypeFactoryPusher(_this.projectionFn);
        return _this;
    }
    Object.defineProperty(DocumentPusher.prototype, "obj", {
        get: function () {
            return this.document;
        },
        enumerable: true,
        configurable: true
    });
    DocumentPusher.prototype.push = function (line) {
        var consumed = this.typefactorypusher.push(line);
        // Well behaved children will have changed state when not consuming so *shouldn't* get in an infinite loop.
        if (!consumed) {
            Logger.log("NOT PUSHED: " + line);
            this.push(line);
            // Just in case they don't behave we'll swallow it.
            return true;
        }
        if (this.typefactorypusher.complete) {
            this.complete = true;
            this.document.types.push(this.typefactorypusher.obj);
            this.destroyTypeFactoryPusher(this.typefactorypusher);
            this.typefactorypusher = this.createTypeFactoryPusher(this.projectionFn);
        }
        return true;
    };
    DocumentPusher.prototype.createTypeFactoryPusher = function (projectionFn) {
        var _this = this;
        var self = this;
        var pusher = new TypeFactoryPusher(projectionFn);
        EventNames.names.forEach(function (name) {
            pusher.addEventListener(name, _this.eventHandler);
        });
        return pusher;
    };
    DocumentPusher.prototype.destroyTypeFactoryPusher = function (typefactorypusher) {
        var _this = this;
        EventNames.names.forEach(function (name) {
            typefactorypusher.removeEventListener(name, _this.eventHandler);
        });
    };
    return DocumentPusher;
}(Pusher));
function passThru(coords) {
    return coords;
}

var LinesToLinePusher = (function () {
    function LinesToLinePusher(callback) {
        this.callback = callback;
    }
    LinesToLinePusher.prototype.receiver = function (lines) {
        var _this = this;
        lines.forEach(function (line) {
            _this.callback(line);
        });
    };
    return LinesToLinePusher;
}());

var HttpPusher = (function () {
    function HttpPusher(url, callback) {
        this.url = url;
        this.callback = callback;
    }
    HttpPusher.prototype.start = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var self = _this;
            var get = new XMLHttpRequest();
            var index = 0;
            var pageNo = 0;
            var lineBuffer = [];
            var handleData = function () {
                if (get.readyState !== null && (get.readyState < 3 || get.status !== 200)) {
                    return;
                }
                var text = get.responseText;
                var totalLength = text.length;
                for (var i = index; i < totalLength; i++) {
                    var char = text[i];
                    if (char === "\r") {
                        continue;
                    }
                    if (char === "\n") {
                        var line = lineBuffer.join("");
                        lineBuffer = [];
                        self.callback(line);
                        continue;
                    }
                    lineBuffer.push(char);
                }
                index = totalLength;
                // Logger.log("Handling data: " + ++pageNo + ", size: " + text.length + ", state: " + get.readyState);
                if (get.readyState === 4) {
                    resolve(null);
                }
            };
            get.onreadystatechange = handleData;
            get.open("get", _this.url);
            get.send();
        });
    };
    return HttpPusher;
}());

var LinesPagedPusher = (function () {
    function LinesPagedPusher(file, options, callback) {
        this.file = file;
        this.callback = callback;
        this.blockSize = 16 * 1024; // A bit at a time should be harmless
        this.file = file;
        this.length = file.size;
        this.pageNo = -1;
        this.index = 0;
        this.blockSize = options.blockSize ? options.blockSize : this.blockSize;
        this.reader;
        this.lineBuffer = [];
        this.reader = new FileReader();
    }
    LinesPagedPusher.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, lines, lineResult, _a, group;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.read()];
                    case 1:
                        result = _b.sent();
                        lines = [];
                        _b.label = 2;
                    case 2:
                        if (!result) return [3 /*break*/, 8];
                        lineResult = this.next();
                        _a = lineResult.state;
                        switch (_a) {
                            case "more": return [3 /*break*/, 3];
                            case "line": return [3 /*break*/, 5];
                            case "complete": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 3:
                        group = lines;
                        lines = [];
                        try {
                            this.callback(group);
                        }
                        catch (e) {
                            Logger.error(e);
                            Logger.error("Someone died. Continue on.\n\n" + group.join("\n").substr(0, 2000));
                        }
                        return [4 /*yield*/, this.read()];
                    case 4:
                        result = _b.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        lines.push(lineResult.line);
                        return [3 /*break*/, 7];
                    case 6:
                        lines.push(lineResult.line);
                        if (lines.length) {
                            try {
                                this.callback(lines);
                            }
                            catch (e) {
                                Logger.error(e);
                                Logger.error("Someone died. Continue on.\n\n" + lines.join("\n").substr(0, 2000));
                            }
                        }
                        result = false;
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 2];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    LinesPagedPusher.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var self, start;
            return __generator(this, function (_a) {
                this.pageNo++;
                this.index = 0;
                self = this;
                start = this.pageNo * this.blockSize;
                Logger.log("Block size: " + this.blockSize + ", file size: " + this.length);
                return [2 /*return*/, new Promise(function (resolve) {
                        if (start >= _this.length) {
                            resolve(false);
                            return;
                        }
                        try {
                            self.reader.onloadend = function (evt) {
                                Logger.log("We have loaded with ready state = " + evt.target["readyState"]);
                                if (evt.target["readyState"] === FileReader.prototype.DONE) {
                                    Logger.log("Reading page " + self.pageNo);
                                    self.buffer = evt.target["result"];
                                    resolve(_this.hasMore());
                                }
                            };
                            self.reader.onerror = function (evt) {
                                Logger.log("What do you mean, error");
                            };
                            var blob = self.file.slice(start, start + self.blockSize);
                            self.reader.readAsText(blob);
                        }
                        catch (e) {
                            Logger.log(e);
                        }
                    })];
            });
        });
    };
    LinesPagedPusher.prototype.hasMore = function () {
        return this.index + this.blockSize * this.pageNo < this.length - 1;
    };
    LinesPagedPusher.prototype.next = function () {
        while (this.hasMore()) {
            if (!this.buffer || this.index >= this.blockSize) {
                return { state: "more" };
            }
            var char = this.buffer[this.index++];
            if (char === "\r") {
                continue;
            }
            if (char === "\n") {
                break;
            }
            this.lineBuffer.push(char);
        }
        var line = this.lineBuffer.join("");
        this.lineBuffer = [];
        return {
            state: this.hasMore() ? "line" : "complete",
            line: line
        };
    };
    return LinesPagedPusher;
}());

// Rollup the libs as used by the web workers.
// These are basically your domain objects, utilities, readers and transformers

exports.DocumentPusher = DocumentPusher;
exports.LinesToLinePusher = LinesToLinePusher;
exports.HttpPusher = HttpPusher;
exports.LinesPagedPusher = LinesPagedPusher;
exports.Logger = Logger;

Object.defineProperty(exports, '__esModule', { value: true });

})));
