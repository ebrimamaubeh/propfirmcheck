export type PropFirm = {
  id: string;
  name: string;
  type: 'Futures' | 'Forex';
  review: {
    rating: number;
    count: number;
  };
  yearsInBusiness: number;
  maxAllocation: number;
  platform: string[];
  referralLink: string;
  promoCode: string;
  rules: {
    title: string;
    description: string;
  }[];
};
