// Import original module declarations
import 'styled-components';
// Import your custom theme
import type theme from './theme';

// Extend the module declarations using custom theme type

type Theme = typeof theme;

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
