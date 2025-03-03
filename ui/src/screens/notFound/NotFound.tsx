import { useEffect, useState } from "react";
import MainLayout from "@/layout/main-layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useNavigate} from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();
    const [cameFromSameSite, setCameFromSameSite] = useState(false);
    useEffect(() => {
        if (document.referrer && new URL(document.referrer).origin === window.location.origin) {
            setCameFromSameSite(true);
        }
    }, []);

    const handleGoBack = () => {
        if (cameFromSameSite) {
            navigate(-1); // Go back to the previous page
        } else {
            navigate("/"); // Redirect to home
        }
    };
    return (
        <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="text-6xl font-extrabold text-primary animate-bounce">
                404
            </h1>
            <h2 className="text-3xl font-bold mt-4">Oops! Page Not Found</h2>
            <p className="mt-2">
                The page you're looking for doesn't exist or has been moved.
            </p>

            <div className="mt-6">
                <Button className="px-6 py-3" onClick={handleGoBack}>
                    👈 Go Back
                </Button>
            </div>

            
        </div>
        </MainLayout>
    )
}
