import { Metadata } from "next";
import { TemplateCreator } from "./template-creator";

export const metadata: Metadata = {
  title: "Create Resume Template",
};

const sample = {
  name: "Software Engineer Resume",
  description: "A template for software engineering positions",
  content: {
    experiences: [
      //   {
      //     id: "exp1",
      //     companyName: "Tech Corp",
      //     role: "Senior Software Engineer",
      //     startDate: "Jan 2020",
      //     endDate: "Present",
      //     enabled: true,
      //     items: [
      //       {
      //         id: "item1",
      //         description: "Led development of microservices architecture",
      //         enabled: true,
      //         variations: [
      //           {
      //             id: "var1",
      //             content:
      //               "Led development of microservices architecture, improving system scalability by 200%",
      //             enabled: true,
      //           },
      //           {
      //             id: "var2",
      //             content:
      //               "Architected and implemented microservices solution that reduced deployment time by 75%",
      //             enabled: true,
      //           },
      //         ],
      //       },
      //       {
      //         id: "item2",
      //         description: "Mentored junior developers",
      //         enabled: true,
      //         variations: [
      //           {
      //             id: "var3",
      //             content:
      //               "Mentored 5 junior developers, improving team productivity by 30%",
      //             enabled: true,
      //           },
      //         ],
      //       },
      //     ],
      //   },
      //   {
      //     id: "exp2",
      //     companyName: "Startup Inc",
      //     role: "Software Developer",
      //     startDate: "Mar 2018",
      //     endDate: "Dec 2019",
      //     enabled: true,
      //     items: [
      //       {
      //         id: "item3",
      //         description: "Developed e-commerce platform",
      //         enabled: true,
      //         variations: [
      //           {
      //             id: "var4",
      //             content:
      //               "Developed e-commerce platform that increased sales by 45%",
      //             enabled: true,
      //           },
      //         ],
      //       },
      //     ],
      //   },
    ],
  },
};

export default async function TemplateBuilderPage() {
  return <TemplateCreator template={sample} />;
}
