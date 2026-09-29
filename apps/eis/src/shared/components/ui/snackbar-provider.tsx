import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Text, View, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSnackbarStore } from '@stores/snackbar.store';
import { useTheme } from '@hooks/use-theme';
import { HugeiconsIcon } from '@hugeicons/react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_MAX_WIDTH = SCREEN_WIDTH * 0.9;
const ANIMATION_DURATION = 250;
const AUTO_DISMISS_MS = 2000;

/**
 * A lightweight snackbar banner that slides in from the bottom of the screen.
 *
 * Reads state from the snackbar Zustand store. When `showSnackbar` is called,
 * this component animates the banner into view, starts a 4-second auto-dismiss
 * timer, and slides it back out when dismissed or the timer fires.
 *
 * Tapping the banner dismisses it immediately.
 *
 * Renders nothing when no message is set (zero layout impact).
 */
export const SnackbarProvider = () => {
  const message = useSnackbarStore((state) => state.message);
  const visible = useSnackbarStore((state) => state.visible);
  const icon = useSnackbarStore((state) => state.icon);
  const dismissSnackbar = useSnackbarStore((state) => state.dismissSnackbar);

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const isDark = theme === 'dark';

  const translateY = useRef(new Animated.Value(150)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // React to visibility becoming true (show animation)
  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();

      // Start auto-dismiss timer
      timerRef.current = setTimeout(() => {
        useSnackbarStore.setState({ visible: false });
        timerRef.current = null;
      }, AUTO_DISMISS_MS);
    }
  }, [visible, translateY, opacity]);

  // React to visibility becoming false (dismiss animation)
  useEffect(() => {
    if (!visible && message !== null) {
      // Clean up timer if still running
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Slide out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 150,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        dismissSnackbar();
      });
    }
  }, [visible, message, translateY, opacity, dismissSnackbar]);

  const handleTap = () => {
    // Cancel timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Trigger dismiss animation by setting visible to false
    // message is still set so the exit useEffect fires
    useSnackbarStore.setState({ visible: false });
  };

  if (!message && !visible) {
    return null;
  }

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: insets.bottom + 16,
        left: 0,
        right: 0,
        alignItems: 'center',
        transform: [{ translateY }],
        opacity,
        zIndex: 9999,
        elevation: Platform.OS === 'android' ? 100 : undefined,
      }}
      pointerEvents="box-none">
      <TouchableOpacity
        onPress={handleTap}
        activeOpacity={0.85}
        accessibilityRole="alert"
        accessibilityLabel={message ?? undefined}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            maxWidth: BANNER_MAX_WIDTH,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 9999,
            backgroundColor: isDark ? '#ffffff' : '#1a1a1a',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
              },
              android: {
                elevation: 6,
              },
            }),
          }}>
          {icon ? (
            <View style={{ marginRight: 8 }}>
              <HugeiconsIcon icon={icon} size={20} color={isDark ? '#1a1a1a' : '#ffffff'} />
            </View>
          ) : null}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: isDark ? '#1a1a1a' : '#ffffff',
            }}>
            {message?.slice(0, 120)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
