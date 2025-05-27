import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../Components/ui/table";
import { Badge } from "../../Components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../Components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../Components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../Components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../Components/ui/select";
import { Label } from "../../Components/ui/label";
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import { toast, useToast } from "../../Components/ui/use-toast";
import { Toaster } from "../../Components/ui/toaster";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";

interface Member {
  name: string;
  email: string;
  role: string;
  joinedDate: string;
  wId: number;
  // assuming date is a string in ISO format
}

interface Admin {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
  first_name: string;
  last_name: string;
  profile_image: string;
}

interface InviteMember {
  name: string;
  role: string;
  invitedAt: string;
  expiresAt: string;
  status: string;
}

interface Roles {
  role_id: string;
  role_name: string;
}

const Team: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
// const totalPages = "1";

// const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

// // Slice admins to show for current page
// const paginatedAdmins = filteredAdmins.slice(
//   (currentPage - 1) * itemsPerPage,
//   currentPage * itemsPerPage
// );
  const [open, setOpen] = useState(false);
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null);
  const [currentMembers, setCurrentMembers] = useState<Member[]>([]);
  const [originalMembers, setOriginalMembers] = useState<Member[]>([]);
  const [isSorted, setIsSorted] = useState(false);
  const [sortColumn, setSortColumn] = useState<"name" | "email" | "createdAt" | null>(null);
  const [isSortedAsc, setIsSortedAsc] = useState(true);

  const [currentAdmins, setCurrentAdmins] = useState<Admin[]>([]);
  const [originalAdmins, setOriginalAdmins] = useState<Admin[]>([]);
  const [imageSrc, setImageSrc] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [inviteCurrentMembers, setInviteCurrentMembers] = useState<
    InviteMember[]
  >([]);
  const [inviteOriginalMembers, setInviteOriginalMembers] = useState<
    InviteMember[]
  >([]);
  const [isInviteSorted, setIsInviteSorted] = useState(false);
  const [apiUrlAdmin, setApiUrlAdmin] = useState("");
  const [apiUrlAdvAcc, setApiUrlAdvAcc] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const toast = useToast();
  const personalemail = useSelector(
    (state: RootState) => state.authentication.userEmail
  );
  const workspaceId = useSelector(
    (state: RootState) => state.authentication.workspace_id
  );
  const [invitedMembers, setInvitedMembers] = useState([
    { email: "", role: "", name: "fazil", wId: workspaceId },
  ]);
  const [roles, setRoles] = useState<Roles[]>([]);

  // New state for search query
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/config.json");
        const config = await response.json();
        setApiUrlAdmin(config.ApiUrlAdminAcc);
        setApiUrlAdvAcc(config.ApiUrlAdvAcc);
        setApiUrl(config.API_URL);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (apiUrlAdvAcc) {
        try {
          await getAdminsList();
          await fetchProfileImage();
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        console.log("apiUrlAdvAcc is missing", {
          apiUrlAdvAcc,
        });
      }
    };

    fetchData();
  }, [apiUrlAdvAcc]);

  const getAdminsList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrlAdmin}/GetAdminsList?workspaceId=${workspaceId}`
      );

      if (response.data.status === "Success") {
        console.log(response)
        setCurrentAdmins(response.data.adminsList);
        setOriginalAdmins(response.data.adminsList);
        console.log("Admins List:" + response.data.adminsList);
        setIsLoading(false);
      } else {
        console.log("No admins found");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
      setIsLoading(false);
    }
  };

  const DeleteAdminAccess = async (AdminId: number) => {
    console.log(`Deleting admin access for AdminId: ${AdminId}`);
    try {
      const response = await axios.delete(
        `${apiUrlAdmin}/DeleteAdminAccess?AdminId=${AdminId}`
      );
      if (response.data.status === "Success") {
        getAdminsList(); // Re-fetch admins
        toast.toast({
          title: "Success",
          description: "The Admin access was revoked successfully",
        });
      } else {
        console.log("Error in revoking admin access");
        toast.toast({
          title: "Error",
          description: "Something went wrong revoking admin access",
        });
      }
    } catch (error) {
      console.error("Error in DeleteAdminAccess:", error);
    }
  };

  const fetchProfileImage = async () => {
    try {
      const response = await axios.get(`${apiUrlAdvAcc}/GetProfileImage`, {
        params: { EmailId: personalemail },
      });

      if (response.data.status === "Success") {
        // Decode base64 string and create a data URL
        const base64String = response.data.image[0].image;
        const dataUrl = `data:image/jpeg;base64,${base64String}`;
        setImageSrc(dataUrl);
      } else {
        console.error(
          "Failed to fetch image:",
          response.data.status_Description
        );
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const sortAdminByField = (
    field: "name" | "email" | "createdAt",
    type: "string" | "date" = "string"
  ) => {
    const sortedAdmins = [...currentAdmins].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
  
      if (field === "name") {
        aVal = `${a.first_name} ${a.last_name}`.toLowerCase();
        bVal = `${b.first_name} ${b.last_name}`.toLowerCase();
        return isSortedAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
  
      if (field === "email") {
        aVal = a.email.toLowerCase();
        bVal = b.email.toLowerCase();
        return isSortedAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
  
      if (field === "createdAt") {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
        return isSortedAsc ? aVal - bVal : bVal - aVal;
      }
  
      return 0;
    });
  
    setCurrentAdmins(sortedAdmins);
    setSortColumn(field); // track which column was sorted
  };
  
  const sortingAdmins = (tableHeader: string) => {
    let field: "name" | "email" | "createdAt" | null = null;
  
    switch (tableHeader) {
      case "ByAdminsName":
        field = "name";
        break;
      case "ByAdminsEmail":
        field = "email";
        break;
      case "ByAdminsJoinDate":
        field = "createdAt";
        break;
      default:
        console.warn("Unknown table header");
        return;
    }
  
    // Toggle sorting direction if clicking the same column
    if (field === sortColumn) {
      setIsSortedAsc(!isSortedAsc);
    } else {
      setIsSortedAsc(true); // new column sort starts with ascending
      setSortColumn(field);
    }
  
    sortAdminByField(field);
  };
  

  

  // Filter admins based on search term (first_name + last_name)

  const sortInviteByField = (
    field: keyof InviteMember,
    type: "string" | "number" | "date" = "string"
  ) => {
    const sortedMembers = [...inviteCurrentMembers].sort((a, b) => {
      if (type === "number") {
        return Number(a[field]) - Number(b[field]);
      } else if (type === "date") {
        return Date.parse(a[field] as string) - Date.parse(b[field] as string);
      } else {
        return String(a[field]).localeCompare(String(b[field]));
      }
    });
    setInviteOriginalMembers(inviteCurrentMembers); // Save original state
    setInviteCurrentMembers(sortedMembers); // Set sorted members
  };

  // Function to handle sorting based on column clicked for invites
  const sortInviteMembers = (tableHeader: string) => {
    if (isInviteSorted) {
      setInviteCurrentMembers(inviteOriginalMembers);
    } else {
      switch (tableHeader) {
        case "ByInviteMemberName":
          sortInviteByField("name", "string");
          break;
        case "ByInviteMemberRole":
          sortInviteByField("role", "string");
          break;
        case "ByMemberInvitedAt":
          sortInviteByField("invitedAt", "string");
          break;
        case "ByMemberExpiresAt":
          sortInviteByField("expiresAt", "string");
          break;
        case "ByMemberStatus":
          sortInviteByField("status", "string");
          break;
        default:
          console.warn("Unknown table header");
      }
    }
    setIsInviteSorted(!isInviteSorted);
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleMenuToggle = (rowId: number) => {
    setOpenMenuRowId(openMenuRowId === rowId ? null : rowId);
  };

  // Filter currentAdmins based on search term (first_name and last_name)
  const filteredAdmins = currentAdmins.filter((admin) => {
    const fullName = `${admin.first_name} ${admin.last_name}`.toLowerCase();
    // console.log(fullName)
    return fullName.includes(searchTerm.toLowerCase());
  });
  // const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);

// total filtered admins
const totalPages = Math.ceil(filteredAdmins.length / rowsPerPage);

// get only paginated admins to show in table
const paginatedAdmins = filteredAdmins.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);
const handlePageChange = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages) {
    setCurrentPage(newPage);
  }
};

  return (
    <div className="flex-col gap-6 h-full overflow-y-auto no-scrollbar">
      <Toaster />
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-[500px]">
          <CircularProgress color="success" />
        </div>
      )}

      <Card>
        {!isLoading && filteredAdmins.length > 0 ? (
          <div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-left">Teams</h2>
                  <p className="text-sm text-gray-600">
                    Here you can manage the Click2go teams
                  </p>
                </div>
              </div>
            </CardHeader>
            <div className="pr-6 pl-6">
              {/* Update the search input to update searchTerm */}
              <Input 
                    className="w-full md:w-[250px] text-[14px] font-normal text-[#171717]  !mt-0"
                    placeholder="Search admins"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <CardContent>
              <div className="rounded-md border mt-4">
                <div className="max-h-[60vh] overflow-y-auto">
                <Table
                    className="rounded-xl whitespace-nowrap border-gray-200"
                    style={{ color: "#020202", fontSize: "15px" }}
                  >
                    <TableHeader className="text-center">
                      <TableRow className="sticky top-0 z-10 bg-white hover:bg-white">
                        <TableHead className="text-left">
                          <div className="flex items-center justify-start cursor-pointer">
                            Name{" "}
                            <CaretSortIcon
                              onClick={() => sortingAdmins("ByAdminsName")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                        <TableHead className="text-left">
                          <div className="flex items-center justify-start">
                            Email{" "}
                            <CaretSortIcon
                              onClick={() => sortingAdmins("ByAdminsEmail")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                        <TableHead className="text-left">
                          <div className="flex items-center  justify-start">
                            Permissions{" "}
                            <CaretSortIcon
                              onClick={() => sortingAdmins("ByAdminsPermissions")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                        <TableHead className="text-left">
                          <div className="flex items-center  justify-start">
                            Joined at{" "}
                            <CaretSortIcon
                              onClick={() => sortingAdmins("ByAdminsJoinDate")}
                              className="cursor-pointer"
                            />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
  {paginatedAdmins.map((admin, index) => (
    <TableRow key={index}>
      <TableCell className="flex items-center p-1">

   
  <Avatar className="w-8 h-8">
    {admin.profile_image ? (
      <AvatarImage src={`data:image/jpeg;base64,${admin.profile_image}`} />
    ) : (
      <AvatarFallback>
        {admin.first_name?.[0]?.toUpperCase() || "N/A"}
      </AvatarFallback>
    )}
  </Avatar>
  <div>&nbsp;</div>
    <div className="flex items-center gap-1">
    <span className={admin.first_name || admin.last_name ? "" : "text-red-500"}>
      {admin.first_name || admin.last_name
        ? `${admin.first_name ?? ""} ${admin.last_name ?? ""}`.trim()
        : "No Name"}
    </span>

    {admin.email === personalemail && (
      <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">
        You
      </Badge>
    )}
  </div>


  
      </TableCell>

      <TableCell className="text-left p-1">{admin.email}</TableCell>

      <TableCell className="text-left p-1">
        <Badge className="text-white" style={{ backgroundColor: "#000000" }}>
          {"Super Admin"}
        </Badge>
      </TableCell>

      <TableCell className="text-left p-1">
        {admin.createdAt
          ? new Date(admin.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "N/A"}
      </TableCell>

      <TableCell className="text-left p-1">
        {personalemail === "nour@sibiatech.com" && admin.email !== "nour@sibiatech.com" && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="ml-2 cursor-pointer"
              onClick={() => console.log("Dropdown triggered")}
            >
              <DotsHorizontalIcon className="cursor-pointer w-6 h-6" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-24 bg-gray-200">
              <DropdownMenuItem
                onClick={() => {
                  console.log(`Revoke Access clicked for Admin ID: ${admin.id}`);
                  DeleteAdminAccess(admin.id);
                }}
              >
                Revoke Access
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  ))}
</TableBody>

                  </Table>
                </div>
              </div>
            </CardContent>
  <div className="flex justify-between items-center mt-4 p-2">
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <span>{`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                currentPage * rowsPerPage,
                paginatedAdmins.length
              )} of ${paginatedAdmins.length} row(s) selected`}</span>
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

          </div>
        ) : (
          <>
            {isLoading && null}
            {!isLoading && (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <h2 className="text-[24px] font-semibold mb-1 text-[#000000]">
                  Here you will see all admins
                </h2>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default Team;
