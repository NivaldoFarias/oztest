import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

/**
 * Extends Zod with OpenAPI functionality.
 * This must be imported before any other Zod schema definitions.
 */
extendZodWithOpenApi(z);

export { z };
