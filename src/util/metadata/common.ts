export const compareSemVersions = (
  version1: string,
  version2: string,
): number => {
  const [major1, minor1, patch1] = getSemNumbers(version1)
  const [major2, minor2, patch2] = getSemNumbers(version2)

  if (major1 !== major2) {
    return major1 - major2
  }
  if (minor1 !== minor2) {
    return minor1 - minor2
  }
  return patch1 - patch2
}

export const getSemNumbers = (version: string): [number, number, number] => {
  const [major, minor, patch] = version.split('.').map(Number)
  return [major || 0, minor || 0, patch || 0]
}
