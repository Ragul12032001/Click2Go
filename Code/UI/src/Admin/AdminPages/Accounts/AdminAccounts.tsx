import React, { useState, useEffect } from "react";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { Badge } from "../../../Components/ui/badge";
import { DotsHorizontalIcon, CaretSortIcon } from "@radix-ui/react-icons";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../Components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../../../Components/ui/breadcrumb";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../Components/ui/use-toast";
import { Toaster } from "../../../Components/ui/toaster";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../Components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "../../../Components/ui/dialog";

import {
  PlayIcon,
  PauseIcon,
  StopwatchIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { Skeleton } from "../../../Components/ui/skeleton";
import DropdownMenuDemo from "../../../Components/Filter/AccountsDropdown";
import { useDispatch, useSelector } from "react-redux";
import { UseSelector } from "react-redux";
import {
  setworkspace,
  setWorkspaceId,
  setmail,
  setAccountId,
} from "../../../State/slices/AuthenticationSlice";
import { SetImpersonator } from "../../../State/slices/AdminSlice";
import {
  setCreateBreadCrumb,
  setPermissions,
  setUser_Role_Name,
} from "../../../State/slices/AdvertiserAccountSlice";
import PersonalInfoPopup from "./PersonalInfoPopUp";
import { RootState } from "@/src/State/store";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import { Card } from "../../../Components/ui/card";

interface Account {
  accountId: number;
  name: string;
  email: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

type AccountCheck = {
  accountId: number;
  name: string;
};

interface ServerData {
  id: number;
  name: string;
}

interface ConnectionData {
  id: number;
  name: string;
}

interface DropdownRow {
  id: number;
  server: string;
  database: string;
  table: string;
  availableDatabases: { id: number; name: string }[]; // Explicit type for availableDatabases
  availableShortcodes: string[];
}

//
const Accounts: React.FC = () => {
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);

  const [accountList, setAccountList] = useState<Account[]>([]);
  const emailId = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  const apiUrlAdvAcc = useSelector(
    (state: RootState) => state.authentication.apiURL
  );
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const workspaceName = useSelector(
    (state: RootState) => state.authentication.workspaceName
  );
  const ImpersonatorData = useSelector(
    (state: RootState) => state.admin.Impersonator
  );
  const navigate = useNavigate();

  const [isSorted, setIsSorted] = useState(false);
  const [originalAccounts, setOriginalAccounts] = useState(accountList);

  const [checkboxSelectedRows, setCheckboxSelectedRows] = useState<number[]>(
    []
  );
  const [isAllSelected, setIsAllSelected] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10); // Default 5 rows per page
  const [searchTerm, setSearchTerm] = useState("");
  const [apiUrlAdminAcc, setapiUrlAdminAcc] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFullScreen, setIsLoadingFullScreen] = useState(false);

  //For the Pop Up Operation
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number>(0);
  const [selectedAccountEmail, setSelectedAccountEmail] = useState<string>("");
  const [selectedAccountType, setSelectedAccountType] = useState<string>("");

  //Tamil
  const [isAlertOpen, setIsAlertOpen] = useState(false); // State to control dialog visibility
  const [openDialog2, setOpenDialog2] = useState(false);

  const [delete_wid, setdelete_wid] = useState<number>(0);
  const [delete_personalemail, setdelete_personalemail] = useState<string>("");
  const [shortcode_wid, setShortCodeWid] = useState<number>(0);

  const [selected_type, setSelected_type] = useState<number>(0);
  const roleId = useSelector(
    (state: RootState) => state.authentication.role_id
  );
  const CurrentAID = useSelector(
    (state: RootState) => state.authentication.account_id
  );

  //Tamil
  const [serverData, setServerData] = useState<ServerData[]>([]);
  const [databaseData, setDatabaseData] = useState<ConnectionData[]>([]);
  const [serverId, setServerId] = useState<number>(0);
  const [connectionId, setConnectionId] = useState<number>(0);
  const [shortcodedata, setShortCodeData] = useState<string[]>([]);

  const toast = useToast();

  const [filterData, setFilterData] = useState({
    filter: "All Accounts",
    value: 0,
  });

  const [hasAccounts, setHasAccounts] = useState(false);
  const dispatch = useDispatch();
  const impersonation = useSelector(
    (state: RootState) => state.admin.Impersonator?.ImpersonationState
  );


  useEffect(() => {
    if (openDialog2 === false) {
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 500);
    }
  }, [openDialog2]);

  useEffect(() => {
    const impersonatedEmail = sessionStorage.getItem("impersonatedEmail");
    if (impersonatedEmail) {
      dispatch(setmail(impersonatedEmail));
      console.log("Dispatched setmail with:", impersonatedEmail);  // Set impersonated email in Redux
    }
  }, []);

  const handleCheckboxRowSelect = (id: number) => {
    setCheckboxSelectedRows((prev) => {
      const newSelectedRows = prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id];
      setIsAllSelected(newSelectedRows.length === currentAccounts.length);
      return newSelectedRows;
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setCheckboxSelectedRows([]);
    } else {
      const allIds = currentAccounts.map((account) => account.accountId);
      setCheckboxSelectedRows(allIds);
    }
    setIsAllSelected(!isAllSelected);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/config.json");
        const config = await response.json();
        setapiUrlAdminAcc(config.ApiUrlAdminAcc);
        setApiUrl(config.API_URL);

        console.log("apiUrlAdminAcc:", apiUrlAdminAcc);
      } catch (error) {
        console.error("Error loading config:", error);
      }

      console.log("Impersonate data :" + roleId);
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (apiUrlAdminAcc) {
      getAccountList();
    }
  }, [apiUrlAdminAcc]); // Runs when apiUrlAdminAcc is updated

  // Step 1: Apply filtering first
  const filteredAccounts = accountList.filter((account) => {
    if (filterData.filter === "All Accounts") return true;
    return account.type === filterData.filter;
  });

  // Step 2: Apply search on the filtered results
  const searchedAccounts = filteredAccounts.filter((account) => {
    return searchTerm
      ? account.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
  });

  // Step 3: Calculate new total pages after filtering & searching
  const totalPages: number = Math.ceil(searchedAccounts.length / rowsPerPage);

  // Step 4: Ensure currentPage is within bounds after filtering or searching
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1); // Stay on the last valid page
    }
  }, [searchedAccounts, totalPages]);

  // Step 5: Apply pagination to get the final list
  const currentAccounts = searchedAccounts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Function to handle the actual delete after confirmation

  useEffect(() => {
    console.log("filter data: " + filterData.filter + " " + filterData.value);
  }, [filterData]);

  const GetWorkspaceDetailsByPersonalId = async (
    accountId: Number,
    mode: string
  ) => {
    try {
      const response = await axios.get(
        `${apiUrlAdminAcc}/GetWorkspaceDetailsByPersonalId?accountId=${accountId}&mode=${mode}`
      );
      if (response.data.status === "Success") {
        return {
          wId: response.data.workspaceData[0].workspaceId,
          wName: response.data.workspaceData[0].workspaceName,
          rId: response.data.workspaceData[0].roleId,
          aid: response.data.workspaceData[0].accountId,
        };
      } else {
        console.error("Error in getting user workspace details");
        return { wId: null, wName: null };
      }
    } catch (error) {
      console.error("user workspace details not found due to: ", error);
    }
  };

  const getAccountList = async (currentFilterData = filterData, newPage = currentPage) => {
    setIsLoading(true);
    try {
      console.log("AccountGet");
      const response = await axios.get(`${apiUrlAdminAcc}/GetAccountList`);
      console.log("Response : ", response.data.accountList);
      if (response.data && response.data.accountList) {

        setAccountList(response.data.accountList);
        setIsLoading(false);

        setFilterData(currentFilterData);
        setCurrentPage(newPage);
        console.log("account List : ", response.data.accountList);
      } else {
        console.log("No account list available in response.");
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      // Handle error if API call fails
      console.error("Error fetching account list:", error);
    } finally {
      // Ensure the menu is closed after fetching data
    }
  };

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  const sortAccountList = (tableHeader: string) => {
    const sortByField = (
      field: keyof Account,
      type: "string" | "number" | "date" = "string"
    ) => {
      const sortedAccounts = [...accountList].sort((a, b) => {
        if (type === "number") {
          return Number(a[field]) - Number(b[field]);
        } else if (type === "date") {
          return (
            Date.parse(a[field] as string) - Date.parse(b[field] as string)
          );
        } else {
          return String(a[field]).localeCompare(String(b[field]));
        }
      });
      setOriginalAccounts(accountList);
      setAccountList(sortedAccounts);
    };

    if (isSorted) {
      setAccountList(originalAccounts);
    } else {
      switch (tableHeader) {
        case "ByAccountName":
          sortByField("name", "string");
          break;
        case "ByAccountEmail":
          sortByField("email", "string");
          break;
        case "ByAccountType":
          sortByField("type", "string");
          break;
        case "ByAccountCreatedAt":
          sortByField("createdAt", "date"); // Sorting by start date
          break;
        case "ByAccountUpdatedAt":
          sortByField("updatedAt", "date"); // Sorting by start date
          break;

        default:
          console.warn("Unknown table header");
      }
    }

    setIsSorted(!isSorted);
  };

  useEffect(() => {
    setHasAccounts(accountList.length > 0);
  }, [accountList]);

  useEffect(() => {
    if (openDialog2) {
      ShortCodeMapperDetails(Number(""), Number(""));
    }
  }, [openDialog2]);

  const GetPersonalInfo = async (accountEmail: string) => {
    debugger;
    try {
      console.log("Fetching Personal Info...");
      const response = await axios.post(
        `${apiUrlAdvAcc}/GetPersonalinfoByEmail`,
        {
          UserEmail: accountEmail,
        }
      );

      if (
        response.data.status === "Success" &&
        response.data.personalInfoList.length > 0
      ) {
        const user = response.data.personalInfoList[0];
        if (user.workspace_type) {
          if (user.workspace_type === "Telecom Operator") {
            handleTelcoDeleteClick(accountEmail);
          }
          else {
            setdelete_personalemail(accountEmail);
            setSelected_type(1);
            setIsAlertOpen(true);
          }
        }
      } else {
        console.log("No personal info found for the given email.");
      }

    } catch (error) {
      console.error("Error fetching personal info:", error);
    }
  };

  const handleView = (accountId: number, accountEmail: string, accountType: string) => {
    console.log(`View account with ID: ${accountId}`);
    console.log("Account Type", accountType);
    setSelectedAccountId(accountId);
    setSelectedAccountEmail(accountEmail);
    setSelectedAccountType(accountType);
    setIsPopupOpen(true);
  };

  const handleImpersonate = async (
    accountId: number,
    accountEmail: string,
    accountType: string
  ) => {
    setIsLoadingFullScreen(true);
    //console.log(Impersonating account with ID: ${accountId});
    let mode = accountType;
    if (accountType !== "Personal") {
      mode = "Workspace";
    }
    const response = await GetWorkspaceDetailsByPersonalId(accountId, mode);
    console.log("Im Account ID : ", response?.aid);
    console.log("CURRENT AID :", CurrentAID);
    const Impersonator = {
      ImpersonationState: true,
      ImpersonatorEmail: emailId,
      ImpersonatorWName: workspaceName,
      ImpersonatorWID: workspaceId,
      ImpersonatorRID: roleId,
      ImpersonatorAID: CurrentAID,
    };

    console.log("Role ID: ", roleId);
    console.log("Role ID: ", Impersonator.ImpersonatorRID);
    if (response?.wId != null && response?.wName != null) {
      dispatch(SetImpersonator(Impersonator));
      sessionStorage.setItem("impersonatedEmail", accountEmail);
      dispatch(setmail(accountEmail));
      console.log("Dispatched setmail with:", accountEmail);
      dispatch(setworkspace(response.wName));
      dispatch(setWorkspaceId(response.wId));
      dispatch(setAccountId(response.aid));

      const response2 = await axios.get(
        `${apiUrl}/GetPermissionsByRoleId?RoleID=${response.rId}`
      );
      if (response2.data.status === "Success") {
        const permissions = JSON.parse(response2.data.roleDetails.permissions);
        const role_name = response2.data.roleDetails.roleName;
        dispatch(setPermissions(permissions));
        dispatch(setUser_Role_Name(role_name));
        if (response.rId >= 11) {
          navigate("/operatorNavbar/dashboard", {
            state: { path: response.wName },
          });
        } else {
          navigate("/navbar/dashboard", { state: { path: response.wName } });
        }
      } else {
        setIsLoadingFullScreen(false);
        toast.toast({
          title: "Error",
          description: "Something went wrong, please try again",
        });
        console.log("GetPermissionsByRoleId API error");
      }
      console.log("dispatched workspace details...redirecting...");
    } else {
      setIsLoadingFullScreen(false);
      toast.toast({
        title: "Failure",
        description: "Something went wrong, please try again",
      });
      console.error("error dispatching workspace details");
    }
  };

  const [dropdownRows, setDropdownRows] = useState<DropdownRow[]>([
    {
      id: Date.now(),
      server: "",
      database: "",
      table: "",
      availableDatabases: [],
      availableShortcodes: [],
    },
  ]);

  const [rows, setRows] = useState([
    {
      id: 1,
      selectedServer: "",
      databases: [],
      selectedDatabase: "",
      shortcodes: [],
      selectedShortcode: "",
    },
  ]);

  const handleServerChange = (rowId: number, serverId: string) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId
          ? {
            ...row,
            selectedServer: serverId,
            selectedDatabase: "",
            shortcodes: [],
          }
          : row
      )
    );
    // Fetch databases for the selected server
    fetchDatabases(Number(serverId), rowId);
  };

  // Function to fetch databases for a specific server
  const fetchDatabases = async (serverId: number, rowId: number) => {
    try {
      const response = await axios.get(
        `${apiUrlAdminAcc}/GetShortCodeMapper?ServerId=${serverId}&ConnectionId=${connectionId === 0 ? "" : connectionId}`
      );
      const databases = response.data.data || [];

      setDropdownRows((prevRows) =>
        prevRows.map((row) =>
          row.id === rowId
            ? {
              ...row,
              availableDatabases: databases,
              database: "",
              table: "",
              availableShortcodes: [],
            }
            : row
        )
      );
    } catch (error) {
      console.error("Error fetching databases:", error);
    }
  };

  // Function to fetch shortcodes for a specific database
  const fetchShortcodes = async (
    serverId: number,
    connectionId: number,
    rowId: number
  ) => {
    try {
      const response = await axios.get(
        `${apiUrlAdminAcc}/GetShortCodeMapper?ServerId=${serverId}&ConnectionId=${connectionId}`
      );
      const shortcodes = response.data.data?.[0]?.shortCodes
        ? JSON.parse(response.data.data[0].shortCodes)
        : [];

      setDropdownRows((prevRows) =>
        prevRows.map((row) =>
          row.id === rowId
            ? { ...row, availableShortcodes: shortcodes, table: "" }
            : row
        )
      );
    } catch (error) {
      console.error("Error fetching shortcodes:", error);
    }
  };

  const ShortCodeMapperDetails = async (
    serverId: number,
    connectionId: number
  ) => {
    try {
      console.log("ServerID :", serverId, "ConnectionId :", connectionId);
      const response = await axios.get(
        `${apiUrlAdminAcc}/GetShortCodeMapper?ServerId=${serverId === 0 ? "" : serverId
        }&ConnectionId=${connectionId === 0 ? "" : connectionId}`
      );
      console.log("Data :", response.data.data);
      if (serverId === 0) {
        setServerData(response.data.data);
      } else if (serverId !== 0 && connectionId === 0) {
        setDatabaseData(response.data.data);
      } else {
        const shortcodes = JSON.parse(response.data.data[0].shortCodes);
        console.log("ShortCode Data :", shortcodes);
        setShortCodeData(shortcodes);
      }
    } catch (e) {
      console.log("Error :", e);
    }
  };

  // Add a new row
  const addRow = () => {
    setDropdownRows([
      ...dropdownRows,
      {
        id: Date.now(),
        server: "",
        database: "",
        table: "",
        availableDatabases: [],
        availableShortcodes: [],
      },
    ]);
  };

  // Remove a row
  const removeRow = (id: number) => {
    setDropdownRows(dropdownRows.filter((row) => row.id !== id));
  };

  // Handle dropdown value change
  const handleValueChange = (id: number, field: string, value: string) => {
    setDropdownRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          if (field === "server") {
            fetchDatabases(Number(value), id);
            return {
              ...row,
              server: value,
              database: "",
              table: "",
              availableDatabases: [],
              availableShortcodes: [],
            };
          } else if (field === "database") {
            fetchShortcodes(Number(row.server), Number(value), id);
            return {
              ...row,
              database: value,
              table: "",
              availableShortcodes: [],
            };
          } else {
            return { ...row, [field]: value };
          }
        }
        return row;
      })
    );
  };

  const handleGetConnectionValue = (ind: number) => {
    return dropdownRows[ind].database;
  };

  const handleShortCodeMappings = (accountId: number) => {
    console.log("WID :", accountId);
    setShortCodeWid(accountId);
    setOpenDialog2(true);
  };

  const UpdateShortCodeMapper = async (Data: string) => {
    try {
      const response = await axios.put(`${apiUrlAdminAcc}/UpdateShortCodeMapper`, {
        workspaceId: shortcode_wid,
        data: Data,
      });
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "ShortCode's updated successfully."
        })
      } else {
        console.log("Error :", response);
        toast.toast({
          title: "Failed",
          description: "Failed to update."
        })
      }
    } catch (e) {
      console.log("Error :", e);
      toast.toast({
        title: "Error Occurred",
        description: "An unexpected error occurred. Please try again later."
      });
    }
  }

  const handleShortCodeMappingsSubmit = () => {
    console.log("Entire Data:", dropdownRows);
    console.log("row data:", dropdownRows[0].database);
    //
    let pipeSeparatedFinalValue = dropdownRows.map(
      (data) => `${data.server}|${data.database}|${data.table}`
    );

    console.log("Final Value:", JSON.stringify(pipeSeparatedFinalValue, null, 2));

    UpdateShortCodeMapper(JSON.stringify(pipeSeparatedFinalValue, null, 2))
    setOpenDialog2(false);
    setDropdownRows([
      {
        id: Date.now(),
        server: "",
        database: "",
        table: "",
        availableDatabases: [],
        availableShortcodes: [],
      },
    ]);
  };

  useEffect(() => {
    if (!openDialog2) {
      setDropdownRows([
        {
          id: Date.now(),
          server: "",
          database: "",
          table: "",
          availableDatabases: [],
          availableShortcodes: [],
        },
      ]);
    }
  }, [openDialog2]);

  //Personal Account Delete
  const handlePersonalDeleteClick = (accountEmail: string) => {
    debugger;
    console.log(`Deleting Personal Account : ${accountEmail}`);
    GetPersonalInfo(accountEmail);

  };

  //Adv Account Delete
  const handleAdvDeleteClick = (accountId: number) => {
    console.log(`Deleting Workspace Account : ${accountId}`);
    setdelete_wid(accountId);
    setSelected_type(2);
    setIsAlertOpen(true); // Open the alert dialog
  };

  //Telco Account Delete
  const handleTelcoDeleteClick = (accountEmail: string) => {
    console.log(`Deleting account with ID: ${accountEmail}`);
    setdelete_personalemail(accountEmail);
    setSelected_type(3);
    setIsAlertOpen(true); // Open the alert dialog
  };

  const handleClose = () => {
    setIsAlertOpen(false);
    setSelected_type(0);
  };

  const confirmDelete = async () => {
    let isDeleted = false;
    if (selected_type === 1) {
      try {
        console.log(`Deleting Personal Account: ${delete_personalemail}`);

        // Indicate loading state
        setIsLoading(true);

        // Make the API call
        const response = await axios.get(
          `${apiUrlAdvAcc}/DeleteAccountByEmail?email=${delete_personalemail}`
        );
        const statusDescription = response.data.status_Description;

        if (response.status === 200) {
          // Check if the response has the expected status and description
          setIsAlertOpen(false);
          if (
            statusDescription ===
            "User is an invited member. Status updated to Inactive."
          )
            toast.toast({
              title: "Success",
              description: "Account Deleted Successfully",
            });
          else if (
            statusDescription === "Your account has been marked as Inactive."
          )
            toast.toast({
              title: "Success",
              description: "Account Deleted Successfully",
            });
          else if (
            statusDescription ===
            "Validation failed: You have active invited members in your workspace(s). Account deletion is not accepted"
          )
            toast.toast({
              title: "Access Denied",
              description:
                "They have active invited members in their workspace(s). Account deletion is not accepted",
            });
          else {
            toast.toast({
              title: "Error",
              description: "Something went wrong, please try again.",
            });
          }

        } else {
          toast.toast({
            title: "Error",
            description: "Something went wrong, please try again.",
          });
        }
      } catch (error) {
        // Handle errors
        toast.toast({
          title: "Error",
          description: "Something went wrong, please try again.",
        });
        console.error("Error deleting personal:", error);
      } finally {
        // Reset loading state and refresh the account list
        setSelected_type(1);
        setFilterData({ filter: "All Accounts", value: 0 });
        getAccountList({ filter: "All Accounts", value: 1 });
        setIsLoading(false);
      }
    } else if (selected_type === 2) {
      try {
        console.log(`Deleting Workspace Account: ${delete_wid}`);

        // Indicate loading state
        setIsLoading(true);

        // Make the API call
        const response = await axios.get(
          `${apiUrlAdvAcc}/deleteworkspce?workspaceid=${delete_wid}`
        );

        // Check if the response has the expected status and description
        if (response.data.status === "Success") {
          setIsAlertOpen(false);
          toast.toast({
            title: "Success",
            description: "Account Deleted Successfully",
          });
        } else if (response.data.status === "Error") {
          setIsAlertOpen(false);
          toast.toast({
            title: "Failure",
            description:
              "There are other members in your workspace, so the workspace cannot be deleted.",
          });
        } else {
          setIsAlertOpen(false);
          toast.toast({
            title: "Error",
            description: "Something went wrong, please try again.",
          });
        }
      } catch (error) {
        // Handle errors
        setIsAlertOpen(false);
        toast.toast({
          title: "Error",
          description: "Something went wrong, please try again.",
        });
        console.error("Error deleting workspace:", error);
      } finally {
        // Reset loading state and refresh the account list
        setSelected_type(2);
        setFilterData({ filter: "All Accounts", value: 0 });
        getAccountList({ filter: "All Accounts", value: 1 });
        setIsLoading(false);
      }
    } else if (selected_type === 3) {
      try {
        console.log(`Deleting Operator Account: ${delete_personalemail}`);

        // Indicate loading state
        setIsLoading(true);

        // Make the API call
        const response = await axios.post(
          `${apiUrlAdvAcc}/DeleteOperatorAccount?email=${delete_personalemail}`
        );
        // Check if the response has the expected status and description
        if (response.data.status === "Success") {
          setIsAlertOpen(false);
          if (
            response.data.status_Description ===
            "Status updated to Inactive in all related tables"
          )
            toast.toast({
              title: "Success",
              description: "Account Deleted Successfully",
            });
          else if (
            response.data.status_Description ===
            "Validation failed: You have active invited members in your workspace(s). Account deletion is not accepted"
          )
            toast.toast({
              title: "Failure",
              description:
                "Access Denied ,  You have active invited members in your workspace(s). Account deletion is not accepted",
            });
        } else {
          toast.toast({
            title: "Error",
            description: "Something went wrong, please try again.",
          });
        }
        if (isDeleted) {
          // If only one item left on the current page, move to the previous page
          const remainingItems = currentAccounts.length - 1;
          const newPage = remainingItems === 0 && currentPage > 1 ? currentPage - 1 : currentPage;

          // ✅ Call getAccountList with current filter & page (preserve state)
          getAccountList(filterData, newPage);
        }

      } catch (error) {
        // Handle errors
        toast.toast({
          title: "Error",
          description: "Something went wrong, please try again.",
        });
        console.error("Error deleting operator:", error);
      } finally {
        // Reset loading state and refresh the account list
        setSelected_type(3);
        setFilterData({ filter: "All Accounts", value: 0 });
        getAccountList({ filter: "All Accounts", value: 1 });
        setIsLoading(false);
      }
    } else {
      setSelected_type(0);
      getAccountList();
    }
  };

  useEffect(() => {
    if (!isAlertOpen) {
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 500);
    }
  }, [isAlertOpen]);

  return (
    <Card className="w-full overflow-auto">

      <div className="p-4 ">
        <div>
          <h2 className="text-lg font-bold text-left">Accounts</h2>
          <p className="text-sm text-gray-600 text-left">
            List of Accounts
          </p>
          {/* <p className="p-2"></p> */}
        </div>
        <div>
          <Toaster />

          {isLoadingFullScreen && (
            <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center z-50">
              <CircularProgress className="text-primary" />
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-[500px]">
              <CircularProgress color="success" />
            </div>
          )}

          {!isLoading && hasAccounts ? (
            <div>
              {/* Existing table code here */}
              <div className="flex mt-2">
                <div className=" ">
                  <Input
                    placeholder="Search account by name..."
                    className="w-[250px] text-[14px] font-normal text-[#64748B]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className=" ">
                  {/* Filter Button */}
                  <DropdownMenuDemo setFilterData={setFilterData} />
                </div>
              </div>

              <div className="rounded-md border overflow-hidden -mt-2">
                <div className="max-h-[60vh] overflow-y-auto">
                  <Table
                    className="rounded-xl whitespace-nowrap border-gray-200"
                    style={{ color: "#020202", fontSize: "15px" }}
                  >
                    <TableHeader className="text-center text-[14px] font-medium">
                      <TableRow className="sticky top-0 bg-white z-10 hover:bg-white">
                        <TableHead>
                          <div className="flex items-center justify-start cursor-pointer">
                            {/* <input
                          type="checkbox"
                          className={`text-muted-foreground ${
                            isAllSelected
                              ? "accent-gray-700 bg-grey-700 text-red-500"
                              : ""
                          }`}
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                        /> */}
                            <span className="font-medium text-[14px] text-[#64748B]">
                              Name{" "}
                            </span>
                            <CaretSortIcon
                              onClick={() => sortAccountList("ByAccountName")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>

                        <TableHead style={{ width: "20%" }}>
                          <div className="flex items-center  justify-start">
                            <span className="font-medium text-[14px] text-[#64748B]">
                              Email{" "}
                            </span>
                            <CaretSortIcon
                              onClick={() => sortAccountList("ByAccountEmail")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>

                        <TableHead style={{ width: "20%" }}>
                          <div className="flex items-center justify-start">
                            <span className="font-medium text-[14px] text-[#64748B]">
                              Type{" "}
                            </span>
                            <CaretSortIcon
                              onClick={() => sortAccountList("ByAccountType")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>

                        <TableHead style={{ width: "20%" }}>
                          <div className="flex items-center  justify-start">
                            <span className="font-medium text-[14px] text-[#64748B]">
                              Created at{" "}
                            </span>
                            <CaretSortIcon
                              onClick={() => sortAccountList("ByAccountCreatedAt")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>

                        <TableHead style={{ width: "20%" }}>
                          <div className="flex items-center  justify-start">
                            <span className="font-medium text-[14px] text-[#64748B]">
                              Updated at{" "}
                            </span>
                            <CaretSortIcon
                              onClick={() => sortAccountList("ByAccountUpdatedAt")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>

                        <TableHead className="text-left"></TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                      {currentAccounts.map((account) => {
                        let isSelected;
                        accountList.map((accounts) => {
                          isSelected = checkboxSelectedRows.includes(
                            accounts.accountId
                          );
                        });

                        return (
                          <TableRow
                            key={account.accountId}
                            className={`${isSelected ? "bg-gray-200" : ""}`}
                          >
                            <TableCell className="flex justify-start text-green-900">
                              <div className="flex items-center gap-6">
                                {/* <input
                              type="checkbox"
                              className={`accent-gray-700 bg-grey-700 text-red-500 ${
                                isAllSelected
                                  ? "accent-gray-700 bg-grey-700 text-red-500"
                                  : ""
                              }`}
                              checked={checkboxSelectedRows.includes(
                                account.accountId
                              )}
                              onChange={() =>
                                handleCheckboxRowSelect(account.accountId)
                              }
                            /> */}
                                <span
                                  style={{
                                    color: "#020617",
                                    fontSize: "14px",
                                    fontWeight: "400",
                                  }}
                                >
                                  {account.name}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell style={{ width: "20%" }} className="">
                              <span
                                style={{
                                  color: "#020617",
                                  fontSize: "14px",
                                  fontWeight: "400",
                                }}
                              >
                                {account.email}
                              </span>
                            </TableCell>

                            <TableCell style={{ width: "20%" }} className="">
                              <span
                                style={{
                                  color: "#020617",
                                  fontSize: "14px",
                                  fontWeight: "400",
                                }}
                              >
                                {account.type}
                              </span>
                            </TableCell>

                            <TableCell
                              style={{ width: "20%" }}
                              className="text-left"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  style={{
                                    color: "#020617",
                                    fontSize: "14px",
                                    fontWeight: "400",
                                  }}
                                >
                                  {new Date(account.createdAt).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    }
                                  )}{" "}
                                  ∙{" "}
                                  {new Date(account.createdAt).toLocaleTimeString(
                                    "en-GB",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell
                              style={{ width: "20%" }}
                              className="text-left"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  style={{
                                    color: "#020617",
                                    fontSize: "14px",
                                    fontWeight: "400",
                                  }}
                                >
                                  {new Date(account.updatedAt).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    }
                                  )}{" "}
                                  ∙{" "}
                                  {new Date(account.updatedAt).toLocaleTimeString(
                                    "en-GB",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className=" flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  {account.email !== emailId && (
                                    <DotsHorizontalIcon
                                      style={{ color: "#020617" }}
                                      onClick={() =>
                                        handleMenuToggle(account.accountId)
                                      } // Call the original function
                                      className="cursor-pointer w-5 h-5"
                                      aria-disabled={account.email === emailId} // Optional for accessibility
                                    />
                                  )}
                                </DropdownMenuTrigger>
                                {openMenuRowId === account.accountId && (
                                  <DropdownMenuContent align="end" className="w-48">
                                    {account.type === "Personal" && (
                                      <>
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={() =>
                                            handleView(
                                              account.accountId,
                                              account.email,
                                              account.type
                                            )
                                          }
                                        >
                                          View
                                        </DropdownMenuItem>
                                        {!impersonation && (
                                          <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={() =>
                                              handleImpersonate(
                                                account.accountId,
                                                account.email,
                                                account.type
                                              )
                                            }
                                          >
                                            Impersonate
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={() =>
                                            handlePersonalDeleteClick(account.email)
                                          }
                                        >
                                          Delete Personal Account
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {account.type === "Advertiser" && (
                                      <>
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={() =>
                                            handleView(
                                              account.accountId,
                                              account.email,
                                              account.type
                                            )
                                          }
                                        >
                                          View
                                        </DropdownMenuItem>
                                        {!impersonation && (
                                          <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={() =>
                                              handleImpersonate(
                                                account.accountId,
                                                account.email,
                                                account.type
                                              )
                                            }
                                          >
                                            Impersonate
                                          </DropdownMenuItem>
                                        )}
                                        {/* <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() =>
                                        handleShortCodeMappings(
                                          account.accountId
                                        )
                                      }
                                    >
                                      ShortCode Mappings
                                    </DropdownMenuItem> */}
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={() =>
                                            handleAdvDeleteClick(account.accountId)
                                          }
                                        >
                                          Delete Advertiser Account
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {account.type === "Telecom Operator" && (
                                      <>
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={() =>
                                            handleView(
                                              account.accountId,
                                              account.email,
                                              account.type
                                            )
                                          }
                                        >
                                          View
                                        </DropdownMenuItem>
                                        {!impersonation && (
                                          <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={() =>
                                              handleImpersonate(
                                                account.accountId,
                                                account.email,
                                                account.type
                                              )
                                            }
                                          >
                                            Impersonate
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={() =>
                                            handleTelcoDeleteClick(account.email)
                                          }
                                        >
                                          Delete Telco Account
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                )}
                                <PersonalInfoPopup
                                  isOpen={isPopupOpen}
                                  onOpenChange={setIsPopupOpen}
                                  accountId={selectedAccountId}
                                  accountEmail={selectedAccountEmail}
                                  accountType={selectedAccountType}
                                />
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <DialogContent className="p-6 mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-18px font-semibold text-[#09090B]">
                      Delete Account
                    </DialogTitle>
                    <DialogDescription className="text-14px font-medium text-[#71717A] mt-2">
                      Are you sure you want to delete this account? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-4 flex-wrap">
                    <Button
                      className="px-4 py-2 w-auto"
                      variant="outline"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="px-4 py-2 w-auto bg-red-500 text-white hover:bg-red-600"
                      onClick={confirmDelete}
                    >
                      Delete
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={openDialog2} onOpenChange={setOpenDialog2}>
                <DialogContent className="p-4 max-h-[80vh] overflow-auto w-[90vw] max-w-[600px]">
                  <DialogHeader className="mt-4 ml-1">
                    <DialogTitle> ShortCode Mapper </DialogTitle>
                  </DialogHeader>
                  <div>
                    {dropdownRows.map((row, index) => (
                      <div
                        key={row.id}
                        className="flex justify-between items-center m-1 w-full gap-4 p-2"
                      >
                        {/* Server Selection */}
                        <div className="w-[135px]">
                          <Select
                            onValueChange={(value) =>
                              handleValueChange(row.id, "server", value)
                            }
                          >
                            <SelectTrigger className="border-gray-200">
                              <SelectValue placeholder="Provider" />
                            </SelectTrigger>
                            <SelectContent>
                              {serverData.map((server) => (
                                <SelectItem
                                  key={server.id}
                                  value={server.id.toString()}
                                  className="cursor-pointer"
                                >
                                  {server.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Database Selection */}
                        <div className="w-[150px]">
                          <Select
                            onValueChange={(value) =>
                              handleValueChange(row.id, "database", value)
                            }
                            disabled={!row.server}
                          >
                            <SelectTrigger className="border-gray-200">
                              <SelectValue placeholder="Connection" />
                            </SelectTrigger>
                            <SelectContent>
                              {row.availableDatabases.map((db) => (
                                <SelectItem
                                  key={db.id}
                                  value={db.id.toString()}
                                  className="cursor-pointer"
                                >
                                  {db.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Shortcode Selection */}
                        <div className="w-[130px]">
                          <Select
                            onValueChange={(value) =>
                              handleValueChange(row.id, "table", value)
                            }
                            disabled={!row.database}
                          >
                            <SelectTrigger className="border-gray-200">
                              <SelectValue placeholder="ShortCode" />
                            </SelectTrigger>
                            <SelectContent>
                              {row.availableShortcodes.map((code) => (
                                <SelectItem
                                  key={code}
                                  value={code}
                                  className="cursor-pointer"
                                >
                                  {code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Remove Row Button */}
                        <div className="w-[5%] mr-2">
                          {dropdownRows.length > 1 && (
                            <button
                              onClick={() => removeRow(row.id)}
                              className="ml-2 text-red-500"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end w-auto">
                    <Button className="mt-4" variant="ghost" onClick={addRow}>
                      + Add Another Code
                    </Button>
                  </div>

                  <div className="flex justify-center items-center gap-4 mt-1 mb-4 w-full">
                    <Button
                      className="px-6 py-2 w-[40%]"
                      variant="outline"
                      onClick={() => setOpenDialog2(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="px-6 py-2 w-[40%] text-[#FAFAFA] bg-[#3A85F7]"
                      onClick={handleShortCodeMappingsSubmit}
                    >
                      Submit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Pagination controls */}
              <div className="flex justify-between items-center mt-4">
                {/* Row information */}
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <span>{`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                    currentPage * rowsPerPage,
                    accountList.length
                  )} of ${accountList.length} row(s) selected`}</span>
                </div>

                {/* Pagination controls */}
                <div className="flex items-center space-x-4 font-medium text-sm">
                  <span className="text-[#020617] font-medium text-[14px]">
                    Rows per page
                  </span>

                  {/* Rows per page dropdown */}
                  <div className="relative inline-block ml-2">
                    <select
                      className="cursor-pointer border border-gray-300 rounded-md px-2 py-1 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        width: "60px",
                        height: "30px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "400",
                        borderColor: "#E5E7EB",
                        boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)", // Adds slight shadow
                      }}
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Reset to first page after changing rows per page
                      }}
                    >
                      {[5, 10].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                    <CaretSortIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 w-4 h-4" />
                  </div>

                  {/* Page info */}
                  <div className="ml-4 mr-4">
                    <span className="text-[#020617] text-[14px] font-medium">{`Page ${currentPage} of ${totalPages}`}</span>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === 1
                          ? "cursor-not-allowed bg-gray-100"
                          : "hover:bg-gray-200"
                        }`}
                      onClick={() => handlePageChange(1)}
                    >
                      «
                    </button>
                    <button
                      disabled={currentPage === 1}
                      className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === 1
                          ? "cursor-not-allowed bg-gray-100"
                          : "hover:bg-gray-200"
                        }`}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      ‹
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === totalPages
                          ? "cursor-not-allowed bg-gray-100"
                          : "hover:bg-gray-200"
                        }`}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      ›
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${currentPage === totalPages
                          ? "cursor-not-allowed bg-gray-100"
                          : "hover:bg-gray-200"
                        }`}
                      onClick={() => handlePageChange(totalPages)}
                    >
                      »
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {isLoading && null}
              {!isLoading && (
                <div className="flex flex-col items-center justify-center h-[500px]">
                  <h2 className="text-[24px] font-semibold mb-1 text-[#000000]">
                    Here you will see all accounts
                  </h2>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Accounts;
