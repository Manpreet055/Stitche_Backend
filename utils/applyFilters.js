const applyFilters = (filters) => {
  const query = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value == null || value === "") return acc;

    if (Array.isArray(value)) {
      acc[key] = { $in: value };
    } else if (!Number.isNaN(value) && value !== "") {
      acc[key] = Number(value);
    } else if (value === "true" || value === "false") {
      acc[key] = value === "true";
    } else {
      acc[key] = value;
    }
    return acc
  }, {});

  return query;
};

module.exports = applyFilters;
