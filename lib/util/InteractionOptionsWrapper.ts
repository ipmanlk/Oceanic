import { ApplicationCommandOptionTypes } from "../Constants";
import type Member from "../structures/Member";
import type Role from "../structures/Role";
import type User from "../structures/User";
import type {
    AnyChannel,
    ApplicationCommandInteractionResolvedData,
    InteractionOptions,
    InteractionOptionsAttachment,
    InteractionOptionsBoolean,
    InteractionOptionsChannel,
    InteractionOptionsInteger,
    InteractionOptionsMentionable,
    InteractionOptionsNumber,
    InteractionOptionsRole,
    InteractionOptionsString,
    InteractionOptionsSubCommand,
    InteractionOptionsSubCommandGroup,
    InteractionOptionsUser,
    InteractionOptionsWithValue
} from "../types";
import type Attachment from "../structures/Attachment";

/** A wrapper for interaction options. */
export default class InteractionOptionsWrapper {
    /** The raw options from Discord.  */
    raw: Array<InteractionOptions>;
    /** Then resolved data for this options instance. */
    resolved: ApplicationCommandInteractionResolvedData | null;
    constructor(data: Array<InteractionOptions>, resolved: ApplicationCommandInteractionResolvedData | null) {
        this.raw = data;
        this.resolved = resolved;
    }

    private _getOption<T extends InteractionOptionsWithValue = InteractionOptionsWithValue>(name: string, required = false, type: ApplicationCommandOptionTypes) {
        let baseOptions: Array<InteractionOptionsWithValue> | undefined;
        const sub = this.getSubCommand(false);
        if (sub?.length === 1) baseOptions = (this.raw.find(o => o.name === sub[0] && o.type === ApplicationCommandOptionTypes.SUB_COMMAND) as InteractionOptionsSubCommand | undefined)?.options;
        else if (sub?.length === 2) baseOptions = ((this.raw.find(o => o.name === sub[0] && o.type === ApplicationCommandOptionTypes.SUB_COMMAND_GROUP) as InteractionOptionsSubCommandGroup | undefined)?.options?.find(o2 => o2.name === sub[1] && o2.type === ApplicationCommandOptionTypes.SUB_COMMAND) as InteractionOptionsSubCommand | undefined)?.options;
        const opt = (baseOptions || this.raw).find(o => o.name === name && o.type === type) as T | undefined;
        if (!opt && required) throw new Error(`Missing required option: ${name}`);
        else return opt;
    }


    /**
     * Get an attachment option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present or the attachment cannot be found.
     */
    getAttachment(name: string, required?: false): Attachment | undefined;
    getAttachment(name: string, required: true): Attachment;
    getAttachment(name: string, required?: boolean) {
        if (this.resolved === null) throw new Error("attempt to use getAttachmentValue with null resolved");
        let val: string | undefined;
        if (!(val = this.getAttachmentOption(name, required as false)?.value)) return undefined;
        const a = this.resolved.attachments.get(val);
        if (!a && required) throw new Error(`attachment not present for required option: ${name}`);
        return a;
    }

    /**
     * Get an attachment option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getAttachmentOption(name: string, required?: false): InteractionOptionsAttachment | undefined;
    getAttachmentOption(name: string, required: true): InteractionOptionsAttachment;
    getAttachmentOption(name: string, required?: boolean) {
        return this._getOption(name, required, ApplicationCommandOptionTypes.ATTACHMENT);
    }

    /**
     * Get a boolean option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getBoolean(name: string, required?: false): boolean | undefined;
    getBoolean(name: string, required: true): boolean;
    getBoolean(name: string, required?: boolean) {
        return this.getBooleanOption(name, required as false)?.value;
    }


    /**
     * Get a boolean option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getBooleanOption(name: string, required?: false): InteractionOptionsBoolean | undefined;
    getBooleanOption(name: string, required: true): InteractionOptionsBoolean;
    getBooleanOption(name: string, required?: boolean) {
        return this._getOption(name, required, ApplicationCommandOptionTypes.BOOLEAN);
    }

    /**
     * Get a channel option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present or the channel cannot be found.
     */
    getChannel<T extends AnyChannel = AnyChannel>(name: string, required?: false): T | undefined;
    getChannel<T extends AnyChannel = AnyChannel>(name: string, required: true): T;
    getChannel(name: string, required?: boolean) {
        if (this.resolved === null) throw new Error("attempt to use getChannelValue with null resolved");
        let val: string | undefined;
        if (!(val = this.getChannelOption(name, required as false)?.value)) return undefined;
        const ch = this.resolved.channels.get(val);
        if (!ch && required) throw new Error(`channel not present for required option: ${name}`);
        return ch;
    }

