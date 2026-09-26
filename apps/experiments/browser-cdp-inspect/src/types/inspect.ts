export type InspectResult = {
  title: string;
  url: string;
  cookiesCount: number;
  documentTitle: string;
  performance: {
    domContentLoaded?: number;
  };
  userAgent: string;
};
