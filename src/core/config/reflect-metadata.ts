/**
 * Initializes reflection metadata polyfill before any other imports.
 * Required for Typegoose decorators to work properly in Bun runtime
 * or when bundling with Bun.
 *
 * @see https://github.com/oven-sh/bun/issues/4677#issuecomment-1836928255
 */
import "reflect-metadata";
