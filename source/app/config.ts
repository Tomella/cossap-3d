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
         baseUrl: "/explorer-cossap-services/service/rocks/",
         summaryService: "summary?zoom=${zoom}&xmin=${xmin}&xmax=${xmax}&ymin=${ymin}&ymax=${ymax}",
         featuresService: "features/",
         queryService: "query/",
         maxCount: 300000
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