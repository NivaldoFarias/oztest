import type { Ref } from "@typegoose/typegoose";

import { pre, getModelForClass, prop } from "@typegoose/typegoose";

import { GeoLibSingleton } from "@/utils/";
import { Base } from "@/models/base.model";
import type { Region } from "@/models/region.model";

/** User model representing application users with location data */
@pre<User>("save", async function (next) {
	if (this.isModified("coordinates")) {
		this.address = await GeoLibSingleton.getLocationFromCoordinates(this.coordinates);
	} else if (this.isModified("address")) {
		const { latitude: lat, longitude: lng } = await GeoLibSingleton.getLocationFromAddress(
			this.address,
		);
		this.coordinates = [lng, lat];
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
