import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import SpecialisationStep from './SpecialisationStep';

const mockIncrementStep = vi.fn();

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

describe('SpecialisationStep', () => {
  it('should render', async () => {
    renderWithProviders(
      <SpecialisationStep
        incrementStep={mockIncrementStep}
        currStep={false}
        type="majors"
      />,
      { preloadedState },
    );
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

  it('should call incrementStep after selecting an option', async () => {
    renderWithProviders(
      <SpecialisationStep
        incrementStep={mockIncrementStep}
        currStep={false}
        type="majors"
      />,
      { preloadedState },
    );
    expect(mockIncrementStep).not.toHaveBeenCalled();
    await userEvent.click(await screen.findByText('COMPA1 Computer Science'));
    expect(mockIncrementStep).toHaveBeenCalled();
  });
});
