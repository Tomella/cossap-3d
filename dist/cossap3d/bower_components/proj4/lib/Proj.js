var parseCode = require('./parseCode');
var extend = require('./extend');
var projections = require('./projections');
var deriveConstants = require('./deriveConstants');
var Datum = require('./constants/Datum');
var datum = require('./datum');


function Projection(srsCode,callback) {
  if (!(this instanceof Projection)) {
    return new Projection(srsCode);
  }
  callback = callback || function(error){
    if(error){
      throw error;
    }
  };
  var json = parseCode(srsCode);
  if(typeof json !== 'object'){
    callback(srsCode);
    return;
  }
  var ourProj = Projection.projections.get(json.projName);
  if(!ourProj){
    callback(srsCode);
    return;
  }
  if (json.datumCode && json.datumCode !== 'none') {
    var datumDef = Datum[json.datumCode];
    if (datumDef) {
      json.datum_params = datumDef.towgs84 ? datumDef.towgs84.split(',') : null;
      json.ellps = datumDef.ellipse;
      json.datumName = datumDef.datumName ? datumDef.datumName : json.datumCode;
    }
  }
  json.k0 = json.k0 || 1.0;
  json.axis = json.axis || 'enu';

  var sphere = deriveConstants.sphere(json.a, json.b, json.rf, json.ellps, json.sphere);
  var ecc = deriveConstants.eccentricity(sphere.a, sphere.b, sphere.rf, json.R_A);
  var datumObj = json.datum || datum(json.datumCode, json.datum_params, sphere.a, sphere.b, ecc.es, ecc.ep2);

  extend(this, json); // transfer everything over from the projection because we don't know what we'll need
  extend(this, ourProj); // transfer all the methods from the projection

  // copy the 4 things over we calulated in deriveConstants.sphere
  this.a = sphere.a;
  this.b = sphere.b;
  this.rf = sphere.rf;
  this.sphere = sphere.sphere;

  // copy the 3 things we calculated in deriveConstants.eccentricity
  this.es = ecc.es;
  this.e = ecc.e;
  this.ep2 = ecc.ep2;

  // add in the datum object
  this.datum = datumObj;

  // init the projection
  this.init();

  // legecy callback from back in the day when it went to spatialreference.org
  callback(null, this);

}
Projection.projections = projections;
Projection.projections.start();
module.exports = Projection;
