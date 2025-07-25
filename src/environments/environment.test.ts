import { EnvironmentsEnum } from '@multiversx/sdk-dapp/out/types/enums.types';

export const environment = {
  dAppConfig: {
    environment: EnvironmentsEnum.testnet,
    transactionTracking: {
      successfulToastLifetime: 5000,
    },
  },
};
