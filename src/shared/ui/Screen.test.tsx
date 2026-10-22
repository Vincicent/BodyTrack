import { Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { renderWithProviders, screen } from '@/test/render';
import { Screen } from './Screen';

// A phone with Android's 3-button navigation bar (48 px high)
const withNavigationBar = () =>
  jest.mocked(useSafeAreaInsets).mockReturnValue({ top: 24, bottom: 48, left: 0, right: 0 });

/** The bottom padding of the scrolling content: the space left below the last element (a Save button). */
function bottomSpace() {
  let node = screen.getByText('Save').parent;
  while (node && !node.props.contentContainerStyle) node = node.parent; // up to the ScrollView
  const style = [node?.props.contentContainerStyle].flat(Infinity).filter(Boolean);
  return Object.assign({}, ...style).paddingBottom;
}

afterEach(() => jest.restoreAllMocks());

describe('Screen', () => {
  it('on Android, keeps the end of the content above the navigation bar (edge to edge)', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    withNavigationBar();
    await renderWithProviders(
      <Screen>
        <Text>Save</Text>
      </Screen>,
    );
    expect(bottomSpace()).toBe(16 + 48); // spacing.lg + the bar
  });

  it('on iOS, adds nothing: the ScrollView already does (contentInsetAdjustmentBehavior)', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    withNavigationBar();
    await renderWithProviders(
      <Screen>
        <Text>Save</Text>
      </Screen>,
    );
    expect(bottomSpace()).toBe(16);
  });
});
