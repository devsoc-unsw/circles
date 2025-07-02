type Route = {
  label: string;
  link: string;
  dev?: boolean;
  inHamburger: boolean;
};

const routes: Route[] = [
  {
    label: 'Degree Wizard',
    link: '/degree-wizard',
    inHamburger: true
  },
  {
    label: 'Course Selector',
    link: '/course-selector',
    inHamburger: false
  },
  {
    label: 'Graphical Selector (Beta)',
    link: '/graphical-selector',
    inHamburger: false
  },
  {
    label: 'Term Planner',
    link: '/term-planner',
    inHamburger: false
  },
  {
    label: 'Progression Checker',
    link: '/progression-checker',
    inHamburger: false
  },
  {
    label: 'Change Log',
    link: '/change-log',
    inHamburger: true
  },
  {
    label: 'Logout',
    link: '/logout',
    inHamburger: true
  }
];

export default routes;
