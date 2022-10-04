import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import YearStep from './YearStep';

const incrementStep = vi.fn();

vi.mock('../../../components/Datepicker.tsx', () => {
  const Datepicker = () => <div data-testid="ant-rangepicker" />;
  return {
    __esModule: true,
    default: {
      RangePicker: Datepicker,
    },
  };
});

describe('YearStep', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render', async () => {
    renderWithProviders(<YearStep incrementStep={incrementStep} />);
    expect(screen.getByText('What years do you start and finish?')).toBeInTheDocument();
    expect(await screen.findByTestId('ant-rangepicker')).toBeInTheDocument();
  });
});
