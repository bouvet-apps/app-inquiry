exports.forceArray = (object) => {
  if (!object || (typeof object === "object" && !Object.keys(object).length)) {
    return [];
  }
  if (object.constructor !== Array || typeof object === "string") {
    return [object];
  }
  return object;
};

exports.getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

exports.decodeHtml = (input, target) => {
  if (target === "excel") {
    return input
      .replace(/&#39;/g, "'")
      .replace(/&#34;/g, "\"")
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&amp;/g, "&")
      .replace(/&#64;/g, "@")
      .replace(/&#61;/g, "=")
      .replace(/&#43;/g, "+")
      .replace(/<br>/g, " ")
      .replace(/^[@,=,+,-]+/, ""); // Remove signs at beginning of a string that might cause the cell to be interpreted as a formula in excel
  }
  if (target === "script") {
    return input
      .replace(/&#39;/g, "'")
      .replace(/&#34;/g, "'") // Replace double quotes with single quotes to prevent script from breaking
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&amp;/g, "&")
      .replace(/&#64;/g, "@")
      .replace(/&#61;/g, "=")
      .replace(/&#43;/g, "+")
      .replace(/<br>/g, " ");
  }
  return input;
};
