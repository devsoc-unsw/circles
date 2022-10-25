import React from 'react';
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

  beforeEach(() => {
    useDispatchMock.mockClear();
    vi.clearAllMocks();
  });

  it('should render', () => {
    renderWithProviders(<ResetModal />);
    expect(screen.queryByText('Reset Planner?')).not.toBeInTheDocument();
  });

  it('should show modal when degree wizard is complete', () => {
    renderWithProviders(<ResetModal open />, { preloadedState });
    expect(screen.getByText('Reset Planner?')).toBeInTheDocument();
  });

  it('should reset state when reset button is clicked', async () => {
    const dummyDispatch = vi.fn();
    useDispatchMock.mockReturnValue(dummyDispatch);

    renderWithProviders(<ResetModal open />, {
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

  it('should call the OnCancel callback when the Go Back button is clicked', async () => {
    const dummyOnCancel = vi.fn();

    renderWithProviders(<ResetModal open onCancel={dummyOnCancel} />, { preloadedState });
    await userEvent.click(screen.getByText('Go back'));
    expect(dummyOnCancel).toBeCalled();
  });

  it('should call the OnOk callback when the Reset button is clicked', async () => {
    const dummyOnOk = vi.fn();

    renderWithProviders(<ResetModal open onOk={dummyOnOk} />, { preloadedState });
    await userEvent.click(screen.getByText('Reset'));
    expect(dummyOnOk).toBeCalled();
  });
});
