const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';

  const convertBelowThousand = (n: number): string => {
    let result = '';

    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred';
      n %= 100;
      if (n > 0) result += ' ';
    }

    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      n %= 10;
      if (n > 0) result += ' ';
    }

    if (n > 0) {
      result += ones[n];
    }

    return result;
  };

  const parts: string[] = [];

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundred = num;

  if (crore) parts.push(convertBelowThousand(crore) + ' Crore');
  if (lakh) parts.push(convertBelowThousand(lakh) + ' Lakh');
  if (thousand) parts.push(convertBelowThousand(thousand) + ' Thousand');
  if (hundred) parts.push(convertBelowThousand(hundred));

  return parts.join(' ').trim();
}
