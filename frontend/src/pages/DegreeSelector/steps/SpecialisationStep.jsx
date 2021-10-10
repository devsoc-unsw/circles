import React, { useEffect } from 'react';
import axios from 'axios';
import { Button, Typography } from 'antd';
import { degreeActions } from '../../../actions/degreeActions';
import { useDispatch, useSelector } from 'react-redux'
import './steps.less';

const { Title } = Typography;
export const SpecialisationStep = () => {
    const dispatch = useDispatch();
    const program = useSelector(store => store.degree.program);
    // Fetch the minors
    const [selected, setSelected] = React.useState("Select Specialisation"); 
    const [options, setOptions] = React.useState(null);

    const fetchAllSpecializations = async () => {
        const res = await axios.get(`http://localhost:8000/api/getMajors/${program}`);
        setOptions(res.data["majors"]);
        // setIsLoading(false);
      };
    
    useEffect(() => {
        // setTimeout(fetchDegree, 2000);  // testing skeleton
        fetchAllSpecializations();
    }, []);

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
            {options && Object.keys(options).map((key, index) =>
                <option
                    key={index + 1}
                    value={key}
                >
                    {key} {options[key]}
                </option>
            )}
            </select>
            {selected !== "Select Specialisation" && (
                <Button 
                    className='steps-next-btn'
                    type="primary"
                    onClick={() => {
                        dispatch(degreeActions('SET_SPECIALISATION', selected));
                        dispatch(degreeActions('NEXT_STEP', selected));
                }}>
                    Next 
                    {/* if no minors */}
                </Button>
            )}
        </div>
       
    )

}