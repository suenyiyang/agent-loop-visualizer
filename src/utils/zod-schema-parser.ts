import { z } from 'zod';

export interface SchemaProperty {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  required: boolean;
  items?: SchemaProperty;
  properties?: SchemaProperty[];
}

export interface VisualSchemaModel {
  properties: SchemaProperty[];
}

export function parseZodToJsonSchema(code: string): { jsonSchema: string; error?: string } {
  try {
    const factory = new Function('z', 'return (' + code + ')');
    const schema = factory(z);
    if (!schema || typeof schema !== 'object' || typeof schema.toJSONSchema !== 'function') {
      return { jsonSchema: '', error: 'Expression must return a Zod schema' };
    }
    // Use zod v4's built-in toJSONSchema()
    const jsonSchema = schema.toJSONSchema();
    // Remove $schema and additionalProperties to keep it clean for OpenAI tool format
    delete jsonSchema.$schema;
    delete jsonSchema.additionalProperties;
    return { jsonSchema: JSON.stringify(jsonSchema, null, 2) };
  } catch (err) {
    return { jsonSchema: '', error: (err as Error).message };
  }
}

export function jsonSchemaToVisualModel(json: string): VisualSchemaModel {
  if (!json.trim()) return { properties: [] };
  try {
    const schema = JSON.parse(json);
    const required: string[] = schema.required ?? [];
    const props = schema.properties ?? {};
    const result: SchemaProperty[] = [];

    for (const [name, def] of Object.entries(props)) {
      result.push(parsePropertyDef(name, def as Record<string, unknown>, required.includes(name)));
    }

    return { properties: result };
  } catch {
    return { properties: [] };
  }
}

function parsePropertyDef(name: string, def: Record<string, unknown>, isRequired: boolean): SchemaProperty {
  const type = (def.type as string) ?? 'string';
  const prop: SchemaProperty = {
    name,
    type: type as SchemaProperty['type'],
    description: def.description as string | undefined,
    required: isRequired,
  };

  if (type === 'array' && def.items) {
    prop.items = parsePropertyDef('items', def.items as Record<string, unknown>, false);
  }

  if (type === 'object' && def.properties) {
    const nestedRequired: string[] = (def.required as string[]) ?? [];
    const nestedProps = def.properties as Record<string, Record<string, unknown>>;
    prop.properties = Object.entries(nestedProps).map(([n, d]) =>
      parsePropertyDef(n, d, nestedRequired.includes(n)),
    );
  }

  return prop;
}

export function jsonSchemaToZodCode(json: string): string {
  if (!json.trim()) return '';
  try {
    const schema = JSON.parse(json);
    if (schema.type !== 'object' || !schema.properties) return '';
    return `z.object({\n${buildZodProperties(schema.properties, schema.required ?? [])}\n})`;
  } catch {
    return '';
  }
}

function buildZodProperties(
  properties: Record<string, Record<string, unknown>>,
  required: string[],
  indent = '  ',
): string {
  return Object.entries(properties)
    .map(([name, def]) => {
      let expr = buildZodType(def, indent);
      if (def.description) {
        expr += `.describe(${JSON.stringify(def.description)})`;
      }
      if (!required.includes(name)) {
        expr += '.optional()';
      }
      return `${indent}${name}: ${expr},`;
    })
    .join('\n');
}

function buildZodType(def: Record<string, unknown>, indent: string): string {
  const type = (def.type as string) ?? 'string';
  switch (type) {
    case 'string':
      return 'z.string()';
    case 'number':
      return 'z.number()';
    case 'boolean':
      return 'z.boolean()';
    case 'array': {
      const items = (def.items as Record<string, unknown>) ?? {};
      return `z.array(${buildZodType(items, indent)})`;
    }
    case 'object': {
      const props = (def.properties as Record<string, Record<string, unknown>>) ?? {};
      const req = (def.required as string[]) ?? [];
      const inner = buildZodProperties(props, req, indent + '  ');
      return `z.object({\n${inner}\n${indent}})`;
    }
    default:
      return 'z.string()';
  }
}

export function visualModelToJsonSchema(model: VisualSchemaModel): string {
  if (model.properties.length === 0) return '';

  const schema: Record<string, unknown> = {
    type: 'object',
    properties: {} as Record<string, unknown>,
    required: [] as string[],
  };

  for (const prop of model.properties) {
    (schema.properties as Record<string, unknown>)[prop.name] = buildPropertyDef(prop);
    if (prop.required) {
      (schema.required as string[]).push(prop.name);
    }
  }

  if ((schema.required as string[]).length === 0) {
    delete schema.required;
  }

  return JSON.stringify(schema, null, 2);
}

function buildPropertyDef(prop: SchemaProperty): Record<string, unknown> {
  const def: Record<string, unknown> = { type: prop.type };

  if (prop.description) {
    def.description = prop.description;
  }

  if (prop.type === 'array' && prop.items) {
    def.items = buildPropertyDef(prop.items);
  }

  if (prop.type === 'object' && prop.properties) {
    def.properties = {} as Record<string, unknown>;
    const required: string[] = [];
    for (const p of prop.properties) {
      (def.properties as Record<string, unknown>)[p.name] = buildPropertyDef(p);
      if (p.required) required.push(p.name);
    }
    if (required.length > 0) def.required = required;
  }

  return def;
}
