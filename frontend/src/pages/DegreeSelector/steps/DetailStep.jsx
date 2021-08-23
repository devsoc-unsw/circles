import React from 'react';
import { useDispatch } from 'react-redux';
import { Typography, Button } from 'antd';
import { plannerActions } from '../../../actions/plannerActions'
import { degreeActions } from '../../../actions/degreeActions'
import './steps.less';

const { Title } = Typography;
export const DetailStep = () => {
    const dispatch = useDispatch();
    const currYear = parseInt(new Date().getFullYear());
    const [yearStart, setYearStart] = React.useState(currYear);
    const [yearStartError, setYearStartError] = React.useState(false);
    // Adjust this when be is linked
    const [yearEnd, setYearEnd] = React.useState(currYear + 3);
    const [yearEndError, setYearEndError] = React.useState(false);

    const [outOfDateError, setOutOfDateError] = React.useState(false);
    const handleStartYear = (e) => {
        const input = parseInt(e.target.value);
        // Our website may be out of date for the user
        setOutOfDateError(input < currYear - 10);

        // Starting year cannot be after ending year
        setYearStartError(input >= yearEnd);

        // No errors
        if (!yearStartError) setYearStart(input);
    }

    const handleEndYear = (e) => {
        const input = parseInt(e.target.value);
        // Our website may be out of date for the user
        setOutOfDateError(input > currYear + 10)

        // Ending year cannot be before starting year
        setYearEndError(input <= yearStart);

        // No errors 
        if (!yearEndError) setYearEnd(input);
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
            <input 
                className='steps-search-input'
                type='number'
                value={yearEnd}
                onChange={(e) =>    handleEndYear(e)}
            />

            {(!yearStartError && !yearEndError ) && (
                <Button
                    className='steps-next-btn'
                    type="primary"
                    onClick={() => {
                        const degreeLength = yearEnd - yearStart;
                        dispatch(plannerActions('YEAR_START', yearStart));
                        dispatch(plannerActions('SET_DEGREE_LENGTH', degreeLength))
                        dispatch(degreeActions('NEXT_STEP'));
                }}>
                    Next
                </Button>
            )}
        </div>
    )
}