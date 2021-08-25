import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Typography, Button, Modal } from 'antd';
import { plannerActions } from '../../../actions/plannerActions';
import './steps.less';


// TODO: Add to unplanned with extra information
const coreCourses = new Map();
coreCourses.set('COMP1511', {
    title: "Programming fundamentals",
    type: "Core",
    termsOffered: ["t1", "t2"],
    plannedFor: null,
});
coreCourses.set('COMP1521', {
    title: "Systems fundamentals",
    type: "Core",
    termsOffered: ["t1", "t2"],
    plannedFor: null,
})

const { Title } = Typography;
export const DetailStep = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const currYear = parseInt(new Date().getFullYear());
    const [yearStart, setYearStart] = React.useState(currYear);
    const [yearStartError, setYearStartError] = React.useState(false);
    // Adjust this when be is linked
    const [yearEnd, setYearEnd] = React.useState(currYear + 3);
    const [yearEndError, setYearEndError] = React.useState(false);

    const [outOfDateError, setOutOfDateError] = React.useState(false);
    const [openModal, setOpenModal] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const handleStartYear = (e) => {
        const input = parseInt(e.target.value);
        setYearStart(input);
        // Our website may be out of date for the user
        setOutOfDateError(input < currYear - 10);

        // Starting year cannot be after ending year
        setYearStartError(input >= yearEnd);

        (outOfDateError || yearStartError) 
        ? e.target.classlist.add('steps-input-warning') 
        : e.target.classlist.remove('steps-input-warning');
    }

    const handleEndYear = (e) => {
        const input = parseInt(e.target.value);
        setYearEnd(input);
        
        // Our website may be out of date for the user
        setOutOfDateError(input > currYear + 10)
        
        // Ending year cannot be before starting year
        setYearEndError(input <= yearStart);
        
        (outOfDateError || yearEndError) 
        ? e.target.classlist.add('steps-input-warning') 
        : e.target.classlist.remove('steps-input-warning');

    }

    const handleNoCoreCourses = () => {
        history.push('/course-selector');
    }
    const handleAddCoreCoures = () => {
        setLoading(true);
        // Do fetch call here.
        dispatch(plannerActions('ADD_CORE_COURSES', coreCourses));
        setTimeout(() => {
            setLoading(false);
            setOpenModal(false);
            history.push('/course-selector');
        }, 3000);
      };
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
                onChange={(e) => handleEndYear(e)}
            />

            {(!yearStartError && !yearEndError ) && (
                <Button
                    className='steps-next-btn'
                    type="primary"
                    onClick={() => {
                        const degreeLength = yearEnd - yearStart;
                        dispatch(plannerActions('SET_YEAR_START', yearStart));
                        dispatch(plannerActions('SET_DEGREE_LENGTH', degreeLength))
                        setOpenModal(true);
                }}>
                    Start browsing courses
                </Button>
            )}

            <Modal className='step-modal' title="One last step!" 
                onCancel={() => setOpenModal(false)}
                visible={openModal} 
                footer={[
                    <Button className='text' key="no-core-courses" 
                        onClick={handleNoCoreCourses}>
                        No thanks
                    </Button>,
                    <Button key="yes-core-courses" type="primary" 
                        loading={loading} onClick={handleAddCoreCoures}>
                        Yes 
                    </Button>
                  ]}>
                <p>Would you like to automatically add compulsory courses to your planner? </p>
            </Modal>
        </div>
    )
}