import type {
    CreateWebhookOptions,
    DeleteWebhookMessageOptions,
    EditWebhookMessageOptions,
    EditWebhookOptions,
    EditWebhookTokenOptions,
    ExecuteWebhookOptions,
    ExecuteWebhookWaitOptions,
    RawWebhook
} from "../types/webhooks";
import type { AnyGuildTextChannel, RawMessage } from "../types/channels";
import * as Routes from "../util/Routes";
import Webhook from "../structures/Webhook";
import Message from "../structures/Message";
import type RESTManager from "../rest/RESTManager";

export default class Webhooks {
    #manager: RESTManager;
    constructor(manager: RESTManager) {
        this.#manager = manager;
    }
    /**
     * Creat a channel webhook.
     * @param channelID The ID of the channel to create the webhook in.
     * @param options The options to create the webhook with.
     */
    async create(channelID: string, options: CreateWebhookOptions) {
        const reason = options.reason;
        if (options.reason) delete options.reason;
        if (options.avatar) options.avatar = this.#manager.client.util._convertImage(options.avatar, "avatar");
        return this.#manager.authRequest<RawWebhook>({
            method: "POST",
            path:   Routes.CHANNEL_WEBHOOKS(channelID),
            json:   {
                avatar: options.avatar,
                name:   options.name
            },
            reason
        }).then(data => new Webhook(data, this.#manager.client));
    }

    /**
     * Delete a webhook.
     * @param id The ID of the webhook.
     * @param reason The reason for deleting the webhook.
     */
    async delete(id: string, reason?: string) {
        await this.#manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.WEBHOOK(id),
            reason
        });
    }

    /**
     * Delete a webhook message.
     * @param id The ID of the webhook.
     * @param token The token of the webhook.
     * @param messageID The ID of the message.
     * @param options The options for deleting the message.
     */
    async deleteMessage(id: string, token: string, messageID: string, options?: DeleteWebhookMessageOptions) {
        const query = new URLSearchParams();
        if (options?.threadID) query.set("thread_id", options.threadID);
        await this.#manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.WEBHOOK_MESSAGE(id, token, messageID)
        });
    }

    /**
     * Delete a webhook via its token.
     * @param id The ID of the webhook.
     * @param token The token of the webhook.
     */
    async deleteToken(id: string, token: string) {
        await this.#manager.authRequest<null>({
            method: "DELETE",
            path:   Routes.WEBHOOK(id, token)
        });
    }

    /**
     * Edit a webhook.
     * @param id The ID of the webhook.
     * @param options The options tofor editing the webhook.
     */
    async edit(id: string, options: EditWebhookOptions) {
        const reason = options.reason;
        if (options.reason) delete options.reason;
        if (options.avatar) options.avatar = this.#manager.client.util._convertImage(options.avatar, "avatar");
        return this.#manager.authRequest<RawWebhook>({
            method: "PATCH",
            path:   Routes.WEBHOOK(id),
            json:   {
                avatar:     options.avatar,
                channel_id: options.channelID,
                name:       options.name
            },
            reason
        }).then(data => new Webhook(data, this.#manager.client));
    }

    /**
     * Edit a webhook message.
     * @param id The ID of the webhook.
     * @param token The token of the webhook.
     * @param messageID The ID of the message to edit.
     * @param options The options for editing the message.
     */
    async editMessage<T extends AnyGuildTextChannel>(id: string, token: string, messageID: string, options: EditWebhookMessageOptions): Promise<Message<T>> {
        const files = options.files;
        if (options.files) delete options.files;
        const query = new URLSearchParams();
        if (options.threadID) query.set("thread_id", options.threadID);
        return this.#manager.authRequest<RawMessage>({
            method: "PATCH",
            path:   Routes.WEBHOOK_MESSAGE(id, token, messageID),
            json:   {
                allowed_mentions: this.#manager.client.util.formatAllowedMentions(options.allowedMentions),
                attachments:      options.attachments,
                components:       options.components ? this.#manager.client.util.componentsToRaw(options.components) : undefined,
                content:          options.content,
                embeds:           options.embeds ? this.#manager.client.util.embedsToRaw(options.embeds) : undefined
            },
            query,
            files
        }).then(data => new Message<T>(data, this.#manager.client));
    }

    /**
     * Edit a webhook via its token.
     * @param id The ID of the webhook.
     * @param options The options for editing the webhook.
     */
    async editToken(id: string, token: string, options: EditWebhookTokenOptions) {
        if (options.avatar) options.avatar = this.#manager.client.util._convertImage(options.avatar, "avatar");
        return this.#manager.authRequest<RawWebhook>({
            method: "PATCH",
            path:   Routes.WEBHOOK(id, token),
            json:   {
                avatar: options.avatar,
                name:   options.name
            }
        }).then(data => new Webhook(data, this.#manager.client));
    }

    /**
     * Execute a webhook.
     * @param id The ID of the webhook.
     * @param token The token of the webhook.
     * @param options The options for executing the webhook.
     */
    async execute<T extends AnyGuildTextChannel>(id: string, token: string, options: ExecuteWebhookWaitOptions): Promise<Message<T>>;
    async execute(id: string, token: string, options: ExecuteWebhookOptions): Promise<void>;
    async execute<T extends AnyGuildTextChannel>(id: string, token: string, options: ExecuteWebhookOptions): Promise<Message<T> | void> {
        const files = options.files;
        if (options.files) delete options.files;
        const query = new URLSearchParams();
        if (options.wait) query.set("wait", "true");
        if (options.threadID) query.set("thread_id", options.threadID);
        return this.#manager.authRequest<RawMessage | null>({
            method: "POST",
            path:   Routes.WEBHOOK(id, token),
            query,
            json:   {
                allowed_mentions: this.#manager.client.util.formatAllowedMentions(options.allowedMentions),
                attachments:      options.attachments,
                avatar_url:       options.avatarURL,
                components:       options.components ? this.#manager.client.util.componentsToRaw(options.components) : undefined,
                content:          options.content,
                embeds:           options.embeds ? this.#manager.client.util.embedsToRaw(options.embeds) : undefined,
                flags:            options.flags,
                thread_name:      options.threadName,
                tts:              options.tts,
                username:         options.username
            },
            files
        }).then(res => {
            if (options.wait && res !== null) return new Message(res, this.#manager.client);
        });
    }

    /**
     * Execute a github compabible webhook.
     * @param id The ID of the webhook.
     * @param token The token of the webhook.
     * @param options The options to send. See Github's documentation for more information.
     */
    async executeGithub(id: string, token: string, options: Record<string, unknown> & { wait: false; }): Promise<void>;
    async executeGithub<T extends AnyGuildTextChannel>(id: string, token: string, options: Record<string, unknown> & { wait?: true; }): Promise<Message<T>>;
    async executeGithub<T extends AnyGuildTextChannel>(id: string, token: string, options: Record<string, unknown> & { wait?: boolean; }): Promise<Message<T> | void> {
        const query = new URLSearchParams();
        if (options.wait) query.set("wait", "true");
        return this.#manager.authRequest<RawMessage | null>({
            method: "POST",
            path:   Routes.WEBHOOK_PLATFORM(id, token, "github"),
            query,
            json:   options
        }).then(res => {
            if (options.wait && res !== null) return new Message(res, this.#manager.client);
        });
    }

    /**
     * Execute a slack compabible webhook.
     * @param id The ID of the webhook.
     * @param token The token of the webhook.
     * @param options The options to send. See [Slack's Documentation](https://api.slack.com/incoming-webhooks) for more information.
     */
    async executeSlack(id: string, token: string, options: Record<string, unknown> & { wait: false; }): Promise<void>;
    async executeSlack<T extends AnyGuildTextChannel>(id: string, token: string, options: Record<string, unknown> & { wait?: true; }): Promise<Message<T>>;
    async executeSlack<T extends AnyGuildTextChannel>(id: string, token: string, options: Record<string, unknown> & { wait?: boolean; }): Promise<Message<T> | void> {
        const query = new URLSearchParams();
        if (options.wait) query.set("wait", "true");
        return this.#manager.authRequest<RawMessage | null>({
            method: "POST",
            path:   Routes.WEBHOOK_PLATFORM(id, token, "slack"),
            query,
            json:   options
        }).then(res => {
            if (options.wait && res !== null) return new Message(res, this.#manager.client);
        });
    }

    /**
     * Get a webhook by ID (and optionally token).
     * @param id The ID of the webhook.
     * @param token The token of the webhook.
     */
    async get(id: string, token?: string) {
        return this.#manager.authRequest<RawWebhook>({
            method: "GET",
            path:   Routes.WEBHOOK(id, token)
        }).then(data => new Webhook(data, this.#manager.client));
    }

    /**
     * Get the webhooks in the specified channel.
     * @param channelID The ID of the channel to get the webhooks of.
     */
    async getChannel(channelID: string) {
        return this.#manager.authRequest<Array<RawWebhook>>({
            method: "GET",
            path:   Routes.CHANNEL_WEBHOOKS(channelID)
        });
    }

    /**
     * Get the webhooks in the specified guild.
     * @param guildID The ID of the guild to get the webhooks of.
     */
    async getGuild(guildID: string) {
        return this.#manager.authRequest<Array<RawWebhook>>({
            method: "GET",
            path:   Routes.GUILD_WEBHOOKS(guildID)
        });
    }

    /**
     * Get a webhook message.
     * @param id The ID of the webhook.
     * @param token The token of the webhook.
     * @param messageID The ID of the message.
     * @param threadID The ID of the thread the message is in.
     */
    async getMessage<T extends AnyGuildTextChannel>(id: string, token: string, messageID: string, threadID?: string) {
        const query = new URLSearchParams();
        if (threadID) query.set("thread_id", threadID);
        return this.#manager.authRequest<RawMessage>({
            method: "GET",
            path:   Routes.WEBHOOK_MESSAGE(id, token, messageID)
        }).then(data => new Message<T>(data, this.#manager.client));
    }
}
