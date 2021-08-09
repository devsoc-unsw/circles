import React from 'react';
import { Button, Typography } from 'antd';
import { degreeActions } from '../../../actions/degreeActions';
import { useDispatch, useSelector } from 'react-redux'
import './dropdown.less';
const options = [
    'SPECIALISATION 1', 
    'SPECIALISATION 2', 
    'SPECIALISATION 3', 
    'SPECIALISATION 4', 
];
const { Title } = Typography;
export const SpecialisationStep = () => {
    const dispatch = useDispatch();
    const program = useSelector(store => store.degree.program);
    // Fetch the minors
    const [selected, setSelected] = React.useState(null); 
    return (
        <div>
            <Title level={3} className="text">
                specialising in 
            </Title>
            <select 
            className='steps-dropdown'
            name="Select Specialisation"
            onChange={value => setSelected(value)} 
            >
            {options.map((option, index) =>
                <option
                    key={index}
                    value={option}
                >
                    {option}
                </option>
            )}
            </select>
            {selected && (
                <Button 
                    type="primary"
                    onClick={() => {
                        dispatch(degreeActions('SET_MINOR', selected));
                        dispatch(degreeActions('NEXT_STEP', selected));
                }}>
                    Next 
                    {/* if no minors */}
                </Button>
            )}
        </div>
       
    )

}