interface ResearchBrand {
  logo: string;
  logoWidth: number;
  logoHeight: number;
  consortiumUrl: string;
  role: string;
  partners: { name: string; logo: string }[];
}

const media = "/preview/ai/media/research/";

/** Project identities and membership are sourced in media/research/sources.json. */
export const researchBrands: Record<string, ResearchBrand> = {
  elastic: {
    logo: `${media}elastic.png`,
    logoWidth: 522,
    logoHeight: 209,
    consortiumUrl: "https://elasticproject.eu/partners-2/",
    role: "Orchestration & edge security",
    partners: [
      { name: "Technical University of Crete", logo: `${media}tuc.png` },
      { name: "Ericsson", logo: `${media}ericsson.png` },
      { name: "Telefónica", logo: `${media}telefonica.png` },
      { name: "Thales", logo: `${media}thales.png` },
      { name: "imec", logo: `${media}imec.png` },
      { name: "Aalto University", logo: `${media}aalto.png` },
    ],
  },
  confidential6g: {
    logo: `${media}confidential6g.png`,
    logoWidth: 1730,
    logoHeight: 2020,
    consortiumUrl: "https://confidential6g.eu/partners/",
    role: "Technical management & secure IoT",
    partners: [
      { name: "WINGS ICT Solutions", logo: `${media}wings.png` },
      { name: "Nokia", logo: `${media}nokia.png` },
      { name: "Telefónica", logo: `${media}telefonica.png` },
      { name: "VTT", logo: `${media}vtt.png` },
      { name: "TNO", logo: `${media}tno.png` },
      { name: "Eindhoven University of Technology", logo: `${media}tue.png` },
    ],
  },
};
