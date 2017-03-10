import { Mapper } from "../utils/mapper";

/**
 * To be developed into an auto binder, to populate the Dom object programmatically.
 */
export class DomBind {
   private mapper;

   constructor(public element: HTMLElement, public data: any) {
      this.mapper = new Mapper(data);
      this.traverse(element);
   }

   traverse(element: Element) {
      Array.from( element.children).forEach(child => {
         let bind = child.getAttribute("bind");
         console.log(child);
         if (bind) {
            let attributes = child.attributes;
         } else {
            this.traverse(child);
         }
      });
   }
}