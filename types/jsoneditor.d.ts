declare module 'jsoneditor' {
  export type JSONEditorMode = 'tree' | 'view' | 'form' | 'code' | 'text';

  export interface JSONEditorOptions {
    mode?: JSONEditorMode;
    modes?: JSONEditorMode[];
    name?: string;
    schema?: object;
    schemaRefs?: object;
    search?: boolean;
    history?: boolean;
    navigationBar?: boolean;
    statusBar?: boolean;
    mainMenuBar?: boolean;
    onChange?: () => void;
    onChangeJSON?: (json: any) => void;
    onChangeText?: (jsonString: string) => void;
    onError?: (error: Error) => void;
    onModeChange?: (newMode: JSONEditorMode, oldMode: JSONEditorMode) => void;
    onEditable?: (node: {
      field: string;
      value: string;
      path: string[];
    }) => boolean | { field: boolean; value: boolean };
    escapeUnicode?: boolean;
    sortObjectKeys?: boolean;
    limitDragging?: boolean;
    indentation?: number;
    theme?: string;
    templates?: any[];
    ajv?: any;
    colorPicker?: boolean;
    languages?: object;
    timestampTag?: boolean;
    createQuery?: (json: any) => string;
    executeQuery?: (json: any, query: string) => any;
    queryDescription?: string;
    ace?: object;
  }

  export default class JSONEditor {
    constructor(container: HTMLElement, options?: JSONEditorOptions, json?: object);

    set(json: any): void;
    get(): any;
    update(json: any): void;
    updateText(jsonString: string): void;
    setText(jsonString: string): void;
    getText(): string;
    setMode(mode: JSONEditorMode): void;
    getMode(): JSONEditorMode;
    setName(name: string): void;
    getName(): string;
    setSchema(schema: object, schemaRefs?: object): void;
    getSchema(): object;
    validate(): object[];
    destroy(): void;
    expandAll(): void;
    collapseAll(): void;
    focus(): void;
    setSelection(selection: { path: string[]; start: boolean; end: boolean }): void;
    getSelection(): { path: string[]; start: boolean; end: boolean };
    getNodesByRange(start: { path: string[] }, end: { path: string[] }): any[];
    refresh(): void;
  }
}

declare module 'jsoneditor/dist/jsoneditor.css';
