import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { CityInput } from '@/components/CityInput';

describe('CityInput', () => {
  it('renders with the current city as the initial value', () => {
    render(<CityInput currentCity="Berlin" onSubmit={jest.fn()} />);
    expect(screen.getByTestId('city-input').props.value).toBe('Berlin');
  });

  it('calls onSubmit with the typed city when the search button is pressed', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<CityInput currentCity="" onSubmit={onSubmit} />);
    await user.type(screen.getByTestId('city-input'), 'Madrid');
    await user.press(screen.getByTestId('search-button'));
    expect(onSubmit).toHaveBeenCalledWith('Madrid');
  });

  it('calls onSubmit when the keyboard return key is pressed', async() => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<CityInput currentCity="" onSubmit={onSubmit} />);
    await user.type(screen.getByTestId('city-input'), 'Rome');
    fireEvent(screen.getByTestId('city-input'), 'submitEditing');
    expect(onSubmit).toHaveBeenCalledWith('Rome');
  });

  it('does not call onSubmit when the input is empty', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<CityInput currentCity="" onSubmit={onSubmit} />);
    await user.press(screen.getByTestId('search-button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('trims whitespace before submitting', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<CityInput currentCity="" onSubmit={onSubmit} />);
    await user.type(screen.getByTestId('city-input'), '  Paris  ');
    await user.press(screen.getByTestId('search-button'));
    expect(onSubmit).toHaveBeenCalledWith('Paris');
  });
});
