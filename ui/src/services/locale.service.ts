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
  public async getLocaleFile(filePath: string): Promise<any> {
    try {
      const response = await this.httpService.get(`/api/locale/${filePath}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch locale file (${filePath}):`, error);
      return null;
    }
  }
  public async createLocaleFile(
    code: string
    //filePath: string,
    //country: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      var filePath=code
      const response = await this.httpService.post(`/api/locale/${filePath}`, {
        code, //code is culture code
        //filePath,
        //country,
      });
      return response as { success: boolean; message: string };
    } catch (error) {
      console.error(`Failed to create locale file (${code}.json):`, error);
      return { success: false, message: "Failed to create locale file" };
    }
  }

}
