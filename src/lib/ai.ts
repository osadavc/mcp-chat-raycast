import { createOpenAI } from "@ai-sdk/openai";
import axios from "axios";
import { Headers, Response } from "undici";

export const openai = ({ apiKey, baseURL }: { apiKey: string; baseURL: string }) =>
  createOpenAI({
    apiKey,
    baseURL,
    // @ts-expect-error - issue is fetch doesn't exist in raycast and axios is incompatible with vercel ai sdk
    fetch: async (url, options) => {
      const isStream = options?.body ? JSON.parse(options?.body as string).stream === true : false;

      try {
        const response = await axios({
          url: url.toString(),
          method: options?.method || "GET",
          headers: options?.headers as Record<string, string>,
          data: options?.body,
          responseType: isStream ? "stream" : "json",
        });

        return new Response(response.data, {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers(response.headers as Record<string, string>),
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return new Response(error.response.data, {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: new Headers(error.response.headers as Record<string, string>),
          });
        }
        throw error;
      }
    },
  });
