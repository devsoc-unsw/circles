import React from 'react';
import { render } from '@testing-library/react';
import { describe } from 'vitest';
import YearStep from './YearStep';

const incrementStep = jest.fn();

describe('YearStep', () => {
  it('should render', () => {
    render(<YearStep incrementStep={incrementStep} />);
  });

  it('should call incrementStep after selecting years', () => {
    fail('TODO');
  });

  it('should update degree length and start year after selecting years', () => {
    fail('TODO');
  });
});
