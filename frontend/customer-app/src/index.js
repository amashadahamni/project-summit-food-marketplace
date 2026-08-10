import React from 'react';
import ReactDOM from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

function CustomerApp() {
  return (
    <div>
      <h1>Customer App</h1>
      <p>Browse approved products and manage your cart.</p>
    </div>
  );
}

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: CustomerApp,
});

export const { bootstrap, mount, unmount } = lifecycles;
