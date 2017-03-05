export class Mapper {
   constructor(public data: any) {

   }

   get(str) {
      let result = null;

      if (str) {
         result = this.data;
         let keys = str.split(".");
         for (let i = 0; i < keys.length; i++) {
            result = result[keys[i]];
            if (!result) {
               break;
            }
         }
      }
      return result;
   }
}