import { toast } from "sonner";

const API_ENDPOINT = "wss://ws-api.runware.ai/v1";

export interface GenerateImageParams {
  positivePrompt: string;
  model?: string;
  numberResults?: number;
  outputFormat?: string;
  CFGScale?: number;
  scheduler?: string;
  strength?: number;
  promptWeighting?: "compel" | "sdEmbeds";
  seed?: number | null;
  lora?: string[];
}

export interface GeneratedImage {
  imageURL: string;
  positivePrompt: string;
  seed: number;
  NSFWContent: boolean;
}

// Lightweight cached singleton. Stores API key in-memory; UI sets it in localStorage('runwareApiKey').
export class RunwareService {
  private static instance: RunwareService | null = null;
  private ws: WebSocket | null = null;
  private apiKey: string | null = null;
  private connectionSessionUUID: string | null = null;
  private messageCallbacks: Map<string, (data: any) => void> = new Map();
  private isAuthenticated = false;
  private connectionPromise: Promise<void> | null = null;

  static getInstance(): RunwareService {
    if (!RunwareService.instance) {
      RunwareService.instance = new RunwareService();
    }
    return RunwareService.instance;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    if (typeof window !== "undefined") {
      try { localStorage.setItem("runwareApiKey", key); } catch {}
    }
    // Reconnect with new key
    this.connectionPromise = this.connect();
  }

  private constructor() {
    if (typeof window !== "undefined") {
      try { this.apiKey = localStorage.getItem("runwareApiKey"); } catch {}
    }
    // Lazy connect; only when generateImage is called
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.apiKey) {
        reject(new Error("Runware API key not set"));
        return;
      }
      this.ws = new WebSocket(API_ENDPOINT);

      this.ws.onopen = () => {
        this.authenticate().then(resolve).catch(reject);
      };

      this.ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data as any);
          if (response.error || response.errors) {
            const errorMessage = response.errorMessage || response.errors?.[0]?.message || "Runware error";
            console.error("Runware error:", response);
            toast.error(errorMessage);
            return;
          }
          if (response.data) {
            response.data.forEach((item: any) => {
              if (item.taskType === "authentication") {
                this.connectionSessionUUID = item.connectionSessionUUID;
                this.isAuthenticated = true;
              } else {
                const cb = this.messageCallbacks.get(item.taskUUID);
                if (cb) {
                  cb(item);
                  this.messageCallbacks.delete(item.taskUUID);
                }
              }
            });
          }
        } catch (e) {
          console.error("Runware message parse error", e);
        }
      };

      this.ws.onerror = (error) => {
        console.error("Runware WebSocket error:", error);
        toast.error("Runware connection error");
        reject(error as any);
      };

      this.ws.onclose = () => {
        this.isAuthenticated = false;
        // No auto-reconnect here; next call will recreate
      };
    });
  }

  private authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not open"));
        return;
      }
      const msg = [{
        taskType: "authentication",
        apiKey: this.apiKey,
        ...(this.connectionSessionUUID && { connectionSessionUUID: this.connectionSessionUUID }),
      }];
      const onMsg = (event: MessageEvent) => {
        try {
          const response = JSON.parse(event.data as any);
          if (response.data?.[0]?.taskType === "authentication") {
            this.ws?.removeEventListener("message", onMsg);
            resolve();
          }
        } catch {}
      };
      this.ws.addEventListener("message", onMsg);
      this.ws.send(JSON.stringify(msg));
    });
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    if (!this.apiKey) {
      throw new Error("Runware API key missing. Add it in Settings or via localStorage('runwareApiKey').");
    }
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isAuthenticated) {
      this.connectionPromise = this.connect();
      await this.connectionPromise;
    }

    const taskUUID = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const message = [{
        taskType: "imageInference",
        taskUUID,
        model: params.model || "runware:100@1",
        width: 512,
        height: 512,
        numberResults: params.numberResults || 1,
        outputFormat: params.outputFormat || "WEBP",
        steps: 4,
        CFGScale: params.CFGScale || 1,
        scheduler: params.scheduler || "FlowMatchEulerDiscreteScheduler",
        strength: params.strength || 0.8,
        lora: params.lora || [],
        ...params,
      }];
      if (!params.seed) delete (message[0] as any).seed;
      if ((message[0] as any).model === "runware:100@1") delete (message[0] as any).promptWeighting;

      this.messageCallbacks.set(taskUUID, (data) => {
        if ((data as any).error) {
          reject(new Error((data as any).errorMessage || "Runware generation failed"));
        } else {
          resolve(data as GeneratedImage);
        }
      });

      this.ws!.send(JSON.stringify(message));
    });
  }
}
