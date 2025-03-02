import { useState, useEffect, ChangeEvent } from "react";
import MainLayout from "../../layout/main-layout.css/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { ConfigService } from "@/services/config.service";
import { ICognatesConfig, ILanguage } from "@/types";
import { cn } from "@/lib/utils"; 
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function Configure() {
  const [config, setConfig] = useState<ICognatesConfig>({
    defaultLanguage: "en",
    autoDetectLanguage: true,
    source: "src/",
    port: 2410,
    localeDir: "cognates/",
    excludePaths: ['/assets/*'],
  });

  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
        try {
          const configService = ConfigService.getSingletonInstance();
    
          const configData = await configService.getConfig();
          setConfig(configData);  // No need for "error in configData" check
    
          const languageList = await configService.getConfigList();
          setLanguages(languageList);
    
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Something went wrong.");
        }
        finally {
            setLoading(false);
          }
      }
    fetchData();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement> | string, name?: string) => {
    if (typeof e === "string" && name) {
      setConfig((prev) => ({
        ...prev,
        [name]: e,
      }));
      setErrors((prev) => ({ ...prev, [name]: !e }));
    } else {
      const event = e as ChangeEvent<HTMLInputElement>;
      const { name, value, type, checked } = event.target;
      setConfig((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      setErrors((prev) => ({ ...prev, [name]: !value }));
    }
  };

  const handleArrayChange = (e: ChangeEvent<HTMLInputElement>) => {
    const values = e.target.value.split(",").map((path) => path.trim());
    setConfig((prev) => ({
      ...prev,
      excludePaths: values,
    }));
  };

  const handleSave = async (config: ICognatesConfig, setErrors: (errors: Record<string, boolean>) => void) => {
    try {
      const requiredFields: (keyof ICognatesConfig)[] = ["defaultLanguage", "source", "port", "localeDir"];
      const newErrors: Record<string, boolean> = {};
      let hasError = false;
  
      requiredFields.forEach((field) => {
        if (!config[field]) {
          newErrors[field] = true;
          hasError = true;
        }
      });
  
      setErrors(newErrors);
  
      if (hasError) {
        toast.error("Please fill in all required fields.");
        return;
      }
  
      // Call API to update config
      await ConfigService.getSingletonInstance().updateConfig(config);
  
      toast.success("Configuration updated successfully!");
      console.log("Configuration saved:", config);
    } catch (error) {
      console.error("Error updating config:", error);
      toast.error("Failed to update configuration.");
    }
  };

  // Description messages for each field
  const info: Record<string, { title: string; description: any }> = {
    defaultLanguage: {
      title: "🌍 Default Language",
      description: (
        <>
          The primary language your application will use when it first loads. <br />
          <strong>Example:</strong> If set to <code>en</code>, your app will display content in English by default. <br />
          <strong>Default Value:</strong> <code>en</code> (English) <br />
          This can be overridden based on user preferences or browser settings.
        </>
      ),
    },
    autoDetectLanguage: {
      title: "🔍 Auto Detect Language",
      description: (
        <>
          Enable this option to automatically detect and apply the user's preferred language. <br />
          <strong>Example:</strong> If a user has their browser set to Spanish (<code>es</code>), your app will automatically display content in Spanish. <br />
          <strong>Default Value:</strong> <code>true</code> (Enabled) <br />
          This feature helps provide a more personalized user experience.
        </>
      ),
    },
    source: {
      title: "📂 Source Folder",
      description: (
        <>
          Specify the folder where your source files (such as components and views) are located. <br />
          <strong>Example:</strong> <code>src/pages</code> or <code>app/views</code> <br />
          <strong>Default Value:</strong> src/ <br />
          This is essential for scanning and extracting translatable strings.
        </>
      ),
    },
    port: {
      title: "🚀 Port Number",
      description: (
        <>
          The port number your local development server will use. <br />
          <strong>Example:</strong> <code>2410</code> for local testing <br />
          <strong>Default Value:</strong> <code>2410</code> <br />
          Change this if you have conflicts with other running applications.
        </>
      ),
    },
    localeDir: {
      title: "📁 Locale Directory",
      description: (
        <>
          The folder where all localization files (JSON, YAML, etc.) will be stored. <br />
          <strong>Example:</strong> <code>locales/</code> or <code>cognates/</code> <br />
          <strong>Default Value:</strong> cognates/ <br />
          This is where translations are read from and written to.
        </>
      ),
    },
    excludePaths: {
      title: "🚫 Exclude Paths",
      description: (
        <>
          Define specific paths or files that should be ignored during localization scanning. <br />
          <strong>Example:</strong> <code>node_modules/, build/, test/</code> <br />
          <strong>Default Value:</strong> <code>['/assets/*']</code>  excludes /assets/* <br />
          Use this to prevent unnecessary files from being processed.
        </>
      ),
    },
  };
  
  

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* Configuration Form */}
        <Card className="w-full md:w-2/3 p-4">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>

          {loading ? (
          <CardContent>
              <>
              <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-7 w-full mb-6" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-7 w-full mb-6" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-7 w-full mb-6" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-7 w-full mb-6" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-7 w-full mb-6" />
              </>
              </CardContent>
            ):(
                
          <CardContent>
            {/* Default Language */}
            <label className="block mb-2">Default Language:</label>
            <Combobox
              options={languages.map((lang) => ({
                label: `${lang.language}${lang.country ? ` (${lang.country})` : ""}`,
                value: lang.code,
              }))}
              value={config.defaultLanguage}
              onChange={(value) => handleChange(value, "defaultLanguage")}
              onFocus={() => setFocusedField("defaultLanguage")}
              placeholder="Select a language"
            />
            {errors.defaultLanguage && <p className="text-red-500 text-sm">Default language is required</p>}

            {/* Auto Detect Language */}
            <div className="mt-4">
              <input 
                type="checkbox" 
                name="autoDetectLanguage" 
                checked={config.autoDetectLanguage} 
                onChange={handleChange}
                onFocus={() => setFocusedField("autoDetectLanguage")}
              />
              <label className="ml-2">Auto Detect Language</label>
            </div>

            {/* Source Folder */}
            <label className="block mt-4">Source Folder:</label>
            <input
              type="text"
              name="source"
              value={config.source}
              onChange={handleChange}
              onFocus={() => setFocusedField("source")}
              className={cn("w-full p-2 border rounded", errors.source && "border-red-500")}
            />
            {errors.source && <p className="text-red-500 text-sm">Source folder is required</p>}

            {/* Port Number */}
            <label className="block mt-4">Port Number:</label>
            <input
              type="number"
              name="port"
              value={config.port}
              onChange={handleChange}
              onFocus={() => setFocusedField("port")}
              className={cn("w-full p-2 border rounded", errors.port && "border-red-500")}
            />
            {errors.port && <p className="text-red-500 text-sm">Port number is required</p>}

            {/* Locale Directory */}
            <label className="block mt-4">Locale Directory:</label>
            <input
              type="text"
              name="localeDir"
              value={config.localeDir}
              onChange={handleChange}
              onFocus={() => setFocusedField("localeDir")}
              className={cn("w-full p-2 border rounded", errors.localeDir && "border-red-500")}
            />
            {errors.localeDir && <p className="text-red-500 text-sm">Localization directory is required</p>}

            {/* Exclude Paths */}
            <label className="block mt-4">Exclude Paths (comma-separated):</label>
            <input 
              type="text" 
              name="excludePaths" 
              value={config.excludePaths.join(", ")} 
              onChange={handleArrayChange} 
              onFocus={() => setFocusedField("excludePaths")}
              className="w-full p-2 border rounded" 
            />
          </CardContent>
        )}
          <CardFooter>
            <Button onClick={() => handleSave(config, setErrors)} className="w-full">Save Changes</Button>
          </CardFooter>
        </Card>

        {/* Dynamic Description Panel */}
        <Card className="w-full md:w-1/3 p-4">
        
            <CardHeader>
                <CardTitle>{focusedField ? info[focusedField].title : ""}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600">
                    {focusedField ? info[focusedField].description : ""}
                </p>
            </CardContent>
        
        </Card>
      </div>
    </MainLayout>
  );
}
