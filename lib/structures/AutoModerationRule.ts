import Base from "./Base";
import type User from "./User";
import type Guild from "./Guild";
import type Client from "../Client";
import type { AutoModerationAction, EditAutoModerationRuleOptions, RawAutoModerationRule, TriggerMetadata } from "../types/auto-moderation";
import type { AutoModerationEventTypes, AutoModerationTriggerTypes } from "../Constants";
import type { JSONAutoModerationRule } from "../types/json";

/** Represents an auto moderation rule. */
export default class AutoModerationRule extends Base {
    /** The actions that will execute when this rule is triggered. */
    actions: Array<AutoModerationAction>;
    /** The creator of this rule. This can be a partial object with just an `id` property. */
    creator: User;
    /** The ID of the creator of this rule. */
    creatorID: string;
    /** If this rule is enabled. */
    enabled: boolean;
    /** The [event type](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types) of this rule. */
    eventType: AutoModerationEventTypes;
    /** The channels that are exempt from this rule. */
    exemptChannels: Array<string>;
    /** The roles that are exempt from this rule. */
    exemptRoles: Array<string>;
    /** The guild this rule is in. */
    guild: Guild;
    /** The id of the guild this rule is in. */
    guildID: string;
    /** The name of this rule */
    name: string;
    /** The metadata of this rule's trigger.  */
    triggerMetadata: TriggerMetadata;
    /** This rule's [trigger type](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types). */
    triggerType: AutoModerationTriggerTypes;
    constructor(data: RawAutoModerationRule, client: Client) {
        super(data.id, client);
        this.actions = data.actions.map(a => ({
            metadata: {
                channelID:       a.metadata.channel_id,
                durationSeconds: a.metadata.duration_seconds
            },
            type: a.type
        }));
        this.creator = client.users.get(data.creator_id)!;
        this.creatorID = data.creator_id;
        this.enabled = data.enabled;
        this.eventType = data.event_type;
        this.exemptChannels = data.exempt_channels;
        this.exemptRoles = data.exempt_roles;
        this.guild = client.guilds.get(data.guild_id)!;
        this.guildID = data.guild_id;
        this.name = data.name;
        this.triggerMetadata = {
            allowList:         data.trigger_metadata.allow_list,
            keywordFilter:     data.trigger_metadata.keyword_filter,
            mentionTotalLimit: data.trigger_metadata.mention_total_limit,
            presets:           data.trigger_metadata.presets
        };
        this.triggerType = data.trigger_type;
        this.update(data);
    }

    protected update(data: Partial<RawAutoModerationRule>) {
        if (data.actions !== undefined) this.actions = data.actions.map(a => ({
            metadata: {
                channelID:       a.metadata.channel_id,
                durationSeconds: a.metadata.duration_seconds
            },
            type: a.type
        }));
        if (data.enabled !== undefined) this.enabled = data.enabled;
        if (data.event_type !== undefined) this.eventType = data.event_type;
        if (data.exempt_channels !== undefined) this.exemptChannels = data.exempt_channels;
        if (data.exempt_roles !== undefined) this.exemptRoles = data.exempt_roles;
        if (data.name !== undefined) this.name = data.name;
        if (data.trigger_metadata !== undefined) this.triggerMetadata = {
            allowList:         data.trigger_metadata.allow_list,
            keywordFilter:     data.trigger_metadata.keyword_filter,
            mentionTotalLimit: data.trigger_metadata.mention_total_limit,
            presets:           data.trigger_metadata.presets
        };
        if (data.trigger_type !== undefined) this.triggerType = data.trigger_type;
    }

    /**
     * Delete this auto moderation rule.
     * @param reason The reason for deleting this rule.
     */
    async deleteAutoModerationRule(reason?: string) {
        return this.client.rest.guilds.deleteAutoModerationRule(this.guildID, this.id, reason);
    }

    /**
     * Edit this auto moderation rule.
     * @param options The options for editing the rule.
     */
    async edit(options: EditAutoModerationRuleOptions) {
        return this.client.rest.guilds.editAutoModerationRule(this.guildID, this.id, options);
    }

    override toJSON(): JSONAutoModerationRule {
        return {
            ...super.toJSON(),
            actions:         this.actions,
            creator:         this.creatorID,
            enabled:         this.enabled,
            eventType:       this.eventType,
            exemptChannels:  this.exemptChannels,
            exemptRoles:     this.exemptRoles,
            guild:           this.guildID,
            name:            this.name,
            triggerMetadata: this.triggerMetadata,
            triggerType:     this.triggerType
        };
    }
}
