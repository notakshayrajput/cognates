import { ILocaleFileInfo } from "@/types";
import { HttpService } from "./http.service";

export class LocaleService {
  private static instance: LocaleService;
  private httpService: HttpService;

  private constructor() {
    this.httpService = HttpService.getSingletonInstance();
  }

  public static getSingletonInstance(): LocaleService {
    if (!LocaleService.instance) {
      LocaleService.instance = new LocaleService();
    }
    return LocaleService.instance;
  }

  public async getLocaleFiles(): Promise<ILocaleFileInfo[]> {
    try {
      const response = await this.httpService.get("/api/locales");
      return response as ILocaleFileInfo[];
    } catch (error) {
      console.error("Failed to fetch locale files:", error);
      return [];
    }
  }
}
