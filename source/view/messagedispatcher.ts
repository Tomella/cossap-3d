export class MessageDispatcher {
   constructor(public element: HTMLElement, dispatcher: THREE.EventDispatcher) {
      let timer;

      let clear = () => {
         element.innerHTML = "";
         element.classList.remove("log", "warn", "error", "success");
         element.classList.add("hide");
      };

      let logger = (event) => {
         clearTimeout(timer);
         element.innerHTML = event.data;
         element.classList.remove("hide", "log", "warn", "error", "success");
         element.classList.add(event.type);
         timer = setTimeout( () => {
            clear();
         }, event.duration);
      };

      dispatcher.addEventListener("log", logger);
      dispatcher.addEventListener("warn", logger);
      dispatcher.addEventListener("error", logger);
      dispatcher.addEventListener("success", logger);
   }

   clear() {

   }
}