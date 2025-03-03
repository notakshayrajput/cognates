import { useEffect, useState } from "react";
import LocalizeLayout from "../../layout/localize-layout/LocalizeLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocaleService } from "@/services/locale.service";
import { ILocaleFileInfo } from "@/types";
import "./Localize.css"

export default function Localize() {
  const [activeTab, setActiveTab] = useState("en");
  const [localeFiles, setLocaleFiles] = useState<ILocaleFileInfo[]>([]);

  useEffect(() => {
    async function fetchLocaleFiles() {
      try {
        const files = await LocaleService.getSingletonInstance().getLocaleFiles();
        setLocaleFiles(files);
        if (files.length > 0) {
          setActiveTab(files[0].fileName.replace(".json", "")); // Set first file as default tab
        }
      } catch (error) {
        console.error("Error fetching locale files:", error);
      }
    }
    fetchLocaleFiles();
  }, []);
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    console.log("Selected Tab:", tab);
  };

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
          <Tabs value={activeTab} onValueChange={handleTabChange} className="tabs scroll pb-2 overflow-x-auto overflow-y-hidden max-w-[calc(100vw-20rem)]">
          <TabsList className="tabs-list">
              {localeFiles.map(({ fileName, cultureInfo }) => {
                const tabLabel = cultureInfo?.language || fileName.replace(".json", "").toUpperCase();
                return (
                  <TabsTrigger key={fileName} value={fileName.replace(".json", "")}>
                    {tabLabel}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Content Panel (Placeholder for Table) */}
          <div className="table scroll mt-2 drop-shadow-lg h-[calc(100vh-150px)] overflow-auto">
            Table will be added here later 
          </div>
        </div>
      </div>
    </LocalizeLayout>
  );
}
