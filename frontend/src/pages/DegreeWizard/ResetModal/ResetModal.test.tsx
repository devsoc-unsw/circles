import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import ResetModal from './ResetModal';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('ResetModal', () => {
  it('should render', () => {
    renderWithProviders(<ResetModal />);
    expect(screen.queryByText('Reset Planner?')).not.toBeInTheDocument();
  });

  it('should show modal when degree wizard is complete', () => {
    renderWithProviders(<ResetModal />, {
      preloadedState: {
        degree: {
          programCode: '3778',
          programName: 'Computer Science',
          specs: ['COMP1A'],
          isComplete: true,
        },
      },
    });
    expect(screen.getByText('Reset Planner?')).toBeInTheDocument();
  });
});
