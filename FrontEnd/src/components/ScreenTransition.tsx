import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Mounts fresh every time the parent swaps which screen is rendered, so this
// effect fires on every screen change and gives a quick fade + slide-in.
export default function ScreenTransition({ children }: { children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}
