// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // apiserver: '140.135.11.224:3001',
  apiserver: '192.168.43.219:3001',
  socket: 'ws://192.168.43.219:3001',
  // apiserver: 'localhost:3001',
  // socket:'ws://localhost:3001',
  fileSocketServer: 'ws://192.168.43.219:3002/upload'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
