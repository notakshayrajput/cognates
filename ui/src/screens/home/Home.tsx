import MainLayout from "../../layout/main-layout.css/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Settings, Globe } from "lucide-react";

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center">
      <div className="text-center mb-6 pb-10">
          <h1 className="text-2xl font-bold">Welcome to Cognates</h1>
          <p className="text-sm text-gray-600">Manage configurations and localizations easily with a simple and intuitive interface.</p>
        </div>
        <div className="flex space-x-4">
          {/* Configuration Card */}
          <Card className="w-64 flex flex-col items-center text-center">
            <CardHeader className="flex flex-col items-center">
              <Settings className="w-12 h-12" />
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Manage Cognates configuration file.</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/configure">Configure</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Localization Card */}
          <Card className="w-64 flex flex-col items-center text-center">
            <CardHeader className="flex flex-col items-center">
              <Globe className="w-12 h-12" />
              <CardTitle>Localization</CardTitle>
            </CardHeader>
            <CardContent>
            <CardDescription>Edit localization strings or add new keys.</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/localize">Edit</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
