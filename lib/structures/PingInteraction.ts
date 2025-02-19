import Interaction from "./Interaction";
import type { InteractionTypes } from "../Constants";
import { InteractionResponseTypes } from "../Constants";
import type { RawPingInteraction } from "../types/interactions";
import type Client from "../Client";
import type { JSONPingInteraction } from "../types/json";

/** Represents a PING interaction. This will not be recieved over a gateway connection. */
export default class PingInteraction extends Interaction {
    declare type: InteractionTypes.PING;
    constructor(data: RawPingInteraction, client: Client) {
        super(data, client);
    }

    /**
     * Responds to the interaction with a `PONG`.
     */
    async pong() {
        return this.client.rest.interactions.createInteractionResponse(this.id, this.token, { type: InteractionResponseTypes.PONG });
    }

    toJSON(): JSONPingInteraction {
        return {
            ...super.toJSON(),
            type: this.type
        };
    }
}
