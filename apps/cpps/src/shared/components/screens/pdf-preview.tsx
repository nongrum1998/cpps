import Pdf from 'react-native-pdf';
import { useEffect } from 'react';
import { View } from 'react-native';

import { useSafeNavigation } from '@pension/hooks';
import { Container } from '@components/layout';
import { Button, EmptyScreen } from '@pension/ui';
import { PAGE_ROUTES } from '@utils/constants';
import { saveAndShareBase64Pdf } from '@utils/helpers/save-base64-pdf';
import { usePdfPreviewStore } from '@stores/pdf-preview';
import { logger } from '@pension/utils';

export function PdfPreview() {
  const isDownloadable = usePdfPreviewStore((s) => s.downloadable);
  const rawUri = usePdfPreviewStore((s) => s.uri);
  const uri = rawUri?.startsWith('data:application/pdf;base64,')
    ? rawUri
    : `data:application/pdf;base64,${rawUri}`;

  const clearPdf = usePdfPreviewStore((s) => s.clearPdf);

  const { navigate, back } = useSafeNavigation();

  useEffect(() => {
    return clearPdf;
  }, [clearPdf]);

  const onPressGoBack = () => {
    const wentBack = back();

    if (!wentBack) {
      navigate(PAGE_ROUTES.HOME, 'replace');
    }
  };

  if (!uri) {
    return (
      <Container>
        <EmptyScreen
          title="Invalid PDF"
          message="The provided PDF is invalid."
          refreshLabel="Go back"
          refresh={onPressGoBack}
        />
      </Container>
    );
  }

  return (
    <>
      <View className="flex-1">
        <Pdf
          source={{ uri }}
          trustAllCerts={false}
          enableDoubleTapZoom
          style={{
            height: '100%',
            width: '100%',
            flex: 1,
          }}
          onError={(error) => {
            logger.log('PDF render error:', error);
          }}
        />
      </View>

      {isDownloadable && (
        <View className="p-4">
          <Button className="w-full" size="lg" onPress={() => saveAndShareBase64Pdf(uri)}>
            Download
          </Button>
        </View>
      )}
    </>
  );
}
