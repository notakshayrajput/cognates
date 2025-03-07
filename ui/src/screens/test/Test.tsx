import React from "react";
import LocalizeLayout from "../../layout/localize-layout/LocalizeLayout";
import DataGridWrapper from "@/components/dataGrid/DataGridWrapper";
import "@glideapps/glide-data-grid/dist/index.css";
import { ICultureInfo } from "@/types";

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
        },
        dataPoints: {
          totalSales: "Total Sales",
          totalRevenue: "Total Revenue",
          growthPercentage: "{0}% Growth",
        },
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
          explanation: "We use tracking to improve user experience.",
        },
      },
    },
    dashboard: {
      analytics: {
        visitorStats: {
          totalVisitors: "Total Visitors",
          uniqueVisitors: "Unique Visitors",
          avgSession: "Avg. Session Duration",
        },
        trafficSources: {
          direct: "Direct",
          referral: "Referral",
          organicSearch: "Organic Search",
          paidAds: "Paid Ads",
        },
      },
      performance: {
        cpuUsage: "CPU Usage: {0}%",
        memoryUsage: "Memory Usage: {0}MB",
        diskSpace: "Disk Space: {0}GB used",
      },
    },
  };
  

export default function Localize() {
    const culture:ICultureInfo={
        code:"en",
        language:"English"
    }
    const defaultCulture:ICultureInfo={
        code:"en",
        language:"English"
    }
  return (
    <LocalizeLayout>
      <DataGridWrapper data={initialData} defaultCulture={defaultCulture} culture={culture} onUpdate={(updatedData) => console.log(updatedData)} />
    </LocalizeLayout>
  );
}
