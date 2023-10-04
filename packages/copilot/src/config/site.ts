import { NavItem } from "common-utils";

interface SiteConfig {
  name: string;
  description: string;
  mainNav: NavItem[];
  links: {
    twitter: string;
    github: string;
    help: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "nmcopilot",
  description: "Draw diagram with natural language.",
  mainNav: [
    // {
    //   title: "Credentials",
    //   href: "/credentials",
    // },
  ],
  links: {
    twitter: "https://twitter.com/neuralmimicry",
    github: "https://github.com/neuralmimicry/nmcopilot",
    help: "https://localhost:3000/help",
  },
};
