import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Typography, Button, Modal, Alert } from 'antd';
import { plannerActions } from '../../../actions/plannerActions';
import './steps.less';
import { CheckOutlined } from '@ant-design/icons';


// TODO: Add to unplanned with extra information
const coreCourses = new Map();
coreCourses.set('COMP1511', {
    title: "Programming fundamentals",
    type: "Core",
    termsOffered: ["t1", "t2"],
    plannedFor: null,
	prereqs: "",
	warning: false, 
});
coreCourses.set('COMP1521', {
    title: "Systems fundamentals",
    type: "Core",
    termsOffered: ["t1", "t2"],
    plannedFor: null,
	prereqs: "",
	warning: false, 
})

const { Title } = Typography;
export const DetailStep = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const currYear = parseInt(new Date().getFullYear());
    const [yearStart, setYearStart] = React.useState(currYear);
    // Use be results for this
    const [duration, setDuration] = React.useState(5);
    const [openModal, setOpenModal] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [completed, setCompleted] = React.useState(false);
    const handleStartYear = (e) => {
        const input = parseInt(e.target.value);
        setYearStart(input);
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
            setCompleted(true);
            history.push('/course-selector');
        }, 1500);
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
                    dispatch(plannerActions('SET_DEGREE_LENGTH', duration))
                    setOpenModal(true);
            }}>
                Start browsing courses
            </Button>

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
                ]}
            >
                {loading 
                    ? <><CheckOutlined/> Adding your compulsory courses...</> 
                    : <p>Would you like to automatically add compulsory courses to your planner? </p>
                }
                
            </Modal>
        </div>
    )
}