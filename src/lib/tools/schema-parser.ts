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
    case "string": {
      let stringProp = z.string();

      if (prop.maxLength !== undefined) {
        stringProp = stringProp.max(prop.maxLength);
      }
      if (prop.minLength !== undefined) {
        stringProp = stringProp.min(prop.minLength);
      }
      if (prop.pattern !== undefined) {
        stringProp = stringProp.regex(new RegExp(prop.pattern));
      }
      if (prop.format === "email") {
        stringProp = stringProp.email();
      }
      if (prop.format === "url") {
        stringProp = stringProp.url();
      }

      if (prop.enum !== undefined) {
        zodProp = z.enum(prop.enum as [string, ...string[]]);
      } else {
        zodProp = stringProp;
      }
      break;
    }

    case "number":
    case "integer": {
      let numberProp = prop.type === "integer" ? z.number().int() : z.number();

      if (prop.minimum !== undefined) {
        numberProp = numberProp.min(prop.minimum);
      }
      if (prop.maximum !== undefined) {
        numberProp = numberProp.max(prop.maximum);
      }
      if (prop.exclusiveMinimum !== undefined) {
        numberProp = numberProp.gt(prop.exclusiveMinimum);
      }
      if (prop.exclusiveMaximum !== undefined) {
        numberProp = numberProp.lt(prop.exclusiveMaximum);
      }
      if (prop.multipleOf !== undefined) {
        numberProp = numberProp.multipleOf(prop.multipleOf);
      }

      zodProp = numberProp;
      break;
    }

    case "boolean": {
      zodProp = z.boolean();
      break;
    }

    case "array": {
      let arraySchema;

      if (prop.items) {
        arraySchema = z.array(createZodSchemaFromJsonSchema(prop.items));

        if (prop.minItems !== undefined) {
          arraySchema = arraySchema.min(prop.minItems);
        }
        if (prop.maxItems !== undefined) {
          arraySchema = arraySchema.max(prop.maxItems);
        }
      } else {
        arraySchema = z.array(z.any());
      }

      zodProp = arraySchema;
      break;
    }

    case "object": {
      zodProp = createZodSchemaFromJsonSchema(prop);
      break;
    }

    default:
      zodProp = z.any();
  }

  if (prop.description) {
    zodProp = zodProp.describe(prop.description);
  }

  if (prop.default !== undefined) {
    zodProp = zodProp.default(prop.default);
  }

  return zodProp;
};
