export class Db {
   private indexedDB: IDBFactory;
   private IDBTransaction;
   private IDBKeyRange;

   constructor(global: any, public dbName: string, public tableInfos: Array<TableInfo>) {
      this.indexedDB = global.indexedDB || global.mozIndexedDB || global.webkitIndexedDB || global.msIndexedDB;
      this.open();
   }

   open(): Promise<any> {
      return new Promise((resolve, reject) {
         let req: IDBOpenDBRequest;

         req = this.indexedDB.open(this.dbName);
         req.onupgradeneeded = this.addTables;
         req.onsuccess = function (e: any) {
            resolve(e.target.result);
         };
      });

   }

   addTables() {

   }
/*
   resetDB() {
      this.db.close();
      this.indexedDB.deleteDatabase(this.dbName);
      this.open();
   }
*/
}

   /*
   // In the following line, you should include the prefixes of implementations you want to test.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
*/
}