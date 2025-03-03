export interface ICognatesConfig {
    defaultLanguage:string,
    autoDetectLanguage:boolean
    source:string,
    port:number
    localeDir:string,
    excludePaths:string[]
}
export interface IError{
    error:string;
}
export interface ICultureInfo {
    country?: string;
    language: string;
    code: string;
  }
  export interface ILocaleFileInfo{
    fileName:string;
    filePath:string;
    cultureInfo?:ICultureInfo
  }