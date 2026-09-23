import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { RegistrationErrorView } from '../../components';
import { useRegistrationStore } from '../../store/registration';

describe('RegistrationErrorView', () => {
  beforeEach(() => {
    act(() => {
      useRegistrationStore.getState().reset();
    });
  });

  it('renders the failure message and retry action', () => {
    render(<RegistrationErrorView />);

    expect(screen.getByText('Registration Failed')).toBeTruthy();
    expect(screen.getByText('We could not create your account')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('resets the wizard when Try Again is pressed', () => {
    act(() => {
      useRegistrationStore.getState().setStep(3);
      useRegistrationStore.getState().setIsError();
    });

    render(<RegistrationErrorView />);
    fireEvent.press(screen.getByText('Try Again'));

    const state = useRegistrationStore.getState();
    expect(state.isError).toBe(false);
    expect(state.step).toBe(1);
  });
});
