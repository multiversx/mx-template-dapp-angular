import { EnvironmentsEnum } from '@multiversx/sdk-dapp/out/types/enums.types';

export const environment = {
  dAppConfig: {
    environment: EnvironmentsEnum.devnet,
    transactionTracking: {
      successfulToastLifetime: 5000,
    },
  },
};