    /**
     * Get a channel option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getChannelOption(name: string, required?: false): InteractionOptionsChannel | undefined;
    getChannelOption(name: string, required: true): InteractionOptionsChannel;
    getChannelOption(name: string, required?: boolean) {
        return this._getOption(name, required, ApplicationCommandOptionTypes.CHANNEL);
    }

    /**
     * Get an integer option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getInteger(name: string, required?: false): number | undefined;
    getInteger(name: string, required: true): number;
    getInteger(name: string, required?: boolean) {
        return this.getIntegerOption(name, required as false)?.value;
    }

    /**
     * Get an integer option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getIntegerOption(name: string, required?: false): InteractionOptionsInteger | undefined;
    getIntegerOption(name: string, required: true): InteractionOptionsInteger;
    getIntegerOption(name: string, required?: boolean) {
        return this._getOption(name, required, ApplicationCommandOptionTypes.INTEGER);
    }

    /**
     * Get a user option value (as a member).
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present, or if the member cannot be found.
     */
    getMember(name: string, required?: false): Member | undefined;
    getMember(name: string, required: true): Member;
    getMember(name: string, required?: boolean) {
        if (this.resolved === null) throw new Error("attempt to use getMemberValue with null resolved");
        let val: string | undefined;
        if (!(val = this.getUserOption(name, required as false)?.value)) return undefined;
        const ch = this.resolved.members.get(val);
        if (!ch && required) throw new Error(`member not present for required option: ${name}`);
        return ch;
    }

    /**
     * Get a mentionable option value (channel, user, role).
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present, or if the value cannot be found.
     */
    getMentionable<T extends AnyChannel | User | Role = AnyChannel | User | Role>(name: string, required?: false): T | undefined;
    getMentionable<T extends AnyChannel | User | Role = AnyChannel | User | Role>(name: string, required: true): T;
    getMentionable(name: string, required?: boolean) {
        if (this.resolved === null) throw new Error("attempt to use getMentionableValue with null resolved");
        let val: string | undefined;
        if (!(val = (this._getOption(name, required as false, ApplicationCommandOptionTypes.MENTIONABLE) as InteractionOptionsMentionable | undefined)?.value)) return undefined;
        const ch = this.resolved.channels.get(val);
        const role = this.resolved.roles.get(val);
        const user = this.resolved.users.get(val);
        if ((!ch && !role && !user) && required) throw new Error(`value not present for required option: ${name}`);
        return ch;
    }

