import type { Ref, DocumentType } from "@typegoose/typegoose";

import { pre, getModelForClass, prop, modelOptions } from "@typegoose/typegoose";

import { GeoCoding } from "@/core/utils";
import { Base } from "@/shared/models/base.model";
import type { Region } from "@/modules/regions/region.model";
import { ApiKeyUtil } from "@/core/utils/api-key.util";

/** User model representing application users with location data */
@pre<User>("save", async function (next) {
	if (this.isModified("coordinates")) {
		const { formatted_address } = await GeoCoding.getLocationFromCoordinates(this.coordinates);

		this.address = formatted_address;
	} else if (this.isModified("address")) {
		const { geometry } = await GeoCoding.getLocationFromAddress(this.address);

		this.coordinates = [geometry.location.lng, geometry.location.lat];
	}

	next();
})
@modelOptions({ schemaOptions: { timestamps: true } })
export class User extends Base {
	@prop({ required: true })
	public name!: string;

	@prop({ required: true })
	public email!: string;

	@prop({ required: true })
	public address!: string;

	@prop({ required: true, type: () => [Number] })
	public coordinates!: [number, number];

	@prop({ required: true, default: [], ref: "Region" })
	public regions!: Ref<Region>[];

	@prop({ required: true })
	public apiKeyHash!: string;

	/**
	 * Verifies if a provided API key matches this user's stored hash
	 * Uses cryptographically secure comparison to prevent timing attacks
	 *
	 * @param apiKey - The API key to verify against this user
	 * @returns Boolean indicating if the key is valid
	 *
	 * @example
	 * ```typescript
	 * const user = await UserModel.findById(id);
	 * const isValidKey = user.verifyApiKey(requestApiKey);
	 * ```
	 */
	public verifyApiKey(this: DocumentType<User>, apiKey: string): boolean {
		return ApiKeyUtil.verify(apiKey, this.apiKeyHash);
	}
}

export const UserModel = getModelForClass(User);
