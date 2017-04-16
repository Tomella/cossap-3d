/**
 * Literal bindings between UI and Javascript friendly accessors.
 */
export class Bind {

   // Keep all the DOM stuff together. Make the abstraction to the HTML here
   static dom = {
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
}