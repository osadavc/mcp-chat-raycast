import { z, ZodSchema } from "zod";

/**
 * Converts a JSON schema object to a Zod schema
 *
 * Handles:
 * - Basic types (string, number, boolean, array, object)
 * - Required fields
 * - Default values
 * - Descriptions
 */
export const createZodSchemaFromJsonSchema = (schema: any): ZodSchema => {
  if (!schema || typeof schema !== "object") {
    return z.any();
  }

  // Handle primitive types directly
  if (schema.type && !schema.properties) {
    return createZodPrimitiveType(schema);
  }

  if (!schema.properties) {
    return z.object({});
  }

  const zodProperties: Record<string, ZodSchema> = {};
  const requiredFields = schema.required || [];

  for (const [key, prop] of Object.entries<any>(schema.properties)) {
    let zodProp = createZodPrimitiveType(prop);

    // Make non-required fields optional
    if (!requiredFields.includes(key)) {
      zodProp = zodProp.optional();
    }

    zodProperties[key] = zodProp;
  }

  return z.object(zodProperties);
};

/**
 * Creates a Zod schema for a primitive JSON schema type
 */
const createZodPrimitiveType = (prop: any): ZodSchema => {
  if (!prop || typeof prop !== "object") {
    return z.any();
  }

  let zodProp: ZodSchema;

  switch (prop.type) {
    case "string":
      zodProp = z.string();
      break;
    case "number":
    case "integer":
      zodProp = z.number();
      break;
    case "boolean":
      zodProp = z.boolean();
      break;
    case "array":
      if (prop.items) {
        zodProp = z.array(createZodSchemaFromJsonSchema(prop.items));
      } else {
        zodProp = z.array(z.any());
      }
      break;
    case "object":
      zodProp = createZodSchemaFromJsonSchema(prop);
      break;
    default:
      zodProp = z.any();
  }

  // Add description if available
  if (prop.description) {
    zodProp = zodProp.describe(prop.description);
  }

  // Add default value if available
  if (prop.default !== undefined) {
    zodProp = zodProp.default(prop.default);
  }

  return zodProp;
};
