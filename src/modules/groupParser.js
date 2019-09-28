export function parseNameFrom(key) {
  let isUppercase = char => char.charCodeAt(0) > 64 && char.charCodeAt(0) < 90;
  let isCPE = (word, i) => word.slice(i, i + 3).toLowerCase() === "cpe";
  let str = "";
  for (let i; i < key.length; i++) {
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
  let suffix = name.slice(1).replace(" ", "");
  let startsWithCPE = name.toLowerCase().startsWith("cpe");
  return startsWithCPE ? name[0] + suffix : name[0].toLowerCase() + suffix;
}
