import React from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Tag, Alert, Typography } from 'antd';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';
import { CourseTag } from '../../components/courseTag/CourseTag';
import { getCourseById } from './courseProvider';
import { setUnplannedCourses } from '../../actions/userAction';
import { plannerActions } from '../../actions/plannerActions';
import './courseDescription.less';

const { Title, Text } = Typography;
const CourseAttribute = ({ title, content }) => {
  return (
    <div className='cs-course-attr'>
      <Title level={4} className='text'>{title}</Title>
      <Text className='text'>{content}</Text>
    </div>
  );
}
export default function CourseDescription() {
  const dispatch = useDispatch();
  const { active, tabs } = useSelector(state => state.tabs);
  let id = tabs[active];
  // Course needs to be replaced with a fetch 
  const course = useSelector(state => state.updateCourses.course);
  const coursesInPlanner = useSelector(state => state.planner.courses);
  const courseInPlanner = coursesInPlanner.has(id);
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    dispatch(getCourseById(id));
  }, [id]);

  if (id === 'explore') return (<div>This is the explore page</div>)
  if (id === 'search') return (<div>This is the search page</div>)
  if (!id) {
    return (
      <div className="empty">
        <Title level={5} className="text">
          Select a course on the left to view! (っ＾▿＾)۶🍸🌟🍺٩(˘◡˘ )
        </Title>
      </div>
    )
  }
  
  const addToPlanner = () => {
    const data = {
      courseCode: id,
      courseData: {
        title: course.name,
        type: course.type,
        termsOffered: course.terms,
      }
    } 
    dispatch(plannerActions("ADD_TO_UNPLANNED", data));
    dispatch(setUnplannedCourses(id));
    setLoading(true)
    setTimeout(() => {
      setShow(true);
      setLoading(false);
    }, 1000)
    setTimeout(() => {
      setShow(false);
    }, 4000)
  }

  const removeFromPlanner = () => {
    dispatch(plannerActions('REMOVE_COURSE', id))
    setLoading(true)
    setTimeout(() => {
      setShow(true);
      setLoading(false);
    }, 1000)
    setTimeout(() => {
      setShow(false);
    }, 4000)
  }

  return (
    <div className="cs-description-root">
      <div className="cs-description-content">
        { (show && courseInPlanner) &&
           <Alert message={`Successfully added ${id} to your planner!` } 
              type="success" style={{ marginBottom: '1rem'}} 
              showIcon closable afterClose={() => setShow(false)}
            />
        }
         { (show && !courseInPlanner) &&
           <Alert message={`Successfully removed ${id} from your planner!` } 
              type="success" style={{ marginBottom: '1rem'}} 
              showIcon closable afterClose={() => setShow(false)}
            />
        } 
        <div className="cs-desc-title-bar">
          <Title level={2} className="text">{ id } - { course.name }</Title>
          { courseInPlanner ? (
            <Button type="secondary" loading={loading}
              onClick={ removeFromPlanner } icon={<StopOutlined />}>
               Remove from planner
            </Button>
          ):(
            <Button  type="primary" loading={loading} 
              onClick={ addToPlanner }icon={<PlusOutlined />}>
              Add to planner
            </Button>
          )}
        </div>
        <Title level={4} className="text">Overview</Title>
        <Text className="text">{course.overview}</Text>
        <Title level={4} className="text">Prerequisites</Title>
        { course.prereq && course.prereq.length > 0 
          ? <div className={"text course-tag-cont"}>
              { course.prereq.map(courseCode => <CourseTag name={courseCode}/> )}
            </div>
          : <p className={`text`}>None</p>
        }
        <Title level={4} className="text">Unlocks these next courses</Title>
        { course.next && course.next.length > 0 
          ? course.next.map((courseCode, index) => <CourseTag key={index} name={courseCode}/>)
          : <p className={`text`}>None</p>
        }
      </div>
      <div>
        <CourseAttribute title="Faculty" content={course.faculty}/>
        <CourseAttribute title="School" content={course.school}/>
        <CourseAttribute title="Study Level" content={course.level}/>
        <CourseAttribute title="Campus" content={course.campus}/>
        <Title level={4} className='text cs-final-attr'>Offering Terms</Title>
        { course.terms && course.terms.map((term, index) => {
          let termNo = term.slice(1);
            return (
              <Tag key={index} className={`text`}> 
                {termNo === '0' ? 'Summer' : `Term ${termNo}`}
              </Tag>
            )
          })
        }
      </div>
    </div>
  );
}