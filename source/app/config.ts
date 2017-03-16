declare var Elevation;

/**
 * Javascript container for all things to do with configuration.
 */
export class Config {
   static preferences = {
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
         resolutionX: 75,
         imageWidth: 256,
         hiResX: 256,
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
            "alkaline ultrabasic": {r: 220, g: 20, b: 60},
            "argillaceous detrital sediment": {r: 0, g: 250, b: 154},
            "fault / shear rock": {r: 84, g: 255, b: 159},
            "feldspar- or lithic-rich arenite to rudite": {r: 255, g: 231, b: 186},
            "high grade metamorphic rock": {r: 240, g: 255, b: 240},
            "igneous": {r: 255, g: 182, b: 193},
            "igneous felsic": {r: 193, g: 255, b: 193},
            "igneous felsic intrusive": {r: 250, g: 235, b: 215},
            "igneous felsic volcanic": {r: 255, g: 239, b: 219},
            "igneous foid-bearing volcanic": {r: 238, g: 223, b: 204},
            "igneous intermediate intrusive": {r: 205, g: 192, b: 176},
            "igneous intermediate volcanic": {r: 222, g: 184, b: 135},
            "igneous intrusive": {r: 255, g: 211, b: 155},
            "igneous kimberlite": {r: 238, g: 197, b: 145},
            "igneous lamprophyres": {r: 237, g: 145, b: 33},
            "igneous mafic": {r: 255, g: 140, b: 0},
            "igneous mafic intrusive": {r: 255, g: 127, b: 0},
            "igneous mafic volcanic": {r: 238, g: 118, b: 0},
            "igneous ultramafic": {r: 255, g: 128, b: 0},
            "igneous ultramafic intrusive": {r: 255, g: 165, b: 75},
            "igneous ultramafic volcanic": {r: 205, g: 133, b: 63},
            "igneous volcanic": {r: 255, g: 218, b: 185},
            "low grade metamorphic rock": {r: 238, g: 58, b: 140},
            "meta-igneous": {r: 255, g: 110, b: 180},
            "meta-igneous felsic": {r: 154, g: 255, b: 154},
            "meta-igneous felsic volcanic": {r: 142, g: 56, b: 142},
            "meta-igneous mafic": {r: 113, g: 113, b: 198},
            "meta-igneous mafic volcanic": {r: 125, g: 158, b: 192},
            "meta-igneous ultramafic": {r: 56, g: 142, b: 142},
            "metamorphic": {r: 255, g: 131, b: 250},
            "metamorphic protolith unknown": {r: 0, g: 238, b: 0},
            "metasedimentary": {r: 216, g: 191, b: 216},
            "metasedimentary carbonate": {r: 127, g: 255, b: 0},
            "metasedimentary non-carbonate chemical or biochemical": {r: 255, g: 255, b: 224},
            "metasedimentary siliciclastic": {r: 255, g: 255, b: 0},
            "metasomatic": {r: 255, g: 0, b: 255},
            "mineralisation": {r: 155, g: 48, b: 255},
            "organic-rich rock": {r: 202, g: 225, b: 255},
            "regolith": {r: 0, g: 191, b: 255},
            "sedimentary": {r: 0, g: 245, b: 255},
            "sedimentary carbonate": {r: 255, g: 215, b: 0},
            "sedimentary non-carbonate chemical or biochemical": {r: 211, g: 211, b: 211},
            "sedimentary siliciclastic": {r: 192, g: 192, b: 192},
            "unknown": {r: 255, g: 255, b: 255},
            "vein": {r: 0, g: 190, b: 140}
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

}