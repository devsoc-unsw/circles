import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from 'test/testUtil';
import openNotification from 'utils/openNotification';
import { vi } from 'vitest';
import * as hooks from 'hooks';
import StartBrowsingStep from './StartBrowsingStep';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('utils/openNotification', () => ({
  default: vi.fn(),
}));

describe('StartBrowsingStep', () => {
  const useDispatchMock = vi.spyOn(hooks, 'useAppDispatch');
  const useNavigateMock = vi.spyOn(reactRouterDom, 'useNavigate');

  beforeEach(() => {
    useDispatchMock.mockClear();
    useNavigateMock.mockClear();
    vi.clearAllMocks();
  });

  it('should render', () => {
    renderWithProviders(<StartBrowsingStep />);
    expect(screen.getByText('Start browsing courses!')).toBeInTheDocument();
  });

  it('should call openNotification when program code is not provided', async () => {
    renderWithProviders(<StartBrowsingStep />, {
      preloadedState: {
        degree: {
          programCode: '',
          programName: '',
          specs: [],
          isComplete: false,
        },
      },
    });
    await userEvent.click(screen.getByText('Start browsing courses!'));
    expect(openNotification).toBeCalledWith({
      message: 'Please select a degree',
      type: 'error',
    });
  });

  it('should call openNotification when a specialisation is not provided', async () => {
    renderWithProviders(<StartBrowsingStep />, {
      preloadedState: {
        degree: {
          programCode: '3778',
          programName: 'Computer Science',
          specs: [],
          isComplete: false,
        },
      },
    });
    await userEvent.click(screen.getByText('Start browsing courses!'));
    expect(openNotification).toBeCalledWith({
      message: 'Please select a specialisation',
      type: 'error',
    });
  });

  it('should set setIsComplete and navigate to course selector', async () => {
    const dummyDispatch = vi.fn();
    useDispatchMock.mockReturnValue(dummyDispatch);
    const dummyNavigate = vi.fn();
    useNavigateMock.mockReturnValue(dummyNavigate);

    renderWithProviders(<StartBrowsingStep />, {
      preloadedState: {
        degree: {
          programCode: '3778',
          programName: 'Computer Science',
          specs: ['COMPA1'],
          isComplete: false,
        },
      },
    });
    await userEvent.click(screen.getByText('Start browsing courses!'));
    expect(dummyDispatch).toBeCalledWith({
      payload: true,
      type: 'degree/setIsComplete',
    });
    expect(dummyNavigate).toBeCalledWith('/course-selector');
  });
});
