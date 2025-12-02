const applyFilters = (filters) => {
  const newFilters = {};

  Object.keys(filters).forEach((key) => {
    if (key.endsWith("[]")) {
      newFilters[key.replace("[]", "")] = filters[key];
    } else {
      newFilters[key] = filters[key];
    }
  });
  return newFilters;
};

module.exports = applyFilters;
