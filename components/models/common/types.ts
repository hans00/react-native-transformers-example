export type Settings = Record<string, string|number|boolean>;

export interface InteractProps {
  settings: Settings;
  params: object;
  runPipe: (...args: any[]) => Promise<any>;
}
