import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import DegreeWizard from './DegreeWizard';

describe('DegreeWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', async () => {
    renderWithProviders(<DegreeWizard />);
    expect(screen.getByText('Welcome to Circles!')).toBeInTheDocument();
  });
});
