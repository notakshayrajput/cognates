import { ILocaleFileInfo } from '@/types'
import { HttpService } from './http.service'

export class LocaleService {
    private static instance: LocaleService
    private httpService: HttpService

    private constructor() {
        this.httpService = HttpService.getSingletonInstance()
    }

    public static getSingletonInstance(): LocaleService {
        if (!LocaleService.instance) {
            LocaleService.instance = new LocaleService()
        }
        return LocaleService.instance
    }

    public async getLocaleFiles(): Promise<ILocaleFileInfo[]> {
        try {
            const response = await this.httpService.get('/api/locales')
            return response as ILocaleFileInfo[]
        } catch (error) {
            console.error('Failed to fetch locale files:', error)
            throw new Error('Failed to fetch locale files.') // Throw error instead of returning []
        }
    }

    public async getLocaleFile(filePath: string): Promise<any> {
        try {
            return await this.httpService.get(`/api/locale/${filePath}`)
        } catch (error) {
            console.error(`Failed to fetch locale file (${filePath}):`, error)
            throw new Error(`Failed to fetch locale file: ${filePath}`)
        }
    }
    public async createLocaleFile(
        code: string,
    ): Promise<{
        success: boolean
        message: string
        localeFiles?: ILocaleFileInfo[]
    }> {
        try {
            const filePath = code
            const response = await this.httpService.post(
                `/api/locale/${filePath}`,
                { code },
            )
            const updatedLocaleFiles = await this.getLocaleFiles() // Fetch updated list
            return { ...response, localeFiles: updatedLocaleFiles }
        } catch (error) {
            console.error(`Failed to create locale file (${code}.json):`, error)
            return { success: false, message: 'Failed to create locale file' }
        }
    }
    public async updateLocaleFile(
        filePath: string,
        data: any,
    ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await this.httpService.put(
                `/api/locale/${filePath}`,
                { content: data },
            )
            return response
        } catch (error) {
            console.error(`Failed to update locale file (${filePath}):`, error)
            return { success: false, message: 'Failed to update locale file' }
        }
    }
    public async renameKeys( keyChanges:any ): Promise<{ success: boolean; message: string }> {
        try {
            const response = await this.httpService.post(
                `/api/locale/key/rename`,
                { keyChanges: keyChanges },
            )
            return response
        } catch (error) {
            console.error(`Failled to update keys:`, error)
            return { success: false, message: 'Failed to update keys' }
        }
    }
}
