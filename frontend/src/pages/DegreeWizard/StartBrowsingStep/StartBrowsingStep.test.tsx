import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import StartBrowsingStep from './StartBrowsingStep';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('StartBrowsingStep', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render', () => {
    renderWithProviders(<StartBrowsingStep />);
    expect(screen.getByText('Start browsing courses!')).toBeInTheDocument();
  });
});
