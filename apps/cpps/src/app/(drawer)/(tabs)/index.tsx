import { StackHeader } from '@components/layout';
import { VerificationStatusScreen } from '@features/verification/screens/verification-status';

export default function Home() {
  return (
    <>
      <StackHeader />
      <VerificationStatusScreen />
    </>
  );
}
