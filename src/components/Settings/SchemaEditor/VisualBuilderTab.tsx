import { useMemo } from 'react';
import {
  jsonSchemaToVisualModel,
  visualModelToJsonSchema,
  type SchemaProperty,
  type VisualSchemaModel,
} from '../../../utils/zod-schema-parser';

interface Props {
  parametersJson: string;
  onUpdate: (json: string) => void;
}

const TYPES: SchemaProperty['type'][] = ['string', 'number', 'boolean', 'array', 'object'];

export function VisualBuilderTab({ parametersJson, onUpdate }: Props) {
  const model = useMemo(() => jsonSchemaToVisualModel(parametersJson), [parametersJson]);

  const updateModel = (newModel: VisualSchemaModel) => {
    onUpdate(visualModelToJsonSchema(newModel));
  };

  const addProperty = () => {
    updateModel({
      properties: [
        ...model.properties,
        { name: '', type: 'string', required: false },
      ],
    });
  };

  const updateProperty = (index: number, updates: Partial<SchemaProperty>) => {
    const newProps = model.properties.map((p, i) =>
      i === index ? { ...p, ...updates } : p,
    );
    updateModel({ properties: newProps });
  };

  const removeProperty = (index: number) => {
    updateModel({ properties: model.properties.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-2">
      {model.properties.map((prop, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            value={prop.name}
            onChange={(e) => updateProperty(index, { name: e.target.value })}
            placeholder="name"
            className="flex-1 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded px-2 py-1 text-xs text-[var(--text-primary)] font-mono"
          />
          <select
            value={prop.type}
            onChange={(e) => updateProperty(index, { type: e.target.value as SchemaProperty['type'] })}
            className="bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            type="text"
            value={prop.description ?? ''}
            onChange={(e) => updateProperty(index, { description: e.target.value || undefined })}
            placeholder="description"
            className="flex-1 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
          />
          <label className="flex items-center gap-1 text-xs text-[var(--text-muted)] whitespace-nowrap">
            <input
              type="checkbox"
              checked={prop.required}
              onChange={(e) => updateProperty(index, { required: e.target.checked })}
              className="rounded"
            />
            req
          </label>
          <button
            onClick={() => removeProperty(index)}
            className="text-[var(--text-muted)] hover:text-red-400 text-xs px-1"
          >
            x
          </button>
        </div>
      ))}
      <button
        onClick={addProperty}
        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        + Add Property
      </button>
    </div>
  );
}
