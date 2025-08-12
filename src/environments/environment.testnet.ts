import { EnvironmentsEnum } from '@multiversx/sdk-dapp/out/types/enums.types';
import { sharedConfig } from './shared';

const API_URL = 'https://testnet-template-api.multiversx.com';

export const environment = {
  production: false,
  API_URL,
  contractAddress: 'erd1qqqqqqqqqqqqqpgq8tq5rulzxzje29v8kzmcxx9pgx6kmevmep6qckwthl',
  environment: EnvironmentsEnum.testnet,
  sampleAuthenticatedDomains: [API_URL],
  ...sharedConfig
};