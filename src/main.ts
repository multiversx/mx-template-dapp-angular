import './polyfills';
import { initApp } from '@multiversx/sdk-dapp/out/methods/initApp/initApp';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

async function main() {
  initApp({
    storage: { getStorageCallback: () => sessionStorage },
    dAppConfig: environment.dAppConfig,
  }).then(() => {
    bootstrapApplication(App, appConfig).catch(err => console.error(err));
  });
}

main();
