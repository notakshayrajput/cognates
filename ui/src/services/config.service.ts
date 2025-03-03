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
      if (response.error) {
        throw new Error(response.error);
      }
      return response as ICognatesConfig;
    } catch (error) {
      console.error("Failed to fetch config:", error);
      throw new Error("Failed to fetch configuration.");
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
    try {
      const response = await HttpService.getSingletonInstance().post("/api/config", newConfig);
      if (response.error) {
        throw new Error(response.error);
      }
      return response as { success: boolean; message: string };
    } catch (error) {
      console.error("Failed to update config:", error);
      throw new Error("Failed to update configuration.");
    }
  }
 
}
