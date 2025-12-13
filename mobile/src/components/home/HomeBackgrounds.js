import React from 'react';
import { WavePattern, AnimatedBlob, BubbleAnimation, PatternBackground } from '../';
import theme from '../../theme';

export function HomeBackgrounds() {
  return (
    <>
      {/* Layered decorative backgrounds */}
      <WavePattern color={theme.colors.sageGreen} opacity={0.06} />
      <PatternBackground pattern="dots" color={theme.colors.teal} opacity={0.05} size="small" />
      <PatternBackground pattern="diagonal-lines" color={theme.colors.lavender} opacity={0.04} size="large" />
      <PatternBackground pattern="cross-dots" color={theme.colors.slate} opacity={0.03} size="medium" />

      {/* Floating animated blobs */}
      <BubbleAnimation color={theme.colors.teal} size={220} opacity={0.18} duration={25000} style={{ top: '-5%', right: '-15%' }} />
      <AnimatedBlob color={theme.colors.lavender} size={180} opacity={0.2} shape="shape2" duration={30000} style={{ top: '15%', left: '-10%' }} />
      <BubbleAnimation color={theme.colors.sageGreen} size={160} opacity={0.15} duration={22000} style={{ top: '35%', right: '-8%' }} />
      <AnimatedBlob color={theme.colors.slate} size={200} opacity={0.12} shape="shape4" duration={28000} style={{ top: '55%', left: '-12%' }} />
      <BubbleAnimation color={theme.colors.mutedPurple} size={140} opacity={0.16} duration={24000} style={{ bottom: '25%', right: '-5%' }} />
      <AnimatedBlob color={theme.colors.peach} size={170} opacity={0.14} shape="shape2" duration={26000} style={{ bottom: '10%', left: '-8%' }} />
      <BubbleAnimation color={theme.colors.mossGreen} size={130} opacity={0.18} duration={23000} style={{ bottom: '40%', right: '80%' }} />
      <AnimatedBlob color={theme.colors.deepTeal} size={150} opacity={0.13} shape="shape1" duration={27000} style={{ top: '70%', right: '-6%' }} />
    </>
  );
}
