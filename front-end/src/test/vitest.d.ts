/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace Vi {
    interface Assertion<T = any>
      extends jest.Matchers<void, T>,
        import('@testing-library/jest-dom').TestingLibraryMatchers<T, void> {}
  }
}
