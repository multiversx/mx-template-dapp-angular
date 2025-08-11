export const sharedConfig = {
  apiTimeout: 6000,
  nativeAuth: true,
  transactionSize: 10,
  walletConnectV2ProjectId: '9b1a9564f91cb659ffe21b73d5c4e2d8',
  GITHUB_REPO_URL: 'https://github.com/multiversx/mx-template-dapp',
  BATCH_TRANSACTIONS_SC: {
    1: {
      contract:
        'erd1qqqqqqqqqqqqqpgqayf6j3qgpzj6c0e3vtj0jl8y0k4qr0mp2q5s7t7t5h',
      data: 'ESDTTransfer@wEGLD-bd4d79@0de0b6b3a7640000',
    },
    2: {
      contract:
        'erd1qqqqqqqqqqqqqpgqk0j8x9r0yf6qlj7w9qkz5s5c5q5c5q5c5q5c5q5c5q5c',
      data: 'swapTokensFixedInput@USDC-c76f1f@01',
    },
    3: {
      contract:
        'erd1qqqqqqqqqqqqqpgqk0j8x9r0yf6qlj7w9qkz5s5c5q5c5q5c5q5c5q5c5q5c',
      data: 'swapTokensFixedInput@MEX-455c57@01',
    },
    4: {
      contract:
        'erd1qqqqqqqqqqqqqpgqm0j8x9r0yf6qlj7w9qkz5s5c5q5c5q5c5q5c5q5c5q5c',
      data: 'lockTokens@MEX-455c57@0de0b6b3a7640000@0365c040',
    },
  },
};
