import Base from "./Base";
import type User from "./User";
import type Message from "./Message";
import type Guild from "./Guild";
import type ClientApplication from "./ClientApplication";
import type Client from "../Client";
import type { ImageFormat, WebhookTypes } from "../Constants";
import { BASE_URL } from "../Constants";
import * as Routes from "../util/Routes";
import type { AnyGuildTextChannel, RawChannel } from "../types/channels";
import type { RawGuild } from "../types/guilds";
import type {
    DeleteWebhookMessageOptions,
    EditWebhookMessageOptions,
    EditWebhookOptions,
    ExecuteWebhookOptions,
    ExecuteWebhookWaitOptions,
    RawWebhook
} from "../types/webhooks";
import type { Uncached } from "../types/shared";
import type { JSONWebhook } from "../types/json";

export default class Webhook extends Base {
    /** The application associatd with this webhook. */
    application: ClientApplication | Uncached | null;
    /** The hash of this webhook's avatar. */
    avatar: string | null;
    /** The channel this webhook is for, if applicable. */
    channel: AnyGuildTextChannel | Uncached | null;
    /** The guild this webhook is for, if applicable. */
    guild: Guild | null;
    /** The id of the guild this webhook is in, if applicable. */
    guildID: string | null;
    /** The username of this webhook, if any. */
    name: string | null;
    /** The source channel for this webhook (channel follower only). */
    sourceChannel?: Pick<RawChannel, "id" | "name">;
    /** The source guild for this webhook (channel follower only). */
    sourceGuild?: Pick<RawGuild, "id" | "name" | "icon">;
    /** The token for this webhook (not present for webhooks created by other applications) */
    token?: string;
    /** The [type](https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types) of this webhook. */
    type: WebhookTypes;
    /** The user that created this webhook. */
    user: User | null;
    constructor(data: RawWebhook, client: Client) {
        super(data.id, client);
        this.application = data.application_id === null ? null : client.application?.id === data.application_id ? client.application : { id: data.application_id };
        this.avatar = data.avatar ?? null;
        this.channel = data.channel_id === null ? null : client.getChannel<AnyGuildTextChannel>(data.channel_id) || { id: data.channel_id };
        this.guild = !data.guild_id ? null : client.guilds.get(data.guild_id)!;
        this.guildID = data.guild_id ?? null;
        this.name = data.name;
        this.sourceChannel = data.source_channel;
        this.sourceGuild = data.source_guild;
        this.token = data.token;
        this.type = data.type;
        this.user = !data.user ? null : client.users.update(data.user);
    }

    get url() { return `${BASE_URL}${Routes.WEBHOOK(this.id, this.token)}`; }

    /**
     * The url of this webhook's avatar.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    avatarURL(format?: ImageFormat, size?: number) {
        return this.avatar === null ? null : this.client.util.formatImage(Routes.USER_AVATAR(this.id, this.avatar), format, size);
    }

    /**
     * Delete this webhook (requires a bot user, see `deleteToken`).
     * @param reason The reason for deleting this webhook.
     */
    async delete(reason?: string) {
        return this.client.rest.webhooks.delete(this.id, reason);
    }

    /**
     * Delete a message from this webhook.
     * @param messageID The ID of the message.
     * @param options The options for deleting the message.
     * @param token The token for the webhook, if not already present.
     */
    async deleteMessage(messageID: string, options?: DeleteWebhookMessageOptions, token?: string) {
        const t = this.token || token;
        if (!t) throw new Error("Token is not present on webhook, and was not provided in options.");
        return this.client.rest.webhooks.deleteMessage(this.id, t, messageID, options);
    }

    /**
     * Delete this webhook via its token.
     * @param token The token for the webhook, if not already present.
     */
    async deleteToken(token?: string) {
        const t = this.token || token;
        if (!t) throw new Error("Token is not present on webhook, and was not provided in options.");
        return this.client.rest.webhooks.deleteToken(this.id, t);
    }

    /**
     * Edit this webhook (requires a bot user, see `editToken`).
     * @param options The options for editing the webhook.
     */
    async edit(options: EditWebhookOptions) {
        return this.client.rest.webhooks.edit(this.id, options);
    }

