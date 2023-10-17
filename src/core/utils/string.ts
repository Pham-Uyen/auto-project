/**
 * Extract codename from test's description. a code name will begin with @TS_ or @TC_
 * @param testDescriptions
 * @returns
 */
export function extractCodeName(testDescriptions: string) {
    const result = testDescriptions
      .split(/(\s+)/)
      .filter(str => /^@T[S|C]_|^@[S|P]B_|^@DP_|^@PLB_/.test(str))
      .map(str => str.replace(/@/, ""));
    return result;
  }