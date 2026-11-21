import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius } from '../../config/theme';
import { useThemeColors } from '../../store/AppContext';

export default function SegmentedControl({ options, value, onChange, testID }) {
  const colors = useThemeColors();
  return (
    <View testID={testID} style={[styles.row, { borderColor: colors.border }]}>
      {options.map((opt, i) => {
        const selected = opt.value === value;
        const tint = opt.color || colors.primary;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segment,
              i > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border },
              selected && { backgroundColor: `${tint}26` },
            ]}
          >
            {opt.icon ? (
              <MaterialCommunityIcons name={opt.icon} size={17} color={selected ? tint : colors.textMuted} />
            ) : null}
            <Text style={[styles.label, { color: selected ? tint : colors.textMuted }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.pill, overflow: 'hidden' },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  label: { fontSize: 13.5, fontWeight: '600' },
});
