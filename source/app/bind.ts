export class Bind {

   // Keep all the DOM stuff together. Make the abstraction to the HTML here
   static dom = {
      target: document.getElementById("target"),
      body: document.body,
      verticalExaggeration: document.getElementById("verticalExaggeration"),
      verticalExaggerationView: document.getElementById("verticalExaggerationValue"),
      surfaceOpacity: document.getElementById("surfaceOpacity"),
      showHideBoreholes: document.getElementById("showHideBoreholes"),
      surfaceMaterialRadio: document.getElementsByName("surfaceMaterialRadio")

   };
}