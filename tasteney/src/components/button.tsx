import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  useColorScheme,
  GestureResponderEvent,
} from 'react-native';
import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { Colors } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'container';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title?: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: { ios: string; android: string; web: string } | string | ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: ReactNode;
  activeOpacity?: number;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  children,
  activeOpacity = 0.85,
  fullWidth = false,
}: ButtonProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; iconColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: colors.primary,
            shadowColor: '#4d0011',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 3,
          },
          text: {
            color: colors.onPrimary,
            fontWeight: '700',
          },
          iconColor: colors.onPrimary,
        };
      case 'container':
        return {
          container: {
            backgroundColor: colors.primaryContainer,
            shadowColor: '#4d0011',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          },
          text: {
            color: colors.onPrimary,
            fontWeight: '700',
          },
          iconColor: colors.onPrimary,
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: colors.outlineVariant,
            borderWidth: 1,
          },
          text: {
            color: colors.textSecondary,
            fontWeight: '600',
          },
          iconColor: colors.textSecondary,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: colors.outlineVariant,
            borderWidth: 1,
          },
          text: {
            color: colors.text,
            fontWeight: '600',
          },
          iconColor: colors.text,
        };
      case 'danger':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: colors.danger,
            borderWidth: 1,
          },
          text: {
            color: colors.danger,
            fontWeight: '600',
          },
          iconColor: colors.danger,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: colors.primary,
            fontWeight: '600',
          },
          iconColor: colors.primary,
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle; iconSize: number } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 16,
            gap: 6,
          },
          text: {
            fontSize: 13,
          },
          iconSize: 14,
        };
      case 'lg':
        return {
          container: {
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderRadius: 24,
            gap: 8,
          },
          text: {
            fontSize: 16,
          },
          iconSize: 18,
        };
      case 'md':
      default:
        return {
          container: {
            paddingVertical: 12,
            paddingHorizontal: 18,
            borderRadius: 20,
            gap: 8,
          },
          text: {
            fontSize: 14,
          },
          iconSize: 16,
        };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return icon;
    }

    if (typeof icon === 'string') {
      return <Text style={{ fontSize: sizeStyle.iconSize }}>{icon}</Text>;
    }

    if (typeof icon === 'object' && 'ios' in icon) {
      return (
        <SymbolView
          name={icon as SymbolViewProps['name']}
          size={sizeStyle.iconSize}
          weight="bold"
          tintColor={variantStyle.iconColor}
        />
      );
    }

    return null;
  };

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        sizeStyle.container,
        variantStyle.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.text.color} />
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          {children ? (
            children
          ) : title ? (
            <Text style={[styles.baseText, sizeStyle.text, variantStyle.text, textStyle]}>
              {title}
            </Text>
          ) : null}
          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  baseText: {
    letterSpacing: 0.2,
  },
});
