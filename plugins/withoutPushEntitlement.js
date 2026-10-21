// BodyTrack only schedules LOCAL notifications (the daily reminder): no server ever sends a push. expo-notifications
// still adds the Push Notifications capability (aps-environment), which a free Apple ID ("Personal Team") can't sign:
// "Personal development teams … do not support the Push Notifications capability". Remove it.
// If the app ever receives push notifications, delete this plugin (and use a paid Apple Developer account).
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};
