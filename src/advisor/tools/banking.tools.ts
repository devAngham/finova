export const bankingTools = [
  {
    type: 'function',
    function: {
      name: 'create_account',
      description: 'Create a new bank account for the user',
      parameters: {
        type: 'object',
        properties: {
          accountType: {
            type: 'string',
            enum: ['savings', 'checking'],
            description: 'Type of create account',
          },
          currency: {
            type: 'string',
            enum: ['USD', 'EUR'],
            description: 'Currency for the account',
          },
        },
        required: ['accountType', 'currency'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_accounts',
      description:
        'Get all bank accounts for the current user with their balances',
      parameters: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'The user ID - always pass "current" as value',
          },
        },
      },
      required: ['userId'],
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_account',
      description:
        'Get bank account of aspecific account id for the current user',
      parameters: {
        type: 'object',
        properties: {
          accountId: {
            type: 'string',
            description: 'The account ID',
          },
        },
        required: ['accountId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_account_balance',
      description: 'Get bank account balance of a spesific account id',
      parameters: {
        type: 'object',
        properties: {
          accountId: {
            type: 'string',
            description: 'The account ID',
          },
        },
        required: ['accountId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'internal_transfer',
      description:
        'Transfer money between two internal accounts. Always confirm before executing',
      parameters: {
        type: 'object',
        properties: {
          fromAccount: {
            type: 'string',
            description: 'Source account ID',
          },
          toAccount: {
            type: 'string',
            description: 'Destination account ID',
          },
          amount: {
            type: 'number',
            description: 'Amount of transfer',
          },
          description: {
            type: 'string',
            description: 'Description of transfer',
          },
        },
        required: ['fromAccount', 'toAccount', 'amount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'external_transfer',
      description:
        'Transfer money to external bank via IBAN. Always confirm before executing',
      parameters: {
        type: 'object',
        properties: {
          fromAccount: {
            type: 'string',
            description: 'Source account ID',
          },
          iban: {
            type: 'string',
            description: 'Destination IBAN',
          },
          recipientName: {
            type: 'string',
            description: 'Recipient full name',
          },
          amount: {
            type: 'number',
            description: 'Amount of transfer',
          },
          description: {
            type: 'string',
            description: 'Transfer description',
          },
        },
        required: ['fromAccount', 'iban', 'recipientName', 'amount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_account_transactions',
      description: 'Get bank account transactions for a specific account id',
      parameters: {
        type: 'object',
        properties: {
          accountId: {
            type: 'string',
            description: 'The account ID',
          },
        },
        required: ['accountId'],
      },
    },
  },
];
