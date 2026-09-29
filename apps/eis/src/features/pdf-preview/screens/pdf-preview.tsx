import React from 'react';
import Pdf from 'react-native-pdf';
import { router, useLocalSearchParams } from 'expo-router';
import { Container } from '@components/layout';
import { View } from 'react-native';
import { Button } from '@components/ui';
import * as Sharing from 'expo-sharing';
import { EmptyScreen } from '@components/screens';
import { PAGE_ROUTES } from '@utils/constants';
import { isValidPDFUriSchema } from '@validators/common';
import { Ternary } from '@components/common';

/**
 * PDF preview screen that renders a document from a URI passed as an
 * expo-router route param.
 *
 * Validates the incoming URI against {@link isValidPDFUriSchema} (must be a
 * URL whose path ends with `.pdf`, case-insensitive). If the URI is invalid,
 * renders an {@link EmptyScreen} with a "Go back" action that navigates to the
 * previous route when possible, falling back to the home route
 * ({@link PAGE_ROUTES.HOME}).
 *
 * When the URI is valid, renders a scrollable PDF viewer
 * (`react-native-pdf`) plus a full-width "Download" button that shares the PDF
 * via `expo-sharing`'s native share sheet.
 *
 * @example
 * ```tsx
 * router.push({ pathname: '/pdf-preview', params: { uri: 'file:///.../statement.pdf' } });
 * ```
 */

type PdfPreviewLocalSearchParamsProps = {
  uri: string;
  downloadable: string;
};

export function PdfPreviewScreen() {
  const { uri, downloadable = 'true' } = useLocalSearchParams<PdfPreviewLocalSearchParamsProps>();
  const isDownloadable = downloadable === 'true' ? true : false;

  const onPressGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
    router.replace(PAGE_ROUTES.HOME);
  };

  if (!isValidPDFUriSchema.safeParse(uri).success) {
    return (
      <Container>
        <EmptyScreen
          title="Invalid PDF"
          message="The provided URI is not a valid PDF."
          refreshLabel="Go back"
          refresh={onPressGoBack}
        />
      </Container>
    );
  }

  return (
    <Container>
      <Pdf
        showsVerticalScrollIndicator
        showsHorizontalScrollIndicator
        source={{ uri }}
        style={{ flex: 1, padding: 0, margin: 0 }}
      />
      <Ternary
        condition={isDownloadable}
        ifTrue={
          <View className="flex-row items-center justify-center">
            <Button
              disabled={!downloadable}
              className="w-full"
              size={'lg'}
              onPress={() => Sharing.shareAsync(uri)}>
              Download
            </Button>
          </View>
        }
        ifFalse={null}
      />
    </Container>
  );
}
