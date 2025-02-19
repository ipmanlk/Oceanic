import type User from "./User";
import Team from "./Team";
import ClientApplication from "./ClientApplication";
import type Guild from "./Guild";
import type Client from "../Client";
import type { InstallParams, RESTApplication } from "../types/oauth";
import type { ImageFormat } from "../Constants";
import * as Routes from "../util/Routes";
import type { JSONApplication } from "../types/json";

/** Represents an oauth application. */
export default class Application extends ClientApplication {
    /** When false, only the application's owners can invite the bot to guilds. */
    botPublic: boolean;
    /** When true, the applications bot will only join upon the completion of the full oauth2 code grant flow. */
    botRequireCodeGrant: boolean;
    /** This application's rich presence invite cover image hash, if any. */
    coverImage: string | null;
    /** This application's default custom authorization link, if any. */
    customInstallURL?: string;
    /** The description of the application. */
    description: string;
    /** If this application is a game sold on Discord, the guild to which it has been linked.*/
    guild?: Guild;
    /** The ID of the guild associated with this application, if any. */
    guildID?: string;
    /** The icon hash of the application. */
    icon: string | null;
    /** Settings for this application's in-app authorization link, if enabled. */
    installParams?: InstallParams;
    /** The name of the application. */
    name: string;
    /** The owner of this application. */
    owner: User;
    /** If this application is a game sold on Discord, the id of the Game's SKU. */
    primarySKUID?: string;
    /** A url to this application's privacy policy. */
    privacyPolicyURL?: string;
    /** A list of rpc origin urls, if rpc is enabled. */
    rpcOrigins: Array<string>;
    /** If this application is a game sold on Discord, the slug that links to its store page. */
    slug?: string;
    /** The tags for this application. */
    tags?: Array<string>;
    /** The team that owns this application, if any. */
    team: Team | null;
    /** A url to this application's terms of service. */
    termsOfServiceURL?: string;
    /** The bot's hex encoded public key. */
    verifyKey: string;
    constructor(data: RESTApplication, client: Client) {
        super(data, client);
        this.botPublic = !!data.bot_public;
        this.botRequireCodeGrant = !!data.bot_require_code_grant;
        this.coverImage = null;
        this.description = data.description;
        this.icon = null;
        this.name = data.name;
        this.owner = client.users.update(data.owner);
        this.rpcOrigins = [];
        this.team = null;
        this.verifyKey = data.verify_key;
        this.update(data);
    }

    protected update(data: Partial<RESTApplication>) {
        super.update(data);
        if (data.bot_public !== undefined) this.botPublic = data.bot_public;
        if (data.bot_require_code_grant !== undefined) this.botRequireCodeGrant = data.bot_require_code_grant;
        if (data.cover_image !== undefined) this.coverImage = data.cover_image;
        if (data.custom_install_url !== undefined) this.customInstallURL = data.custom_install_url;
        if (data.description !== undefined) this.description = data.description;
        if (data.guild_id !== undefined) {
            this.guild = this.client.guilds.get(data.guild_id);
            this.guildID = data.guild_id;
        }
        if (data.icon !== undefined) this.icon = data.icon;
        if (data.install_params !== undefined) this.installParams = data.install_params;
        if (data.name !== undefined) this.name = data.name;
        if (data.owner !== undefined) this.owner = this.client.users.update(data.owner);
        if (data.primary_sku_id !== undefined) this.primarySKUID = data.primary_sku_id;
        if (data.privacy_policy_url !== undefined) this.privacyPolicyURL = data.privacy_policy_url;
        if (data.rpc_origins !== undefined) this.rpcOrigins = data.rpc_origins;
        if (data.slug !== undefined) this.slug = data.slug;
        if (data.tags !== undefined) this.tags = data.tags;
        if (data.team !== undefined) this.team = data.team ? new Team(data.team, this.client) : null;
        if (data.terms_of_service_url !== undefined) this.termsOfServiceURL = data.terms_of_service_url;
        if (data.verify_key !== undefined) this.verifyKey = data.verify_key;
    }

    /**
     * The url of this application's cover image.
     * @param format The format the url should be.
     * @param size The dimensions of the image.
     */
    coverImageURL(format?: ImageFormat, size?: number) {
        return this.coverImage === null ? null : this.client.util.formatImage(Routes.APPLICATION_COVER(this.id, this.coverImage), format, size);
    }

    override toJSON(): JSONApplication {
        return {
            ...super.toJSON(),
            botPublic:           this.botPublic,
            botRequireCodeGrant: this.botRequireCodeGrant,
            coverImage:          this.coverImage,
            customInstallURL:    this.customInstallURL,
            description:         this.description,
            guild:               this.guild?.id,
            icon:                this.icon,
            installParams:       this.installParams,
            name:                this.name,
            owner:               this.owner.id,
            primarySKUID:        this.primarySKUID,
            privacyPolicyURL:    this.privacyPolicyURL,
            rpcOrigins:          this.rpcOrigins,
            slug:                this.slug,
            tags:                this.tags,
            team:                this.team?.toJSON() || null,
            termsOfServiceURL:   this.termsOfServiceURL,
            verifyKey:           this.verifyKey
        };
    }
}
