import RequestHandler from "./RequestHandler";
import type Client from "../Client";
import Channels from "../routes/Channels";
import Guilds from "../routes/Guilds";
import Users from "../routes/Users";
import OAuth from "../routes/OAuth";
import Webhooks from "../routes/Webhooks";
import type { RESTOptions } from "../types/client";
import type { RequestOptions } from "../types/request-handler";
import ApplicationCommands from "../routes/ApplicationCommands";
import Interactions from "../routes/Interactions";
import * as Routes from "../util/Routes";
import type { GetBotGatewayResponse, GetGatewayResponse, RawGetBotGatewayResponse } from "../types/gateway";

export default class RESTManager {
    applicationCommands: ApplicationCommands;
    channels: Channels;
    #client: Client;
    guilds: Guilds;
    #handler: RequestHandler;
    interactions: Interactions;
    oauth: OAuth;
    users: Users;
    webhooks: Webhooks;
    constructor(client: Client, options?: RESTOptions) {
        this.applicationCommands = new ApplicationCommands(this);
        this.channels = new Channels(this);
        this.#client = client;
        this.guilds = new Guilds(this);
        this.#handler = new RequestHandler(this, options);
        this.interactions = new Interactions(this);
        this.oauth = new OAuth(this);
        this.users = new Users(this);
        this.webhooks = new Webhooks(this);
    }

    get client() { return this.#client; }
    get options() { return this.#handler.options; }

    /** Alias for {@link rest/RequestHandler~RequestHandler#authRequest | RequestHandler#authRequest} */
    async authRequest<T = unknown>(options: Omit<RequestOptions, "auth">) {
        return this.#handler.authRequest<T>(options);
    }

    /**
     * Get the gateway information related to your bot client.
     */
    async getBotGateway() {
        return this.authRequest<RawGetBotGatewayResponse>({
            method: "GET",
            path:   Routes.GATEWAY_BOT
        }).then(data => ({
            url:               data.url,
            maxConcurrency:    data.max_concurrency,
            shards:            data.shards,
            sessionStartLimit: {
                total:          data.session_start_limit.total,
                remaining:      data.session_start_limit.remaining,
                resetAfter:     data.session_start_limit.reset_after,
                maxConcurrency: data.session_start_limit.max_concurrency
            }
        }) as GetBotGatewayResponse);
    }

    /**
     * Get the gateway information.
     */
    async getGateway() {
        return this.request<GetGatewayResponse>({
            method: "GET",
            path:   Routes.GATEWAY
        });
    }

    /** Alias for {@link rest/RequestHandler~RequestHandler#request | RequestHandler#request} */
    async request<T = unknown>(options: RequestOptions) {
        return this.#handler.request<T>(options);
    }
}
