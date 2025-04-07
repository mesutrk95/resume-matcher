declare module 'mjml' {
  interface MjmlOptions {
    fonts?: Record<string, string>;
    keepComments?: boolean;
    beautify?: boolean;
    minify?: boolean;
    validationLevel?: 'strict' | 'soft' | 'skip';
    filePath?: string;
  }

  interface MjmlResult {
    html: string;
    errors: Array<{
      line: number;
      message: string;
      tagName: string;
      formattedMessage: string;
    }>;
  }

  function mjml2html(mjml: string, options?: MjmlOptions): MjmlResult;

  export = mjml2html;
}
