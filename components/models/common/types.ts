export type Settings = Record<string, string|number|boolean>;

export type InputParams = Record<string, string|number|boolean>;

export interface InteractProps {
  settings: Settings;
  params: InputParams;
  runPipe: (...args: any[]) => Promise<any>;
}
