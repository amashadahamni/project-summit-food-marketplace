import React from 'react';
import ReactDOM from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

function SupplierApp() {
  return (
    <div>
      <h1>Supplier App</h1>
      <p>Submit products and track approval status.</p>
    </div>
  );
}

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: SupplierApp,
});

export const { bootstrap, mount, unmount } = lifecycles;
