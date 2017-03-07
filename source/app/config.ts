declare var Elevation;

export class Config {
   static preferences = {
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
         resolutionX: 60,
         imageWidth: 256,
         hiResX: 600,
         hiResImageWidth: 2048,
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

}