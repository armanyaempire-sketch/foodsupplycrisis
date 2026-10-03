export interface CountryFlag {
  code: string;
  name: string;
  url: string;
}

const countries: Array<{ match: string[]; code: string; name: string }> = [
  { match: ["united states", "us food", "u.s. food", "american"], code: "us", name: "United States" },
  { match: ["india"], code: "in", name: "India" },
  { match: ["china"], code: "cn", name: "China" },
  { match: ["egypt"], code: "eg", name: "Egypt" },
  { match: ["uae", "united arab emirates", "emirates"], code: "ae", name: "United Arab Emirates" },
  { match: ["saudi arabia"], code: "sa", name: "Saudi Arabia" },
  { match: ["qatar"], code: "qa", name: "Qatar" },
  { match: ["kuwait"], code: "kw", name: "Kuwait" },
  { match: ["philippines"], code: "ph", name: "Philippines" },
  { match: ["nigeria", "borno"], code: "ng", name: "Nigeria" },
  { match: ["japan"], code: "jp", name: "Japan" },
  { match: ["brazil"], code: "br", name: "Brazil" },
  { match: ["australia"], code: "au", name: "Australia" },
  { match: ["bangladesh"], code: "bd", name: "Bangladesh" },
  { match: ["pakistan"], code: "pk", name: "Pakistan" },
  { match: ["turkey", "turkiye"], code: "tr", name: "Türkiye" },
  { match: ["germany"], code: "de", name: "Germany" },
  { match: ["indonesia", "southeast asia rice"], code: "id", name: "Indonesia" },
  { match: ["thailand"], code: "th", name: "Thailand" },
  { match: ["russia"], code: "ru", name: "Russia" },
  { match: ["ukraine"], code: "ua", name: "Ukraine" },
  { match: ["sudan"], code: "sd", name: "Sudan" },
  { match: ["yemen"], code: "ye", name: "Yemen" },
  { match: ["somalia"], code: "so", name: "Somalia" },
  { match: ["united kingdom", "britain", " uk "], code: "gb", name: "United Kingdom" }
];

export function getCountryFlag(title: string): CountryFlag | null {
  const normalized = ` ${title.toLowerCase()} `;
  const match = countries.find((country) =>
    country.match.some((term) => normalized.includes(` ${term.toLowerCase()} `) || normalized.includes(term.toLowerCase()))
  );

  return match
    ? {
        ...match,
        url: `https://flagcdn.com/w1600/${match.code}.png`
      }
    : null;
}
