import React, { createContext, useContext } from 'react';
import {
  useSharedValue,
  useAnimatedScrollHandler,
  type SharedValue,
} from 'react-native-reanimated';

interface AnimationContextType {
  start: boolean;
  stagger: number;
  scrollOffset: SharedValue<number>;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export const AnimationProvider = ({
  children,
  start = true,
  stagger = 100,
}: {
  children: React.ReactNode;
  start?: boolean;
  stagger?: number;
}) => {
  const scrollOffset = useSharedValue(0);
  return (
    <AnimationContext.Provider value={{ start, stagger, scrollOffset }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) throw new Error('useAnimation must be used within AnimationProvider');
  return context;
};

export const useAnimationScrollHandler = () => {
  const { scrollOffset } = useAnimation();
  return useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });
};
