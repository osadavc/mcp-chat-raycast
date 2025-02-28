export const ensureUniqueId = (baseId: string, existingIds: string[], currentId?: string): string => {
  if (currentId && baseId === currentId) {
    return currentId;
  }

  let uniqueId = baseId;
  let counter = 1;

  while (existingIds.includes(uniqueId)) {
    uniqueId = `${baseId}-${counter}`;
    counter++;
  }

  return uniqueId;
};
