import { useTheme } from '@/shared/theme/useTheme';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, type ViewProps } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
  useKeyboardState,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Height of the bar the toolbar draws above the keyboard (the library's KEYBOARD_TOOLBAR_HEIGHT, not exported)
const TOOLBAR_HEIGHT = 42;

export function Screen({ children, style }: ViewProps) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const keyboardOpen = useKeyboardState((k) => k.isVisible);
  // Android draws apps edge to edge: without this, the end of a long form (its Save button) stays under the navigation
  // bar, where a tap presses Home (found by the Maestro flow). iOS adds it itself (contentInsetAdjustmentBehavior).
  const insets = useSafeAreaInsets();
  const navigationBar = Platform.OS === 'android' ? insets.bottom : 0;
  return (
    <>
      {/* React Native never moves a focused field above the keyboard by itself (iOS never did; Android stopped with
          edge-to-edge). This ScrollView scrolls the focused field into view, on both platforms. */}
      <KeyboardAwareScrollView
        bottomOffset={TOOLBAR_HEIGHT + 2 * t.spacing.lg} // measured from the text, not the field's frame: keep both visible
        style={{ backgroundColor: t.colors.background }}
        contentContainerStyle={[
          styles.content,
          { padding: t.spacing.lg, gap: t.spacing.lg, paddingBottom: t.spacing.lg + navigationBar },
          // While the keyboard is open, its toolbar covers the bottom of the screen: leave room for it, or it hides the
          // Save button (Android: 90% hidden). Also true with a floating keyboard, which takes no height of its own.
          // (The keyboard covers the navigation bar, so no need to add it here.)
          keyboardOpen && { paddingBottom: t.spacing.lg + TOOLBAR_HEIGHT },
          style,
        ]}
        contentInsetAdjustmentBehavior="automatic"
        // With the keyboard open, a tap on a button (Save) must press it. The default ("never") only closes the
        // keyboard, so users had to tap twice. Found by the Maestro flow.
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </KeyboardAwareScrollView>
      {/* A bar above the keyboard: previous/next field, and "Done" to close it. The iOS number pad has no "Done" key,
          so without it nothing closes the keyboard and the Save button of a long form stays hidden underneath. */}
      <KeyboardToolbar>
        <KeyboardToolbar.Prev />
        <KeyboardToolbar.Next />
        <KeyboardToolbar.Done text={tr('common.done')} />
      </KeyboardToolbar>
    </>
  );
}
const styles = StyleSheet.create({ content: { flexGrow: 1 } });
