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
export interface ILanguage {
    country?: string;
    language: string;
    code: string;
  }