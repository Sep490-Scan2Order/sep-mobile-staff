import React from 'react';
import { render } from '@testing-library/react-native';
import { InlineError } from './InlineError';
describe('InlineError', () => {
  it('renders nothing when message is empty', () => {
    const { queryByText } = render(<InlineError message="" />);
    expect(queryByText(/./)).toBeNull();
  });
  it('renders nothing when not visible', () => {
    const { queryByText } = render(
      <InlineError message="Error" visible={false} />
    );
    expect(queryByText('Error')).toBeNull();
  });
  it('renders the error message when provided', () => {
    const { getByText } = render(<InlineError message="Field is required" />);
    expect(getByText('Field is required')).toBeTruthy();
  });
});
