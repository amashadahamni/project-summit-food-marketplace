import { registerApplication, start } from 'single-spa';

registerApplication({
  name: '@summit/customer-app',
  app: () => System.import('@summit/customer-app'),
  activeWhen: ['/customer']
});

registerApplication({
  name: '@summit/supplier-app',
  app: () => System.import('@summit/supplier-app'),
  activeWhen: ['/supplier']
});

registerApplication({
  name: '@summit/datasteward-app',
  app: () => System.import('@summit/datasteward-app'),
  activeWhen: ['/datasteward']
});

start();
