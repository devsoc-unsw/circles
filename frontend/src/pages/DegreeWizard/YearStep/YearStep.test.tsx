import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import * as hooks from 'hooks';
import Steps from '../common/steps';
import YearStep from './YearStep';

const incrementStepMock = vi.fn();

describe('YearStep', () => {
  const useDispatchMock = vi.spyOn(hooks, 'useAppDispatch');

  beforeEach(() => {
    useDispatchMock.mockClear();
    vi.clearAllMocks();
  });

  it('should render', async () => {
    renderWithProviders(<YearStep incrementStep={incrementStepMock} />);
    expect(screen.getByText('What years do you start and finish?')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('antd-rangepicker')).toBeInTheDocument(), {
      timeout: 5000
    });
  });

  it('should dispatch correct props and call incrementStep after selecting years', async () => {
    const dummyDispatch = vi.fn();
    useDispatchMock.mockReturnValue(dummyDispatch);

    renderWithProviders(<YearStep incrementStep={incrementStepMock} />);
    await waitFor(() => expect(screen.getByTestId('antd-rangepicker')).toBeInTheDocument(), {
      timeout: 5000
    });
    await userEvent.click(screen.getByTestId('antd-rangepicker'));
    await userEvent.click(screen.getByText('2020'));
    await userEvent.click(screen.getByText('2022'));
    expect(dummyDispatch.mock.calls).toEqual([
      [
        {
          payload: 3,
          type: 'planner/updateDegreeLength'
        }
      ],
      [
        {
          payload: 2020,
          type: 'planner/updateStartYear'
        }
      ]
    ]);
    expect(incrementStepMock).toHaveBeenCalledWith(Steps.DEGREE);
  });
});
