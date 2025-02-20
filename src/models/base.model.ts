import { Types } from "mongoose";

import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop } from "@typegoose/typegoose";

/** Base class for all models, providing common fields */
export class Base extends TimeStamps {
	@prop({ required: true, default: () => new Types.ObjectId().toString() })
	public readonly _id!: string;
}
