import React, { useMemo } from 'react';
import { Text, StyleSheet, StyleProp, TextStyle, useColorScheme, Linking } from 'react-native';
import { parseWikiLinks } from '@/utils/wiki-links';
import { getArticleById } from '@/data/drink-knowledge-service';
import { Colors } from '@/constants/theme';

export interface LinkedArticleContentProps {
  content: string;
  onArticlePress?: (articleId: string) => void;
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
  selectable?: boolean;
}

export function LinkedArticleContent({
  content,
  onArticlePress,
  style,
  linkStyle,
  selectable = true,
}: LinkedArticleContentProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const segments = useMemo(() => parseWikiLinks(content), [content]);

  return (
    <Text style={[styles.baseText, { color: colors.text }, style]} selectable={selectable}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <Text key={index}>{segment.text}</Text>;
        }

        if (segment.isExternal && segment.externalUrl) {
          const externalUrl = segment.externalUrl;
          return (
            <Text
              key={index}
              accessibilityRole="link"
              accessibilityHint={`Opens external Wikipedia link: ${segment.text}`}
              onPress={() => Linking.openURL(externalUrl)}
              style={[
                styles.link,
                styles.externalLink,
                { color: colors.primary, textDecorationColor: colors.primary },
                linkStyle,
              ]}>
              {segment.text} ↗
            </Text>
          );
        }

        const targetId = segment.targetId || '';
        const targetArticle = getArticleById(targetId);
        const exists = Boolean(targetArticle);
        const displayText = segment.customLabel || targetArticle?.title || segment.text;

        if (!exists) {
          // Render graceful unlinked or styled text for missing target
          return (
            <Text
              key={index}
              style={[styles.missingLink, { color: colors.textSecondary }]}>
              {displayText}
            </Text>
          );
        }

        return (
          <Text
            key={index}
            accessibilityRole="link"
            accessibilityHint={`Navigates to article ${displayText}`}
            onPress={() => onArticlePress?.(targetId)}
            style={[
              styles.link,
              { color: colors.primary, textDecorationColor: colors.primary },
              linkStyle,
            ]}>
            {displayText}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  baseText: {
    fontSize: 14,
    lineHeight: 22,
  },
  link: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  externalLink: {
    fontStyle: 'normal',
  },
  missingLink: {
    fontStyle: 'italic',
  },
});
