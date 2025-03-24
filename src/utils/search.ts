export const createSearchFilter = <T extends Record<string, any>>(
  searchQuery: string,
  fields: (keyof T)[]
): ((item: T) => boolean) => {
  const searchLower = searchQuery.toLowerCase();
  return (item: T) => {
    return fields.some(field => {
      const value = item[field];
      return value?.toString().toLowerCase().includes(searchLower);
    });
  };
}; 