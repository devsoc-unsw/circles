import React from 'react';
import { Button, Typography } from 'antd';
import { useHistory } from 'react-router-dom';
import { degreeActions } from '../../../actions/degreeActions';
import { useDispatch, useSelector } from 'react-redux'
import './steps.less';
const options = [
    'MINOR 1', 
    'MINOR 2', 
    'MINOR 3', 
    'MINOR 4', 
];  
const { Title } = Typography;
export const MinorStep = () => {
    const dispatch = useDispatch();
    const history = useHistory();  
    const program = useSelector(store => store.degree.program);
    // Fetch the minors
    const [selected, setSelected] = React.useState("Select Minor"); 
    return (
        <div>
             <Title level={3} className="text">
                and minoring in 
            </Title>
            <select 
                className='steps-dropdown'
                name="Select Minor"
                onChange={value => setSelected(value)} 
            >
                <option
                    key={0}
                    value={"Select Minor"}
                >
                    Select Minor
                </option>
                {options.map((option, index) =>
                    <option
                        key={index}
                        value={option}
                    >
                        {option}
                    </option>
                )}
            </select>
            <div className='steps-action-container'>
                <Button onClick={() => {
                    dispatch(degreeActions('PREV_STEP'));
                }}>
                    Back
                </Button>
                {selected !== "Select Minor" && (
                    <Button type="primary" onClick={() => {
                        dispatch(degreeActions('SET_MINOR', selected));
                        history.push('/course-selector');
                    }}>
                        Start planning your courses
                    </Button>
                )}
            </div>
        </div>
        
       
    )

}