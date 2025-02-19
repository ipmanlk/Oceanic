import type Guild from "./Guild";
import type User from "./User";
import type Client from "../Client";
import type { CreateGuildFromTemplateOptions, EditGuildTemplateOptions, RawGuildTemplate } from "../types/guild-template";
import type { RawGuild } from "../types/guilds";
import type { JSONGuildTemplate } from "../types/json";

export default class GuildTemplate {
    client: Client;
    /** The code of the template. */
    code: string;
    /** When this template was created. */
    createdAt: Date;
    /** The creator of this template. */
    creator: User;
    /** The description of this template. */
    description: string | null;
    /** If this template has unsynced changes. */
    isDirty: boolean | null;
    /** The name of this template. */
    name: string;
    /** A snapshot of the guild. */
    serializedSourceGuild: Partial<RawGuild>;
    /** The source guild of this template. */
    sourceGuild: Guild;
    /** The ID of the source guild of this template. */
    sourceGuildID: string;
    /** When this template was last updated. */
    updatedAt: Date;
    /** The amount of times this template has been used. */
    usageCount: number;
    constructor(data: RawGuildTemplate, client: Client) {
        this.client = client;
        this.code = data.code;
        this.createdAt = new Date(data.created_at);
        this.creator = this.client.users.update(data.creator);
        this.description = null;
        this.isDirty = null;
        this.name = data.name;
        this.serializedSourceGuild = data.serialized_source_guild;
        this.sourceGuild = this.client.guilds.get(data.source_guild_id)!;
        this.sourceGuildID = data.source_guild_id;
        this.updatedAt = new Date(data.updated_at);
        this.usageCount = data.usage_count;
        this.update(data);
    }

    protected update(data: Partial<RawGuildTemplate>) {
        if (data.description !== undefined) this.description = data.description;
        if (data.is_dirty !== undefined) this.isDirty = data.is_dirty;
        if (data.name !== undefined) this.name = data.name;
        if (data.serialized_source_guild !== undefined) this.serializedSourceGuild = data.serialized_source_guild;
        if (data.source_guild_id !== undefined) {
            this.sourceGuild = this.client.guilds.get(data.source_guild_id)!;
            this.sourceGuildID = data.source_guild_id;
        }
        if (data.updated_at !== undefined) this.updatedAt = new Date(data.updated_at);
        if (data.usage_count !== undefined) this.usageCount = data.usage_count;
    }

    /**
     * Create a guild from this template. This can only be used by bots in less than 10 guilds.
     * @param options The options for creating the guild.
     */
    async createGuild(options: CreateGuildFromTemplateOptions) {
        return this.client.rest.guilds.createFromTemplate(this.code, options);
    }

    /**
     * Delete this template.
     */
    async delete() {
        return this.client.rest.guilds.deleteTemplate(this.sourceGuild.id, this.code);
    }

    /**
     * Edit this template.
     * @param options The options for editing the template.
     */
    async editTemplate(options: EditGuildTemplateOptions) {
        return this.client.rest.guilds.editTemplate(this.sourceGuild.id, this.code, options);
    }

    /**
     * Sync this template.
     */
    async syncTemplate() {
        return this.client.rest.guilds.syncTemplate(this.sourceGuild.id, this.code);
    }

    toJSON(): JSONGuildTemplate {
        return {
            code:                  this.code,
            createdAt:             this.createdAt.getTime(),
            creator:               this.creator.toJSON(),
            description:           this.description,
            isDirty:               this.isDirty,
            name:                  this.name,
            serializedSourceGuild: this.serializedSourceGuild,
            sourceGuild:           this.sourceGuild.id,
            updatedAt:             this.updatedAt.getTime(),
            usageCount:            this.usageCount
        };
    }
}
