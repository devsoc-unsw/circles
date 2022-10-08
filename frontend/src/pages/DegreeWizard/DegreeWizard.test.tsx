import React from 'react';
import * as reactRouterDom from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import { initialDegreeState } from 'reducers/degreeSlice';
import DegreeWizard from './DegreeWizard';

const mockAxios = new MockAdapter(axios);
mockAxios.onGet('/programs/getPrograms').reply(200, {
  programs: {
    3778: 'Computer Science',
  },
});

mockAxios.onGet('/specialisations/getSpecialisationTypes/3778').reply(200, {
  types: [
    'majors',
    'minors',
  ],
});

mockAxios.onGet('/specialisations/getSpecialisations/3778/majors').reply(200, {
  spec: {
    'Computer Science': {
      is_optional: false,
      specs: {
        COMPA1: 'Computer Science',
      },
      notes: 'COMPA1 is the default stream, and will be used if no other stream is selected.',
    },
  },
});

mockAxios.onGet('/specialisations/getSpecialisations/3778/minors').reply(200, {
  spec: {
    'Computer Science': {
      is_optional: true,
      specs: {
        FINSA2: 'Finance',
      },
      notes: 'Optional minors available include the following. If you complete a minor of 30 UOC, you will also need to take 6 UOC of free electives.',
    },
  },
});

describe('DegreeWizard', () => {
  const useNavigateMock = vi.spyOn(reactRouterDom, 'useNavigate');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', async () => {
    renderWithProviders(<DegreeWizard />);
    expect(screen.getByText('Welcome to Circles!')).toBeInTheDocument();
  });

  it('should render', async () => {
    const dummyNavigate = vi.fn();
    useNavigateMock.mockReturnValue(dummyNavigate);

    const { store } = renderWithProviders(<DegreeWizard />);
    expect(screen.getByText('Welcome to Circles!')).toBeInTheDocument();

    expect(store.getState().degree).toEqual(initialDegreeState);

    // select years
    await waitFor(() => expect(screen.getByTestId('antd-rangepicker')).toBeInTheDocument(), { timeout: 5000 });
    await userEvent.click(screen.getByTestId('antd-rangepicker'));
    await userEvent.click(screen.getByText('2020'));
    await userEvent.click(screen.getByText('2022'));

    // select degree
    await waitFor(() => expect(screen.getByPlaceholderText('Search Degree')).toBeInTheDocument());
    userEvent.type(screen.getByPlaceholderText('Search Degree'), 'comp');
    await userEvent.click(await screen.findByText('3778 Computer Science'));

    // select majors
    await waitFor(() => expect(screen.getByText('Majors for Computer Science')).toBeInTheDocument());
    await userEvent.click(screen.getByText('COMPA1 Computer Science'));
    await userEvent.click(screen.getByText('Next'));

    // select minors
    await waitFor(() => expect(screen.getByText('Minors for Computer Science')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Skip'));

    // finish degree wizard
    await userEvent.click(screen.getByText('Start browsing courses!'));

    // check final states
    expect(dummyNavigate).toBeCalledWith('/course-selector');
    expect(store.getState().degree).toEqual({
      programCode: '3778',
      programName: 'Computer Science',
      specs: ['COMPA1'],
      isComplete: true,
    });
  });
});
