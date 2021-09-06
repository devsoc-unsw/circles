import React from 'react';
import { Typography, Modal } from 'antd';
import { useSelector } from 'react-redux';
import './steps.less';

const { Title } = Typography; 
const TermBox = ({ yearIndex, termNo, courses }) => {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const handleSave
    return (
        <>
        <div className="termBox">
            {courses.length === 0 && (

            )}
            Term Box! {yearIndex} {termNo}
            
        </div>
            <Modal className='step-modal' title='Add courses'
                onCancel={() => setOpen(false)}
                visible={openModal}
                footer={[
                    <Button className='text' key="cancel" 
                        onClick={() => setOpen(false)}>
                        Cancel
                    </Button>,
                    <Button key="save" type="primary" 
                        loading={loading} onClick={handleSave}>
                        Save
                    </Button>
                ]}
        </>
    )
}
export const PreviousCoursesStep = () => {
    const startYear = useSelector(state => state.planner.startYear);
    const planner = useSelector(state => state.planner.years);
    const years = new Date().getFullYear() - startYear + 1; // Inclusive
    // const dispatch = useDispatch(); 
    return (
        <div className='steps-root-container'>
            <Title level={3} className="text">
                Courses that I've planned so far
            </Title>
            {/* Add info button */}
            <div className="steps-grid-cont">
                <div className="steps-grid-item"></div>
                {/* <div className="steps-grid-item">Summer</div> */}
                <div className="steps-grid-item">Term 1</div>
                <div className="steps-grid-item">Term 2</div>
                <div className="steps-grid-item">Term 3</div>
            </div>
            {[...Array(parseInt(years))].map((_, yearNo) => 
                <div className='steps-grid-cont'> 
                    <div className="steps-grid-item">{parseInt(startYear) + yearNo}</div>
                    {[...Array(3)].map((_, termNo) => {
                        // Get the courses in the term 
                        const term = 't' + (termNo + 1).toString();
                        const courses = planner[yearNo][term];
                        return <TermBox yearIndex={yearNo} termNo={termNo} courses={courses}/>
                    })}
                </div>

            )}
        </div>
    )
}
