import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import * as hooks from 'hooks';
import CourseBanner from './CourseBanner';

const axiosMock = new MockAdapter(axios);
axiosMock.onPost('/courses/searchCourse/COMP1511').reply(200, {
  COMP1511: 'Programming Fundamentals'
});

const preloadedState = {
  degree: {
    programCode: '3778',
    programName: 'Computer Science',
    specs: ['COMPA1'],
    isComplete: true
  }
};

describe('CourseBanner', () => {
  const useDispatchMock = vi.spyOn(hooks, 'useAppDispatch');

  beforeEach(() => {
    useDispatchMock.mockClear();
    vi.clearAllMocks();
  });

  it('should render', () => {
    renderWithProviders(<CourseBanner />, { preloadedState });
    expect(screen.getByText('3778 - Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Search for a course...')).toBeInTheDocument();
  });

  it('should dispatch addTab after searching a course', async () => {
    const dummyDispatch = vi.fn();
    useDispatchMock.mockReturnValue(dummyDispatch);

    renderWithProviders(<CourseBanner />, { preloadedState });
    userEvent.type(screen.getByText('Search for a course...'), 'COMP1511');
    await userEvent.click(await screen.findByText('COMP1511: Programming Fundamentals'));
    expect(dummyDispatch).toBeCalledWith({
      payload: 'COMP1511',
      type: 'courseTabs/addTab'
    });
  });
});
