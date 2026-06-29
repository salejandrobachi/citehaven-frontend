import { theme } from 'antd'
import type { ThemeConfig } from 'antd'

const SIDER_LIGHT = '#0F6B5C' // primary teal — distinct from white content area
const SIDER_DARK = '#0A1310'  // dark green-black, consistent with the dark layout bases

/**
 * Light theme: deep teal primary, amber accent mapped to colorWarning,
 * warm off-white backgrounds.
 */
export const lightThemeConfig: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // --- Seed tokens (drive the full derived palette via algorithm) ---
    colorPrimary: '#0F6B5C',
    colorSuccess: '#2E9E5B',
    colorWarning: '#D9A441',
    colorError: '#C4503D',
    colorLink: '#0F6B5C',

    // --- Map token overrides ---
    colorPrimaryHover: '#15876F',
    colorBgLayout: '#FAF8F4',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorText: '#1A2B26',
    colorTextSecondary: '#5C6B66',
    colorBorder: '#E5E1D8',
    colorBorderSecondary: '#E5E1D8',
  },
  components: {
    Layout: {
      siderBg: SIDER_LIGHT,
      triggerBg: SIDER_LIGHT,
      triggerColor: '#FFFFFF',
    },
    Menu: {
      darkItemBg: SIDER_LIGHT,
      darkItemColor: 'rgba(255, 255, 255, 0.85)',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.12)',
      darkItemHoverColor: '#FFFFFF',
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.18)',
      darkItemSelectedColor: '#FFFFFF',
    },
  },
}

/**
 * Dark theme: lighter teal primary, soft amber accent, deep green-black bases.
 * Sider uses a dark green-black background (consistent with the rest of the
 * dark palette) instead of the bright primary teal — using the primary color
 * as a background was too saturated/jarring against the near-black layout.
 * Menu text uses the light teal primary color so it stands out against the
 * dark sider background.
 */
export const darkThemeConfig: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    // --- Seed tokens ---
    colorPrimary: '#2DBF9E',
    colorSuccess: '#4CC97F',
    colorWarning: '#E0B768',
    colorError: '#E0705C',
    colorLink: '#2DBF9E',

    // --- Map token overrides ---
    colorPrimaryHover: '#3DD4B1',
    colorBgLayout: '#0D1412',
    colorBgContainer: '#161F1C',
    colorBgElevated: '#1D2924',
    colorText: '#F2F0EA',
    colorTextSecondary: '#9BA8A3',
    colorBorder: '#283330',
    colorBorderSecondary: '#283330',
  },
  components: {
    Layout: {
      siderBg: SIDER_DARK,
      triggerBg: SIDER_DARK,
      triggerColor: '#2DBF9E',
    },
    Menu: {
      darkItemBg: SIDER_DARK,
      darkItemColor: 'rgba(242, 240, 234, 0.75)',
      darkItemHoverBg: 'rgba(45, 191, 158, 0.12)',
      darkItemHoverColor: '#2DBF9E',
      darkItemSelectedBg: 'rgba(45, 191, 158, 0.18)',
      darkItemSelectedColor: '#2DBF9E',
    },
  },
}