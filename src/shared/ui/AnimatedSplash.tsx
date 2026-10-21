import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// The native splash (app.json) shows the whole icon, arrow included, because iOS opens an app by zooming its icon: the
// arrow must not vanish between the two. Here the arrow is a separate layer, on the same 1024 px canvas so both images
// line up exactly: target + arrow = the designer's splash-icon.png.
const SPLASH = {
  light: {
    backgroundColor: '#115E59',
    target: require('../../../assets/images/splash-target.png'),
    arrow: require('../../../assets/images/splash-arrow.png'),
  },
  dark: {
    backgroundColor: '#0B0F19',
    target: require('../../../assets/images/splash-target-dark.png'),
    arrow: require('../../../assets/images/splash-arrow-dark.png'),
  },
};
const IMAGE_WIDTH = 200; // "imageWidth" in app.json
const PULL_DISTANCE = 40; // how far the arrow is pulled out: up and to the right, along its own 45° line

// Timeline (ms): the arrow is pulled out a little and thrown back in, the target recoils, then the icon dips and zooms
// towards you while it all fades
const PULL = 160;
const HOLD = 50;
const THROW = 130;
const ARROW = PULL + HOLD + THROW;
const IMPACT = 140;
const DIP = 150;
const ZOOM = 350;
export const SPLASH_DURATION = ARROW + IMPACT + DIP + ZOOM;
export const LOAD_TIMEOUT = 1500; // if an image never loads, go on without waiting any longer

/**
 * Drawn on top of the app, exactly like the native splash (which can only be a still image). When it mounts, the
 * native splash is hidden behind it, then the arrow is thrown into the target and the splash animates out.
 */
export function AnimatedSplash() {
  // The native splash follows the SYSTEM appearance, not the in-app theme setting
  const splash = SPLASH[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const reduceMotion = useReducedMotion();
  const [done, setDone] = useState(false);
  // An <Image> draws nothing until its file is loaded (on web: downloaded). Start only when both layers are on screen,
  // or the user would see an empty teal screen instead of the target.
  const [ready, setReady] = useState(false);
  const loadedCount = useRef(0);
  const onLoad = () => {
    loadedCount.current += 1; // both layers, or the target would show without its arrow
    if (loadedCount.current === 2) setReady(true);
  };
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const flight = useSharedValue(1); // 1 = in the target (as in the icon), 0 = pulled out

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), LOAD_TIMEOUT);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hide(); // the overlay now looks exactly like the native splash: swap them
    if (reduceMotion) {
      opacity.set(withTiming(0, { duration: 200 })); // no movement: a short fade only
    } else {
      flight.set(
        withSequence(
          withTiming(0, { duration: PULL, easing: Easing.out(Easing.quad) }), // pulled out, slowing down
          withDelay(HOLD, withTiming(1, { duration: THROW, easing: Easing.in(Easing.quad) })), // thrown: speeds up
        ),
      );
      scale.set(
        withDelay(
          ARROW,
          withSequence(
            withTiming(0.94, { duration: IMPACT / 2, easing: Easing.out(Easing.quad) }), // the hit
            withTiming(1, { duration: IMPACT / 2, easing: Easing.out(Easing.quad) }),
            withTiming(0.9, { duration: DIP, easing: Easing.out(Easing.quad) }),
            withTiming(8, { duration: ZOOM, easing: Easing.in(Easing.cubic) }),
          ),
        ),
      );
      opacity.set(withDelay(ARROW + IMPACT + DIP + 50, withTiming(0, { duration: ZOOM - 50 }))); // ends with the zoom
    }
    const timer = setTimeout(() => setDone(true), reduceMotion ? 200 : SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [ready, opacity, scale, flight, reduceMotion]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const arrowStyle = useAnimatedStyle(() => {
    const distance = (1 - flight.get()) * PULL_DISTANCE;
    return { transform: [{ translateX: distance }, { translateY: -distance }] };
  });

  if (done) return null;
  return (
    <Animated.View
      testID="animated-splash"
      pointerEvents="none" // the app below is already usable while it fades
      accessibilityElementsHidden // decoration: screen readers skip it
      importantForAccessibility="no-hide-descendants"
      style={[
        StyleSheet.absoluteFill,
        styles.center,
        { backgroundColor: splash.backgroundColor },
        overlayStyle,
      ]}
    >
      <Animated.View style={[styles.icon, iconStyle]}>
        <Animated.Image
          testID="splash-target"
          source={splash.target}
          onLoad={onLoad}
          style={styles.layer}
        />
        <Animated.Image
          testID="splash-arrow"
          source={splash.arrow}
          onLoad={onLoad}
          style={[styles.layer, arrowStyle]}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  icon: { width: IMAGE_WIDTH, height: IMAGE_WIDTH },
  // An explicit size, not absoluteFill: on web, a loaded image takes its file's size (1024 px) unless told otherwise
  layer: { position: 'absolute', top: 0, left: 0, width: IMAGE_WIDTH, height: IMAGE_WIDTH },
});
