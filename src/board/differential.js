export function threePointSecondDerivative(previous, current, next, uniformDistance) {
  return (next - 2 * current + previous) / (uniformDistance * uniformDistance);
}
