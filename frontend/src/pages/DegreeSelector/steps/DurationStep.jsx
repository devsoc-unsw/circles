import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Button } from 'antd';
import { Link } from 'react-scroll'; 
import { plannerActions } from '../../../actions/plannerActions';
import './steps.less';

const { Title } = Typography;
export const DurationStep = () => {
    const dispatch = useDispatch();
    const { yearStart, numYears } = useSelector(store => store.planner);
    console.log(yearStart, numYears);
    return (
        <div className='steps-root-container'>
            <Title level={3} className='text'>
                I start in
            </Title>
            <input 
                className='steps-search-input'
                type='number'
                value={yearStart}
                onChange={(e) =>  {
                    console.log(e.target.value);
                    dispatch(plannerActions('SET_YEAR_START', parseInt(e.target.value)))
                }}
            />
            <Title level={3} className='text'>
                and complete my degree in
            </Title>
            <select className='steps-dropdown text'
                name="Number of years"
                value={numYears}
                onChange={e => {
                    console.log(e.target.value);
                    dispatch(plannerActions("SET_DEGREE_LENGTH", parseInt(e.target.value)))
                }}
            >
                <option className='text' key={0} value={3}>3 Years</option>
                <option className='text' key={1} value={4}>4 Years</option>
                <option className='text' key={2} value={5}>5 Years</option>
                <option className='text' key={3} value={6}>6 Years</option>
                <option className='text' key={4} value={7}>7 Years</option>
                <option className='text' key={5} value={8}>8 Years</option>
            </select>
            <Link to="Previous Courses" smooth={true} duration={1000}>
                <Button
                    className='steps-next-btn'
                    type="primary"
                >
                    Next
                </Button>
            </Link>
        </div>
    )
}