declare module '@nextgen-marketplace/shared-utils' {
  export function executeWithPolicies<T>(fn: () => Promise<T>): Promise<T>;
}
