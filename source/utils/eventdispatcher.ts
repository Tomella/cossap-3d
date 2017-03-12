/**
 * Slightly modified for TypeScript. Also we want it in the domain
 * https://github.com/mrdoob/eventdispatcher.js/
 */
import { Event } from "../domain/event";

export class EventDispatcher {
   private listeners: any;

   public addEventListener(type: string, listener: Function) {
      if (this.listeners === undefined) this.listeners = {};

      let listeners = this.listeners;

      if (listeners[type] === undefined) {
         listeners[type] = [];
      }

      if (listeners[type].indexOf(listener) === - 1) {
         listeners[type].push(listener);
      }
   }

   public hasEventListener(type: string, listener: Function) {
      if (this.listeners === undefined) return false;

      let listeners = this.listeners;

      if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== - 1) {
         return true;
      }
      return false;
   }

   public removeEventListener(type: string, listener: Function) {
      if (this.listeners === undefined) return;

      let listenerArray = this.listeners[type];

      if (listenerArray !== undefined) {
         this.listeners[type] = listenerArray.filter(existing => listener !== existing);
      }
   }

   public dispatchEvent(event: Event) {
      let listeners = this.listeners;
      if (listeners === undefined) return;

      let array: any[] = [];

      let listenerArray = listeners[event.type];
      if (listenerArray !== undefined) {
         event.target = this;
         listenerArray.forEach(listener => listener.call(this, event));
      }
   }

   public removeAllListeners() {
      this.listeners = undefined;
   }
}