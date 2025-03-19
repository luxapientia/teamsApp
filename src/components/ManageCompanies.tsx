import { Grid28Regular } from "@fluentui/react-icons";
import { useState } from "react";
import { Link } from "react-router-dom";
import CompaniesLicensesTable from "./CompaniesLicensesTable";
import CompaniesSuperUsersTable from "./CompaniesSuperUsersTable";
import CompaniesTable from "./CompaniesTable";

// Sample data for companies
const sampleCompanies = [
  { id: 1, name: "NAMIFICA", createdOn: "Mar 18th 2022", status: "Active", type: "license" },
  { id: 2, name: "Roads Authority", createdOn: "Oct 11th 2022", status: "Active", type: "superuser" },
  { id: 3, name: "City of Windhoek", createdOn: "Feb 13th 2023", status: "Active", type: "company" },
  { id: 4, name: "NAMIBIA", createdOn: "Mar 7th 2023", status: "Active", type: "license" },
  { id: 5, name: "ABC Demo", createdOn: "Apr 9th 2023", status: "Active", type: "superuser" },
];

// Sample data for companies
const sampleCompaniesLicenses = [
  { id: 1, name: "NAMIFICA", license_key: "00000", license_start_date: "Mar 18th 2022", license_end_date: "Mar 20th 2022", status: "Active" },
  { id: 2, name: "Roads Authority", license_key: "00000", license_start_date: "Oct 11th 2022", license_end_date: "Mar 20th 2022", status: "Active" },
  { id: 3, name: "City of Windhoek", license_key: "00000", license_start_date: "Feb 13th 2023", license_end_date: "Mar 20th 2022", status: "Active" },
  { id: 4, name: "NAMIBIA", license_key: "00000", license_start_date: "Mar 7th 2023", license_end_date: "Mar 20th 2022", status: "Active" },
  { id: 5, name: "ABC Demo", license_key: "00000", license_start_date: "Apr 9th 2023", license_end_date: "Mar 20th 2022", status: "Active" },
];

// Sample data for companies
const sampleCompaniesSuperUsers = [
  { id: 1, name: "NAMIFICA", surname: "Uushona", email: "abc@cs.com", company: "silicon", status: "Active" },
  { id: 2, name: "Roads Authority", surname: "Uushona", email: "abc@cs.com", company: "silicon", status: "Active" },
  { id: 3, name: "City of Windhoek", surname: "Uushona", email: "abc@cs.com", company: "silicon", status: "Active" },
  { id: 4, name: "NAMIBIA", surname: "Uushona", email: "abc@cs.com", company: "silicon", status: "Active" },
  { id: 5, name: "ABC Demo", surname: "Uushona", email: "abc@cs.com", company: "silicon", status: "Active" },
];

export function ManageCompanies() {
  const [companies] = useState(sampleCompanies);
  const [activeTab, setActiveTab] = useState("companies");


  return (
    <div className="flex flex-col h-screen">
      {/* Header section */}
      <div className="gradual-border p-2 bg-[#f3f2f1] flex items-center justify-start shadow-md">
        <Grid28Regular className="mr-2" />
        <span className="text-xl font-bold">Manage Companies</span>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 bg-white">
        {/* Tabs */}
        <div className="flex space-x-2 mb-4">
          <Link to="#" onClick={() => setActiveTab("licenses")} className="border rounded-full px-4 py-2 hover:bg-gray-200">
            Companies Licenses
          </Link>
          <Link to="#" onClick={() => setActiveTab("super-users")} className="border rounded-full px-4 py-2 hover:bg-gray-200">
            Companies Super Users
          </Link>
          <Link to="#" onClick={() => setActiveTab("companies")} className="border rounded-full px-4 py-2 hover:bg-gray-200">
            Companies
          </Link>
        </div>

        {/* Render the appropriate table based on the active tab */}
        {activeTab === "licenses" && <CompaniesLicensesTable companies_licenses={sampleCompaniesLicenses} />}
        {activeTab === "super-users" && <CompaniesSuperUsersTable super_users={sampleCompaniesSuperUsers} />}
        {activeTab === "companies" && <CompaniesTable companies={sampleCompanies} />}
      </div>
    </div>
  );
}