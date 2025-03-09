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
import { useTheme } from '../../components/theme-provider/theme-provider'
import DataGridWrapper from '@/components/dataGrid/DataGridWrapper'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Localize() {
    const [activeTab, setActiveTab] = useState<string | undefined>(undefined)
    const [config, setConfig] = useState<ICognatesConfig>()
    const [localeFiles, setLocaleFiles] = useState<ILocaleFileInfo[]>([])
    const [openAddPopOver, setOpenAddPopOver] = useState(false)
    const [newCultureCode, setNewCultureCode] = useState('')
    const [content, setFileContent] = useState<any>(undefined)
    const [defaultContent, setDefaultFileContent] = useState<any>(undefined)
    const [isDirty,setIsDirty]=useState(false);
    const [cultureList, setCultureList] = useState<ICultureInfo[]>([])
    const [showDialog, setShowDialog] = useState(false)
    const [pendingTab, setPendingTab] = useState<string | undefined>(undefined)
    useEffect(() => {
        async function fetchLocaleFiles() {
            try {
                await loadTabs()

                getCultureInfoForAdd()
            } catch (error) {
                console.error('Error fetching locale files:', error)
            }
        }
        fetchLocaleFiles()
    }, [activeTab])
    async function loadTabs() {
        const files =
            await LocaleService.getSingletonInstance().getLocaleFiles()
        setLocaleFiles(files)

        if (files.length > 0) {
            let config = await ConfigService.getSingletonInstance().getConfig()
            setConfig(config)
            loadDefaultFileContent(config)
            let i = files.findIndex(
                (x) => x.cultureInfo?.code == config.defaultLanguage,
            )
            let activeTabIndex = i > -1 ? i : 0
            if (!activeTab) {
                setActiveTab(files[activeTabIndex].filePath) // Set first file as default tab
                loadFileContent(files[activeTabIndex].filePath)
            }
        }
    }
    async function getCultureInfoForAdd() {
        const configService = ConfigService.getSingletonInstance()
        const cultureInfoList = await configService.getCultureInfo()
        setCultureList(cultureInfoList)
    }
    const loadFileContent = async (filePath: string) => {
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
    const loadDefaultFileContent = async (config: ICognatesConfig) => {
        try {
            const fileContent =
                await LocaleService.getSingletonInstance().getLocaleFile(
                    config?.defaultLanguage,
                )
            setDefaultFileContent(fileContent)
            console.log('Fetched locale file content:', fileContent)
        } catch (error) {
            console.error('Error fetching locale file:', error)
        }
    }
    const handleTabChange = async (tab: string) => {
        if (isDirty) {
            setPendingTab(tab)
            setShowDialog(true)
        } else {
            await changeTab(tab)
        }
    }

    const changeTab = async (tab: string) => {
        setIsDirty(false)
        await loadFileContent(tab).then(() => {
            setActiveTab(tab)
            console.log(tab, config?.defaultLanguage)
        })
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

        // Reload locale files
        await loadTabs()
    }

    const { theme } = useTheme()
    const lightTheme = {
        // bgCell: "oklch(0.98 0.00 106)", // Lightest background
        textDark: 'oklch(0.15 0.00 49)', // Dark text
        textMedium: 'oklch(0.37 0.01 68)', // Medium text
        textLight: 'oklch(0.92 0.00 49)', // Light text
        headerBg: 'oklch(0.87 0.00 56)', // Header background
        rowBg: 'oklch(0.97 0.00 106)', // Row background
    }

    const darkTheme = {
        bgCell: 'oklch(0.15 0.00 49)', // Darkest background
        textDark: 'oklch(0.98 0.00 106)', // Light text
        textMedium: 'oklch(0.55 0.01 58)', // Medium text
        textLight: 'oklch(0.72 0.01 56)', // Light text
        headerBg: 'oklch(0.22 0.01 56)', // Header background
        rowBg: 'oklch(0.27 0.01 34)', // Row background
    }
    const appliedTheme = theme === 'dark' ? darkTheme : lightTheme
    const onUpdate=(culture:string,
        updatedData:any,
        defaultCulture:string,
        defaultCultureData:any)=>{
            console.log(
                culture,
                updatedData,
                defaultCulture,
                defaultCultureData,
            )
            setIsDirty(true);
    }
    const handleDialogConfirm = async () => {
        setShowDialog(false)
        if (pendingTab) {
            await changeTab(pendingTab)
            setPendingTab(undefined)
        }
    }

    const handleDialogCancel = () => {
        setShowDialog(false)
        setPendingTab(undefined)
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
                                                {`${tabLabel}${cultureInfo?.code === config?.defaultLanguage ? '⭐' : ''}`}
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
                    <div className="flex w-full justify-end mt-2 drop-shadow-lg max-h-30 gap-2">
                        {config?.defaultLanguage === activeTab?.replace('.json', '') && 
                            <Button>Generate Type File</Button>}
                        {isDirty &&
                            <Button>Save</Button>}
                            </div>
                    {/* Content Panel (Placeholder for Table) */}
                    <div className="table scroll mt-2 drop-shadow-lg h-[calc(100vh-150px)] overflow-auto">
                        {content &&
                        config?.defaultLanguage &&
                        defaultContent &&
                        activeTab ? (
                            <>
                            <DataGridWrapper
                                key={activeTab || config.defaultLanguage}
                                theme={appliedTheme}
                                height="100%"
                                width="100%"
                                data={content}
                                defaultCulture={config.defaultLanguage}
                                defaultCultureData={defaultContent}
                                culture={activeTab.replace('.json', '')}
                                onUpdate={onUpdate}
                            />
                            
                            </>
                        ) : (
                            <p>Loading data...</p>
                        )}
                    </div>
                </div>
            </div>
            {/* Add PopOver */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                    </DialogHeader>
                    <p>Changes not saved. If you switch tabs now, the changes will be lost. Save the changes before switching tabs.</p>
                    <DialogFooter>
                        <Button onClick={handleDialogCancel}>Cancel</Button>
                        <Button onClick={handleDialogConfirm}>Change Anyway</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LocalizeLayout>
    )
}
