import type { Serializable } from "playwright-core/types/structs";
import type { ReadStream } from "fs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CaseConf = Record<string, any>;

export type Config = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    suiteConf: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    caseConf: Record<string, any>;
    caseName: string;
    directory?: string;
    fileName?: string;
  };

  export type TestConfig = {
    user_id: number;
    shop_id: number;
    shop_name: string;
    username: string;
    password: string;
    device: string;
  };

  export type FixtureApiRequestOptions = {
    url: string;
    data?: string | Buffer | Serializable;
    failOnStatusCode?: boolean;
    form?: { [key: string]: string | number | boolean };
    headers?: { [key: string]: string };
    ignoreHTTPSErrors?: boolean;
    method?: string;
    multipart?: {
      [key: string]:
        | string
        | number
        | boolean
        | ReadStream
        | {
            name: string;
            mimeType: string;
            buffer: Buffer;
          };
    };
    params?: { [key: string]: string | number | boolean };
    timeout?: number;
  };

  