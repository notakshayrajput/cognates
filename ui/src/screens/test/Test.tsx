import LocalizeLayout from "../../layout/localize-layout/LocalizeLayout";
import DataGridWrapper from "@/components/dataGrid/DataGridWrapper";
import "@glideapps/glide-data-grid/dist/index.css";
import { useTheme } from "../../components/theme-provider/theme-provider";
import { useState } from "react";

const initialData = {
  btnSubmit: "Submit",
  btnCancel: "Cancel",
  btnDelete: "Delete",
  btnSave: "Save",
  btnLoadMore: "Load More",
  myComponent: {
    header1: "Component1",
    description: "This is a Component Description.",
    welcomeText: "Welcome, {0}!",
    Section1: {
      chartHeader: "Sales Data",
      chartFooter: "Year",
      filters: {
        dateRange: "Date Range",
        category: "Category",
        region: "Region",
      }
    },
    Section2: {
      userList: {
        title: "User List",
        columns: {
          name: "Name",
          email: "Email",
          status: "Status",
          actions: "Actions",
        },
        statusOptions: {
          active: "Active",
          inactive: "Inactive",
          pending: "Pending",
        },
      },
    },
  },
  settings: {
    general: {
      language: "Language",
      theme: "Theme",
      notifications: {
        enable: "Enable Notifications",
        disable: "Disable Notifications",
        email: "Email Notifications",
        push: "Push Notifications",
      },
    },
    privacy: {
      dataCollection: "Allow Data Collection",
      tracking: {
        enable: "Enable Tracking",
        disable: "Disable Tracking",
        explanation: "We use tracking to improve user experience.We use tracking to improve user experience.We use tracking to improve user experience.We use tracking to improve user experience.\n We use tracking to improve user experience.We use tracking to improve user experience.We use tracking to improve user experience.",
      },
    },
  },
};
const initialDataEN = JSON.parse(JSON.stringify(initialData));
const initialDataFR = {
  btnSubmit: "Soumettre",
  btnCancel: "Annuler",
  btnDelete: "Supprimer",
  btnSave: "Enregistrer",
  btnLoadMore: "Charger plus",
  myComponent: {
    header1: "Composant1",
    description: "Ceci est une description du composant.",
    welcomeText: "Bienvenue, {0} !",
    Section2: {
      userList: {
        title: "Liste des utilisateurs",
        columns: {
          name: "Nom",
          email: "E-mail",
          status: "Statut",
          actions: "Actions",
        },
        statusOptions: {
          active: "Actif",
        },
      },
    },
  },
  settings: {
    general: {
      language: "Langue",
      theme: "Thème",
      notifications: {
        enable: "Activer les notifications",
        disable: "Désactiver les notifications",
        email: "Notifications par e-mail",
        push: "Notifications push",
      },
    },
    privacy: {
      tracking: {
        explanation: "Nous utilisons le suivi pour améliorer l'expérience utilisateur.Nous utilisons le suivi pour améliorer l'expérience utilisateur.Nous utilisons le suivi pour améliorer l'expérience utilisateur.Nous utilisons le suivi pour améliorer l'expérience utilisateur.\nNous utilisons le suivi pour améliorer l'expérience utilisateur.",
      },
    },
  },
};

export default function Localize() {
  const { theme } = useTheme();
  const culture = "fr";
  const defaultCulture = "en";

  const lightTheme = {
    // bgCell: "oklch(0.98 0.00 106)", // Lightest background
    textDark: "oklch(0.15 0.00 49)", // Dark text
    textMedium: "oklch(0.37 0.01 68)", // Medium text
    textLight: "oklch(0.92 0.00 49)", // Light text
    headerBg: "oklch(0.87 0.00 56)", // Header background
    rowBg: "oklch(0.97 0.00 106)", // Row background
  };

  const darkTheme = {
    bgCell: "oklch(0.15 0.00 49)", // Darkest background
    textDark: "oklch(0.98 0.00 106)", // Light text
    textMedium: "oklch(0.55 0.01 58)", // Medium text
    textLight: "oklch(0.72 0.01 56)", // Light text
    headerBg: "oklch(0.22 0.01 56)", // Header background
    rowBg: "oklch(0.27 0.01 34)", // Row background
  };
  const appliedTheme = theme === "dark" ? darkTheme : lightTheme;

  const handleUpdate = (culture:string,updatedData: Record<string, any>,defaultCulture:string, updatedDefaultData: Record<string, any>) => {
    
    console.log('Updated Grid Data:',culture, updatedData);
    console.log('Updated Default Culture Data:',defaultCulture, updatedDefaultData);
  };

  return (
    <LocalizeLayout>
      <DataGridWrapper
        theme={appliedTheme}
        width={"100%"}
        height={"700px"}
        culture={"fr"}
        defaultCulture={defaultCulture}
        data={initialDataFR}
        defaultCultureData={initialData}
        onUpdate={handleUpdate}
      />
    </LocalizeLayout>
  );
}