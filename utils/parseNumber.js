function parseNumbers(obj) {
  for (let key in obj) {
    if (!isNaN(obj[key]) && obj[key] !== "") {
      obj[key] = Number(obj[key]);
    }
    if (obj[key] === "true") obj[key] = true;
    if (obj[key] === "false") obj[key] = false;
  }
  return obj;
}

module.exports = parseNumbers;
