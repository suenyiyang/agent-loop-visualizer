import { SystemPromptEditor } from './SystemPromptEditor';
import { ToolDefinitionList } from './ToolDefinitionList';
import { ConnectorSettingsInline } from '../TopBar/ConnectorSettingsForm';
import { ExportImportButtons } from '../TopBar/ExportImportButtons';
import { ResetSection } from './ResetSection';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-primary)] pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <Section title="System Prompt Templates">
          <SystemPromptEditor />
        </Section>

        <Section title="Tool Definitions">
          <ToolDefinitionList />
        </Section>

        <Section title="LLM Connector">
          <ConnectorSettingsInline />
        </Section>

        <Section title="Data Export / Import">
          <ExportImportButtons />
        </Section>

        <Section title="Reset">
          <ResetSection />
        </Section>
      </div>
    </div>
  );
}
