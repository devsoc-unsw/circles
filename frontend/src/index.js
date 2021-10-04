import React from 'react';
import ReactDOM from 'react-dom';
import { createStore }  from 'redux';
import { Provider } from 'react-redux';
import allReducers from "./reducers/index"; 
import App from './App';


const store = createStore(
  allReducers, 
); 
ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>,
  document.getElementById('root')
);
