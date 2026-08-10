import React from 'react';
import ReactDOM from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

function DataStewardApp() {
  return (
    <div>
      <h1>Data Steward App</h1>
      <p>Review supplier submissions and approve or reject products.</p>
    </div>
  );
}

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: DataStewardApp,
});

export const { bootstrap, mount, unmount } = lifecycles;
