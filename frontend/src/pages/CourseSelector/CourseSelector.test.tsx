import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import CourseSelector from './CourseSelector';

const preloadedState = {
  degree: {
    programCode: '3778',
    programName: 'Computer Science',
    specs: ['COMPA1'],
    isComplete: true
  }
};

const axiosMock = new MockAdapter(axios);
axiosMock.onPost('/courses/searchCourse/COMP1511').reply(200, {
  COMP1511: 'Programming Fundamentals'
});

axiosMock.onPost('/courses/getAllUnlocked/').reply(200, {
  courses_state: {
    COMP1511: {
      is_accurate: true,
      handbook_note: '',
      unlocked: true,
      warnings: []
    },
    COMP2521: {
      is_accurate: true,
      handbook_note: '',
      unlocked: false,
      warnings: []
    }
  }
});

axiosMock.onGet('/programs/getStructure/3778/COMPA1').reply(200, {
  structure: {
    'Major - COMPA1': {
      name: 'Computer Science',
      content: {
        'Core Courses': {
          UOC: 66,
          courses: {
            COMP1511: 'Programming Fundamentals',
            COMP2521: 'Data Structures and Algorithms'
          },
          type: '',
          notes: ''
        }
      }
    }
  },
  uoc: 144
});

axiosMock.onGet('/courses/getCourse/COMP1511').reply(200, {
  code: 'COMP1511',
  title: 'Programming Fundamentals'
});

axiosMock.onPost('/courses/unselectCourse/COMP1511').reply(200, {
  courses: ['COMP1511']
});

vi.mock('components/DraggableTab', () => ({
  default: ({ tabName }: { tabName: string }) => <div>{tabName}</div>
}));

describe('CourseSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', async () => {
    renderWithProviders(<CourseSelector />, { preloadedState });
    expect(screen.getByText('3778 - Computer Science')).toBeInTheDocument();
    expect(await screen.findByText('Major - COMPA1 - Computer Science')).toBeInTheDocument();
    expect(await screen.findByText('Core Courses')).toBeInTheDocument();
    expect(await screen.findByText('COMP1511: Programming Fundamentals')).toBeInTheDocument();
  });

  it('should toggle locked courses', async () => {
    renderWithProviders(<CourseSelector />, { preloadedState });
    expect(await screen.findByText('COMP1511: Programming Fundamentals')).toBeInTheDocument();
    expect(screen.queryByText('COMP2521: Data Structures and Algorithms')).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId('show-all-courses'));
    expect(screen.getByText('COMP2521: Data Structures and Algorithms')).toBeInTheDocument();
  });

  it('should be able to quick add and remove a course from the course menu', async () => {
    const { store } = renderWithProviders(<CourseSelector />, { preloadedState });
    expect(await screen.findByText('COMP1511: Programming Fundamentals')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('quick-add-cart-button'));
    expect(store.getState().planner.unplanned).toEqual(['COMP1511']);
    await userEvent.click(screen.getByTestId('quick-remove-cart-button'));
    expect(store.getState().planner.unplanned).toEqual([]);
  });
});
