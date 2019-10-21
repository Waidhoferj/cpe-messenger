//TODO: add short words
export function parseNameFrom(key) {
  let isUppercase = char => char.charCodeAt(0) > 64 && char.charCodeAt(0) < 90;
  let isCPE = (word, i) => word.slice(i, i + 3).toLowerCase() === "cpe";

  let str = "";
  for (let i = 0; i < key.length; i++) {
    if (isCPE(key, i)) {
      str += " CPE";
      i += 2;
    } else if (i === 0) str += key[i].toUpperCase();
    else if (isUppercase(key[i])) str += " " + key[i];
    else str += key[i];
  }
  return str;
}

export function parseKeyFrom(name) {
  return name
    .toLowerCase()
    .split(" ")
    .map((word, i) => (i === 0 ? word : word[0].toUpperCase() + word.slice(1)))
    .join("");
}

export function parseCSV(csv) {
  let isInt = /^\d+$/;
  let isPhoneNumber = value =>
    value[0] === "1" && value.length === 11 && isInt.test(value);
  return csv
    .replace(/"/g, "")
    .split(/,|\n/g)
    .filter(isPhoneNumber);
}

export function parsePhoneNumber(number) {
  let numStr = String(number);
  let hasCountryCode = numStr.length === 10;
  if (hasCountryCode)
    return `${numStr[0]}-${numStr.slice(1, 3)}-${numStr.slice(
      4,
      6
    )}-${numStr.slice(7, 10)}`;
  else
    return `${numStr.slice(0, 2)}-${numStr.slice(3, 5)}-${numStr.slice(6, 9)}`;
}
