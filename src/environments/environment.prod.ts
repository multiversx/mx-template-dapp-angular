import { EnvironmentsEnum } from '@multiversx/sdk-dapp/out/types/enums.types';
import { sharedConfig } from './shared';

const API_URL = 'https://template-api.multiversx.com';

export const environment = {
  production: true,
  API_URL,
  contractAddress: 'erd1qqqqqqqqqqqqqpgqtmcuh307t6kky677ernjj9ulk64zq74w9l5qxyhdn7',
  environment: EnvironmentsEnum.mainnet,
  authenticatedDomains: [API_URL],
  ...sharedConfig
};