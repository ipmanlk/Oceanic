import GuildChannel from "./GuildChannel";
import PermissionOverwrite from "./PermissionOverwrite";
import PublicThreadChannel from "./PublicThreadChannel";
import type Invite from "./Invite";
import type Member from "./Member";
import Permission from "./Permission";
import type Client from "../Client";
import type {
    CreateInviteOptions,
    EditForumChannelOptions,
    EditPermissionOptions,
    ForumEmoji,
    ForumTag,
    GetArchivedThreadsOptions,
    JSONForumChannel,
    RawForumChannel,
    RawOverwrite,
    RawPublicThreadChannel,
    StartThreadInForumOptions,
    Uncached
} from "../types";
import Collection from "../util/Collection";
import type { ChannelTypes, ThreadAutoArchiveDuration } from "../Constants";
import { AllPermissions, Permissions } from "../Constants";

/** Represents a forum channel. Documentation for these is currently scarce, so they may not work entirely correctly. */
export default class ForumChannel extends GuildChannel {
    /** The usable tags for threads. */
    availableTags: Array<ForumTag>;
    /** The default auto archive duration for threads. */
    defaultAutoArchiveDuration: ThreadAutoArchiveDuration;
    /** The default reaction emoji for threads. */
    defaultReactionEmoji: ForumEmoji | null;
    /** The default amount of seconds between non-moderators sending messages in threads. */
    defaultThreadRateLimitPerUser: number;
    /** The flags for this channel, see {@link Constants.ChannelFlags}. */
    flags: number;
    /** The most recently created thread. */
    lastThread: PublicThreadChannel | Uncached | null;
    /** If this channel is age gated. */
    nsfw: boolean;
    declare parent: ForumChannel;
    declare parentID: string;
    /** The permission overwrites of this channel. */
    permissionOverwrites: Collection<string, RawOverwrite, PermissionOverwrite>;
    /** The position of this channel on the sidebar. */
    position: number;
    /** The amount of seconds between non-moderators creating threads. */
    rateLimitPerUser: number;
    /** Undocumented property. */
    template: string;
    /** The threads in this channel. */
    threads: Collection<string, RawPublicThreadChannel, PublicThreadChannel>;
    /** The `guidelines` of this forum channel. */
    topic: string | null;
    declare type: ChannelTypes.GUILD_FORUM;
    constructor(data: RawForumChannel, client: Client) {
        super(data, client);
        this.availableTags = [];
        this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
        this.defaultReactionEmoji = null;
        this.defaultThreadRateLimitPerUser = data.default_thread_rate_limit_per_user;
        this.flags = data.flags;
        this.lastThread = data.last_message_id === null ? null : { id: data.last_message_id };
        this.nsfw = data.nsfw;
        this.permissionOverwrites = new Collection(PermissionOverwrite, client);
        this.position = data.position;
        this.rateLimitPerUser = 0;
        this.template = data.template;
        this.threads = new Collection<string, RawPublicThreadChannel, PublicThreadChannel>(PublicThreadChannel, client);
        this.topic = data.topic;
        this.update(data);
    }

    protected update(data: Partial<RawForumChannel>) {
        super.update(data);
        if (data.available_tags !== undefined) this.availableTags = data.available_tags.map(tag => ({
            emoji:     tag.emoji_id === null && tag.emoji_name === null ? null : { id: tag.emoji_id, name: tag.emoji_name },
            id:        tag.id,
            moderated: tag.moderated,
            name:      tag.name
        }));
        if (data.default_auto_archive_duration !== undefined) this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
        if (data.default_reaction_emoji !== undefined) this.defaultReactionEmoji = data.default_reaction_emoji === null || (data.default_reaction_emoji.emoji_id === null && data.default_reaction_emoji.emoji_name === null) ? null : { id: data.default_reaction_emoji.emoji_id, name: data.default_reaction_emoji.emoji_name };
        if (data.default_thread_rate_limit_per_user !== undefined) this.defaultThreadRateLimitPerUser = data.default_thread_rate_limit_per_user;
        if (data.flags !== undefined) this.flags = data.flags;
        if (data.last_message_id !== undefined) {
            this.lastThread = this.threads.get(data.last_message_id!) || { id: data.last_message_id! };
        }
        if (data.nsfw !== undefined) this.nsfw = data.nsfw;
        if (data.permission_overwrites !== undefined) {
            for (const id of this.permissionOverwrites.keys()) {
                if (!data.permission_overwrites!.some(overwrite => overwrite.id === id)) this.permissionOverwrites.delete(id);
            }
            for (const overwrite of data.permission_overwrites) this.permissionOverwrites.update(overwrite);
        }
        if (data.position !== undefined) this.position = data.position;
        if (data.rate_limit_per_user !== undefined) this.rateLimitPerUser = data.rate_limit_per_user;
        if (data.template !== undefined) this.template = data.template;
        if (data.topic !== undefined && data.topic !== null) this.topic = data.topic;
    }

