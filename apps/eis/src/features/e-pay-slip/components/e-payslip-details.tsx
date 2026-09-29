import React from 'react';
import { Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CheckmarkBadge01Icon, File01Icon } from '@hugeicons/core-free-icons';
import { EPayslip } from '../types';
import { Button } from '@components/ui';
import { previewBase64PDF } from '@utils/helpers/preview-pdf';
import { logger } from '@utils/logger';
import { useSnackbar } from '@hooks';
import { formatDate } from '@utils/formatters';

interface PayslipDetailsProps {
  payslip: EPayslip;
  /** When false (before ownership confirmation) the download button is disabled. */
  downloadEnabled?: boolean;
}

/**
 * Shows the confirmed e-pay slip identity fields and the Download PDF /
 * Share Slip actions. When `downloadEnabled` is false (before ownership
 * confirmation) both actions are disabled.
 */

export const EPayslipDetails = ({ payslip, downloadEnabled = true }: PayslipDetailsProps) => {
  const { showSnackbar } = useSnackbar();

  const handlePreviewEPaySlip = async () => {
    if (!payslip?.pdf) {
      showSnackbar('No PDF');
      return;
    }

    const fileName = [payslip.payslip_no, payslip.payslip_date]
      .filter(Boolean)
      .join('-')
      .replace(/[^\w.-]+/g, '-'); // remove invalid filename characters

    try {
      previewBase64PDF(payslip.pdf, fileName);
    } catch (error) {
      logger.error('Failed to preview payslip PDF:', error);
      showSnackbar('Failed to preview payslip PDF');
    }
  };

  const rows = [
    { label: 'Payslip Number', value: payslip.payslip_no },
    { label: 'Payslip Date', value: formatDate(payslip.payslip_date) },
    { label: 'Sign Date', value: formatDate(payslip.sign_date) },
    { label: 'Name', value: payslip.name },
    { label: 'Designation', value: payslip.designation },
    { label: 'Valid From ', value: formatDate(payslip.valid_from) },
    { label: 'Valid To', value: formatDate(payslip.valid_to) || '' },
  ];

  return (
    <>
      {/* Institutional Detail Card */}
      <View className="mb-6 flex-col overflow-hidden rounded-md border border-border bg-white">
        {/* Institutional Badge Header */}
        <View className="flex-row items-center justify-between border-b border-border bg-primary/5 px-4 py-3">
          <Text className="text-sm font-semibold uppercase tracking-wider text-primary">
            Official Document
          </Text>
          <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} color="#2563eb" />
        </View>

        {/* Detail Rows */}
        <View className="flex-col">
          {rows.map((row, index) => (
            <DetailRow
              key={row.label}
              label={row.label}
              value={row.value}
              isLast={index === rows.length - 1}
            />
          ))}
        </View>
      </View>

      {/* Illustration / Visual Decorative Element */}
      <View className="mb-6 flex h-40 w-full items-center justify-center rounded-md border border-primary bg-primary/5">
        <View className="flex-col items-center">
          <View className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <HugeiconsIcon icon={File01Icon} size={24} color="#ffffff" />
          </View>
          <Text className="text-sm font-semibold text-primary">Digital Signature Encrypted</Text>
        </View>
      </View>

      {/* Action Section */}
      <View className="flex-row flex-wrap gap-x-2">
        <Button
          activeOpacity={0.8}
          disabled={!downloadEnabled}
          size={'lg'}
          className="flex-1"
          onPress={handlePreviewEPaySlip}>
          Preview
        </Button>
      </View>
    </>
  );
};

/** Renders a single label/value row inside the institutional detail card. */
const DetailRow = ({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) => (
  <View
    className={`min-h-[56px] flex-row items-center justify-between bg-white px-4 py-4 ${
      !isLast ? 'border-b border-border' : ''
    }`}>
    <Text className="text-sm text-graphite">{label}</Text>
    <Text className="text-base font-bold">{value}</Text>
  </View>
);
