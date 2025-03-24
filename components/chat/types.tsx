import { Content } from "@google/generative-ai";

export interface ContentWithMeta extends Content {
  id: string;
  timestamp: Date;
}
