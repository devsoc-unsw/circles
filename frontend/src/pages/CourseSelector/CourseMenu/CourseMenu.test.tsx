import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import * as hooks from 'hooks';
import CourseMenu from './CourseMenu';

const axiosMock = new MockAdapter(axios);
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

const structure = {
  'Major - COMPA1': {
    name: 'Computer Science',
    content: {
      'Core Courses': {
        UOC: 66,
        courses: {
          COMP1511: 'Programming Fundamentals'
        },
        type: '',
        notes: ''
      }
    }
  }
};

describe('CourseMenu', () => {
  const useDispatchMock = vi.spyOn(hooks, 'useAppDispatch');

  beforeEach(() => {
    useDispatchMock.mockClear();
    vi.clearAllMocks();
  });

  it('should render', async () => {
    renderWithProviders(<CourseMenu structure={structure} />);
    expect(await screen.findByText('Major - COMPA1 - Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Core Courses')).toBeInTheDocument();
    expect(screen.getByText('0 / 66')).toBeInTheDocument();
    expect(screen.getByText('COMP1511: Programming Fundamentals')).toBeInTheDocument();
  });
});
