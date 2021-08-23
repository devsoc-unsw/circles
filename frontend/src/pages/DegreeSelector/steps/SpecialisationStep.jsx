import React from 'react';
import { Button, Typography } from 'antd';
import { degreeActions } from '../../../actions/degreeActions';
import { useDispatch, useSelector } from 'react-redux'
import './steps.less';
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
    const [selected, setSelected] = React.useState("Select Specialisation"); 
    return (
        <div className='steps-root-container'>
            <Title level={3} className="text">
                specialising in 
            </Title>
            <select 
            className='steps-dropdown'
            onChange={value => setSelected(value)} 
            >
            <option
                key={0}
                value={"Select Specialisation"}
            >
                Select Specialisation
            </option>
            {options.map((option, index) =>
                <option
                    key={index + 1}
                    value={option}
                >
                    {option}
                </option>
            )}
            </select>
            {selected !== "Select Specialisation" && (
                <Button 
                    className='steps-next-btn'
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