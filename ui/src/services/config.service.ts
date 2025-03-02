import { ICognatesConfig,  ILanguage } from "@/types";
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
  
  public async getConfigList(): Promise<ILanguage[]> {
    try {
      const response = await HttpService.getSingletonInstance().get("/lang.json");
      if (response.error) {
        throw new Error(response.error);
      }
      return response as ILanguage[];
    } catch (error) {
      console.error("Failed to fetch language list:", error);
      throw new Error("Failed to fetch language list.");
    }
  }
  
}
