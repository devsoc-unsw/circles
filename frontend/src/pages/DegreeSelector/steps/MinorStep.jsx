import React from 'react';
// import axios from 'axios';
import { Menu, Button, Typography } from 'antd';
import { degreeActions } from '../../../actions/degreeActions';
import { Link } from 'react-scroll';
import { useDispatch, useSelector } from 'react-redux'
import './steps.less';

const { Title } = Typography;
export const MinorStep = () => {
    const dispatch = useDispatch();
    const minor = useSelector(store => store.degree.minor);
    // Fetch the minors
    const options = {
        "1": "Minor1",
        "2": "Minor1",
        "3": "Minor1",
        "4": "Minor1",
        "5": "Minor1",
    };

    // const fetchAllMinors = async () => {
    //     const res = await axios.get(`http://localhost:8000/api/getMinors/${program}`);
    //     setOptions(res.data["minors"]);
       
    //     // setIsLoading(false);
    //   };
    
    // useEffect(() => {
    //     setTimeout(fetchDegree, 2000);  // testing skeleton
    //     fetchAllMinors();
    // }, []);

    
    return (
        <div className="steps-root-container">
             <Title level={3} className="text">
                and minoring in (optional)
            </Title>
            <Menu className='degree-minors'
                onClick={(e) => dispatch(degreeActions('SET_MINOR', e.key))}
                selectedKeys={minor && [minor]}
                mode="inline"
            >
                { Object.keys(options).map((key) => 
                    <Menu.Item className='text' key={key}>{key} {options[key]}</Menu.Item>
                )}  
            </Menu>
            <Link to="Previous Courses" smooth={true} duration={1000}>
                <Button type="primary" className='steps-next-btn'>
                    Next
                </Button>
            </Link>
        </div>
    )

}