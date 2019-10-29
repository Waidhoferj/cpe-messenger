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
  let nonDigit = /\D/g;
  let notDate = field => !/[:M]/.test(field);
  let quotes = /"/g;
  let spacers = /[,\n]/g;
  let toPhoneNumbers = (numbers, entry) => {
    let digits = entry.replace(nonDigit, "");
    let validNumber =
      digits.length === 10 || (digits.length === 11 && digits[0] === "1");
    if (!validNumber) return numbers;
    if (digits.length === 10) digits = "1" + digits;
    numbers.add(digits);
    return numbers;
  };
  let numberSet = csv
    .replace(quotes, "")
    .split(spacers)
    .filter(notDate)
    .reduce(toPhoneNumbers, new Set());
  return Array.from(numberSet);
}

export function formatPhoneNumber(number) {
  let notPhoneNumber = parseInt(number) < Math.pow(10, 9);
  if (notPhoneNumber) return number;
  let str = String(number);
  if (str.length === 11) str = str.slice(1);
  return str.slice(0, 3) + "-" + str.slice(3, 6) + "-" + str.slice(6, 10);
}
