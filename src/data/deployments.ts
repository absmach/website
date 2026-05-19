export interface Deployment {
  logo: string;
  company: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

export const deployments: Deployment[] = [
  {
    logo: "/img/products/nokia.png",
    company: "Nokia",
    title: "Data Marketplace",
    description:
      "Nokia's Data Marketplace uses Magistrala to seamlessly connect real-time MQTT IoT data streams, enabling secure data sharing and monetisation through Magistrala connectors.",
    link: "https://www.nokia.com/networks/data-marketplace/",
    linkText: "Learn more",
  },
  {
    logo: "/img/products/intel.png",
    company: "Intel",
    title: "Edge Metering",
    description:
      "Magistrala powers real-time metering on the edge for Intel, integrated with EdgeX Foundry under the Linux Foundation.",
    link: "https://github.com/intel/Middleware-Metering",
    linkText: "View GitHub project",
  },
  {
    logo: "/img/products/ericsson.png",
    company: "Ericsson",
    title: "IoT Slice Orchestration",
    description:
      "Ericsson uses Magistrala for orchestration of IoT slices through edge and cloud microservice platforms.",
    link: "https://www.researchgate.net/publication/334265054_Enabling_the_Orchestration_of_IoT_Slices_through_Edge_and_Cloud_Microservice_Platforms",
    linkText: "Read the paper",
  },
  {
    logo: "/img/products/target.png",
    company: "Target",
    title: "In-Store IoT Platform",
    description:
      "Target uses Magistrala as the substrate of their IoT platform, deployed in-cloud and on the edge within their retail stores.",
    link: "https://youtu.be/VenSmkpzC8w?t=1988",
    linkText: "Watch the talk",
  },
];
