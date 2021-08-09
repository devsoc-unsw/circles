import React from 'react';
import { Menu, Typography, Button } from 'antd';
import { degreeActions } from '../../../actions/degreeActions';
import { useDispatch } from 'react-redux'
import './degreeStep.less';

const options = [
    'Bachelor of Arts', 
    'Bachelor of Computer Science',
    'Bachelor of Commerce',
    'Bachelor of Commerce/Law',
    'Bachelor of Engineering (Honours)',
    'Bachelor of Medical Studies/Doctor of Medicine'
]
const { Title } = Typography;
export const DegreeStep = () => {
    const dispatch = useDispatch();
    const [input, setInput] = React.useState('')
    const [selected, setSelected] = React.useState(null);
    return (
        <div className='degree-step-root'>
            <Title level={3} className="text">
                I am studying 
            </Title>
            <input 
                className='degree-search-input'
                type="text"
                value={input}
                placeholder="Search Degree"
                onChange={(e) => setInput(e.target.value)} />
            { input !== '' && (
                <Menu className='degree-search-results'
                    onClick={(e) => setSelected(e.key)}
                    selectedKeys={[selected]}
                    mode="inline"
                >
                    { options.map(option => 
                    <Menu.Item key={option}>{option}</Menu.Item>
                    )}  
                </Menu>
            )}

            {selected && (
                <Button 
                    type="primary"
                    onClick={() => {
                        dispatch(degreeActions('SET_DEGREE', selected));
                        dispatch(degreeActions('NEXT_STEP'));
                }}>
                    Next
                </Button>
            )}
        </div>
       
    )

}