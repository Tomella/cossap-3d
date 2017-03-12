export abstract class Layer extends THREE.EventDispatcher {
   abstract parse(): void;
   abstract switch(name: string, opacity?: number): void;
   abstract set visible(on: boolean);
}