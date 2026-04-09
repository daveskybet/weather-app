import { render, screen, userEvent } from '@testing-library/react-native';
import React from 'react';
import { ErrorMessage } from '@/components/ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the error message text', () => {
    render(<ErrorMessage message="City not found" />);
    expect(screen.getByTestId('error-text')).toHaveTextContent('City not found');
  });

  it('renders the retry button when onRetry is provided', () => {
    render(<ErrorMessage message="Error" onRetry={jest.fn()} />);
    expect(screen.getByTestId('retry-button')).toBeTruthy();
  });

  it('does not render the retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.queryByTestId('retry-button')).toBeNull();
  });

  it('calls onRetry when the retry button is pressed', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);
    await user.press(screen.getByTestId('retry-button'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
