import React, { useEffect } from 'react';
// import axios from 'axios';
import { Menu, Typography, Button } from 'antd';
import { degreeActions } from '../../../actions/degreeActions';
import { Link } from 'react-scroll';
import { useDispatch } from 'react-redux'
import './steps.less';

const { Title } = Typography;
export const DegreeStep = () => {
    const dispatch = useDispatch();
    const [input, setInput] = React.useState('')
    const [selected, setSelected] = React.useState(null);
    const [options, setOptions] = React.useState(null);

    const fetchAllDegrees = async () => {
        // const res = await axios.get("http://localhost:8000/api/getPrograms");
        // setOptions(res.data["programs"]);
        setOptions({
            "3778": "Computer Science", 
            "3779": "Computer Science",
            "3777": "Computer Science",
            "3775": "Computer Science",
            "3774": "Computer Science",
            "3772": "Computer Science",
            "3771": "Computer Science",
            "3771": "Computer Science",
        })
        // setIsLoading(false);
      };
    
    useEffect(() => {
        // setTimeout(fetchDegree, 2000);  // testing skeleton
        fetchAllDegrees();
    }, []);

    return (
        <div className='steps-root-container'>
            <Title level={3} className="text">
                I am studying 
            </Title>
            <input 
                className='steps-search-input'
                type="text"
                value={input}
                placeholder="Search Degree"
                onChange={(e) => setInput(e.target.value)} />
            { input !== '' && options && (
                <Menu className='degree-search-results'
                    onClick={(e) => setSelected(e.key)}
                    selectedKeys={[selected]}
                    mode="inline"
                >
                    { Object.keys(options).map((key) => 
                    <Menu.Item className='text' key={key}>{key} &nbsp; Bachelor of {options[key]}</Menu.Item>
                )}  
                </Menu>
            )}

            {(selected && input !== "") && (
                <Link to={"Specialisation"} smooth={true} duration={1000}>
                    <Button
                        className='steps-next-btn'
                        type="primary"
                        onClick={() => {
                            console.log('THIS', selected)
                            dispatch(degreeActions('SET_DEGREE', selected));
                            dispatch(degreeActions('NEXT_STEP'));
                        }}>
                        Next
                    </Button>
                </Link>
            )}
        </div>
       
    )

}