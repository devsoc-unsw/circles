import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Typography, Button, Modal, Alert } from 'antd';
import { plannerActions } from '../../../actions/plannerActions';
import './steps.less';
import { CheckOutlined } from '@ant-design/icons';

const { Title } = Typography;
export const DetailStep = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const currYear = parseInt(new Date().getFullYear());
    const [yearStart, setYearStart] = React.useState(currYear);
    // Use be results for this
    const [duration, setDuration] = React.useState(5);
    const [loading, setLoading] = React.useState(false);
    const [completed, setCompleted] = React.useState(false);
    const handleStartYear = (e) => {
        const input = parseInt(e.target.value);
        setYearStart(input);
    }

    const handleNoCoreCourses = () => {
        history.push('/course-selector');
    }

    return (
        <div className='steps-root-container'>
            <Title level={3} className='text'>
                I start in
            </Title>
            <input 
                className='steps-search-input'
                type='number'
                value={yearStart}
                onChange={(e) => handleStartYear(e)}
            />
            <Title level={3} className='text'>
                and complete my degree in
            </Title>
            <select className='steps-dropdown text'
                name="Number of years"
                value={duration}
                onChange={e => setDuration(e.target.value)}
            >
                <option className='text' key={0} value={3}>3 Years</option>
                <option className='text' key={1} value={4}>4 Years</option>
                <option className='text' key={2} value={5}>5 Years</option>
                <option className='text' key={3} value={6}>6 Years</option>
                <option className='text' key={4} value={7}>7 Years</option>
                <option className='text' key={5} value={8}>8 Years</option>
            </select>

            <Button
                className='steps-next-btn'
                type="primary"
                onClick={() => {
                    dispatch(plannerActions('SET_YEAR_START', yearStart));
                    dispatch(plannerActions('SET_DEGREE_LENGTH', duration));
            }}>
                Start browsing courses
            </Button>
        </div>
    )
}