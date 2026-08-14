// Adds DOM matchers such as toBeDisabled() and toBeInTheDocument() to expect().
// Those matchers are what let the role tests assert real accessibility state
// rather than appearance.
import '@testing-library/jest-dom/vitest'
