export const parseEnvString = (envString: string): Record<string, string> => {
  if (!envString.trim()) return {};

  const result: Record<string, string> = {};
  const lines = envString.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const equalsIndex = trimmedLine.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmedLine.substring(0, equalsIndex).trim();
    const value = trimmedLine.substring(equalsIndex + 1).trim();

    if (key) {
      result[key] = value;
    }
  }

  return result;
};

export const envObjectToString = (env: Record<string, string>): string => {
  if (!env || Object.keys(env).length === 0) return "";

  return Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
};
