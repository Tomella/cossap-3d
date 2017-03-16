/**
 * A convenience singleton to convey messages around the system.
 * Typically the view will grab a handle on this and propogate
 * the messages to the UI. Because it is a singleton anything can
 * grab a handle and start spitting out messages.
 *
 * Neither the consumer or the emitter is aware of each other so
 * it should stay nicely decoupled (and it is highly cohesive).
 *
 * There is nothing stopping multiple listeners from grabbing this
 * so for example it could be grabbed by a logger and the
 * message be logged somewhere.
 */

export class MessageBus extends THREE.EventDispatcher {
   static instance = new MessageBus();

   constructor() {
      super();
      if (MessageBus.instance) {
         throw new Error("Use the static instance property. Do not create a new on");
      }
   }

   clear() {
      this.dispatchEvent({
         type: "clear"
      });
   }

   success(message: string, duration: number = 10000) {
      this.dispatchEvent({
         type: "success",
         data: message,
         duration
      });
   }

   log(message: string, duration: number = 10000) {
      this.dispatchEvent({
         type: "log",
         data: message,
         duration
      });
   }

   warn(message: string, duration: number = 10000) {
      this.dispatchEvent({
         type: "warn",
         data: message,
         duration
      });
   }

   error(message: string, duration: number = 10000) {
      this.dispatchEvent({
         type: "error",
         data: message,
         duration
      });
   }
}