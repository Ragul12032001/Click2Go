// src/@types/global.d.ts
declare global {
    interface Window {
      fbAsyncInit?: () => void;
      FB: {
        init: (params: {
          appId: string;
          autoLogAppEvents: boolean;
          xfbml: boolean;
          version: string;
        }) => void;
        login: (
          callback: (response: any) => void,
          options?: { scope: string }
        ) => void;
        logout: (callback?: (response: any) => void) => void;
        api: (path: string, method: string, params: any, callback: (response: any) => void) => void;
      };
    }
  }
  
  export {};
  