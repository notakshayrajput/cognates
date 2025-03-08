import { ICognatesConfig,  ICultureInfo } from "@/types";
import { HttpService } from "./http.service";

export class ConfigService {
  private static instance: ConfigService;

  private constructor() {}

  public static getSingletonInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public async getConfig(): Promise<ICognatesConfig> {
    try {
        const response = await HttpService.getSingletonInstance().get("/api/config");
        return response as ICognatesConfig;
    } catch (error: any) { // Ensure error type safety
        console.error("Failed to fetch config:", error?.message || error);
        throw new Error(`Failed to fetch configuration: ${error?.message || "Unknown error"}`);
    }
}

  
  public async getCultureInfo(): Promise<ICultureInfo[]> {
    try {
      const response = await HttpService.getSingletonInstance().get("/api/cultureInfo");
      if (response.error) {
        throw new Error(response.error);
      }
      return response.cultureInfoList as ICultureInfo[];
    } catch (error) {
      console.error("Failed to fetch language list:", error);
      throw new Error("Failed to fetch language list.");
    }
  }
  public async updateConfig(newConfig: ICognatesConfig): Promise<{ success: boolean; message: string }> {
    if (!newConfig) {
        console.error("updateConfig: newConfig is undefined or null");
        return { success: false, message: "Invalid config data" };
    }
    
    try {
        const response = await HttpService.getSingletonInstance().post("/api/config", newConfig);
        return response as { success: boolean; message: string };
    } catch (error: any) {
        console.error("Failed to update config:", error?.message || error);
        return { success: false, message: "Failed to update configuration" };
    }
}
 
}
