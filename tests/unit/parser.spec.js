import { parseNameFrom, parseKeyFrom } from "@/modules/groupParser";
//TODO: This function should probably lowercase values like the, to, and, of, etc. in title and capitalize them in camel;
describe("Parse friendly name from group key", () => {
  it("returns something : D ", () => {
    expect(parseNameFrom("blah")).toBeTruthy();
  });
  it("Can parse words in camel case", () => {
    const key = "thisIsMyTest";
    const name = "This Is My Test";
    expect(parseNameFrom(key)).toMatch(name);

    const key2 = "ThisWordIsInCaps";
    const name2 = "This Word Is In Caps";
    expect(parseNameFrom(key2)).toMatch(name2);
  });

  it("Can parse words with CPE in them", () => {
    const key = "cpeClub";
    const name = "CPE Club";
    expect(parseNameFrom(key)).toMatch(name);

    const key2 = "associatesOfCpe";
    const name2 = "Associates Of CPE";
    expect(parseNameFrom(key2)).toMatch(name2);
  });
});

describe("Parses key from friendly name", () => {
  it("returns something : D ", () => {
    expect(parseKeyFrom("Hey There")).toBeTruthy();
  });

  it("Can turn capitalized spaced words into camel case", () => {
    let name = "Two Things Are Infinite The Universe And Human Stupidity";
    let key = "twoThingsAreInfiniteTheUniverseAndHumanStupidity";
    expect(parseKeyFrom(name)).toMatch(key);

    let name2 = "Be The Change That You Wish To See In The World";
    let key2 = "beTheChangeThatYouWishToSeeInTheWorld";
    expect(parseKeyFrom(name2)).toMatch(key2);
  });

  it("Can handle acronyms", () => {
    let name = "CPE Is Awesome";
    let key = "cpeIsAwesome";
    expect(parseKeyFrom(name)).toMatch(key);

    let name2 = "See How Awesome CPE Is";
    let key2 = "seeHowAwesomeCpeIs";
    expect(parseKeyFrom(name2)).toMatch(key2);
  });
});
