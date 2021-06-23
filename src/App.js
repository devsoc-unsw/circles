import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import './App.less';
import Home from './pages/Home';
import CourseSelector from './pages/CourseSelector/CourseSelector';


function App() {
  // Note: You can access the state from any component since it is passed down from root!
  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/course-selector">
            <CourseSelector />
          </Route>
        </Switch>
      </Router>
    </>
  );
}

// How I imagine dispatch works
// dispatch(data) {
//   for (action in action) {
//     if data.type = action {
//       runReducer(data.params);
//     }
//   }
// }

// Click a button
// Run a function (Reducer)
// pass in action with information -> action.type  (Action)
// Run the function which has the same type as action.type ()
// Update the store (global store) with the next data
// When any value within the store changes, components which use this value will re-render

export default App;
