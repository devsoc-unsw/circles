export type CourseCodes = {
    [courseKey: string]: string
}

export type CourseDetail = {
    title: string
    code: string
    UOC: number
    description: string
    study_level: string
    school: string
    campus: string
    raw_requirements: any
    terms: string[]
    is_legacy: boolean
    is_accurate: boolean
    is_multiterm: boolean
}

export type CourseValidation = {
    is_accurate: boolean
    unlocked: boolean
    handbook_note: string
    warnings: string[]
}

export type CourseList = 