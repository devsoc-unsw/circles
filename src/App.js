import React from 'React';
import {useSelector, useDispatch} from 'react-redux';
import {updateDegree, resetDegree} from './actions/updateDegree'; 
import {appendCourse, deleteCourse} from './actions/updateCourses';
function App() {
    // Note: You can access the state from any component since it is passed down from root! 
    const degree = useSelector(state => state.degree);
    const dispatch = useDispatch();  
    return ( 
      <div> 
        {degree == null ? (
        <div> Select your degree, replace with dropdown 
          <button onClick={() => dispatch(updateDegree)}> UPDATE </button>
        </div> ) : (<Page/>)}
      </div>
    )
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