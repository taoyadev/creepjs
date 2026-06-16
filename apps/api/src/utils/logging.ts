export function logEvent(event: Record<string, unknown>) {
  console.log(JSON.stringify(event));
}

export function logError(event: Record<string, unknown>) {
  console.error(JSON.stringify(event));
}
