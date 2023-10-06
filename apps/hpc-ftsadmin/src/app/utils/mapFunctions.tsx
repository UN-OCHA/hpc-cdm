export const formValueToID = (
  items: { label: string; id: string }[]
): string[] => {
  return items.map((item) => item.id);
};

export const formValueToLabel = (
  items: { label: string; id: string }[]
): string[] => {
  return items.map((item) => item.label);
};

export const camelCaseToTitle = (word: string): string => {
  const addSpaces = word.replace(/([A-Z]+)/g, ' $1');
  return addSpaces.charAt(0).toUpperCase() + addSpaces.slice(1);
};
