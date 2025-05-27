import React, { useState, useEffect } from "react";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Badge } from "../../Components/ui/badge";
import {
  DotsHorizontalIcon,
  CaretSortIcon,
  FileIcon,
} from "@radix-ui/react-icons";

import { FiFilter } from "react-icons/fi";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Components/ui/table";

import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../Components/ui/dropdown-menu";
import { StopwatchIcon, CheckIcon } from "@radix-ui/react-icons";
import DropdownMenuDemo from "../../Components/Filter/AudienceDropdown";
import { useDispatch, useSelector } from "react-redux";
import { setCreateBreadCrumb } from "../../State/slices/AdvertiserAccountSlice";
import CreateListDialog from "./CreateListDialog";
import ContactDetailsDialog from "./ContactDetailsDialog";
import { RootState } from "@/src/State/store";
import * as XLSX from "xlsx";
import CircularProgress from "@mui/material/CircularProgress";
import { title } from "process";
import { useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";

import { DialogContent } from "../../Components/ui/dialog";
import { Dialog } from "../../Components/ui/dialog";
import { DialogTitle } from "../../Components/ui/dialog";
import { DialogHeader } from "../../Components/ui/dialog";
import { DialogDescription } from "../../Components/ui/dialog";
import { ToastTitle } from "@radix-ui/react-toast";
import { Card } from "../../../src/Components/ui/card";
interface Audience {
  list_id: number;
  listname: string;
  status: string;
  created_date: string;
  total_people: number;
}

interface AudienceFileDetails {
  firstname: string;
  lastname: string;
  phoneno: string;
  location: string;
  filename1: string;
}

interface ApiResponse {
  status: string;
  status_Description: string;
  audienceFileDetails: AudienceFileDetails[];
}

type AudienceCheck = {
  list_id: number;
  listname: string;
};

const Audience: React.FC = () => {
  const workspace_id = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  console.log(workspace_id);
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const [audienceList, setaudienceList] = useState<Audience[]>([]);
  const navigate = useNavigate();
  const [isSorted, setIsSorted] = useState(false);
  const [originalAudiences, setOriginalAudiences] = useState(audienceList);
  const [checkboxSelectedRows, setCheckboxSelectedRows] = useState<number[]>(
    []
  );
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10); // Default 5 rows per page
  const [searchTerm, setSearchTerm] = useState("");
  const [apiUrlAcc, setapiUrlAcc] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasAudiences, setHasAudiences] = useState(false);
  const [audienceNames, setAudienceNames] = useState([]);

  const [selectedAudienceId, setSelectedAudienceId] = useState<number>(0);
  const [isApiExecuting, setIsApiExecuting] = useState(false);

  //for the internal open dialog
  const [isInternalDialogOpen, setInternalDialogOpen] = useState(false);

  //for the external open dialoug
  const [isDialogOpen, setDialogOpen] = useState(false);

  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  // const [selectedListId, setSelectedListId] = useState(null);

  const [filterData, setFilterData] = useState({
    filter: "None", // Default filter should be "None"
    value: "",
  });

  const permissions = useSelector(
    (state: RootState) => state.advertiserAccount.permissions
  );
  console.log("PERMISSIONS :", permissions);

  const toast = useToast();
  const dispatch = useDispatch();
  //For Date Filter
  const [dateList, setDateList] = useState<string[]>([]);

  // Get user permissions from Redux
  const userPermissions = useSelector(
    (state: RootState) => state.advertiserAccount.permissions
  );

  const handleCheckboxRowSelect = (id: number) => {
    setCheckboxSelectedRows((prev) => {
      const newSelectedRows = prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id];
      setIsAllSelected(newSelectedRows.length === currentAudiences.length); // Update `isAllSelected` if all rows are selected
      return newSelectedRows;
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setCheckboxSelectedRows([]);
    } else {
      const allIds = currentAudiences.map((audience) => audience.list_id);
      setCheckboxSelectedRows(allIds);
    }
    setIsAllSelected(!isAllSelected);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setapiUrlAcc(config.ApiUrlAdvAcc);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (!isDialogOpen && apiUrlAcc && !isDetailsDialogOpen) {
      // Ensure apiUrlAcc is set before calling getaudienceList
      setSelectedAudienceId(0);
      getaudienceList();
    }
  }, [isDialogOpen, apiUrlAcc, isDetailsDialogOpen]); // Run when popup state or apiUrlAcc changes

  useEffect(() => {
    console.log("Effect running, isDialogOpen:", isInternalDialogOpen);
    if (!isInternalDialogOpen) {
      console.log("Closing Delete Dialog");
      setSelectedAudienceId(0);
    }
  }, [isInternalDialogOpen]);

  useEffect(() => {
    if (audienceList.length > 0) {
      setDateListFunction();
    }
  }, [audienceList]);

  const filteredAudiences = audienceList.filter((audience) => {
    if (filterData.filter === "Status") {
      return filterData.value === "All" || audience.status === filterData.value;
    } else if (filterData.filter === "UpdatedAt") {
      const filterDate = new Date(filterData.value);
      const audienceDate = new Date(audience.created_date.split("T")[0]);
      return audienceDate.toDateString() === filterDate.toDateString();
    }
    return true;
  });

  // Step 2: Apply search within the filtered list
  const searchedAudiences = filteredAudiences.filter((audience) => {
    return searchTerm
      ? audience.listname.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
  });
  // Step 3: Calculate new total pages after filtering & searching
  const totalPages: number = Math.ceil(searchedAudiences.length / rowsPerPage);

  // Step 4: Adjust currentPage only if it’s out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1); // Stay on the last valid page
    }
  }, [searchedAudiences, totalPages]);

  // Step 5: Apply pagination
  const currentAudiences = searchedAudiences.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    console.log("filter data: " + filterData.filter + " " + filterData.value);
  }, [filterData]);

  const getaudienceList = async () => {
    setIsLoading(true);
    try {
      console.log("Entered");
      const response = await axios.get(
        `${apiUrlAcc}/GetAdvAudienceListDetailsByWorkspaceId?workspace_id=${workspace_id}`
      );
      console.log("Response: ", response.data.audienceList);

      if (response.data && response.data.audienceList) {
        const list = response.data.audienceList;
        setaudienceList(list);

        // Extract audience names
        const names = list.map(
          (audience: { listname: any }) => audience.listname
        );
        setAudienceNames(names);
        setHasAudiences(true);
        setIsLoading(false);
        console.log("Audience List: ", list);
        console.log("Audience Names: ", names);
      } else {
        console.log("No audience list available in response.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching audience list:", error);
    }
  };

  const setDateListFunction = () => {
    const uniqueDates = audienceList.reduce(
      (acc: Record<string, string[]>, audience) => {
        const date = audience.created_date.split(" ")[0]; // Split by space to extract the date part (e.g., "2024-12-26")
        if (!acc[date]) {
          acc[date] = []; // Initialize an empty array for this date if it doesn't exist
        }
        acc[date].push(date); // Add the date to the group (if needed for further processing)
        return acc;
      },
      {}
    );
    const datekeys = Object.keys(uniqueDates);
    console.log("Unique Dates", datekeys); // Logs grouped unique dates
    setDateList(datekeys);
  };

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  const sortaudienceList = (tableHeader: string) => {
    const sortByField = (
      field: keyof Audience,
      type: "string" | "number" | "date" = "string"
    ) => {
      const sortedAudiences = [...audienceList].sort((a, b) => {
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
      setOriginalAudiences(audienceList); // Store the original unsorted list
      setaudienceList(sortedAudiences); // Update the audienceList with sorted data
    };

    if (isSorted) {
      setaudienceList(originalAudiences); // Revert to the original audienceList
    } else {
      switch (tableHeader) {
        case "ByAudienceName":
          sortByField("listname", "string");
          break;
        case "ByAudienceUpdatedAt":
          sortByField("created_date", "date");
          break;
        case "ByAudienceRecipients":
          sortByField("total_people", "number");
          break;
        default:
          console.warn("Unknown table header");
      }
    }

    setIsSorted(!isSorted);
  };

  useEffect(() => {
    setHasAudiences(audienceList.length > 0);
  }, [audienceList]);

  const handleExportButtonClick = () => {
    // Filter columns to include only the desired fields
    const filteredData = filteredAudiences.map(
      ({ list_id, listname, created_date, total_people }) => ({
        list_id,
        listname,
        created_date,
        total_people,
      })
    );
    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audience List");
    // Export to an xlsx file
    XLSX.writeFile(workbook, "AudienceList.xlsx");
  };

  //For Editing
  const handleEdit = (audienceId: number, listname: string) => {
    setSelectedAudienceId(audienceId);
    setDialogOpen(true);
  };

  const handleDetailsClick = (audienceId: number, total_people: number) => {
    setSelectedAudienceId(audienceId);
    setSuccessCount(total_people);
    setIsDetailsDialogOpen(true);
  };

  //For Deleting and Downloading
  const handleInternalOpenDialog = (audienceId: number) => {
    console.log("Opening delete dialog for Audience ID:", audienceId);
    setSelectedAudienceId(audienceId);

    // Ensure the state update happens before opening the dialog
    setTimeout(() => {
      setInternalDialogOpen(true);
    }, 0);
  };

  const handleDelete = async (audienceId: number) => {
    console.log("Audience List Deleted :", audienceId);
    setIsApiExecuting(true);
    try {
      const response = await axios.delete(
        `${apiUrlAcc}/Delete_Adv_Audience_ById?Id=${audienceId}`
      );
      if (response.data.status === "Success") {
        toast.toast({
          title: "Success",
          description: "List Deleted Successfully.",
        });
        console.log("List Deleted Successfully");
      } else {
        console.log("List couldn't deleted");
        toast.toast({
          title: "Failure",
          description: "List Couldn't Deleted.",
        });
      }
    } catch (error) {
      console.log("Error :", error);
      toast.toast({
        title: "Error",
        description: "Somethig went wrong, Please try again later.",
      });
    } finally {
      setInternalDialogOpen(false);
      setSelectedAudienceId(0);
      getaudienceList();
      setIsApiExecuting(false);
    }
  };

  const handleDownload = async (
    audienceId: number,
    audienceListName: string
  ) => {
    console.log("Audience List Download ID :", audienceId);
    try {
      const response = await axios.get<ApiResponse>(
        `${apiUrlAcc}/Get_Adv_Audience_FileDetails_ById`,
        {
          params: { Id: audienceId },
        }
      );

      if (response.data.status === "Success") {
        const data = response.data.audienceFileDetails;
        console.log("Data based on the List Id:", audienceId);
        console.log("Data:", data);

        // Map required fields for the Excel file
        const filteredData = data.map(
          ({ firstname, lastname, phoneno, location, filename1 }) => ({
            firstname,
            lastname,
            phoneno,
            location,
            filename1,
          })
        );

        // Create an Excel worksheet
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Audience List");
        // Export to an XLSX file with dynamic filename
        XLSX.writeFile(workbook, `${audienceListName}_AudienceList.xlsx`);

        // Show success toast
        toast.toast({
          title: "Success",
          description: "List Exported Successfully",
        });
      } else {
        // Show failure toast if status is not success
        toast.toast({
          title: "Export Failed",
          description:
            "Unable to export the list. Please check your internet connection or try again later.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      // Show error toast if API request fails
      toast.toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
      });
    }
  };

  return (
   <Card>
           <div className="p-4">
      <Toaster />
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="primary" />
        </div>
      )}
      {!isLoading && (
        <div className="fixed flex justify-end items-end right-0 top-[-15px] z-20 p-4 mr-2">
          {userPermissions.includes("ADV_Audience_Add") && (
            <Button
              onClick={() => setDialogOpen(true)}
              className="w-36 text-sm font-thin h-[35px] mt-[10px] form-button"
            >
              Create list
            </Button>
          )}

          <CreateListDialog
            open={isDialogOpen}
            onOpenChange={setDialogOpen}
            audienceNames={audienceNames}
            audiencefile_id={selectedAudienceId}
          />
        </div>
      )}

      {hasAudiences && !isLoading ? (
        <div>
          {/* Existing table code here */}
          <div className="flex  mt-2">
            <div className=" ">
              <Input
                placeholder="Search audience by name..."
                className="w-[250px] text-[14px] font-normal text-[#64748B]"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
              />
            </div>
            <div className="flex items-end ml-auto">
              <DropdownMenuDemo
                setFilterData={setFilterData}
                filterData={filterData} //  Now passing filterData
                dateList={dateList}
              />

              <Button
                variant="outline"
                className="w-full mb-6 ml-4 mt-[-6] text-[#020617] font-medium text-[14px] py-2 px-3"
                onClick={handleExportButtonClick}
              >
                <FileIcon
                  style={{ width: "14px", height: "14px" }}
                  className="mr-1 text-[#020617]"
                />{" "}
                Export
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="max-h-[60vh] overflow-y-auto">
              <Table
                className="rounded-xl whitespace-nowrap border-gray-200"
                style={{ color: "#020202", fontSize: "15px" }}
              >
                <TableHeader className="text-center text-[14px] font-medium">
                  <TableRow className="sticky top-0 bg-white z-10 hover:bg-white">
                    {" "}
                    {/* Sticky header */}
                    <TableHead>
                      <div className="flex items-center gap-6 justify-start cursor-pointer">
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
                          onClick={() => sortaudienceList("ByAudienceName")}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead style={{ width: "20%" }}>
                      <div className="flex items-center gap-2 justify-start cursor-pointer">
                        <span className="font-medium text-[14px] text-[#64748B]">
                          Updated at{" "}
                        </span>
                        <CaretSortIcon
                          onClick={() =>
                            sortaudienceList("ByAudienceUpdatedAt")
                          }
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead style={{ width: "10%" }}>
                      <div className="flex items-center gap-2 justify-center cursor-pointer">
                        <span className="font-medium text-[14px] text-[#64748B]">
                          Recipients{" "}
                        </span>
                        <CaretSortIcon
                          onClick={() =>
                            sortaudienceList("ByAudiencerecipients")
                          }
                          className="cursor-pointer"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-left"></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="text-left text-[14px] font-normal text-[#020617]">
                  {currentAudiences.map((audience) => {
                    console.log(audience.list_id);
                    let isSelected;
                    audienceList.map((Audiences) => {
                      isSelected = checkboxSelectedRows.includes(
                        Audiences.list_id
                      );
                    });

                    return (
                      <TableRow
                        key={audience.list_id}
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
                                audience.list_id
                              )}
                              onChange={() =>
                                handleCheckboxRowSelect(audience.list_id)
                              }
                            /> */}
                            <span
                              style={{
                                color: "#020617",
                                fontSize: "14px",
                                fontWeight: "400",
                              }}
                            >
                              {audience.listname}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell style={{ width: "20%" }} className="">
                          <div className="flex items-center gap-2">
                            <span
                              style={{
                                color: "#020617",
                                fontSize: "14px",
                                fontWeight: "400",
                              }}
                            >
                              {new Date(
                                audience.created_date
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}{" "}
                              ∙{" "}
                              {new Date(
                                audience.created_date
                              ).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell style={{ width: "10%" }} className="text-left">
  <span className="text-[#020617] text-[14px] font-normal ml-2">
    {audience.total_people}
  </span>
</TableCell>


                        <TableCell className="flex justify-end">
                          {userPermissions.includes("ADV_Audience_Edit") && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <DotsHorizontalIcon
                                  style={{ color: "#020617" }}
                                  onClick={() =>
                                    handleMenuToggle(audience.list_id)
                                  }
                                  className="cursor-pointer w-5 h-5"
                                />
                              </DropdownMenuTrigger>
                              {openMenuRowId === audience.list_id && (
                                <DropdownMenuContent className="w-48 h-auto mr-6">
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleEdit(
                                        audience.list_id,
                                        audience.listname
                                      )
                                    }
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleDetailsClick(
                                        audience.list_id,
                                        audience.total_people
                                      )
                                    }
                                  >
                                    Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleInternalOpenDialog(audience.list_id)
                                    }
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleDownload(
                                        audience.list_id,
                                        audience.listname
                                      )
                                    }
                                  >
                                    Download
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              )}
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2 text-gray-500 text-sm ">
              <span>{`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                currentPage * rowsPerPage,
                filteredAudiences.length
              )} of ${filteredAudiences.length} row(s) selected`}</span>
            </div>

            <div className="flex items-center space-x-4 font-medium text-sm">
              <span className="text-[#020617] font-medium text-[14px]">
                Rows per page
              </span>

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
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)", // Adds slight shadow
                  }}
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page after changing rows per page
                  }}
                >
                  {[5, 10].map((num) => (
                    <option
                      className="text-[12px] font-normal"
                      key={num}
                      value={num}
                    >
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
                    currentPage === 1
                      ? "cursor-not-allowed bg-gray-100"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => handlePageChange(1)}
                >
                  «
                </button>
                <button
                  disabled={currentPage === 1}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                    currentPage === 1
                      ? "cursor-not-allowed bg-gray-100"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ‹
                </button>
                <button
                  disabled={currentPage === totalPages}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                    currentPage === totalPages
                      ? "cursor-not-allowed bg-gray-100"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  ›
                </button>
                <button
                  disabled={currentPage === totalPages}
                  className={`border p-1 pr-2 pl-2 rounded text-gray-500 ${
                    currentPage === totalPages
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

          <Dialog
            open={isInternalDialogOpen}
            onOpenChange={setInternalDialogOpen}
          >
            <DialogContent className="p-6 mx-auto">
              <DialogHeader>
                <DialogTitle className="text-18px font-semibold text-[#09090B]">
                  Delete List
                </DialogTitle>
                <DialogDescription className="text-14px font-medium text-[#71717A] mt-2">
                  Are you sure you want to delete this list? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end gap-4 flex-wrap">
                <Button
                  className="px-4 py-2 w-auto"
                  variant="outline"
                  disabled={isApiExecuting}
                  onClick={() => setInternalDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="px-4 py-2 w-auto bg-red-500 text-white hover:bg-red-600"
                  disabled={isApiExecuting}
                  onClick={() => {
                    console.log("Deleting Audience ID:", selectedAudienceId);
                    handleDelete(selectedAudienceId);
                  }}
                >
                  {isApiExecuting ? "Deleting" : "Delete"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <ContactDetailsDialog
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            successCount={successCount}
            failureCount={failureCount}
            apiEndpoint={apiUrlAcc}
            list_id={selectedAudienceId ?? 0}
          />
        </div>
      ) : (
        <>
          {isLoading && null}
          {!isLoading && (
            <div className="flex flex-col items-center justify-center h-[500px]">
              <h2 className="text-[24px] font-bold mb-1 text-[#000000]">
                Here you will see all your audience lists
              </h2>
              {userPermissions.includes("ADV_Audience_Add") && (
                <div>
                  <p className="text-[#64748B] font-normal mb-1 text-[14px]">
                    Click the button below to create your first list.
                  </p>
                  <Button
                    onClick={() => setDialogOpen(true)}
                    className="inline-flex items-center justify-center text-[14px] font-medium text-[#F8FAFC] px-5 py-5 whitespace-nowrap form-button"
                    style={{ width: "auto", minWidth: "unset" }}
                  >
                    Create list
                  </Button>
                </div>
              )}
              <CreateListDialog
                open={isDialogOpen}
                onOpenChange={setDialogOpen}
                audienceNames={audienceNames}
              />
            </div>
          )}
        </>
      )}
    </div>
    </Card>
  );
};

export default Audience;
