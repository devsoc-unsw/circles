// import original module declarations
import 'styled-components';

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    purplePrimary: string
    purpleLight: string
    purpleDark: string

    body: string
    text: string
    droppable: {
      backgroundColor: string
    }
    plannerCartCard: {
      backgroundColorHover: string
    }
    plannerCartMenu: {
      backgroundColor: string
    }
    draggableTab: {
      backgroundColor: string
      borderColor: string
    }

    degreeCard: {
      backgroundColor: string
    }
    draggableCourse: {
      backgroundColor: string
      warningBackgroundColor: string
      dragDisabledBackgroundColor: string
      iconColor: string
    }
    termCheckbox: {
      color: string
    }
    warningOutlined: {
      color: string
    }
    termBoxWrapper: {
      borderColor: string
    },
    optionsHeader: {
      borderColor: string
    }
    infoOutlined: {
      color: string
    }
    uocBadge: {
      backgroundColor: string
    }

    courseTag?: {
      backgroundColor: string
    }
    courseSidebar?: {
      menuSubColor: string
    }
    specialsationStep?: {
      background: string
    }
    courseButton: {
      backgroundColor: string
      hoverBackgroundColor: string
    }
    courseMenu?: {
      backgroundColor: string
    }
  }
}
