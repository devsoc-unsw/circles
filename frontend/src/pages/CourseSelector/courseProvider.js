const dummyCourseData = require('../../dummyData/courses.json');

export function getCourse(courseCode) {
    // Replace with fetch call (using async await) when BE is ready
    if (!dummyCourseData[courseCode]) {
        throw Error('Invalid Course Code')
    }
    return dummyCourseData[courseCode]
}