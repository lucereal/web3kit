/**
 * Event topic hashes for AccessContract events
 * These are the keccak256 hashes of the event signatures
 */
export const EVENT_TOPICS = {
  AccessPurchased: "0x2a354138a732be5757193f302af3db171a4140c57d28ec50cad02ca4c29d4334",
  ResourceCreated: "0x1e12b808e756a4582626e57c5dd0108b3c525cff531ba4f16b99ea03a813a5b2",
  Withdrawal: "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65"
} as const;

/**
 * Mapping from topic hash to event name
 */
export const TOPIC_TO_EVENT_NAME = {
  [EVENT_TOPICS.AccessPurchased]: "AccessPurchased",
  [EVENT_TOPICS.ResourceCreated]: "ResourceCreated",
  [EVENT_TOPICS.Withdrawal]: "Withdrawal"
} as const;

/**
 * Array of all event topic hashes
 */
export const ALL_EVENT_TOPICS = Object.values(EVENT_TOPICS);

/**
 * Event names as a type union
 */
export type EventName = keyof typeof EVENT_TOPICS;

/**
 * Event topic hashes as a type union
 */
export type EventTopic = typeof EVENT_TOPICS[EventName];
