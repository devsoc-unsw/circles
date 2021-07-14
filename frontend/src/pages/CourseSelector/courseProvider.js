const dummyCourseData = require('../../dummyData/courses.json');
const dummyCourseCodes = require('../../dummyData/courseCodes.json')
export function getCourse(courseCode) {
    // Replace with fetch call (using async await) when BE is ready
    if (!dummyCourseData[courseCode]) {
        throw Error('Invalid Course Code')
    }
    return dummyCourseData[courseCode]
}

export function getSearchResult(input) {
    // Replace with fetch call (using async await) when BE is ready
    return dummyCourseCodes;
}