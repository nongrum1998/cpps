import { FooterImg as Footer } from '@pension/ui';

const footerUrl = [
  {
    source: require('../../../shared/assets/images/NIC.png'),
    alt: 'nic image',
  },
  {
    source: require('../../../shared/assets/images/Digital-India.png'),
    alt: 'digital-india',
  },
];

export const FooterImg = () => <Footer images={footerUrl} />;
