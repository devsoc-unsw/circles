import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import YearStep from './YearStep';

const incrementStep = vi.fn();

describe('YearStep', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render', () => {
    render(<YearStep incrementStep={incrementStep} />);
    expect(screen.getByText('What years do you start and finish?')).toBeInTheDocument();
    expect(screen.getByTestId('ant-rangepicker')).toBeInTheDocument();
  });

  it('should call incrementStep after selecting years', async () => {
    render(<YearStep incrementStep={incrementStep} />);
    expect(incrementStep).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTestId('ant-rangepicker'));
    await userEvent.click(screen.getByText('2020'));
  });

  it('should update degree length and start year after selecting years', () => {
    fail('TODO');
  });
});
