import React, { useState, useEffect } from "react";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Badge } from "../Components/ui/badge";
import {
  DotsHorizontalIcon,
  CaretSortIcon,
  FileIcon,
  PlayIcon,
  PauseIcon,
  StopwatchIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { FiFilter } from "react-icons/fi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../Components/ui/table";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../Components/ui/dropdown-menu";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DropdownMenuDemo from "../Components/Filter/OperatorDataDropdown";
import { useDispatch, useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import { RootState } from "../State/store";

interface Data {
  connectionId: number;
  connectionName: string;
  type: string;
  status: string;
  updatedAt: string;
  recipients: number;
}

interface ContactList {
  list_id: number;
  file_name: string;
  status: string;
  update_at: Date;
  recipient: number;
  type: string;
}

const OperatorDataList: React.FC = () => {
  // States for API and dummy data (if needed)
  const [dataList, setDataList] = useState<Data[]>([]);
  // We'll use contactList from the API as our source of data for search/pagination
  const [contactList, setContactList] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [apiUrlOpAcc, setapiUrlAOpAcc] = useState("");
  const workspaceId = useSelector((state: RootState) => state.authentication.workspace_id);

  // States for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<ContactList[]>([]);
  const [currentContacts, setCurrentContacts] = useState<ContactList[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const totalPages: number = Math.ceil(filteredContacts.length / rowsPerPage);

  // Other states
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const [checkboxSelectedRows, setCheckboxSelectedRows] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [dateList, setDateList] = useState<string[]>([]);
  const dispatch = useDispatch();

  // New state to store sort configuration (if needed)
  const [sortKey, setSortKey] = useState<keyof Data | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Dummy data for testing (if needed)
  const dummyData: Data[] = [
    {
      connectionId: 1,
      connectionName: "Connection 1",
      type: "SFTP",
      status: "Updated",
      updatedAt: "2024-03-02T19:02:00Z",
      recipients: 124434,
    },
    {
      connectionId: 2,
      connectionName: "Connection 2",
      type: "SFTP",
      status: "Syncing...",
      updatedAt: "2024-03-02T19:02:00Z",
      recipients: 43545,
    },
    {
      connectionId: 3,
      connectionName: "Connection 3",
      type: "SFTP",
      status: "Updated",
      updatedAt: "2024-03-02T19:02:00Z",
      recipients: 32213,
    },
    {
      connectionId: 4,
      connectionName: "Connection 4",
      type: "SFTP",
      status: "Updated",
      updatedAt: "2024-03-02T19:02:00Z",
      recipients: 1434,
    },
    {
      connectionId: 5,
      connectionName: "Connection 5",
      type: "API",
      status: "Updated",
      updatedAt: "2024-03-02T19:02:00Z",
      recipients: 43654,
    },
  ];

  // (Optional) Load dummy data
  useEffect(() => {
    // For testing, you might load dummyData into dataList.
    setDataList(dummyData);
    setCurrentPage(1);
  }, []);

  // Fetch config for API URL
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setapiUrlAOpAcc(config.OperatorUrl);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };
    fetchConfig();
  }, []);

  // Once API URL is set, fetch operator contacts
  useEffect(() => {
    if (apiUrlOpAcc) {
      GetOperatorContactsListByWorkspaceId();
    }
  }, [apiUrlOpAcc]);

  const GetOperatorContactsListByWorkspaceId = async () => {
    try {
      const response = await axios.get(
        `${apiUrlOpAcc}/GetOperatorContactsListByWorkspaceId?WorkspaceId=${workspaceId}`
      );
      if (response.data.status === "Success") {
        console.log(response.data.contactList);
        setContactList(response.data.contactList);
        setHasData(response.data.contactList.length > 0);
      } else {
        console.log("Response: " + response.data.Status_Description);
        setHasData(false);
      }
    } catch (e) {
      console.log("Error fetching contacts: ", e);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Update date list whenever dataList changes (if needed)
  useEffect(() => {
    const uniqueDates = dataList.reduce(
      (acc: Record<string, string[]>, data) => {
        const date = data.updatedAt.split("T")[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(date);
        return acc;
      },
      {}
    );
    setDateList(Object.keys(uniqueDates));
  }, [dataList]);

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  // NEW SEARCH & PAGINATION LOGIC:
  // Filter contacts based on the search term using file_name
  useEffect(() => {
    const filtered = contactList.filter((item) =>
      searchTerm ? item.file_name.toLowerCase().includes(searchTerm.toLowerCase()) : true
    );
    setFilteredContacts(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [contactList, searchTerm]);

  // Paginate the filtered contacts
  useEffect(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginated = filteredContacts.slice(startIndex, startIndex + rowsPerPage);
    setCurrentContacts(paginated);
  }, [filteredContacts, currentPage, rowsPerPage]);

  // --- END SEARCH & PAGINATION LOGIC ---

  // Sorting function remains (if needed)
  const sortaudienceList = (tableHeader: string) => {
    let key: keyof Data;
    let type: "string" | "number" | "date" = "string";
    switch (tableHeader) {
      case "ByDataName":
        key = "connectionName";
        type = "string";
        break;
      case "ByDataType":
        key = "type";
        type = "string";
        break;
      case "ByDataStatus":
        key = "status";
        type = "string";
        break;
      case "ByDataUpdatedAt":
        key = "updatedAt";
        type = "date";
        break;
      case "ByDatarecipients":
        key = "recipients";
        type = "number";
        break;
      default:
        console.warn("Unknown table header");
        return;
    }

    // Toggle direction if sorting on the same key; otherwise, default to ascending.
    let direction: "asc" | "desc" = "asc";
    if (sortKey === key) {
      direction = sortDirection === "asc" ? "desc" : "asc";
    }
    setSortKey(key);
    setSortDirection(direction);

    const sortedAudiences = [...dataList].sort((a, b) => {
      if (type === "number") {
        return direction === "asc"
          ? Number(a[key]) - Number(b[key])
          : Number(b[key]) - Number(a[key]);
      } else if (type === "date") {
        return direction === "asc"
          ? Date.parse(a[key] as string) - Date.parse(b[key] as string)
          : Date.parse(b[key] as string) - Date.parse(a[key] as string);
      } else {
        return direction === "asc"
          ? String(a[key]).localeCompare(String(b[key]))
          : String(b[key]).localeCompare(String(a[key]));
      }
    });
    setDataList(sortedAudiences);
  };

  const renderStatusIcon = (status: any) => {
    switch (status) {
      case "Syncing...":
        return <StopwatchIcon className="text-gray-500" />;
      case "Updated":
        return (
          <CheckIcon className="text-gray-500 rounded-full border border-gray-500" />
        );
      default:
        return null;
    }
  };

  const handleView = (audienceId: number) => {
    console.log(`View audience with ID: ${audienceId}`);
  };

  // Update handleSelectAll to work on the current paginated contacts
  const handleSelectAll = () => {
    if (isAllSelected) {
      setCheckboxSelectedRows([]);
    } else {
      const allIds = currentContacts.map((data) => data.list_id);
      setCheckboxSelectedRows(allIds);
    }
    setIsAllSelected(!isAllSelected);
  };

  // Pagination handler
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div>
      <ToastContainer />
      {isLoading ? (
        // Loading state
        <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="success" />
        </div>
      ) : hasData ? (
        // Data loaded and available (using paginated, filtered contacts)
        <div>
          <div className="fixed flex justify-end items-end right-0 top-[-15px] z-20 p-4">
            <Button disabled className="w-36 text-sm text-[#F8FAFC] font-medium h-[35px] mt-[10px]">
              Connect data
            </Button>
          </div>

          <div className="flex mt-2">
            <div>
              <Input
                placeholder="Search data by connection..."
                className="w-[350px] text-[14px] font-normal text-[#64748B]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

          </div>

          <div className="rounded-md border">
            <div className="max-h-[60vh] overflow-y-auto">
              <Table
                className="rounded-xl whitespace-nowrap border-gray-200"
                style={{ color: "#020202", fontSize: "15px" }}
              >
                <TableHeader className="text-center text-[14px] font-medium">
                  <TableRow className="sticky top-0 bg-white z-10">
                    <TableHead>
                      <div className="flex items-center gap-6 justify-start cursor-pointer">
                        <input
                          type="checkbox"
                          className={`text-muted-foreground ${
                            isAllSelected ? "accent-gray-700 bg-grey-700 text-red-500" : ""
                          }`}
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                        />
                        Connection{" "}
                        <CaretSortIcon
                          onClick={() => sortaudienceList("ByDataName")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead style={{ width: "15%" }} className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Type{" "}
                        <CaretSortIcon
                          onClick={() => sortaudienceList("ByDataType")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead style={{ width: "15%" }} className="text-left">
                      <div className="flex items-center gap-2 justify-start">
                        Status{" "}
                        <CaretSortIcon
                          onClick={() => sortaudienceList("ByDataStatus")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead style={{ width: "20%" }}>
                      <div className="flex items-center gap-2 justify-start">
                        Updated at{" "}
                        <CaretSortIcon
                          onClick={() => sortaudienceList("ByDataUpdatedAt")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead style={{ width: "10%" }}>
                      <div className="flex items-center gap-2 justify-center">
                        Recipients{" "}
                        <CaretSortIcon
                          onClick={() => sortaudienceList("ByDatarecipients")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left"></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                  {currentContacts.map((data) => (
                    <TableRow key={data.list_id}>
                      <TableCell className="flex justify-start py-4 text-green-900">
                        <div className="flex items-center gap-6">
                          <input
                            type="checkbox"
                            className={`accent-gray-700 bg-grey-700 text-red-500 ${
                              isAllSelected ? "accent-gray-700 bg-grey-700 text-red-500" : ""
                            }`}
                            checked={checkboxSelectedRows.includes(data.list_id)}
                            //onChange={() => handleCheckboxRowSelect(data.list_id)}
                          />
                          <span
                            style={{
                              color: "#020617",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            {data.file_name}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell style={{ width: "15%" }} className="py-4">
                        <span
                          style={{
                            color: "#020617",
                            fontSize: "14px",
                            fontWeight: "400",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {data.type}
                        </span>
                      </TableCell>

                      <TableCell style={{ width: "15%" }} className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="flex-shrink-0">{renderStatusIcon(data.status)}</span>
                          <span
                            style={{
                              color: "#020617",
                              fontSize: "14px",
                              fontWeight: "400",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {data.status}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell style={{ width: "20%" }} className="py-4">
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              color: "#020617",
                              fontSize: "14px",
                              fontWeight: "400",
                            }}
                          >
                            {new Date(data.update_at).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}{" "}
                            ∙{" "}
                            {new Date(data.update_at).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell style={{ width: "10%" }} className="py-4 text-right">
                        <span
                          style={{
                            color: "#020617",
                            fontSize: "14px",
                            fontWeight: "400",
                          }}
                        >
                          {data.recipient.toLocaleString()}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 pr-4 flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <DotsHorizontalIcon
                              style={{ color: "#020617" }}
                              onClick={() => handleMenuToggle(data.list_id)}
                              className="cursor-pointer w-5 h-5"
                            />
                          </DropdownMenuTrigger>
                          {openMenuRowId === data.list_id && (
                            <DropdownMenuContent className="w-48 h-auto">
                              <DropdownMenuItem onClick={() => handleView(data.list_id)}>
                                View
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          )}
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <span>{`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                currentPage * rowsPerPage,
                filteredContacts.length
              )} of ${filteredContacts.length} row(s) selected`}</span>
            </div>

            <div className="flex items-center space-x-4 font-medium text-sm">
              <span className="text-[#020617] font-medium text-[14px]">Rows per page</span>
              <div className="relative inline-block ml-2">
                <select
                  className="cursor-pointer border border-gray-300 rounded-md px-2 py-1 appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  style={{
                    width: "60px",
                    height: "30px",
                    textAlign: "left",
                    fontSize: "12px",
                    fontWeight: "400",
                    borderColor: "#E5E7EB",
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
                  }}
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[5, 10, 20].map((num) => (
                    <option className="text-[12px] font-normal" key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <CaretSortIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 w-4 h-4" />
              </div>

              <div className="ml-4 mr-4">
                <span className="text-[#020617] text-[14px] font-medium">{`Page ${currentPage} of ${totalPages}`}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                    currentPage === 1 ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-200"
                  }`}
                  onClick={() => handlePageChange(1)}
                >
                  «
                </button>
                <button
                  disabled={currentPage === 1}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                    currentPage === 1 ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-200"
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ‹
                </button>
                <button
                  disabled={currentPage === totalPages}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                    currentPage === totalPages ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-200"
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  ›
                </button>
                <button
                  disabled={currentPage === totalPages}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                    currentPage === totalPages ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-200"
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
        // Empty state if not loading and no data available
        <div className="flex flex-col items-center justify-center h-[500px]">
          <h2 className="text-[24px] font-bold mb-1 text-[#000000]">
            Here you will see all your Data lists
          </h2>
        </div>
      )}
    </div>
  );
};

export default OperatorDataList;
