import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import * as hooks from 'hooks';
import ResetModal from './ResetModal';

const preloadedState = {
  degree: {
    programCode: '3778',
    programName: 'Computer Science',
    specs: ['COMPA1'],
    isComplete: true
  }
};

describe('ResetModal', () => {
  const useDispatchMock = vi.spyOn(hooks, 'useAppDispatch');
  const useNavigateMock = vi.spyOn(reactRouterDom, 'useNavigate');

  beforeEach(() => {
    useDispatchMock.mockClear();
    useNavigateMock.mockClear();
    vi.clearAllMocks();
  });

  it('should render', () => {
    renderWithProviders(<ResetModal />);
    expect(screen.queryByText('Reset Planner?')).not.toBeInTheDocument();
  });

  it('should show modal when degree wizard is complete', () => {
    renderWithProviders(<ResetModal />, { preloadedState });
    expect(screen.getByText('Reset Planner?')).toBeInTheDocument();
  });

  it('should reset state when reset button is clicked', async () => {
    const dummyDispatch = vi.fn();
    useDispatchMock.mockReturnValue(dummyDispatch);

    renderWithProviders(<ResetModal />, {
      preloadedState: {
        degree: {
          programCode: '3778',
          programName: 'Computer Science',
          specs: ['COMPA1'],
          isComplete: true
        }
      }
    });
    await userEvent.click(screen.getByText('Reset'));
    expect(dummyDispatch.mock.calls).toEqual([
      [{ payload: undefined, type: 'planner/resetPlanner' }],
      [{ payload: undefined, type: 'degree/resetDegree' }],
      [{ payload: undefined, type: 'courseTabs/resetTabs' }],
      [{ payload: undefined, type: 'courses/resetCourses' }]
    ]);
  });

  it('should redirect back to course selector if cancel button is clicked', async () => {
    const dummyNavigate = vi.fn();
    useNavigateMock.mockReturnValue(dummyNavigate);

    renderWithProviders(<ResetModal />, { preloadedState });
    await userEvent.click(screen.getByText('Go back to planner'));
    expect(dummyNavigate).toBeCalledWith('/course-selector');
  });
});
