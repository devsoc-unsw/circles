import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { renderWithProviders } from 'test/testUtil';
import CourseMenuTitle from './CourseMenuTitle';

const defaultProps = {
  accurate: true,
  courseCode: 'COMP1511',
  title: 'Programming Fundamentals',
  unlocked: true
};

const axiosMock = new MockAdapter(axios);
axiosMock.onGet('/courses/getCourse/COMP1511').reply(200, {
  code: 'COMP1511',
  title: 'Programming Fundamentals'
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

  it('should add course to planner', async () => {
    const { store } = renderWithProviders(<CourseMenuTitle {...defaultProps} accurate={false} />);
    await userEvent.click(screen.getByTestId('quick-add-cart-button'));
    expect(store.getState().planner.unplanned).toEqual(['COMP1511']);
  });
});
