import React from 'react';
import { Divider, Tooltip, Button, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { ReactComponent as PlannerIcon } from '../assets/planner-icon.svg';
import { DeleteOutlined } from '@ant-design/icons';
import './plannerCart.less';

const { Text, Title } = Typography;   
const CourseCard = ({ code, title }) => {
    // const dispatch = useDispatch();
    return (
        <div className="planner-cart-course-card">
            <Divider /> 
            <div className='planner-cart-card-content'>
                <div>
                    <Title className='text' level={5}>{code}</Title>
                    <Text className='text' >{title}</Text>
                </div>
                <div className="planner-cart-card-actions">
                    <Tooltip title={`Remove ${code} from your planner`}>
                        <Button danger size="small" shape="circle" icon={<DeleteOutlined />}
                            onClick={() => {
                                
                            }}
                        />
                    </Tooltip>
                </div>
            </div>
        </div>   
    )
}
export const PlannerCart = () => {
    const [openMenu, setOpenMenu] = React.useState(false);
    const courses = useSelector(store => store.planner.courses);
    return (
        <div className='planner-cart-root'>
            <Tooltip title="Your courses">
                <Button type="primary" icon={<PlannerIcon />} 
                    onClick={() => setOpenMenu(!openMenu)}
                />
            </Tooltip>
            { openMenu && (
                <div className='planner-cart-menu'>
                    <Title className='text' level={4}>Your selected courses</Title>
                    {/* Reversed map to show the most recently added courses first */}
                    { [...courses.keys()].reverse().map((courseCode) => 
                         <CourseCard code={courseCode} title={courses.get(courseCode).title}/>
                    )}
                </div>
            )}
        </div>
    )
}