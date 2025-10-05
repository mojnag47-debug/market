declare module 'resend' {
  export interface ResendMessage {
    id?: string;
    to?: Array<{ email?: string }>;
    html?: string;
    subject?: string;
  }

  export type SendResponse = { id: string };

  export default class Resend {
    constructor(apiKey: string);
    emails: {
      send(opts: { from: string; to: string | string[]; subject: string; html?: string }): Promise<SendResponse>;
      list(opts?: { to?: string; limit?: number }): Promise<ResendMessage[]>;
    };
  }
}
