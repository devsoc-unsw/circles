import React, { useEffect } from 'react';
import axios from 'axios';
import { Menu, Typography, Button } from 'antd';
import { degreeActions } from '../../../actions/degreeActions';
import { Link } from 'react-scroll';
import { useDispatch, useSelector } from 'react-redux'
import './steps.less';

const { Title } = Typography;
export const DegreeStep = () => {
    const dispatch = useDispatch();
    const programCode = useSelector(store => store.degree.programCode)
    const [input, setInput] = React.useState('')
    const [options, setOptions] = React.useState(null);

    const fetchAllDegrees = async () => {
        const res = await axios.get("http://localhost:8000/api/getPrograms");
        setOptions(res.data["programs"]);
        // setOptions({
        //     "3778": "Bachelor Computer Science", 
        //     "3779": "Bachelor of Science",
        //     "3777": "Bachelor of Arts",
        //     "3775": "Bachelor of Commerce/Law",
        // })
        // setIsLoading(false);
      };
    
    useEffect(() => {
        // setTimeout(fetchDegree, 2000);  // testing skeleton
        fetchAllDegrees();
    }, []);

    const handleDegreeChange = (e) => {
        dispatch(degreeActions('SET_PROGRAM', {
            programCode: e.key,
            programName: options[e.key]
        }));
    }

    return (
        <div className='steps-root-container-first'>
            <Title level={3} className="text">
                I am studying 
            </Title>
            <input 
                className='steps-search-input'
                type="text"
                value={input}
                placeholder="Search Degree"
                onChange={(e) => setInput(e.target.value)}
            />
            { input !== '' && options && (
                <Menu className='degree-search-results'
                    onClick={handleDegreeChange}
                    selectedKeys={programCode && [programCode]}
                    mode="inline"
                >
                    { Object.keys(options).map((key) => 
                        <Menu.Item className='text' key={key}>{key} &nbsp; Bachelor of {options[key]}</Menu.Item>
                    )}  
                </Menu>
            )}

            { programCode && (
                <Link to={"Specialisation"} smooth={true} duration={1000}>
                    <Button
                        className='steps-next-btn-first'
                        type="primary"
                    >
                        Next
                    </Button>
                </Link>
            )}
        </div>
       
    )

}