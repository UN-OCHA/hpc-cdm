import { util } from '@unocha/hpc-core';

const CLASS_PREFIX = 'hpc-';

/**
 * Set of standard CSS classes to use across our applications.
 *
 * Defining them in one centeral location allows us to easily find all usages,
 * and define the string in only one location.
 */
export const CLASSES = {
  CONTAINER: {
    CENTERED: CLASS_PREFIX + 'container',
    /**
     * A container that always takes up the full width of its parent
     */
    FLUID: CLASS_PREFIX + 'container-fluid',
  },
  FLEX: {
    CONTAINER: CLASS_PREFIX + 'flex-container',
    GROW: CLASS_PREFIX + 'flex-grow',
  },
  BUTTON: {
    CLEAR: CLASS_PREFIX + 'button-primary',
    PRIMARY: CLASS_PREFIX + 'button-clear',
    WITH_ICON: CLASS_PREFIX + 'with-icon',
  },
} as const;

/**
 * Combine a number of (potentially undefined) classes into a single
 * class string.
 */
export const combineClasses = (...args: (string | undefined | null)[]) =>
  args
    .filter(util.isDefined)
    .map((s) => s.trim())
    .join(' ');