    /**
     * Edit a webhook message.
     * @param id The ID of the webhook.
     * @param token The token of the webhook.
     * @param messageID The ID of the message to edit.
     * @param options The options for editing the message.
     */
    async editMessage<T extends AnyGuildTextChannel = AnyGuildTextChannel>(messageID: string, options: EditWebhookMessageOptions, token?: string): Promise<Message<T>> {
        const t = this.token || token;
        if (!t) throw new Error("Token is not present on webhook, and was not provided in options.");
        return this.client.rest.webhooks.editMessage<T>(this.id, t, messageID, options);
    }

    /**
     * Edit a webhook via its token.
     * @param options The options for editing the webhook.
     * @param token The token for the webhook, if not already present.
     */
    async editToken(options: EditWebhookOptions, token?: string) {
        const t = this.token || token;
        if (!t) throw new Error("Token is not present on webhook, and was not provided in options.");
        return this.client.rest.webhooks.editToken(this.id, t, options);
    }

    /**
     * Execute the webhook.
     * @param options The options for executing the webhook.
     * @param token The token for the webhook, if not already present.
     */
    async execute<T extends AnyGuildTextChannel>(options: ExecuteWebhookWaitOptions, token?: string): Promise<Message<T>>;
    async execute(options: ExecuteWebhookOptions, token?: string): Promise<void>;
    async execute<T extends AnyGuildTextChannel>(options: ExecuteWebhookOptions, token?: string): Promise<Message<T> | void> {
        const t = this.token || token;
        if (!t) throw new Error("Token is not present on webhook, and was not provided in options.");
        return this.client.rest.webhooks.execute<T>(this.id, t, options as ExecuteWebhookWaitOptions);
    }

    /**
     * Execute this webhook as github compatible.
     * @param options The options to send. See Github's documentation for more information.
     * @param token The token for the webhook, if not already present.
     */
    async executeGithub(options: Record<string, unknown> & { wait: false; }, token?: string): Promise<void>;
    async executeGithub<T extends AnyGuildTextChannel>(options: Record<string, unknown> & { wait?: true; }, token?: string): Promise<Message<T>>;
    async executeGithub<T extends AnyGuildTextChannel>(options: Record<string, unknown> & { wait?: boolean; }, token?: string): Promise<Message<T> | void> {
        const t = this.token || token;
        if (!t) throw new Error("Token is not present on webhook, and was not provided in options.");
        return this.client.rest.webhooks.executeGithub<T>(this.id, t, options as Record<string, unknown>);
    }

    /**
     * Execute this webhook as slack compatible.
     * @param options The options to send. See [Slack's Documentation](https://api.slack.com/incoming-webhooks) for more information.
     * @param token The token for the webhook, if not already present.
     */
    async executeSlack(options: Record<string, unknown> & { wait: false; }, token?: string): Promise<void>;
    async executeSlack<T extends AnyGuildTextChannel>(options: Record<string, unknown> & { wait?: true; }, token?: string): Promise<Message<T>>;
    async executeSlack<T extends AnyGuildTextChannel>(options: Record<string, unknown> & { wait?: boolean; }, token?: string): Promise<Message<T> | void> {
        const t = this.token || token;
        if (!t) throw new Error("Token is not present on webhook, and was not provided in options.");
        return this.client.rest.webhooks.executeSlack<T>(this.id, t, options as Record<string, unknown>);
    }

    /**
     * Get a webhook message.
     * @param messageID The ID of the message.
     * @param threadID The ID of the thread the message is in.
     * @param token The token for the webhook, if not already present.
     */
    async getMessage<T extends AnyGuildTextChannel>(messageID: string, threadID?: string, token?: string) {
        const t = this.token || token;
        if (!t) throw new Error("Token is not present on webhook, and was not provided in options.");
        return this.client.rest.webhooks.getMessage<T>(this.id, t, messageID, threadID);
    }

    /**
     * The url of this webhook's `sourceGuild` icon (only present on channel follower webhooks).
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    sourceGuildIconURL(format?: ImageFormat, size?: number) {
        return !this.sourceGuild?.icon ? null : this.client.util.formatImage(Routes.GUILD_ICON(this.id, this.sourceGuild?.icon), format, size);
    }

    override toJSON(): JSONWebhook {
        return {
            ...super.toJSON(),
            application:   this.application?.id || null,
            avatar:        this.avatar,
            channel:       this.channel?.id || null,
            guild:         this.guildID,
            name:          this.name,
            sourceChannel: this.sourceChannel,
            sourceGuild:   this.sourceGuild,
            token:         this.token,
            type:          this.type,
            user:          this.user?.toJSON()
        };
    }
}
