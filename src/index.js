import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore }  from 'redux';
import allReducers from "./reducers/index"; 
import { Provider } from 'react-redux';
const store = createStore(
  allReducers, 
  // Download redux devtools extension on chrome extensions 
  // This is helpful for debugging the state inside ur browser
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
); 
ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>,
  document.getElementById('root')
);
