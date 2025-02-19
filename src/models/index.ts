import "reflect-metadata";

import { Types } from "mongoose";
import type { Ref } from "@typegoose/typegoose";

import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { pre, getModelForClass, prop, modelOptions } from "@typegoose/typegoose";

import GeoLib from "@/utils/geo.util";

/** Base class for all models, providing common fields */
class Base extends TimeStamps {
	@prop({ required: true, default: () => new Types.ObjectId().toString() })
	public readonly _id!: string;
}

/** User model representing application users with location data */
@pre<User>("save", async function (next) {
	if (this.isModified("coordinates")) {
		this.address = await GeoLib.getAddressFromCoordinates(this.coordinates);
	} else if (this.isModified("address")) {
		const { lat, lng } = await GeoLib.getCoordinatesFromAddress(this.address);
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

	@prop({ required: true, default: [], ref: () => Region, type: () => String })
	public regions!: Ref<Region>[];
}

/** Region model representing geographical areas owned by users */
@pre<Region>("save", async function (next) {
	if (!this._id) {
		this._id = new Types.ObjectId().toString();
	}

	if (this.isNew) {
		const user = await UserModel.findOne({ _id: this.user });
		if (!user) {
			throw new Error("User not found");
		}
		user.regions.push(this._id);
		await user.save({ session: this.$session() });
	}

	next(this.validateSync());
})
@modelOptions({ schemaOptions: { validateBeforeSave: false } })
export class Region extends Base {
	@prop({ required: true })
	public name!: string;

	@prop({ ref: () => User, required: true, type: () => String })
	public user!: Ref<User>;

	@prop({ required: true, type: () => Object })
	public geometry!: {
		type: "Polygon";
		coordinates: [number, number][][];
	};
}

export const UserModel = getModelForClass(User);
export const RegionModel = getModelForClass(Region);
