import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import Steps from '../common/steps';
import DegreeStep from './DegreeStep';

const mockAxios = new MockAdapter(axios);
mockAxios.onGet('/programs/getPrograms').reply(200, {
  programs: {
    3778: 'Computer Science',
  },
});

const mockIncrementStep = vi.fn();

describe('DegreeStep', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render', () => {
    renderWithProviders(<DegreeStep incrementStep={mockIncrementStep} />);
    expect(screen.getByText('What are you studying?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search Degree')).toBeInTheDocument();
  });

  it('should show no degree options on mount', async () => {
    renderWithProviders(<DegreeStep incrementStep={mockIncrementStep} />);
    expect(screen.queryByText('Computer Science')).not.toBeInTheDocument();
  });

  it('should show options and call incrementStep after selecting degree', async () => {
    renderWithProviders(<DegreeStep incrementStep={mockIncrementStep} />);
    expect(mockIncrementStep).not.toHaveBeenCalled();
    userEvent.type(screen.getByPlaceholderText('Search Degree'), 'comp');
    expect(await screen.findByText('3778 Computer Science')).toBeInTheDocument();
    await userEvent.click(screen.getByText('3778 Computer Science'));
    expect(mockIncrementStep).toHaveBeenCalledWith(Steps.SPECS);
  });
});
