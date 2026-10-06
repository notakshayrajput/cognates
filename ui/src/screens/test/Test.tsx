import LocalizeLayout from "../../layout/localize-layout/LocalizeLayout";
import DataGridWrapper from "@/components/dataGrid/DataGridWrapper";

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
  const defaultCulture = "en";


  const handleUpdate = (culture:string,updatedData: Record<string, any>,defaultCulture:string, updatedDefaultData: Record<string, any>) => {
    
    console.log('Updated Grid Data:',culture, updatedData);
    console.log('Updated Default Culture Data:',defaultCulture, updatedDefaultData);
  };

  return (
    <LocalizeLayout>
      <DataGridWrapper
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
