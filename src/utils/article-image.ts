import { SITE } from "../config/site";
import { getCountryFlag } from "./country-flags";

export interface ArticleImage {
  url: string;
  alt: string;
  kind: "country-flag" | "topic" | "custom";
}

const topicImages: Record<string, ArticleImage> = {
  global: {
    url: "/images/global-food.svg",
    alt: "Illustration of a connected global food system",
    kind: "topic"
  },
  prices: {
    url: "/images/food-prices.svg",
    alt: "Illustration of food price trends and market costs",
    kind: "topic"
  },
  supply: {
    url: "/images/food-supply.svg",
    alt: "Illustration of grain storage and food supply",
    kind: "topic"
  },
  security: {
    url: "/images/food-security.svg",
    alt: "Illustration representing food access and food security",
    kind: "topic"
  },
  shortages: {
    url: "/images/food-shortages.svg",
    alt: "Illustration representing localized food shortages",
    kind: "topic"
  },
  climate: {
    url: "/images/climate-agriculture.svg",
    alt: "Illustration of weather and climate effects on agriculture",
    kind: "topic"
  },
  water: {
    url: "/images/water-food.svg",
    alt: "Illustration of irrigation and agricultural water",
    kind: "topic"
  },
  fertilizer: {
    url: "/images/fertilizer.svg",
    alt: "Illustration of fertilizer and crop nutrients",
    kind: "topic"
  },
  logistics: {
    url: "/images/supply-chain.svg",
    alt: "Illustration of grain shipping and food supply logistics",
    kind: "topic"
  },
  storage: {
    url: "/images/food-storage.svg",
    alt: "Illustration of household food storage and preparedness",
    kind: "topic"
  },
  solutions: {
    url: "/images/solutions.svg",
    alt: "Illustration of resilient agriculture and food-system solutions",
    kind: "topic"
  }
};

function topicFor(title: string, category: string): ArticleImage {
  const t = title.toLowerCase();

  if (/(price|prices|inflation|grocery bill|fao food price)/.test(t)) return topicImages.prices;
  if (/(hunger|famine|food security|hotspot)/.test(t)) return topicImages.security;
  if (/(shortage|stockpiling|food collapse)/.test(t)) {
    if (/stockpil|pantry|store water/.test(t)) return topicImages.storage;
    return topicImages.shortages;
  }
  if (/(hormuz|black sea|grain exports|shipping|supply chain|trade route|port)/.test(t)) return topicImages.logistics;
  if (/(el niño|el nino|drought|heat|harvest|crop risk|agriculture|weather)/.test(t)) return topicImages.climate;
  if (/(water|irrigation|groundwater)/.test(t)) return topicImages.water;
  if (/(fertilizer|fertiliser|nutrient|farm input)/.test(t)) return topicImages.fertilizer;
  if (/(storage|pantry|non-perishable|preparedness)/.test(t)) return topicImages.storage;
  if (/(solution|resilien|independence|prevent food crisis)/.test(t)) return topicImages.solutions;

  const categoryMap: Record<string, ArticleImage> = {
    "Global Food Crisis": topicImages.global,
    "Food Prices": topicImages.prices,
    "Food Supply": topicImages.supply,
    "Food Shortages": topicImages.shortages,
    "Food Security": topicImages.security,
    "Climate & Agriculture": topicImages.climate,
    "Water & Food": topicImages.water,
    "Fertilizer": topicImages.fertilizer,
    "Supply Chains": topicImages.logistics,
    "Food Storage": topicImages.storage,
    "Solutions": topicImages.solutions
  };

  return categoryMap[category] ?? topicImages.global;
}

export function getArticleImage(input: {
  title: string;
  category: string;
  heroImage?: string;
  imageAlt?: string;
}): ArticleImage {
  if (input.heroImage && input.heroImage !== SITE.defaultImage) {
    return {
      url: input.heroImage,
      alt: input.imageAlt ?? input.title,
      kind: "custom"
    };
  }

  if (input.category === "Countries") {
    const flag = getCountryFlag(input.title);
    if (flag) {
      return {
        url: flag.url,
        alt: `${flag.name} national flag`,
        kind: "country-flag"
      };
    }
  }

  return topicFor(input.title, input.category);
}
