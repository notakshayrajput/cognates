export interface ICognatesConfig {
    defaultLanguage:string,
    autoDetectLanguage:boolean
    source:string,
    port:number
    localeDir:string,
    localeFilePattern?:string,
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
    code:string;
    fileName:string;
    filePath:string;
    cultureInfo?:ICultureInfo
  }
