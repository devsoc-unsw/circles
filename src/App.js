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
          <button onClick={() => dispatch(update)}> UPDATE </button>
        </div> ) : (<Page/>)}
      </div>
    )
}

export default App;