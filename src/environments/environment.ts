import { EnvironmentsEnum } from '@multiversx/sdk-dapp/out/types/enums.types';

export const environment = {
  dAppConfig: {
    environment: EnvironmentsEnum.mainnet,
    transactionTracking: {
      successfulToastLifetime: 5000,
    },
  },
};
