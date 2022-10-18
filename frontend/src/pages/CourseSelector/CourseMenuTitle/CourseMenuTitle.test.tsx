import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from 'test/testUtil';
import { vi } from 'vitest';
import CourseMenuTitle from './CourseMenuTitle';

const defaultProps = {
  accurate: true,
  courseCode: 'COMP1511',
  title: 'Programming Fundamentals',
  unlocked: true
};

vi.importActual('styled-components');

vi.mock('styled-components', async () => {
  const styledComponents: object = await vi.importActual('styled-components');
  return {
    ...styledComponents,
    useTheme: vi.fn().mockResolvedValue({})
  };
});

describe('CourseMenuTitle', () => {
  it('should render', () => {
    renderWithProviders(<CourseMenuTitle {...defaultProps} />);
    expect(screen.getByText('COMP1511: Programming Fundamentals')).toBeInTheDocument();
    expect(screen.queryByTestId('antd-warning-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('antd-lock-icon')).not.toBeInTheDocument();
  });

  it('should show warning icon', () => {
    renderWithProviders(<CourseMenuTitle {...defaultProps} accurate={false} />);
    expect(screen.getByTestId('antd-warning-icon')).toBeInTheDocument();
  });

  it('should show lock icon', () => {
    renderWithProviders(<CourseMenuTitle {...defaultProps} unlocked={false} />);
    expect(screen.getByTestId('antd-lock-icon')).toBeInTheDocument();
  });
});
