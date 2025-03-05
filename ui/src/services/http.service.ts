export class HttpService {
    private static instance: HttpService;
  
    private constructor() {}
  
    public static getSingletonInstance(): HttpService {
      if (!HttpService.instance) {
        HttpService.instance = new HttpService();
      }
      return HttpService.instance;
    }
  
    private async request(method: string, url: string, body?: any) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: body ? JSON.stringify(body) : undefined,
        });
        const data = await response.json();
        if (!response.ok) {
          throw data;
        }
        return data;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Network error");
      }
    }
  
    public async get(url: string) {
      return this.request("GET", url);
    }
  
    public async post(url: string, body: any) {
      return this.request("POST", url, body);
    }
  
    public async put(url: string, body: any) {
      return this.request("PUT", url, body);
    }
  
    public async delete(url: string) {
      return this.request("DELETE", url);
    }
  }
  