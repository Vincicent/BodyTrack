// FlashList: Jest has no layout engine, so fake the measurements FlashList needs.
// (FlashList 2.0.x ships a jestSetup.js, but it replaces FlashList with an export that no longer exists.)
jest.mock('@shopify/flash-list/dist/recyclerview/utils/measureLayout', () => {
  const actual = jest.requireActual('@shopify/flash-list/dist/recyclerview/utils/measureLayout');
  const box = (width, height) => ({ x: 0, y: 0, width, height });
  return {
    ...actual,
    measureParentSize: jest.fn(() => box(400, 900)),
    measureFirstChildLayout: jest.fn(() => box(400, 900)),
    measureItemLayout: jest.fn(() => box(400, 60)),
  };
});

// Swipe gestures can't run in Jest. Render the row and its actions side by side so tests can press "Delete".
jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Swipeable = ({ children, renderRightActions }) =>
    React.createElement(View, null, children, renderRightActions ? renderRightActions() : null);
  return { __esModule: true, default: Swipeable };
});
