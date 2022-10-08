import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import * as hooks from 'hooks';
import SpecialisationStep from './SpecialisationStep';

const mockAxios = new MockAdapter(axios);
mockAxios.onGet('/specialisations/getSpecialisations/3778/majors').reply(200, {
  spec: {
    'Computer Science': {
      is_optional: false,
      specs: {
        COMPN1: 'Computer Science (Computer Networks)',
        COMPD1: 'Computer Science (Database Systems)',
        COMPS1: 'Computer Science (Embedded Systems)',
        COMPA1: 'Computer Science',
        COMPJ1: 'Computer Science (Programming Languages)',
        COMPY1: 'Computer Science (Security Engineering)',
        COMPE1: 'Computer Science (eCommerce Systems)',
        COMPI1: 'Computer Science (Artificial Intelligence)',
      },
      notes: 'COMPA1 is the default stream, and will be used if no other stream is selected.',
    },
  },
});

const preloadedState = {
  degree: {
    programCode: '3778',
    programName: 'Computer Science',
    specs: [],
    isComplete: false,
  },
};

const incrementStepMock = vi.fn();

describe('SpecialisationStep', () => {
  const useSelectorMock = vi.spyOn(hooks, 'useAppSelector');
  const useDispatchMock = vi.spyOn(hooks, 'useAppDispatch');

  beforeEach(() => {
    useSelectorMock.mockClear();
    useDispatchMock.mockClear();
    vi.clearAllMocks();
  });

  it('should render', async () => {
    renderWithProviders(
      <SpecialisationStep
        incrementStep={incrementStepMock}
        type="majors"
      />,
      { preloadedState },
    );
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
    expect(screen.getByText('What are your majors?')).toBeInTheDocument();
    expect(await screen.findByText('Majors for Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Note: COMPA1 is the default stream, and will be used if no other stream is selected.')).toBeInTheDocument();
    expect(screen.getByText('COMPA1 Computer Science')).toBeInTheDocument();
    expect(screen.getByText('COMPD1 Computer Science (Database Systems)')).toBeInTheDocument();
    expect(screen.getByText('COMPE1 Computer Science (eCommerce Systems)')).toBeInTheDocument();
    expect(screen.getByText('COMPI1 Computer Science (Artificial Intelligence)')).toBeInTheDocument();
    expect(screen.getByText('COMPN1 Computer Science (Computer Networks)')).toBeInTheDocument();
    expect(screen.getByText('COMPS1 Computer Science (Embedded Systems)')).toBeInTheDocument();
    expect(screen.getByText('COMPY1 Computer Science (Security Engineering)')).toBeInTheDocument();
    expect(screen.getByText('COMPJ1 Computer Science (Programming Languages)')).toBeInTheDocument();
  });

  it('should dispatch correct props when selecting a specialisation', async () => {
    const dummyDispatch = vi.fn();
    useDispatchMock.mockReturnValue(dummyDispatch);

    renderWithProviders(
      <SpecialisationStep
        incrementStep={incrementStepMock}
        type="majors"
      />,
      { preloadedState },
    );
    await userEvent.click(await screen.findByText('COMPA1 Computer Science'));
    expect(dummyDispatch).toBeCalledWith({
      payload: 'COMPA1',
      type: 'degree/addSpecialisation',
    });
  });

  it('should display "Next" button when on current step and call incrementStep', async () => {
    renderWithProviders(
      <SpecialisationStep
        incrementStep={incrementStepMock}
        currStep
        type="majors"
      />,
      { preloadedState },
    );
    await userEvent.click(await screen.findByText('Next'));
  });
});
