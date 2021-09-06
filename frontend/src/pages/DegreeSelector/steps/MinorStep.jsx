import React, { useEffect } from 'react';
import axios from 'axios';
import { Button, Typography } from 'antd';
import { degreeActions } from '../../../actions/degreeActions';
import { useDispatch, useSelector } from 'react-redux'
import './steps.less';

const { Title } = Typography;
export const MinorStep = () => {
    const dispatch = useDispatch();
    const program = useSelector(store => store.degree.program);
    // Fetch the minors
    const [selected, setSelected] = React.useState("Select Minor"); 
    const [options, setOptions] = React.useState(null);

    const fetchAllMinors = async () => {
        const res = await axios.get(`http://localhost:8000/api/getMinors/${program}`);
        setOptions(res.data["minors"]);
        // setIsLoading(false);
      };
    
    useEffect(() => {
        // setTimeout(fetchDegree, 2000);  // testing skeleton
        fetchAllMinors();
    }, []);

    return (
        <div className="steps-root-container">
             <Title level={3} className="text">
                and minoring in (optional)
            </Title>
            <select 
                className='steps-dropdown text'
                name="Select Minor"
                onChange={value => setSelected(value)} 
            >
                <option
                    key={0}
                    value={"Select Minor"}
                >
                    Select Minor
                </option>
                {options && Object.keys(options).map((key, index) =>
                    <option
                        key={index}
                        value={key}
                    >
                        {key} {options[key]}
                    </option>
                )}
            </select>

            <Button type="primary" className='steps-next-btn'
                onClick={() => {
                    dispatch(degreeActions('SET_MINOR', selected));
                    dispatch(degreeActions('NEXT_STEP'))
                }}
            >
                Next
            </Button>
            
        </div>
        
       
    )

}