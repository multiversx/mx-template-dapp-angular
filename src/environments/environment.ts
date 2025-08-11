import { EnvironmentsEnum } from '@multiversx/sdk-dapp/out/types/enums.types';
import { sharedConfig } from './shared';

const API_URL = 'https://devnet-template-api.multiversx.com';

export const environment = {
  production: false,
  API_URL,
  contractAddress: 'erd1qqqqqqqqqqqqqpgqm6ad6xrsjvxlcdcffqe8w58trpec09ug9l5qde96pq',
  environment: EnvironmentsEnum.devnet,
  sampleAuthenticatedDomains: [API_URL],
  ...sharedConfig
};