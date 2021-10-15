import React from 'react';
import { Tooltip, Typography, Modal, Button } from 'antd';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { EditOutlined } from '@ant-design/icons';
import DebouncingSelect from './DebouncingSelect';
import './steps.less';

const { Title } = Typography; 
const TermBox = ({ yearIndex, termNo }) => {
    const planner = useSelector(store => store.planner.years);
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [courses, setCourses] = React.useState([]);

    const handleSave = () => {
        setLoading(true);
        // dispatch 
        // promise.all to get all the information about each added course 
        // If course in store.planner.courses, don't need to fetch 
        //  const data = {
        //     courseCode: id,
        //     courseData: {
        //         title: course.name,
        //         type: course.type,
        //         termsOffered: course.terms,
        //         prereqs
        //     }
        // } 
        // dispatch(plannerActions("ADD_TO_UNPLANNED", data))
        setTimeout(() => {
            setLoading(false);
            setOpen(false);
        }, 2000)
    };

    return (
        <>
        <div className="termBox steps-term">
            <Tooltip className="steps-term-edit-btn" size='small' title="Edit">
                <Button 
                    shape="circle"
                    icon={<EditOutlined />}
                    onClick={() => setOpen(true)}    
                />
            </Tooltip>
            { courses.map((course) => <div className="text">{course.value}</div>) }
            {/* Term Box! {yearIndex} {termNo} */}
        </div>
            <Modal className='step-modal' title='Add courses'
                onCancel={() => setOpen(false)}
                visible={open}
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
            >
                {/* { planner[yearIndex][termNo].map((course) => <div>{course}</div>) } */}
                {/* @Gabriella add search here. Show result onclick. and be able to delete */}
                <DebouncingSelect setPlannedCourses={setCourses}/>
            </Modal>
        </>
    )
}
export const PreviousCoursesStep = () => {
    const history = useHistory();
    const startYear = useSelector(state => state.planner.startYear);
    const years = new Date().getFullYear() - startYear + 1; // Inclusive
    return (
        <div className='steps-root-container'>
            <Title level={3} className="text">
                Courses that I've planned so far
            </Title>
            {/* Add info button */}
            <div className="steps-grid-cont" style={{marginTop: "100px"}}>
                <div className="steps-grid-item"></div>
                <div className="steps-grid-item">Summer</div>
                <div className="steps-grid-item">Term 1</div>
                <div className="steps-grid-item">Term 2</div>
                <div className="steps-grid-item">Term 3</div>
            </div>
            {[...Array(parseInt(years))].map((_, yearNo) => 
                <div className='steps-grid-cont'> 
                    <div className="steps-grid-item">{parseInt(startYear) + yearNo}</div>
                    {[...Array(4)].map((_, termNo) => {
                        // Get the courses in the term 
                        const term = 't' + (termNo).toString();
                        return <TermBox yearIndex={yearNo} termNo={term}/>
                    })}
                </div>
            )}

            <Button 
                className="steps-next-btn"
                type="primary"
                onClick={() => history.push('/course-selector')}
            >
                Start browsing courses!
            </Button>
        </div>
    )
}