    /**
     * Create an invite for this channel.
     * @param options The options for the invite.
     */
    async createInvite(options: CreateInviteOptions): Promise<Invite<"withMetadata", this>> {
        return this.client.rest.channels.createInvite<"withMetadata", this>(this.id, options);
    }

    /**
     * Delete a permission overwrite on this channel.
     * @param overwriteID The ID of the permission overwrite to delete.
     * @param reason The reason for deleting the permission overwrite.
     */
    async deletePermission(overwriteID: string, reason?: string) {
        return this.client.rest.channels.deletePermission(this.id, overwriteID, reason);
    }

    /**
     * Edit this channel.
     * @param options The options for editing the channel
     */
    override async edit(options: EditForumChannelOptions) {
        return this.client.rest.channels.edit<this>(this.id, options);
    }

    /**
     * Edit a permission overwrite on this channel.
     * @param overwriteID The ID of the permission overwrite to edit.
     * @param options The options for editing the permission overwrite.
     */
    async editPermission(overwriteID: string, options: EditPermissionOptions) {
        return this.client.rest.channels.editPermission(this.id, overwriteID, options);
    }

    /**
     * Get the invites of this channel.
     */
    async getInvites(): Promise<Array<Invite<"withMetadata", this>>> {
        return this.client.rest.channels.getInvites<this>(this.id);
    }

    /**
     * Get the public archived threads in this channel.
     * @param options The options for getting the public archived threads.
     */
    async getPublicArchivedThreads(options?: GetArchivedThreadsOptions) {
        return this.client.rest.channels.getPublicArchivedThreads<PublicThreadChannel>(this.id, options);
    }

    /**
     * Get the permissions of a member.  If providing an id, the member must be cached.
     * @param member The member to get the permissions of.
     */
    permissionsOf(member: string | Member) {
        if (typeof member === "string") member = this.guild.members.get(member)!;
        if (!member) throw new Error("Member not found");
        let permission = this.guild.permissionsOf(member).allow;
        if (permission & Permissions.ADMINISTRATOR) return new Permission(AllPermissions);
        let overwrite = this.permissionOverwrites.get(this.guildID);
        if (overwrite) permission = (permission & ~overwrite.deny) | overwrite.allow;
        let deny = 0n;
        let allow = 0n;
        for (const id of member.roles) {
            if ((overwrite = this.permissionOverwrites.get(id))) {
                deny |= overwrite.deny;
                allow |= overwrite.allow;
            }
        }
        permission = (permission & ~deny) | allow;
        overwrite = this.permissionOverwrites.get(member.id);
        if (overwrite) permission = (permission & ~overwrite.deny) | overwrite.allow;
        return new Permission(permission);
    }


    /**
     * Create a thread in a forum channel.
     * @param options The options for starting the thread.
     */
    async startThread(options: StartThreadInForumOptions) {
        return this.client.rest.channels.startThreadInForum(this.id, options);
    }

    toJSON(): JSONForumChannel {
        return {
            ...super.toJSON(),
            availableTags:                 this.availableTags,
            defaultAutoArchiveDuration:    this.defaultAutoArchiveDuration,
            defaultReactionEmoji:          this.defaultReactionEmoji,
            defaultThreadRateLimitPerUser: this.defaultThreadRateLimitPerUser,
            flags:                         this.flags,
            lastThread:                    this.lastThread === null ? null : this.lastThread.id,
            permissionOverwrites:          this.permissionOverwrites.map(overwrite => overwrite.toJSON()),
            position:                      this.position,
            rateLimitPerUser:              this.rateLimitPerUser,
            template:                      this.template,
            threads:                       this.threads.map(thread => thread.id),
            topic:                         this.topic
        };
    }
}
