// var JSX = require('node-jsx').install({
//     harmony: true
// });

import React from 'react';
import ReactDOM from 'react-dom';
import Hello from './components/hello.react';
import Register from './components/registerPanel.react';


// var React = require('react');
// var Hello = require('./components/hello.react');
// var ReactDOM = require('react-dom');

ReactDOM.render(
  <Register />,
  document.getElementById('react-app')
);
