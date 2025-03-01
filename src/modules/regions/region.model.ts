import mongoose from "mongoose";
import type { Ref } from "@typegoose/typegoose";

import { pre, getModelForClass, prop, modelOptions, Severity } from "@typegoose/typegoose";

import { Base } from "@/shared/models/base.model";
import { UserModel } from "@/modules/users/user.model";

import type { User } from "@/modules/users/user.model";

/** Region model representing geographical areas owned by users */
@pre<Region>("save", async function (next) {
	if (this.isNew) {
		if (this.user instanceof mongoose.Types.ObjectId) {
			const user = await UserModel.findOne({ _id: this.user });

			if (!user) throw new Error("User not found");

			user.regions.push(this._id);
			await user.save({ session: this.$session() });
		}
	}

	next(this.validateSync());
})
@modelOptions({
	schemaOptions: { validateBeforeSave: false },
	options: { allowMixed: Severity.ALLOW },
})
export class Region extends Base {
	@prop({ required: true })
	public name!: string;

	@prop({ ref: "User", required: true })
	public user!: Ref<User>;

	@prop({ required: true, type: () => Object })
	public geometry!: {
		type: "Polygon";
		coordinates: [number, number][][];
	};
}

export const RegionModel = getModelForClass(Region);
