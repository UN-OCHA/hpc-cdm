import { Language } from '../iface';
import strings from './en.json';

const LANGUAGE: Language = {
  meta: {
    name: 'English',
    direction: 'ltr',
  },
  strings,
};

export default LANGUAGE;

/* ADD IT!
,
    "flowsFilter": {
      "title": "Flows Filter",
      "flowDetails": {
        "title": "Flow Details",
        "flowId": { "label": "Flow ID", "placeholder": "" },
        "fundingAmountUSD": {
          "label": "Funding Amount in USD",
          "placeholder": ""
        },
        "keywords": { "label": "Keyword(s)", "placeholder": "Keyword(s)" }
      },
      "sourceDetails": {
        "title": "Source Details",
        "organisations": { "label": "Flow ID", "placeholder": "" },
        "fundingAmountUSD": {
          "label": "Funding Amount in USD",
          "placeholder": ""
        },
        "keywords": { "label": "Keyword(s)", "placeholder": "Keyword(s)" }
      }
    */
