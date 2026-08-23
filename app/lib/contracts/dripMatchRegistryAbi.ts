/** DripMatchRegistry ABI — regenerate with `npm run contracts:compile` */
export const DRIP_MATCH_REGISTRY_ABI = [
  {
    inputs: [],
    name: "initializeRegistry",
    outputs: [],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "creatorId", type: "string" }],
    name: "subscribeCreator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "creatorId", type: "string" }],
    name: "unsubscribeCreator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getSubscriptions",
    outputs: [{ internalType: "string[]", name: "", type: "string[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_SUBSCRIPTIONS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "string", name: "creatorId", type: "string" },
    ],
    name: "CreatorSubscribed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "string", name: "creatorId", type: "string" },
    ],
    name: "CreatorUnsubscribed",
    type: "event",
  },
  { name: "MaxSubscriptionsReached", type: "error" },
] as const;