    /**
     * Get a mentionable option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getMentionableOption(name: string, required?: false): InteractionOptionsMentionable | undefined;
    getMentionableOption(name: string, required: true): InteractionOptionsMentionable;
    getMentionableOption(name: string, required?: boolean) {
        return this._getOption(name, required, ApplicationCommandOptionTypes.MENTIONABLE);
    }

    /**
     * Get a number option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getNumber(name: string, required?: false): number | undefined;
    getNumber(name: string, required: true): number;
    getNumber(name: string, required?: boolean) {
        return this.getNumberOption(name, required as false)?.value;
    }

    /**
     * Get a number option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getNumberOption(name: string, required?: false): InteractionOptionsNumber | undefined;
    getNumberOption(name: string, required: true): InteractionOptionsNumber;
    getNumberOption(name: string, required?: boolean) {
        return this._getOption(name, required, ApplicationCommandOptionTypes.NUMBER);
    }

    /**
     * Get a role option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present, or if the role cannot be found.
     */
    getRole(name: string, required?: false): Role | undefined;
    getRole(name: string, required: true): Role;
    getRole(name: string, required?: boolean) {
        if (this.resolved === null) throw new Error("attempt to use getRoleValue with null resolved");
        let val: string | undefined;
        if (!(val = this.getRoleOption(name, required as false)?.value)) return undefined;
        const ch = this.resolved.roles.get(val);
        if (!ch && required) throw new Error(`role not present for required option: ${name}`);
        return ch;
    }

    /**
     * Get a role option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getRoleOption(name: string, required?: false): InteractionOptionsRole | undefined;
    getRoleOption(name: string, required: true): InteractionOptionsRole;
    getRoleOption(name: string, required?: boolean) {
        return this._getOption(name, required, ApplicationCommandOptionTypes.ROLE);
    }

    /**
     * Get a string option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getString<T extends string = string>(name: string, required?: false): T | undefined;
    getString<T extends string = string>(name: string, required: true): T;
    getString(name: string, required?: boolean) {
        return this.getStringOption(name, required as false)?.value;
    }

    /**
     * Get a string option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getStringOption(name: string, required?: false): InteractionOptionsString | undefined;
    getStringOption(name: string, required: true): InteractionOptionsString;
    getStringOption(name: string, required?: boolean) {
        return this._getOption(name, required, ApplicationCommandOptionTypes.STRING);
    }

    /**
     * If present, returns the top level subcommand. This only goes one level deep, to get the subcommand of a subcommandgroup, you must call this twice in a ro.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getSubCommand(required?: false): [subcommand: string] | [subcommandGroup: string, subcommand: string] | undefined;
    getSubCommand(required: true): [subcommand: string] | [subcommandGroup: string, subcommand: string];
    getSubCommand(required?: boolean) {
        const opt = this.raw.find(o => o.type === ApplicationCommandOptionTypes.SUB_COMMAND || o.type === ApplicationCommandOptionTypes.SUB_COMMAND_GROUP) as InteractionOptionsSubCommand | InteractionOptionsSubCommandGroup;
        if (!opt?.options) {
            if (required) throw new Error("Missing required option: subcommand/subcommandgroup");
            else return undefined;
        } else {
            // nested
            if (opt.options.length === 1 && opt.type === ApplicationCommandOptionTypes.SUB_COMMAND_GROUP) {
                const sub = opt.options.find(o => o.type === ApplicationCommandOptionTypes.SUB_COMMAND) as InteractionOptionsSubCommand | undefined;
                if (!sub?.options) return [opt.name];
                else return [opt.name, sub.name];
            } else return [opt.name];
        }
    }

    /**
     * Get a user option value.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present, or if the user cannot be found.
     */
    getUser(name: string, required?: false): User | undefined;
    getUser(name: string, required: true): User;
    getUser(name: string, required?: boolean) {
        if (this.resolved === null) throw new Error("attempt to use getUserValue with null resolved");
        let val: string | undefined;
        if (!(val = this.getUserOption(name, required as false)?.value)) return undefined;
        const ch = this.resolved.users.get(val);
        if (!ch && required) throw new Error(`user not present for required option: ${name}`);
        return ch;
    }

    /**
     * Get a user option.
     * @param name The name of the option.
     * @param required If true, an error will be thrown if the option is not present.
     */
    getUserOption(name: string, required?: false): InteractionOptionsUser | undefined;
    getUserOption(name: string, required: true): InteractionOptionsUser;
    getUserOption(name: string, required?: boolean) {
        return this._getOption(name, required, ApplicationCommandOptionTypes.USER);
    }
}
