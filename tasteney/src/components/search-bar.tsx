import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Colors, Spacing } from '@/constants/theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  style?: StyleProp<ViewStyle>;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  autoCorrect?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  onFocus,
  style,
  autoCapitalize = 'none',
  returnKeyType = 'search',
  autoCorrect = false,
}: SearchBarProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      style={[
        styles.searchContainer,
        {
          backgroundColor: colors.surfaceContainerLow,
          borderColor: colors.outlineVariant,
        },
        style,
      ]}>
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        size={18}
        weight="medium"
        tintColor={colors.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        clearButtonMode="never"
        returnKeyType={returnKeyType}
      />
      {value.length > 0 && (
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => onChangeText('')}
          style={styles.clearButton}>
          <SymbolView
            name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'close' }}
            size={18}
            tintColor={colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    height: '100%',
  },
  clearButton: {
    marginLeft: Spacing.two,
    padding: 2,
  },
});
