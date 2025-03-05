import { useEffect, useState } from 'react'
import LocalizeLayout from '../../layout/localize-layout/LocalizeLayout'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LocaleService } from '@/services/locale.service'
import { ICognatesConfig, ICultureInfo, ILocaleFileInfo } from '@/types'
import { PlusIcon } from 'lucide-react'
import './Localize.css'
import { Button } from '@/components/ui/button'
import { ConfigService } from '@/services/config.service'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Combobox } from '@/components/ui/combobox'

export default function Localize() {
    const [activeTab, setActiveTab] = useState<string>()
    const [config, setConfig] = useState<ICognatesConfig>()
    const [localeFiles, setLocaleFiles] = useState<ILocaleFileInfo[]>([])
    const [openAddPopOver, setOpenAddPopOver] = useState(false)
    const [newCultureCode, setNewCultureCode] = useState('')
    const [content, setFileContent] = useState<any>(undefined)

    const [cultureList, setCultureList] = useState<ICultureInfo[]>([])
    useEffect(() => {
        async function fetchLocaleFiles() {
            try {
                await updateTabs()

                getCultureInfoForAdd()
            } catch (error) {
                console.error('Error fetching locale files:', error)
            }
        }
        fetchLocaleFiles()
    }, [])
    async function updateTabs() {
        const files =
            await LocaleService.getSingletonInstance().getLocaleFiles()
        setLocaleFiles(files)

        if (files.length > 0) {
            let config = await ConfigService.getSingletonInstance().getConfig()
            setConfig(config)
            let i = files.findIndex(
                (x) => x.cultureInfo?.code == config.defaultLanguage,
            )
            let activeTabIndex = i > -1 ? i : 0
            if(!activeTab)
            {setActiveTab(files[activeTabIndex].filePath) // Set first file as default tab
            loadTableContent(files[activeTabIndex].filePath)
            }
        }
    }
    async function getCultureInfoForAdd() {
        const configService = ConfigService.getSingletonInstance()
        const cultureInfoList = await configService.getCultureInfo()
        setCultureList(cultureInfoList)
    }
    const loadTableContent = async (filePath: string) => {
        try {
            const fileContent =
                await LocaleService.getSingletonInstance().getLocaleFile(
                    filePath,
                )
                setFileContent(fileContent)
            console.log('Fetched locale file content:', fileContent)
        } catch (error) {
            console.error('Error fetching locale file:', error)
        }
    }
    const handleTabChange = async (tab: string) => {
        setActiveTab(tab)
        await loadTableContent(tab)
    }

    const handleAddLocale = async () => {
        if (!newCultureCode.trim()) return
        const localeService = LocaleService.getSingletonInstance()
        const response = await localeService.createLocaleFile(
            newCultureCode.trim(),
        )
        alert(response.message) // Replace with a toast if needed
        setNewCultureCode('')
        setOpenAddPopOver(false)
    }
    return (
        <LocalizeLayout>
            <div className="flex h-full items-start">
                {/* Sidebar */}
                <aside className="w-64 sidebar scroll  overflow-x-auto overflow-y-auto drop-shadow-lg p-2 h-[calc(100vh-145px)]">
                    Sidebar Content (Empty for now)
                </aside>

                {/* Main Content */}
                <div className="flex flex-col flex-1 pl-4 table-parent h-[calc(100vh-145px)] w-[calc(100vw-20rem)] ">
                    {/* Tabs */}
                    <div className="flex justify-between">
                        <Tabs
                            value={activeTab}
                            onValueChange={handleTabChange}
                            className="tabs scroll pb-2 overflow-x-auto overflow-y-hidden max-w-[calc(100vw-20rem)]"
                        >
                            <TabsList className="tabs-list gap-2 max-w-[calc(100vw-24rem)]">
                                {localeFiles.map(
                                    ({ fileName, filePath, cultureInfo }) => {
                                        const tabLabel =
                                            cultureInfo?.language ||
                                            fileName
                                                .replace('.json', '')
                                                .toUpperCase()
                                        return (
                                            <TabsTrigger
                                                key={fileName}
                                                value={filePath}
                                            >
                                                {tabLabel}
                                            </TabsTrigger>
                                        )
                                    },
                                )}
                            </TabsList>
                        </Tabs>
                        <Popover
                            open={openAddPopOver}
                            onOpenChange={setOpenAddPopOver}
                        >
                            <PopoverTrigger asChild>
                                <Button className="flex tabs-list drop-shadow-lg h-auto ml-2 w-10">
                                    <PlusIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="flex w-auto p-4">
                                <Combobox
                                    className="flex"
                                    options={cultureList.map((culture) => ({
                                        label: `${culture.language}${culture.country ? ` (${culture.country})` : ''}`,
                                        value: culture.code,
                                    }))}
                                    value={newCultureCode}
                                    onChange={setNewCultureCode}
                                    placeholder="Select a culture code"
                                />
                                <Button
                                    className="flex tabs-list drop-shadow-lg h-auto ml-2 w-auto"
                                    onClick={handleAddLocale}
                                >
                                    Add Culture
                                    <PlusIcon />
                                </Button>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Content Panel (Placeholder for Table) */}
                    <div className="table scroll mt-2 drop-shadow-lg h-[calc(100vh-150px)] overflow-auto">
                        Table will be added here later
                    </div>
                </div>
            </div>
            {/*Add  PopOver */}
        </LocalizeLayout>
    )
}
