import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from '@components/ui';
import { Container } from '@components/layout';
import { FooterImg } from '@components/common';
import { useAuthStore } from '@stores/auth.store';
/** Allowed answers for each self-declaration question. */
type SelfVerAnswer = '0' | '1' | '2';

/** Props for {@link FaceVerificationDeclarationForm}. */
export interface FaceVerificationDeclarationFormProps {
  /** Answer for the non-employment question. Empty string = unanswered. */
  nec: '0' | '1' | '2';
  /** Answer for the re-marriage question. Empty string = unanswered. */
  nmc: '0' | '1' | '2';
  /** Called when the user answers the non-employment question. */
  onChangeNec: (value: SelfVerAnswer) => void;
  /** Called when the user answers the re-marriage question. */
  onChangeNmc: (value: SelfVerAnswer) => void;
  /** Called when the user presses the Submit button. */
  onSubmit: () => void;
}

/**
 * Enhanced DLC self-declaration form with side-by-side radio buttons,
 * simplified copy, and fixed state handlers.
 */
export function FaceVerificationDeclarationForm({
  nec: selfVerNec = '0',
  nmc: selfVerNmc = '1',
  onChangeNec,
  onChangeNmc,
  onSubmit,
}: FaceVerificationDeclarationFormProps) {
  const { user } = useAuthStore();
  const showMarriageQuestion = user?.pclass === 'f';

  // Default selection is 'No' when unanswered
  const isNecNo = selfVerNec === '0';
  const isNecYes = selfVerNec === '1';

  const isNmcNo = selfVerNmc === '0';
  const isNmcYes = selfVerNmc === '1';

  return (
    <Container className="gap-5">
      <View className="gap-2">
        <View className="bg-primary/10 self-start py-1">
          <Text className="text-xs font-bold uppercase tracking-wider text-primary">
            Employement / Marriage
          </Text>
        </View>

        <Text className="text-2xl font-extrabold tracking-tight text-foreground">
          Self-Declaration
        </Text>

        <Text className="text-sm font-medium text-muted-foreground">
          Please answer the questions below.
        </Text>
      </View>

      <View className="w-full gap-y-2 rounded-md border-gray-500 bg-muted p-4">
        {/* Employment Section */}
        <Text className="text-center font-bold text-primary">EMPLOYMENT STATUS</Text>
        <View className="mb-4 flex-row items-center justify-between rounded-md border border-border bg-background p-3">
          <Text className="flex-1 pr-2 text-sm font-bold text-foreground">
            Are you Re-Employed?
          </Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onChangeNec('1')}
              className="flex-row items-center gap-1.5 px-2 py-1">
              <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                  isNecYes ? 'bg-primary/10 border-primary' : 'border-slate-400 bg-white'
                }`}>
                {isNecYes && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </View>
              <Text className="text-sm font-bold text-foreground">Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onChangeNec('0')}
              className="flex-row items-center gap-1.5 px-2 py-1">
              <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                  isNecNo ? 'bg-primary/10 border-primary' : 'border-slate-400 bg-white'
                }`}>
                {isNecNo && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </View>
              <Text className="text-sm font-bold text-foreground">No</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Marriage / Re-Marriage Section */}
        {showMarriageQuestion && (
          <>
            <Text className="mt-2 text-center font-bold text-primary">MARITAL STATUS</Text>
            <View className="mb-4 flex-row items-center justify-between rounded-md border border-border bg-background p-3">
              <Text className="flex-1 pr-2 text-sm font-bold text-foreground">
                Are you Re-Married?
              </Text>

              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onChangeNmc('1')}
                  className="flex-row items-center gap-1.5 px-2 py-1">
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isNmcYes ? 'bg-primary/10 border-primary' : 'border-slate-400 bg-white'
                    }`}>
                    {isNmcYes && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </View>
                  <Text className="text-sm font-bold text-foreground">Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onChangeNmc('0')}
                  className="flex-row items-center gap-1.5 px-2 py-1">
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isNmcNo ? 'bg-primary/10 border-primary' : 'border-slate-400 bg-white'
                    }`}>
                    {isNmcNo && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </View>
                  <Text className="text-sm font-bold text-foreground">No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <Button size="lg" className="mt-3 w-full" onPress={onSubmit}>
          <Text className="text-base font-bold text-white">Scan Face</Text>
        </Button>
      </View>
      <FooterImg />
    </Container>
  );
}
