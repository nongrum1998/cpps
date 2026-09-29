import React from 'react';
import { Modal, Text, View } from 'react-native';
import { EPayslipListItem } from '../types';
import { Button } from '@components/ui';
import { truncateText } from '@utils/formatters';

interface PayslipConfirmDialogProps {
  open: boolean;
  payslip: EPayslipListItem | null;
  userName: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog shown after a newly entered GE number returns a
 * payslip. Displays the payslip identity alongside the signed-in user's
 * name so the user can verify ownership before the GE number is persisted
 * and the PDF download is unlocked. Rendered as a light (theme-aware)
 * fade-animated native modal per the E-Pay Slip design mockup.
 */
export const EPayslipConfirmDialog = (props: PayslipConfirmDialogProps) => {
  const { open, payslip, userName, isConfirming = false, onConfirm, onCancel } = props;
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={open}
      onRequestClose={() => !isConfirming && onCancel()}>
      <View className="flex-1 items-center justify-center bg-black/70 px-5">
        {/* Modal Container */}
        <View className="w-full max-w-[350px] flex-col overflow-hidden rounded-md border border-border bg-white">
          <View className="p-6">
            <Text className="mb-2 text-xl font-bold">Confirm Your Payslip</Text>
            <Text className="mb-6 text-base leading-relaxed text-graphite">
              Please confirm this payslip belongs to you{' '}
              <Text className="font-semibold text-graphite">({userName})</Text> before downloading.
            </Text>

            {/* Identity Block */}
            {payslip && (
              <View className="flex-col rounded-md border border-border bg-border/5 p-4 ">
                <IdentityRow label="Name" value={payslip.name} />
                <Divider />
                <IdentityRow
                  label="Designation"
                  value={truncateText({ text: payslip.designation, maxLength: 35 })}
                />
                <Divider />
                <IdentityRow label="GE Number" value={payslip.ge_number} />
                <Divider />
                <IdentityRow label="Payslip No." value={payslip.payslip_no} />
              </View>
            )}
          </View>

          {/* Footer Buttons */}
          <View className="flex-col gap-y-3 px-6 pb-6">
            <Button activeOpacity={0.8} disabled={isConfirming} onPress={onConfirm}>
              {isConfirming ? 'Saving...' : 'This is my payslip'}
            </Button>

            <Button
              variant={'outline'}
              activeOpacity={0.8}
              disabled={isConfirming}
              onPress={onCancel}>
              Not mine
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/** Renders a single label/value row inside the confirmation body. */
const IdentityRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center justify-between">
    <Text className="text-sm text-graphite">{label}</Text>
    <Text className="shrink text-sm font-semibold">{value}</Text>
  </View>
);

/** Thin separator between identity rows. */
const Divider = () => <View className="my-3 h-px bg-border" />;
