/// <reference types="nativewind/types" />

/**
 * NativeWind type registration for `@pension/ui`.
 *
 * This file exists so `tsc` in this package resolves the `className` prop on
 * React Native components. It is intentionally side-effect free: it contains
 * no runtime code and is never imported by JavaScript.
 *
 * ## Why this is required
 *
 * NativeWind v4 does not patch `react-native` at the type level by default.
 * The augmentation lives in `react-native-css-interop/types`, reached via the
 * chain:
 *
 * ```text
 * nativewind/types.d.ts
 *   -> /// <reference types="react-native-css-interop/types" />
 *     -> declare module "react-native" { interface ViewProps { className?: string } ... }
 * ```
 *
 * That `declare module "react-native"` block is a *global* module augmentation.
 * It only takes effect for a compilation that loads it. `apps/cpps` loads it
 * via its own `nativewind-env.d.ts`, which is why the app type-checks while
 * this package did not: `tsconfig.json` listed this filename in `include`, but
 * the file had never been created, so the augmentation was silently absent and
 * every `className` in this package resolved to a type error.
 *
 * `tsconfig.json` must keep `nativewind.d.ts` in its `include` array. Removing
 * it reintroduces the failure with no other warning.
 *
 * ## What it covers
 *
 * The augmentation adds `className?: string` to `ViewProps`, `TextProps`,
 * `ScrollViewProps`, `TextInputProps`, `SwitchProps`, `StatusBarProps`,
 * `FlatListProps`, `ImagePropsBase`, `ImageBackgroundProps`,
 * `InputAccessoryViewProps`, `TouchableWithoutFeedbackProps`, and
 * `KeyboardAvoidingViewProps` (which extends `ViewProps`).
 *
 * Anything whose props extend one of the above inherits `className` without any
 * extra declaration. That covers more than the list suggests, because React
 * Native itself routes most component props through `ViewProps`:
 *
 * - `ActivityIndicator` - `ActivityIndicatorProps extends ViewProps` in
 *   react-native 0.86, so it is covered despite not appearing in the
 *   augmentation list above.
 * - `SafeAreaView` (react-native-safe-area-context) -
 *   `NativeSafeAreaViewProps extends ViewProps`, so it is covered.
 *
 * A component whose props extend *none* of the augmented interfaces would not
 * be covered. None are used in this package today; if one appears, register it
 * with `cssInterop` from `nativewind` rather than loosening this file.
 *
 * @see {@link https://www.nativewind.dev/docs/getting-started/installation#typescript}
 * @see `react-native-css-interop/types` for the authoritative prop list.
 */
export {};
