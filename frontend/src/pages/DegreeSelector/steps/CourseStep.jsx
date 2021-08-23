import React from 'react';
import { Typography, Button, Tag } from 'antd';
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
// import { plannerActions } from '../../../actions/plannerActions';

const { Title } = Typography;
const courseTag = () => {

}
export const CourseStep = () => {
    // let the user know that you've added all the compulsory courses
    // Let the user add in any courses that they've already completed
    const dispatch = useDispatch();
    const history = useHistory();
    const [input, setInput] = React.useState('');
    const coreCourses = ['COMP1511', 'COMP1521', 'COMP1531', 'COMP2511', 'COMP2521', 'COMP3900', 'COMP4920'];
    const [courses, setCourses] = React.useState(coreCourses);
    const handleInput = (e) => {
        setInput(e.target.value);
    }
    return (
        <div className='steps-root-container'>
            <Title level={3} className="text">
                Add your courses
            </Title>
             {/*Notification about adding all core courses already */}
            
            <input 
                className='steps-search-input'
                value={input}
                onChange={(e) => handleInput(e)}
            />
            {coreCourses.map(course => <Tag>{course}</Tag>)}
            <Button
                className='steps-next-btn'
                type="primary"
                // onClick={() => {
                    // planner action to add courses into unplanned
                    // Need to perform calls to get information about a list of courses
            // }}
            >
                Next
            </Button>
        </div>
    )
}