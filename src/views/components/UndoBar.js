import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '../../config/theme';

export default function UndoBar({ message, actionLabel, onAction, visible }) {
  if (!visible) return null;
  return (
    <View style={styles.bar} accessibilityLiveRegion="polite">
      <Text style={styles.text}>{message}</Text>
      {actionLabel ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: '#323232',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
  },
  text: { color: '#FFFFFF', flex: 1, fontSize: 14 },
  action: { color: '#80CBC4', fontWeight: '800', fontSize: 14, marginLeft: spacing.lg },
});
