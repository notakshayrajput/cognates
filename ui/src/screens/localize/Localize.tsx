import { useEffect, useState } from 'react'
import LocalizeLayout from '../../layout/localize-layout/LocalizeLayout'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LocaleService } from '@/services/locale.service'
import { ICognatesConfig, ICultureInfo, ILocaleFileInfo } from '@/types'
import { PlusIcon } from 'lucide-react'
import './Localize.css'
import { Button } from '@/components/ui/button'
import { ConfigService } from '@/services/config.service'
import DataGridWrapper from '@/components/dataGrid/DataGridWrapper'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function Localize() {
    const [activeTab, setActiveTab] = useState<string | undefined>(undefined)
    const [config, setConfig] = useState<ICognatesConfig>()
    const [localeFiles, setLocaleFiles] = useState<ILocaleFileInfo[]>([])
    const [openAddDialog, setOpenAddDialog] = useState(false)
    const [newCultureCode, setNewCultureCode] = useState('')
    const [addLocaleError, setAddLocaleError] = useState('')
    const [isAddingLocale, setIsAddingLocale] = useState(false)
    const [content, setFileContent] = useState<any>(undefined)
    const [defaultContent, setDefaultFileContent] = useState<any>(undefined)
    const [isDirty, setIsDirty] = useState(false)
    const [cultureList, setCultureList] = useState<ICultureInfo[]>([])
    const [showDialog, setShowDialog] = useState(false)
    const [pendingTab, setPendingTab] = useState<string | undefined>(undefined)
    const [unsavedData, setUnsaveData] = useState<any>(undefined)
    const [showKeyChangeDialog, setShowKeyChangeDialog] = useState(false)
    const [trackedKeyChanges, setTrackedKeyChanges] = useState<Array<{ oldKey: string; newKey: string }>>([])

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
        const code = newCultureCode.trim()
        if (!code || isAddingLocale) return
        if (isDirty) {
            setAddLocaleError('Save your current changes before adding a locale.')
            return
        }
        setIsAddingLocale(true)
        setAddLocaleError('')
        const localeService = LocaleService.getSingletonInstance()
        const response = await localeService.createLocaleFile(code)
        setIsAddingLocale(false)
        if (!response.success) {
            setAddLocaleError(response.message)
            return
        }
        setLocaleFiles(response.localeFiles ?? [])
        setNewCultureCode('')
        setOpenAddDialog(false)
        await changeTab(`${code}.json`)
    }

    const availableCultures = cultureList.filter(
        culture => !localeFiles.some(file => file.fileName === `${culture.code}.json`),
    )

    const onUpdate = (
        culture: string,
        updatedData: any,
        defaultCulture: string,
        defaultCultureData: any,
        keyChanges: { oldKey: string; newKey: string } | null
    ) => {
        console.log(
            culture,
            updatedData,
            defaultCulture,
            defaultCultureData,
            keyChanges
        )
        if(keyChanges)
        setTrackedKeyChanges((prev)=>[...prev,keyChanges])
        setUnsaveData({ culture: culture, content: updatedData })
        setIsDirty(true)
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

    const handleSave = async () => {
        console.log(trackedKeyChanges)
        if (isDirty) {
            if (trackedKeyChanges.length > 0) {
                setShowKeyChangeDialog(true)
                return
            }
            const response = await LocaleService.getSingletonInstance().updateLocaleFile(
                unsavedData.culture,
                unsavedData.content
            )
            if (response.success) { 
                setIsDirty(false)
                alert('Saved Successfully')
            } else {
                alert('Failed to save\n' + response.message)
            }
        }
    }

    const handleConfirmKeyChanges = async () => {
        const response = await LocaleService.getSingletonInstance().renameKeys(trackedKeyChanges)
        if (response.success) {            
            setTrackedKeyChanges([])  
            alert('Keys renamed successfully')
            await handleSave()
        } else {
            alert('Failed to rename keys\n' + response.message)
        }
        setShowKeyChangeDialog(false)
    }

    const handleCancelKeyChanges = () => {
        setShowKeyChangeDialog(false)
    }

    return (
        <LocalizeLayout>
            <div className="flex h-full items-start">
                {/* Sidebar
                <aside className="w-64 sidebar scroll  overflow-x-auto overflow-y-auto drop-shadow-lg p-2 h-[calc(100vh-145px)]">
                    Sidebar Content (Empty for now)
                </aside> */}

                {/* Main Content */}
                <div className="flex flex-col flex-1table-parent h-[calc(100vh-145px)] w-[calc(100vw-4rem)] ">
                    {/* Tabs */}
                    <div className="flex justify-between">
                        <Tabs
                            value={activeTab}
                            onValueChange={handleTabChange}
                            className="tabs scroll pb-2 overflow-x-auto overflow-y-hidden max-w-[calc(100vw-4rem)]"
                        >
                            <TabsList className="tabs-list gap-2 max-w-[calc(100vw-10rem)]">
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
                        <div className="flex w-fit justify-end drop-shadow-lg max-h-30 gap-2">
                        <Dialog open={openAddDialog} onOpenChange={(open) => {
                            setOpenAddDialog(open)
                            if (!open) {
                                setNewCultureCode('')
                                setAddLocaleError('')
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="ml-2 shrink-0">
                                    <PlusIcon /> Add locale
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add locale</DialogTitle>
                                    <DialogDescription>
                                        Create a JSON file with the same keys as the default locale and empty values.
                                    </DialogDescription>
                                </DialogHeader>
                                <label htmlFor="new-locale-code" className="text-sm font-medium">Locale</label>
                                <select
                                    id="new-locale-code"
                                    className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3"
                                    value={newCultureCode}
                                    onChange={(event) => {
                                        setNewCultureCode(event.target.value)
                                        setAddLocaleError('')
                                    }}
                                >
                                    <option value="">Select a locale</option>
                                    {availableCultures.map(culture => (
                                        <option key={culture.code} value={culture.code}>
                                            {culture.language}{culture.country ? ` (${culture.country})` : ''} — {culture.code}
                                        </option>
                                    ))}
                                </select>
                                {addLocaleError && <p role="alert" className="text-destructive text-sm">{addLocaleError}</p>}
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                                    <Button onClick={handleAddLocale} disabled={!newCultureCode || isAddingLocale}>
                                        {isAddingLocale ? 'Adding...' : 'Add locale'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        {(isDirty || trackedKeyChanges.length>0) &&
                            <Button onClick={handleSave}>Save</Button>
                            }
                    </div>
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
                        <div className='flex justify-between gap-2'>
                            <Button onClick={handleDialogConfirm} variant={"outline"}>Proceed and Change Anyway</Button>
                            <Button onClick={handleDialogCancel}>Cancel and Go back</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Key Change Confirmation Dialog */}
            <Dialog open={showKeyChangeDialog} onOpenChange={setShowKeyChangeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Key Changes</DialogTitle>
                    </DialogHeader>
                    <p>You have made changes to the locale keys. Confirming the changes will update the keys in all locales. Do you want to continue?</p>
                    <DialogFooter>
                        <Button onClick={handleConfirmKeyChanges}>Yes, Proceed</Button>
                        <Button onClick={handleCancelKeyChanges}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LocalizeLayout>
    )
}
