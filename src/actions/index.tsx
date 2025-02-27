import { Action, Alert, confirmAlert, Icon, Image, Keyboard } from "@raycast/api";

export const PrimaryAction = ({ title, onAction }: { title: string; onAction: () => void }) => (
  <Action title={title} icon={Icon.ArrowRight} onAction={onAction} />
);
