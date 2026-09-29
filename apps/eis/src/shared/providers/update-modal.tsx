import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useAppUpdateStore } from '@stores/update.store';
import { BlurView } from 'expo-blur';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Rocket01Icon } from '@hugeicons/core-free-icons';

export const UpdateModal: React.FC = () => {
  const isUpdateReady = useAppUpdateStore((s) => s.isUpdateReady);
  const isDownloading = useAppUpdateStore((s) => s.isDownloading);
  const runUpdate = useAppUpdateStore((s) => s.runUpdate);
  const skipUpdate = useAppUpdateStore((s) => s.skipUpdate);
  const checkAndDownloadUpdate = useAppUpdateStore((s) => s.checkAndDownloadUpdate);

  useEffect(() => {
    checkAndDownloadUpdate();
  }, [checkAndDownloadUpdate]);

  if (!isUpdateReady && !isDownloading) return null;

  return (
    <Modal transparent animationType="fade" visible={isUpdateReady || isDownloading}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <BlurView
          intensity={30}
          className="w-full overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-8 shadow-2xl">
          <View className="items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-md bg-blue-500/10">
              <HugeiconsIcon icon={Rocket01Icon} size={32} color="#3b82f6" />
            </View>

            <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
              {isDownloading ? 'Downloading Update...' : 'New Update Available!'}
            </Text>

            <Text className="mb-8 text-center text-base text-gray-600">
              {isDownloading
                ? 'We are downloading the latest version to ensure you have the best experience.'
                : 'A new version of the app is ready. Install it now to get the latest features and fixes.'}
            </Text>

            {isDownloading ? (
              <ActivityIndicator color="#3b82f6" size="large" />
            ) : (
              <View className="w-full flex-row gap-4">
                <TouchableOpacity
                  onPress={skipUpdate}
                  className="flex-1 items-center justify-center rounded-md bg-gray-200 py-4">
                  <Text className="text-base font-semibold text-gray-700">Remind Later</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={runUpdate}
                  className="flex-1 items-center justify-center rounded-md bg-blue-600 py-4 shadow-lg shadow-blue-500/30">
                  <Text className="text-base font-semibold text-white">Update Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};
