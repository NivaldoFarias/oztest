import type { Ref } from "@typegoose/typegoose";

import { pre, getModelForClass, prop } from "@typegoose/typegoose";

import { GeoLibSingleton } from "@/utils/";
import { Base } from "@/models/base.model";
import type { Region } from "@/models/region.model";

/** User model representing application users with location data */
@pre<User>("save", async function (next) {
	if (this.isModified("coordinates")) {
		const { formatted_address } = await GeoLibSingleton.getLocationFromCoordinates(
			this.coordinates,
		);

		this.address = formatted_address;
	} else if (this.isModified("address")) {
		const { geometry } = await GeoLibSingleton.getLocationFromAddress(this.address);

		this.coordinates = [geometry.location.lng, geometry.location.lat];
	}

	next();
})
export class User extends Base {
	@prop({ required: true })
	public name!: string;

	@prop({ required: true })
	public email!: string;

	@prop({ required: true })
	public address!: string;

	@prop({ required: true, type: () => [Number] })
	public coordinates!: [number, number];

	@prop({ required: true, default: [], ref: "Region", type: () => String })
	public regions!: Ref<Region>[];
}

export const UserModel = getModelForClass(User);
