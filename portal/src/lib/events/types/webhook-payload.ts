export interface WebhookRequestBody {
  event: {
    data: {
      block: {
        number: string;
        timestamp: string;
        hash?: string;
        logs: {
          topics: string[];
          data: string;
          account: {
            address: string;
          };
          transaction: {
            hash: string;
            blockNumber?: number;
          };
          logIndex?: string;
          blockHash?: string;
          transactionIndex?: string;
          removed?: boolean;
        }[];
      };
    };
  };
}

export interface WebhookLogWithMetadata {
  topics: string[];
  data: string;
  address?: string;
  blockNumber?: string;
  transactionHash?: string;
  transactionIndex?: string;
  blockHash?: string;
  logIndex?: string;
  removed?: boolean;
  transaction?: {
    hash: string;
    blockNumber?: number;
  };
}