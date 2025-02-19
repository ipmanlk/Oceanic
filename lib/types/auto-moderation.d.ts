import type { AutoModerationActionTypes, AutoModerationEventTypes, AutoModerationKeywordPresetTypes, AutoModerationTriggerTypes } from "../Constants";

export interface RawAutoModerationRule {
    actions: Array<RawAutoModerationAction>;
    creator_id: string;
    enabled: boolean;
    event_type: AutoModerationEventTypes;
    exempt_channels: Array<string>;
    exempt_roles: Array<string>;
    guild_id: string;
    id: string;
    name: string;
    trigger_metadata: RawTriggerMetadata;
    trigger_type: AutoModerationTriggerTypes;
}

export interface RawTriggerMetadata {
    /** KEYWORD_PRESET */
    allow_list?: Array<string>;
    /** KEYWORD */
    keyword_filter?: Array<string>;
    /** MENTION_SPAM */
    mention_total_limit?: number;
    /** KEYWORD_PRESET */
    presets?: Array<AutoModerationKeywordPresetTypes>;
}

export interface RawAutoModerationAction {
    metadata: RawActionMetadata;
    type: AutoModerationActionTypes;
}

export interface RawActionMetadata {
    /** SEND_ALERT_MESSAGE */
    channel_id: string;
    /** TIMEOUT */
    duration_seconds: number;
}

export interface TriggerMetadata {
    /** The keywords to allow. Valid for `KEYWORD_PRESET`. */
    allowList?: Array<string>;
    /** The keywords to filter. Valid for `KEYWORD`. */
    keywordFilter?: Array<string>;
    /** The maximum number of mentions to allow. Valid for `MENTION_SPAM`. */
    mentionTotalLimit?: number;
    /** The presets to use. Valid for `KEYWORD_PRESET`. */
    presets?: Array<AutoModerationKeywordPresetTypes>;
}

export interface AutoModerationAction {
    /** The metadata for the action. */
    metadata: ActionMetadata;
    /** The type of the action. */
    type: AutoModerationActionTypes;
}

export interface ActionMetadata {
    /** The ID of the channel to send the message to. Valid for `SEND_ALERT_MESSAGE`. */
    channelID: string;
    /** The duration of the timeout in seconds. Valid for `TIMEOUT`. */
    durationSeconds: number;
}

export interface CreateAutoModerationRuleOptions {
    /** The actions for the rule. */
    actions: Array<AutoModerationAction>;
    /** If the rule is enabled. */
    enabled?: boolean;
    /** The event type to trigger on. */
    eventType: AutoModerationEventTypes;
    /** The channels to exempt from the rule. */
    exemptChannels?: Array<string>;
    /** The roles to exempt from the rule. */
    exemptRoles?: Array<string>;
    /** The name of the rule. */
    name: string;
    /** The reason for creating the rule. */
    reason?: string;
    /** The metadata to use for the trigger. */
    triggerMetadata?: TriggerMetadata;
    /** The type of trigger to use. */
    triggerType: AutoModerationTriggerTypes;
}

export type EditAutoModerationRuleOptions = Partial<Pick<CreateAutoModerationRuleOptions, "name" | "eventType" | "triggerMetadata" | "actions" | "enabled" | "exemptRoles" | "exemptChannels" | "reason">>;
